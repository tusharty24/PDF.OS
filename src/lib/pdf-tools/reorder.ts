import { PDFDocument } from 'pdf-lib';
import { loadPdf, toBlob } from './utils';

export async function reorderPages(file: File, newOrder: number[]): Promise<Blob> {
  const src = await loadPdf(file);
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, newOrder);
  pages.forEach(p => doc.addPage(p));
  return toBlob(await doc.save());
}