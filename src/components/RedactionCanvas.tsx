import { useRef, useState, useEffect } from 'react';
import type { RedactionArea } from '../lib/pdfTools';

interface Props {
  pageImageUrl: string;
  pageIndex: number;
  redactions: RedactionArea[];
  onAdd: (area: RedactionArea) => void;
  onClear: (pageIndex: number) => void;
}

export function RedactionCanvas({
  pageImageUrl,
  pageIndex,
  redactions,
  onAdd,
  onClear,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw committed redaction boxes
      ctx.fillStyle = '#000000';
      redactions
        .filter(r => r.page === pageIndex)
        .forEach(r => {
          ctx.fillRect(
            r.x * canvas.width,
            r.y * canvas.height,
            r.width * canvas.width,
            r.height * canvas.height
          );
        });

      // Draw in-progress box
      if (drawing && start && current) {
        ctx.fillStyle = 'rgba(0, 220, 229, 0.3)';
        ctx.strokeStyle = '#00dce5';
        ctx.lineWidth = 2;
        const x = Math.min(start.x, current.x) * canvas.width;
        const y = Math.min(start.y, current.y) * canvas.height;
        const w = Math.abs(current.x - start.x) * canvas.width;
        const h = Math.abs(current.y - start.y) * canvas.height;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }
    };
    img.src = pageImageUrl;
  }, [pageImageUrl, redactions, drawing, start, current, pageIndex]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const pageRedactionCount = redactions.filter(r => r.page === pageIndex).length;

  return (
    <div className="animate-fade-in-up">
      <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-black/40">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair select-none rounded-2xl"
          onMouseDown={e => { setDrawing(true); const p = getPos(e); setStart(p); setCurrent(p); }}
          onMouseMove={e => { if (drawing) setCurrent(getPos(e)); }}
          onMouseUp={() => {
            if (!drawing || !start || !current) return;
            setDrawing(false);
            const x = Math.min(start.x, current.x);
            const y = Math.min(start.y, current.y);
            const width = Math.abs(current.x - start.x);
            const height = Math.abs(current.y - start.y);
            if (width > 0.001 && height > 0.001) {
              onAdd({ page: pageIndex, x, y, width, height });
            }
            setStart(null); setCurrent(null);
          }}
          onMouseLeave={() => { setDrawing(false); setStart(null); setCurrent(null); }}
        />
        <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-surface-tint text-surface text-[9px] font-headline font-black px-2 py-1 rounded tracking-tighter uppercase">Redaction Mode</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-surface-tint rounded-full animate-pulse"></span>
          <span className="text-[10px] font-mono text-outline-variant uppercase tracking-widest leading-none">
            {pageRedactionCount > 0
              ? `${pageRedactionCount} VECTORS MARKED ON THIS SLATE`
              : 'DRAG TO DEFINE REDACTION VECTORS'}
          </span>
        </div>
        {pageRedactionCount > 0 && (
          <button
            onClick={() => onClear(pageIndex)}
            className="flex items-center gap-2 text-[10px] font-headline font-bold uppercase tracking-widest text-error/60 hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            Flush Slate
          </button>
        )}
      </div>
    </div>
  );
}
