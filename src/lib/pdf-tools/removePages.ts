import { PDFDocument } from 'pdf-lib';
import { loadPdf, toBlob } from './utils';

export async function removePages(file: File, pagesToRemove: number[]): Promise<Blob> {
  const src = await loadPdf(file);
  const doc = await PDFDocument.create();
  const keepIndices = src.getPageIndices().filter(i => !pagesToRemove.includes(i));
  const pages = await doc.copyPages(src, keepIndices);
  pages.forEach(p => doc.addPage(p));
  return toBlob(await doc.save());
}