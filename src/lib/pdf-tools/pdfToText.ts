import { getPdfjsLib } from './utils';

export async function pdfToText(file: File): Promise<string> {
  const pdfjsLib = await getPdfjsLib();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str).join(' ');
    fullText += `--- Page ${i} ---\n${strings}\n\n`;
  }
  return fullText;
}
