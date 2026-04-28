import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '@/test/mocks/handlers';
import { POST } from '../route';

vi.mock('@/lib/requireAuth', () => ({
  requireAuth: () => Promise.resolve({ ok: true, userId: 'test-user' }),
}));

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function callScanRoute(body: unknown) {
  const req = new Request('http://localhost/api/ai/scan-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe('POST /api/ai/scan-document', () => {
  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('returns 400 for missing ocrText', async () => {
    const res = await callScanRoute({ categoryId: 'government-ids' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for unsupported category', async () => {
    const res = await callScanRoute({ ocrText: 'some text', categoryId: 'nonexistent' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for ocrText exceeding limit', async () => {
    const res = await callScanRoute({ ocrText: 'x'.repeat(120_001), categoryId: 'government-ids' });
    expect(res.status).toBe(400);
  });

  it('returns 503 when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = await callScanRoute({ ocrText: 'test', categoryId: 'government-ids' });
    expect(res.status).toBe(503);
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });
});
