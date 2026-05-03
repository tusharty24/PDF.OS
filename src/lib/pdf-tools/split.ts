import { PDFDocument } from 'pdf-lib';
import { loadPdf, toBlob } from './utils';

export async function splitPdf(file: File, ranges: [number, number][]): Promise<Blob[]> {
  const src = await loadPdf(file);
  const blobs: Blob[] = [];
  for (const [start, end] of ranges) {
    const doc = await PDFDocument.create();
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    const pages = await doc.copyPages(src, indices);
    pages.forEach(p => doc.addPage(p));
    blobs.push(toBlob(await doc.save()));
  }
  return blobs;
}

export function parseSplitRanges(input: string): [number, number][] {
  return input.split(',').map(r => {
    const parts = r.trim().split('-').map(Number);
    if (parts.length === 1) return [parts[0], parts[0]] as [number, number];
    return [parts[0], parts[1]] as [number, number];
  }).filter(([a, b]) => !isNaN(a) && !isNaN(b) && a > 0 && b >= a);
}