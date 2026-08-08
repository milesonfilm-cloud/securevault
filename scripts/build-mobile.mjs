/**
 * Build a static Next export into `www/` for Capacitor (Android / iOS).
 * Run: npm run build:mobile
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wwwDir = path.join(root, 'www');
const mobileDistDir = path.join(root, '.next-mobile');
const outDir = mobileDistDir; // When `distDir` is set during mobile export, Next writes the exported files into it.
const defaultLocale = 'en';
const startPath = `/${defaultLocale}/family-management/`;

const env = {
  ...process.env,
  MOBILE_BUILD: '1',
  NEXT_PUBLIC_MOBILE_BUILD: '1',
  NODE_ENV: 'production',
  DIST_DIR: '.next-mobile',
  NODE_OPTIONS: [
    process.env.NODE_OPTIONS,
    '--max-old-space-size=12288',
  ]
    .filter(Boolean)
    .join(' '),
};

for (const dir of ['.next-mobile', 'out', 'www']) {
  try {
    rmSync(path.join(root, dir), { recursive: true, force: true });
  } catch {
    /* ignore locked dirs on Windows */
  }
}

console.log('Building static export for Capacitor…');
execSync('npx next build', { cwd: root, env, stdio: 'inherit' });

if (!existsSync(outDir)) {
  console.error('Expected Next mobile export at', outDir);
  process.exit(1);
}

rmSync(wwwDir, { recursive: true, force: true });
mkdirSync(wwwDir, { recursive: true });
cpSync(outDir, wwwDir, { recursive: true });

writeFileSync(
  path.join(wwwDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${startPath}" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>SecureVault</title>
  <script>location.replace(${JSON.stringify(startPath)});</script>
</head>
<body><p><a href="${startPath}">Open SecureVault</a></p></body>
</html>
`,
  'utf8'
);

console.log('Syncing Capacitor native projects…');
execSync('npx cap sync android', { cwd: root, stdio: 'inherit' });
console.log('Done. Open Android Studio: npm run cap:open:android');
console.log('On a Mac with Xcode: npm run cap:open:ios');
