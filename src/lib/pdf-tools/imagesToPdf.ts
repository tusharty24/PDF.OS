import { PDFDocument } from 'pdf-lib';
import { toBlob } from './utils';

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const data = await file.arrayBuffer();
    const bytes = new Uint8Array(data);
    let image;
    if (file.type === 'image/png') {
      image = await doc.embedPng(bytes);
    } else {
      image = await doc.embedJpg(bytes);
    }
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return toBlob(await doc.save());
}