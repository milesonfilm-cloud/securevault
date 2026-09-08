import * as OTPAuth from 'otpauth';

export function generateTotpSecret(): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'Strong Vault',
    label: 'vault',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });
  return totp.secret.base32;
}

export function verifyTotp(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: 'Strong Vault',
    label: 'vault',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

export function getTotpUri(secret: string, userLabel: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'Strong Vault',
    label: userLabel,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.toString();
}
