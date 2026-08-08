/**
 * Re-applies SecureVault iOS fixes to @capgo/capacitor-share-target after npm install.
 * Capgo 7.0.x ships a placeholder App Group ID that cannot receive share events.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'patches', 'capgo-share-target', 'CapacitorShareTargetPlugin.swift');
const dest = path.join(
  root,
  'node_modules',
  '@capgo',
  'capacitor-share-target',
  'ios',
  'Sources',
  'CapacitorShareTargetPlugin',
  'CapacitorShareTargetPlugin.swift'
);

if (!fs.existsSync(src)) {
  console.warn('[patch-capgo-share-target] missing patch source, skip');
  process.exit(0);
}
if (!fs.existsSync(path.dirname(dest))) {
  console.warn('[patch-capgo-share-target] plugin not installed, skip');
  process.exit(0);
}
fs.copyFileSync(src, dest);
console.log('[patch-capgo-share-target] applied CapacitorShareTargetPlugin.swift');
