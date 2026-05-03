import { degrees } from 'pdf-lib';
import { loadPdf, toBlob } from './utils';

export async function rotatePdf(file: File, pageRotations: Record<number, number>): Promise<Blob> {
  const doc = await loadPdf(file);
  const pages = doc.getPages();
  for (const [pageIdx, deg] of Object.entries(pageRotations)) {
    const page = pages[Number(pageIdx)];
    if (page) {
      const current = page.getRotation().angle;
      page.setRotation(degrees(current + deg));
    }
  }
  return toBlob(await doc.save());
}