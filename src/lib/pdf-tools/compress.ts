export type CompressionLevel = 'lossless' | 'balanced' | 'max';

export async function compressPdf(
  file: File,
  level: CompressionLevel = 'balanced',
  onProgress?: (message: string) => void
): Promise<{
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
}> {
  const originalSize = file.size;
  const fileBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../../workers/ghostscript.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      const { type, message, output } = e.data;

      if (type === 'progress') {
        onProgress?.(message);
      } else if (type === 'done') {
        worker.terminate();
        const blob = new Blob([output], { type: 'application/pdf' });
        const compressedSize = blob.size;
        resolve({
          blob,
          originalSize,
          compressedSize,
          savedPercent: Math.max(0, ((originalSize - compressedSize) / originalSize) * 100),
        });
      } else if (type === 'error') {
        worker.terminate();
        reject(new Error(message));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(new Error(err.message));
    };

    worker.postMessage({ fileBuffer, level }, [fileBuffer]);
  });
}