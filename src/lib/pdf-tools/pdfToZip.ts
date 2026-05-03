import { pdfToImages } from './pdfToImages';

export async function pdfToZip(file: File): Promise<Blob> {
  const imageBlobs = await pdfToImages(file);
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  imageBlobs.forEach((blob, i) => {
    const pageNum = String(i + 1).padStart(3, '0');
    zip.file(`page-${pageNum}.png`, blob);
  });
  return await zip.generateAsync({ type: 'blob' });
}