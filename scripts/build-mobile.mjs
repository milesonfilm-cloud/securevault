/**
 * Build a static Next export into `www/` for Capacitor (Android / iOS).
 * Run: npm run build:mobile
 *
 * Android's asset packager / WebView local server mishandles Next.js folders like
 * `[locale]` and `(vault)`. We rename those and rewrite references before `cap sync`.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wwwDir = path.join(root, 'www');
const mobileDistDir = path.join(root, '.next-mobile');
const outDir = mobileDistDir; // When `distDir` is set during mobile export, Next writes the exported files into it.
const defaultLocale = 'en';
/**
 * Must end with `index.html`. Capacitor Android html5mode treats extensionless
 * paths as SPA fallbacks to root `index.html` — a redirect stub there loops forever.
 */
const startPath = `/${defaultLocale}/family-management/index.html`;

/**
 * Next route-segment folders that break Android asset URLs.
 * Avoid leading underscores too — aapt historically drops `_*` asset folders.
 */
const DIR_RENAMES = [
  ['[locale]', 'locale'],
  ['(vault)', 'vault'],
];

const TEXT_EXTS = new Set(['.html', '.js', '.css', '.json', '.txt', '.map', '.svg']);

const env = {
  ...process.env,
  MOBILE_BUILD: '1',
  NEXT_PUBLIC_MOBILE_BUILD: '1',
  NODE_ENV: 'production',
  DIST_DIR: '.next-mobile',
  NODE_OPTIONS: [process.env.NODE_OPTIONS, '--max-old-space-size=12288'].filter(Boolean).join(' '),
};

function listDirsDeepestFirst(dir) {
  /** @type {string[]} */
  const dirs = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const full = path.join(dir, ent.name);
    dirs.push(...listDirsDeepestFirst(full), full);
  }
  return dirs;
}

function listTextFiles(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) listTextFiles(full, out);
    else if (TEXT_EXTS.has(path.extname(ent.name).toLowerCase())) out.push(full);
  }
  return out;
}

/** Make the static export safe for Capacitor Android asset serving. */
function sanitizeWwwForAndroid(www) {
  console.log('Sanitizing Next.js paths for Android WebView…');

  for (const dir of listDirsDeepestFirst(www)) {
    const base = path.basename(dir);
    const mapped = DIR_RENAMES.find(([from]) => from === base);
    if (!mapped) continue;
    const dest = path.join(path.dirname(dir), mapped[1]);
    if (existsSync(dest)) {
      console.warn(`  skip rename (exists): ${path.relative(www, dest)}`);
      continue;
    }
    renameSync(dir, dest);
    console.log(`  ${path.relative(www, dir)} → ${mapped[1]}`);
  }

  const replacements = [
    // Prefer longest / encoded forms first
    ['%5Blocale%5D', 'locale'],
    ['[locale]', 'locale'],
    ['%28vault%29', 'vault'],
    ['(vault)', 'vault'],
    // Prior sanitize pass used underscore names — rewrite if present
    ['_locale_', 'locale'],
    ['_vault_', 'vault'],
  ];

  let rewritten = 0;
  for (const file of listTextFiles(www)) {
    const before = readFileSync(file, 'utf8');
    let after = before;
    for (const [from, to] of replacements) {
      if (after.includes(from)) after = after.split(from).join(to);
    }
    if (after !== before) {
      writeFileSync(file, after);
      rewritten += 1;
    }
  }
  console.log(`  updated ${rewritten} asset reference file(s)`);
}

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

/**
 * Capacitor Android html5mode serves this file for ANY extensionless URL.
 * Never put a redirect stub here — it infinite-loops with `/en/.../` routes.
 * Copy the real home page; `server.appStartPath` still boots the canonical URL.
 */
const homeHtml = path.join(wwwDir, defaultLocale, 'family-management', 'index.html');
if (!existsSync(homeHtml)) {
  console.error('Missing exported home page at', homeHtml);
  process.exit(1);
}
cpSync(homeHtml, path.join(wwwDir, 'index.html'));
writeFileSync(
  path.join(wwwDir, 'capacitor-start.txt'),
  `${startPath}\n`,
  'utf8'
);

sanitizeWwwForAndroid(wwwDir);

console.log('Syncing Capacitor native projects…');
execSync('npx cap sync android', { cwd: root, stdio: 'inherit' });
console.log('Done. Open Android Studio: npm run cap:open:android');
console.log('On a Mac with Xcode: npm run cap:open:ios');
