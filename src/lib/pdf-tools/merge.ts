import { PDFDocument } from 'pdf-lib';
import { loadPdf, toBlob } from './utils';

export async function mergePdfs(files: File[]): Promise<Blob> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const src = await loadPdf(file);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  return toBlob(await merged.save());
}