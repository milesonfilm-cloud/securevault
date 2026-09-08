/**
 * Rebuild Strong Vault brand PNGs + Android adaptive launcher icons.
 * - Full lockup (transparent) → strongvault-logo.png
 * - Shield-only (transparent) → strongvault-icon.png  (in-app mark)
 * - Square app icon + mipmap densities for Android
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const ASSET = path.join(
  process.env.USERPROFILE,
  '.cursor/projects/c-Users-palla-Documents-SECUREVAULT-SECUREVAULT/assets',
  'c__Users_palla_AppData_Roaming_Cursor_User_workspaceStorage_4f215555b161b874086f587409648e8d_images_ChatGPT_Image_Aug_15__2026__12_23_53_AM-6417d278-0bb1-49bc-9e4d-e3c17c29baf3.png'
);

const PASTEL = { r: 246, g: 245, b: 250, alpha: 1 };
const BG_HEX = '#F6F5FA';

async function punchNearWhite(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const px = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const q = [];
  const isPlate = (i) => {
    const o = i * channels;
    // near-white plate (and near-black leftovers)
    const r = px[o];
    const g = px[o + 1];
    const b = px[o + 2];
    const nearWhite = r >= 238 && g >= 238 && b >= 238;
    const nearBlack = r <= 22 && g <= 22 && b <= 22;
    return nearWhite || nearBlack;
  };
  for (let x = 0; x < width; x++) {
    q.push(x);
    q.push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    q.push(y * width);
    q.push(y * width + width - 1);
  }
  while (q.length) {
    const i = q.pop();
    if (i < 0 || i >= width * height || visited[i]) continue;
    visited[i] = 1;
    if (!isPlate(i)) continue;
    px[i * channels + 3] = 0;
    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) q.push(i - 1);
    if (x < width - 1) q.push(i + 1);
    if (y > 0) q.push(i - width);
    if (y < height - 1) q.push(i + width);
  }
  // Only edge-connected plate pixels are removed above. Do not globally
  // remove white pixels: the dial, rivets and folder outlines are intentional.
  // soften jagged alpha by 1px average
  const out = Buffer.from(px);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += px[((y + dy) * width + (x + dx)) * channels + 3];
        }
      }
      out[i * channels + 3] = Math.round(sum / 9);
    }
  }
  return {
    buf: await sharp(out, { raw: { width, height, channels } }).png().toBuffer(),
    width,
    height,
  };
}

async function writePng(file, buf) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

async function main() {
  if (!fs.existsSync(ASSET)) throw new Error('source logo missing: ' + ASSET);
  const raw = fs.readFileSync(ASSET);
  const { buf: full, width, height } = await punchNearWhite(raw);
  await writePng(path.join(ROOT, 'public/brand/strongvault-logo.png'), full);

  // Shield-only: include the complete shield but stop before the wordmark.
  const cropH = Math.max(1, Math.min(height - 1, Math.round(height * 0.72)));
  let icon = await sharp(full)
    .extract({ left: 0, top: 0, width, height: cropH })
    .png()
    .toBuffer();
  try {
    icon = await sharp(icon).trim({ threshold: 12 }).png().toBuffer();
  } catch {
    /* keep untrimmed */
  }
  // In-app mark: transparent shield with padding. Never bake a square plate
  // behind this asset; it must blend on white cards and pastel pages alike.
  const iconMeta = await sharp(icon).metadata();
  const side = Math.max(iconMeta.width || 512, iconMeta.height || 512);
  const canvas = Math.round(side * 1.12);
  const transparentIcon = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(icon)
          .resize(Math.round(canvas * 0.88), Math.round(canvas * 0.88), { fit: 'inside' })
          .png()
          .toBuffer(),
        gravity: 'centre',
      },
    ])
    .png()
    .toBuffer();
  await writePng(path.join(ROOT, 'public/brand/strongvault-icon.png'), transparentIcon);
  // Versioned filename busts Android WebView's persistent image cache.
  await writePng(path.join(ROOT, 'public/brand/strongvault-mark-v5.png'), transparentIcon);

  // App icon master 1024² — pastel fill, shield sized for adaptive safe zone (~66%)
  const masterSize = 1024;
  const fgSize = Math.round(masterSize * 0.66);
  const shieldOnPastel = await sharp({
    create: { width: masterSize, height: masterSize, channels: 4, background: PASTEL },
  })
    .composite([
      {
        input: await sharp(icon).resize(fgSize, fgSize, { fit: 'inside' }).png().toBuffer(),
        gravity: 'centre',
      },
    ])
    .png()
    .toBuffer();
  await writePng(path.join(ROOT, 'public/brand/strongvault-app-icon.png'), shieldOnPastel);

  // Adaptive foreground: transparent canvas, shield in safe zone (no full-bleed edges)
  const fgSafe = Math.round(masterSize * 0.62);
  const adaptiveFg = await sharp({
    create: {
      width: masterSize,
      height: masterSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(icon).resize(fgSafe, fgSafe, { fit: 'inside' }).png().toBuffer(),
        gravity: 'centre',
      },
    ])
    .png()
    .toBuffer();

  // Densities (px) for launcher bitmaps
  const densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };
  // Foreground adaptive recommended ~432 for xxxhdpi (108dp * 4)
  const fgDensities = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
  };

  for (const [folder, size] of Object.entries(densities)) {
    const dir = path.join(ROOT, 'android/app/src/main/res', folder);
    fs.mkdirSync(dir, { recursive: true });
    const square = await sharp(shieldOnPastel).resize(size, size).png().toBuffer();
    await writePng(path.join(dir, 'ic_launcher.png'), square);
    await writePng(path.join(dir, 'ic_launcher_round.png'), square);
  }
  for (const [folder, size] of Object.entries(fgDensities)) {
    const dir = path.join(ROOT, 'android/app/src/main/res', folder);
    const fg = await sharp(adaptiveFg).resize(size, size).png().toBuffer();
    await writePng(path.join(dir, 'ic_launcher_foreground.png'), fg);
  }

  // Pastel adaptive background color
  fs.writeFileSync(
    path.join(ROOT, 'android/app/src/main/res/values/ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BG_HEX}</color>\n</resources>\n`
  );

  // Splash
  const splash = path.join(ROOT, 'android/app/src/main/res/drawable/splash.png');
  if (fs.existsSync(path.dirname(splash))) {
    await writePng(splash, shieldOnPastel);
  }

  // Sync web / capacitor brand copies
  for (const dir of ['www/brand', 'android/app/src/main/assets/public/brand']) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of [
      'strongvault-logo.png',
      'strongvault-icon.png',
      'strongvault-mark-v5.png',
      'strongvault-app-icon.png',
    ]) {
      fs.copyFileSync(path.join(ROOT, 'public/brand', name), path.join(abs, name));
    }
  }

  // iOS if present
  const ios = path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  if (fs.existsSync(ios)) fs.copyFileSync(path.join(ROOT, 'public/brand/strongvault-app-icon.png'), ios);

  console.log('Brand + Android icons rebuilt');
  console.log({
    full: `${width}x${height}`,
    iconBytes: fs.statSync(path.join(ROOT, 'public/brand/strongvault-icon.png')).size,
    appBytes: fs.statSync(path.join(ROOT, 'public/brand/strongvault-app-icon.png')).size,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
