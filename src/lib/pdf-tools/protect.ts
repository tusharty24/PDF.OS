import { PDF } from '@libpdf/core';

export async function protectPdf(
  file: File,
  userPassword: string,
  ownerPassword: string
): Promise<Blob> {
  const data = await file.arrayBuffer();
  const pdf = await PDF.load(new Uint8Array(data));
  pdf.setProtection({
    userPassword,
    ownerPassword: ownerPassword || userPassword,
    algorithm: 'AES-256' as any,
  });
  const encrypted = await pdf.save();
  return new Blob([encrypted as any], { type: 'application/pdf' });
}