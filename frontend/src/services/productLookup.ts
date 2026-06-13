// Client-side image preparation for the vision scan endpoint. Downscales and
// re-encodes the photo so we ship a small JPEG (not a multi-MB camera capture).

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode the selected image'));
    img.src = src;
  });
}

/**
 * Resizes an image file to at most `maxWidth` px wide and returns a JPEG data URL.
 * Never upscales. Used before posting to `/api/scan/image`.
 */
export async function resizeImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
  const sourceUrl = await readFileAsDataUrl(file);
  const img = await loadImage(sourceUrl);

  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported on this device');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', quality);
}
