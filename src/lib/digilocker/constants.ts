/**
 * DigiLocker “Authorized Partner API” v2.0 — production host is Meri Pehchaan.
 * @see https://meripehchaan.gov.in/ (spec: Digital Locker Authorized Partner API Specification)
 */
export const DIGILOCKER_PUBLIC_BASE = 'https://digilocker.meripehchaan.gov.in/public';

export const DIGILOCKER_AUTHORIZE_URL = `${DIGILOCKER_PUBLIC_BASE}/oauth2/1/authorize`;

/** Code flow: spec uses /oauth2/2/token (not /oauth2/1/token). */
export const DIGILOCKER_TOKEN_URL = `${DIGILOCKER_PUBLIC_BASE}/oauth2/2/token`;

/** Issued-doc list; override with DIGILOCKER_ISSUED_URL if your registration uses another path. */
export const DIGILOCKER_ISSUED_DEFAULT = `${DIGILOCKER_PUBLIC_BASE}/oauth2/2/files/issued`;

/** Get file bytes (PDF/XML) for a document URI. */
export const DIGILOCKER_FILE_URI_BASE = `${DIGILOCKER_PUBLIC_BASE}/oauth2/1/file/uri`;

export const DIGILOCKER_SCOPE = 'files.issued';

export const SESSION_TOKEN_KEY = 'sv_digilocker_token';
export const SESSION_TOKEN_AT_KEY = 'sv_digilocker_token_at';
