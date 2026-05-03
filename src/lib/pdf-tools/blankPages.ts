import { PDFDocument, PageSizes } from 'pdf-lib';
import { loadPdf, toBlob } from './utils';

export async function addBlankPages(file: File, afterPages: number[]): Promise<Blob> {
  const src = await loadPdf(file);
  const doc = await PDFDocument.create();
  const allPages = await doc.copyPages(src, src.getPageIndices());
  for (let i = 0; i < allPages.length; i++) {
    doc.addPage(allPages[i]);
    if (afterPages.includes(i)) {
      doc.addPage(PageSizes.A4);
    }
  }
  return toBlob(await doc.save());
}