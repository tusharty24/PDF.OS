import { getPdfjsLib } from './utils';

export async function pdfToImages(file: File): Promise<Blob[]> {
  const pdfjsLib = await getPdfjsLib();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const blobs: Blob[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    const renderTask = page.render({ canvasContext: ctx, viewport } as any);
    await (renderTask.promise ?? renderTask);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => {
        if (b) resolve(b);
        else reject(new Error('Failed to create image blob'));
      }, 'image/png');
    });
    blobs.push(blob);
  }
  return blobs;
}