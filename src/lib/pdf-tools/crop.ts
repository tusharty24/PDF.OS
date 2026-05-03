import { loadPdf, toBlob } from './utils';

export async function cropPdf(file: File, margins: { top: number; right: number; bottom: number; left: number }): Promise<Blob> {
  const doc = await loadPdf(file);
  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.setCropBox(
      margins.left,
      margins.bottom,
      width - margins.left - margins.right,
      height - margins.top - margins.bottom
    );
  }
  return toBlob(await doc.save());
}