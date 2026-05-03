import { getPdfjsLib } from './utils';

export async function pdfToAI(file: File): Promise<string> {
  const pdfjsLib = await getPdfjsLib();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pagesData = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str).join(' ').replace(/\\s+/g, ' ').trim();
    pagesData.push({ page: i, content: strings });
  }
  return JSON.stringify({
    metadata: {
      totalPages: pdf.numPages,
      filename: file.name
    },
    pages: pagesData
  }, null, 2);
}