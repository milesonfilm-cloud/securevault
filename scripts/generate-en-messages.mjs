import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catPath = path.join(root, 'src', 'lib', 'categories.ts');
const raw = fs.readFileSync(catPath, 'utf8');

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function extractBracketContent(s, fromIdx, openChar, closeChar) {
  let depth = 0;
  const start = fromIdx;
  for (let j = start; j < s.length; j++) {
    if (s[j] === openChar) depth++;
    else if (s[j] === closeChar) {
      depth--;
      if (depth === 0) return s.slice(start + 1, j);
    }
  }
  return '';
}

const categories = {};
const catRe =
  /\{\s*id: '([^']+)',\s*label: '((?:\\'|[^'])*)',\s*shortLabel: '((?:\\'|[^'])*)',/g;
let m;
while ((m = catRe.exec(raw)) !== null) {
  const id = m[1];
  const label = m[2].replace(/\\'/g, "'");
  const shortLabel = m[3].replace(/\\'/g, "'");
  const from = m.index;
  const block = raw.slice(from, from + 12000);
  const fi = block.indexOf('fields: [');
  if (fi < 0) continue;
  const arrStart = fi + 'fields: ['.length - 1;
  const fieldsBody = extractBracketContent(block, arrStart, '[', ']');
  const fields = {};
  const fkRe = /key: '((?:\\'|[^'])*)',[\s\S]*?label: '((?:\\'|[^'])*)'/g;
  let fm;
  while ((fm = fkRe.exec(fieldsBody)) !== null) {
    const fk = fm[1].replace(/\\'/g, "'");
    const fl = fm[2].replace(/\\'/g, "'");
    fields[slug(fk)] = fl;
  }
  categories[id] = { label, shortLabel, fields };
}

const outPath = path.join(root, 'scripts', 'tmp', 'en.categories.generated.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ categories }, null, 2), 'utf8');
console.log('Wrote', outPath, 'categories:', Object.keys(categories).length);
