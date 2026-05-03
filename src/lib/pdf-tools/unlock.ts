import { PDF } from '@libpdf/core';

export async function unlockPdf(
  file: File,
  password: string
): Promise<Blob> {
  const data = await file.arrayBuffer();
  try {
    const pdf = await PDF.load(new Uint8Array(data), { credentials: password } as any);
    (pdf as any).removeProtection();
    const unlocked = await pdf.save();
    return new Blob([unlocked as any], { type: 'application/pdf' });
  } catch {
    throw new Error('Incorrect password or unsupported encryption.');
  }
}