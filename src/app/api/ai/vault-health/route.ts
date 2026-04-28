import { NextResponse } from 'next/server';
import { AiHealthSchema } from '@/lib/apiSchemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { requireAuth } from '@/lib/requireAuth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-20250514';

function parseSuggestions(raw: string): string[] | null {
  let s = raw.trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence) s = fence[1].trim();
  try {
    const o = JSON.parse(s) as unknown;
    if (!Array.isArray(o)) return null;
    return o
      .filter((x) => typeof x === 'string')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 8);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const rl = await checkRateLimit(req, 'ai-health');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    );
  }

  const auth = await requireAuth(req);
  if (auth.ok === false) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parseResult = AiHealthSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'invalid_request', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { metadata } = parseResult.data;
  const str = JSON.stringify(metadata);
  if (str.length > 120_000) {
    return NextResponse.json({ error: 'metadata_too_large' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: 'missing_anthropic_key' }, { status: 503 });
  }

  const userPrompt = `You are a helpful advisor for SecureVault, a family document vault in India.

You receive ONLY structural metadata: member names, document titles, category IDs, which required fields are empty (field keys only, no values), and nearest expiry day counts per document. There are NO secret numbers, IDs, or passwords in this payload.

Return 3–5 short, actionable suggestions as a JSON array of strings only (no object wrapper, no markdown). Examples of tone:
- "Rohan is missing health insurance — add a policy before school admissions."
- "Priya's passport metadata shows an expiry in 45 days — plan renewal."

Rules:
- Reference people and document titles from the metadata.
- Do not invent field values or claim you saw ID numbers.
- Keep each string under 200 characters.

METADATA_JSON:
${JSON.stringify(metadata, null, 2)}

Output format: ["suggestion 1", "suggestion 2", ...]`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: 'ai_provider_error', status: res.status, detail: detail.slice(0, 500) },
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

  const suggestions = parseSuggestions(raw);
  if (!suggestions || suggestions.length === 0) {
    return NextResponse.json(
      { error: 'ai_parse_failed', raw: raw.slice(0, 1500) },
      { status: 502 }
    );
  }

  return NextResponse.json({ suggestions });
}
