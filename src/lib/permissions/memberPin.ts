const enc = new TextEncoder();

function bufferToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** SHA-256 hash of PIN for storage (hex). */
export async function hashMemberPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(pin));
  return bufferToHex(digest);
}

export async function verifyMemberPin(pin: string, storedHashHex: string): Promise<boolean> {
  const next = await hashMemberPin(pin);
  if (next.length !== storedHashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < next.length; i++) {
    diff |= next.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
  }
  return diff === 0;
}
