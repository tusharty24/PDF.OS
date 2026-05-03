export type RedactionArea = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function redactPdf(
  file: File,
  redactions: RedactionArea[],
  onProgress?: (message: string) => void
): Promise<Blob> {
  const fileBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../../workers/mupdf.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      const { type, message, output } = e.data;

      if (type === 'progress') {
        onProgress?.(message);
      } else if (type === 'done') {
        worker.terminate();
        resolve(new Blob([output], { type: 'application/pdf' }));
      } else if (type === 'error') {
        worker.terminate();
        reject(new Error(message));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(new Error(err.message));
    };

    worker.postMessage({ fileBuffer, redactions }, [fileBuffer]);
  });
}