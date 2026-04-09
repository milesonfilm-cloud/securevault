import 'server-only';

import { cookies } from 'next/headers';
import { verifyAttestedSessionCookieValue } from './session';

export async function requireAttestedSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get('sv_attested')?.value;
  const res = verifyAttestedSessionCookieValue(value);
  if (res.ok === false) {
    const err = new Error(`attestation_required:${res.reason}`);
    // @ts-expect-error attach status
    err.status = 401;
    throw err;
  }
  return res.payload;
}
