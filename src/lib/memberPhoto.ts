/** Resize and compress a photo for storage inside vault JSON (IndexedDB). */

const MAX_DIMENSION = 480;
const MAX_DATA_URL_CHARS = 550_000;

async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to Image()
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}

export async function resizeImageFileToJpegDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('File too large');
  }

  const source = await loadImageSource(file);
  let w = source.width;
  let h = source.height;
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    if (w >= h) {
      h = Math.round((h * MAX_DIMENSION) / w);
      w = MAX_DIMENSION;
    } else {
      w = Math.round((w * MAX_DIMENSION) / h);
      h = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(source, 0, 0, w, h);
  if ('close' in source && typeof (source as ImageBitmap).close === 'function') {
    (source as ImageBitmap).close();
  }

  let q = 0.88;
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  while (dataUrl.length > MAX_DATA_URL_CHARS && q > 0.45) {
    q -= 0.08;
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error('Photo is still too large after compression — try a smaller image.');
  }
  return dataUrl;
}
