import { loadPdf, toBlob } from './utils';

export async function repairPdf(file: File): Promise<Blob> {
  const doc = await loadPdf(file);
  return toBlob(await doc.save());
}