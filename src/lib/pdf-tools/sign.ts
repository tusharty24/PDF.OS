import { loadPdf, toBlob } from './utils';

export async function signPdf(
  file: File,
  signatureDataUrl: string,
  pageIndex: number,
  position: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const doc = await loadPdf(file);
  const pages = doc.getPages();
  const page = pages[pageIndex];
  const base64 = signatureDataUrl.split(',')[1];
  const pngBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const image = await doc.embedPng(pngBytes);
  page.drawImage(image, {
    x: position.x,
    y: position.y,
    width: position.width,
    height: position.height,
  });
  return toBlob(await doc.save());
}