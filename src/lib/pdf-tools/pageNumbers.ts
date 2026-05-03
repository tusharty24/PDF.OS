import { StandardFonts, rgb } from 'pdf-lib';
import { loadPdf, toBlob } from './utils';

export async function addPageNumbers(file: File): Promise<Blob> {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const text = `${i + 1}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: 20,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });
  return toBlob(await doc.save());
}