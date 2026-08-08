import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — SecureVault' };

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
        Last updated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 8 }}>
        What data we store — and where
      </h2>
      <p>
        SecureVault is designed to be <strong>zero-knowledge</strong>. Your vault data (documents,
        photos, metadata) is encrypted on your device using AES-256-GCM before being stored in your
        browser&apos;s IndexedDB. The encryption key is derived from your PIN using Argon2id and
        never leaves your device.
      </p>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 8 }}>DigiLocker</h2>
      <p>
        When you connect DigiLocker, we use PKCE OAuth 2.0 to obtain a short-lived access token.
        This token is stored only in your browser&apos;s sessionStorage and is deleted when you
        close the tab. We do not store DigiLocker tokens on our servers.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 8 }}>
        Your rights (GDPR / DPDP 2023)
      </h2>
      <ul style={{ paddingLeft: 20, color: 'var(--color-text-secondary)' }}>
        <li style={{ marginBottom: 4 }}>
          Right to access: See Settings → Export for a full export of your vault data.
        </li>
        <li style={{ marginBottom: 4 }}>
          Right to erasure: Use Settings → Danger Zone to wipe vault data on this device, or clear
          browser storage for this site.
        </li>
        <li style={{ marginBottom: 4 }}>
          Right to portability: Export as JSON at any time from Settings → Export.
        </li>
        <li style={{ marginBottom: 4 }}>
          Right to withdraw consent: Change analytics preferences when prompted in the app.
        </li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 8 }}>
        Third-party sub-processors
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 500 }}>Processor</th>
            <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 500 }}>Purpose</th>
            <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 500 }}>Location</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              ['Google', 'Optional DigiLocker OAuth only', 'USA'],
              ['Firebase / Google', 'Web hosting', 'USA'],
            ] as const
          ).map(([name, purpose, loc]) => (
            <tr key={name} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
              <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)' }}>{name}</td>
              <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)' }}>{purpose}</td>
              <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)' }}>{loc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 8 }}>Contact</h2>
      <p>
        Data protection enquiries:{' '}
        <a href="mailto:privacy@securevault.app">privacy@securevault.app</a>
      </p>
    </main>
  );
}
