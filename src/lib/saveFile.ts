import { isNativeApp } from '@/lib/platform';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      const comma = dataUrl.indexOf(',');
      resolve(comma >= 0 ? dataUrl.slice(comma + 1) : '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

/** Browser download, or Android/iOS share sheet so the user can save the file. */
export async function saveOrShareFile(
  blob: Blob,
  filename: string,
  mimeType = blob.type || 'application/octet-stream'
): Promise<void> {
  if (isNativeApp()) {
    const { Directory, Filesystem } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const data = await blobToBase64(blob);
    const written = await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Cache,
    });
    try {
      await Share.share({
        title: filename,
        text: filename,
        url: written.uri,
        dialogTitle: filename,
      });
    } catch (err) {
      const msg = String((err as Error)?.message ?? err).toLowerCase();
      if (msg.includes('cancel') || msg.includes('dismiss')) return;
      throw err;
    }
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.type = mimeType;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}
