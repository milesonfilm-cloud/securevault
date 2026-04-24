import { NextResponse } from 'next/server';
import { getCategoryById } from '@/lib/categories';
import { isAiScanCategory } from '@/lib/scan/aiScanCategories';
import type { CategoryId } from '@/lib/storage';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MODEL = 'claude-sonnet-4-20250514';

function parseClaudeJson(raw: string): {
  fields: Record<string, string>;
  confidence: Record<string, number>;
} | null {
  let s = raw.trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence) s = fence[1].trim();
  try {
    const obj = JSON.parse(s) as unknown;
    if (!obj || typeof obj !== 'object' || !('fields' in obj)) return null;
    const rec = obj as { fields: unknown; confidence?: unknown };
    if (!rec.fields || typeof rec.fields !== 'object') return null;

    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(rec.fields as Record<string, unknown>)) {
      fields[k] = v == null ? '' : String(v).trim();
    }

    const confidence: Record<string, number> = {};
    if (rec.confidence && typeof rec.confidence === 'object') {
      for (const [k, v] of Object.entries(rec.confidence as Record<string, unknown>)) {
        const n = Number(v);
        confidence[k] = Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
      }
    }
    for (const k of Object.keys(fields)) {
      if (confidence[k] === undefined) confidence[k] = fields[k] ? 0.5 : 0;
    }
    return { fields, confidence };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: 'missing_anthropic_key' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const ocrText =
    body && typeof body === 'object' && 'ocrText' in body ? (body as { ocrText: unknown }).ocrText : '';
  const categoryIdRaw =
    body && typeof body === 'object' && 'categoryId' in body
      ? (body as { categoryId: unknown }).categoryId
      : '';

  if (typeof ocrText !== 'string' || ocrText.length === 0) {
    return NextResponse.json({ error: 'invalid_ocr_text' }, { status: 400 });
  }
  if (ocrText.length > 120_000) {
    return NextResponse.json({ error: 'ocr_text_too_large' }, { status: 400 });
  }
  if (typeof categoryIdRaw !== 'string' || !isAiScanCategory(categoryIdRaw as CategoryId)) {
    return NextResponse.json({ error: 'unsupported_category' }, { status: 400 });
  }

  const categoryId = categoryIdRaw as CategoryId;
  const category = getCategoryById(categoryId);
  if (!category) {
    return NextResponse.json({ error: 'unknown_category' }, { status: 400 });
  }

  const fieldSchema = category.fields.map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    options: f.options ?? null,
  }));

  const userPrompt = `You extract structured field values from noisy OCR text for an India-first family document vault.

Vault category: "${category.label}" (id: ${category.id}).

Field definitions — you MUST use each object’s "key" string exactly as JSON keys in your output:
${JSON.stringify(fieldSchema, null, 2)}

Rules:
- Prefer ISO dates YYYY-MM-DD when you can infer a full date; otherwise use the clearest date string from the OCR.
- For type "select", the value must be exactly one of the listed options when possible; if none match, use "".
- For government-ids, set "Document Type" to Aadhaar Card, PAN Card, Passport, Driving License, etc. when the OCR clearly indicates it.
- For institutional-docs with insurance paperwork, set "Document Type" to Insurance Policy when appropriate.
- Do not invent ID numbers or policy numbers. If not visible, use "".
- confidence: number 0–1 per key reflecting how sure you are; use 0 for empty values.

Return ONLY valid JSON (no markdown, no commentary) in this exact shape:
{"fields":{"<key>":"<value>",...},"confidence":{"<key>":0.95,...}}

OCR_START
${ocrText}
OCR_END`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: 'ai_provider_error', status: res.status, detail: detail.slice(0, 800) },
      { status: 502 }
    );
  }

  const anthropicJson = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = anthropicJson.content?.find((c) => c.type === 'text');
  const raw = textBlock?.text;
  if (typeof raw !== 'string') {
    return NextResponse.json({ error: 'invalid_ai_response' }, { status: 502 });
  }

  const parsed = parseClaudeJson(raw);
  if (!parsed) {
    return NextResponse.json({ error: 'ai_json_parse_failed', raw: raw.slice(0, 2000) }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
