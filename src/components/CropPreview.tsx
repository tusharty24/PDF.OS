import { useEffect, useRef, useState, useCallback } from "react";

type PDFDoc = import("pdfjs-dist").PDFDocumentProxy;

interface CropPreviewProps {
  pdfDoc: PDFDoc;
  pageCount: number;
  margins: { top: number; right: number; bottom: number; left: number };
  onMarginsChange: (m: { top: number; right: number; bottom: number; left: number }) => void;
}

type Edge = "top" | "right" | "bottom" | "left" | null;

export function CropPreview({ pdfDoc, pageCount, margins, onMarginsChange }: CropPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(1);
  const [dims, setDims] = useState({ pdfW: 612, pdfH: 792, scale: 1 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [draggingEdge, setDraggingEdge] = useState<Edge>(null);
  const dragStartRef = useRef({ pos: 0, margin: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await pdfDoc.getPage(activePage);
        const baseVp = page.getViewport({ scale: 1 });
        const maxW = 800;
        const renderScale = Math.min(1.5, maxW / baseVp.width);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setCanvasSize({ width: viewport.width, height: viewport.height });
        setDims({ pdfW: baseVp.width, pdfH: baseVp.height, scale: renderScale });
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport } as any).promise;
      } catch { /* unmounted */ }
    })();
    return () => { cancelled = true; };
  }, [pdfDoc, activePage]);

  const s = dims.scale;
  const cropLeft = margins.left * s;
  const cropTop = margins.top * s;
  const cropW = Math.max(0, (dims.pdfW - margins.left - margins.right) * s);
  const cropH = Math.max(0, (dims.pdfH - margins.top - margins.bottom) * s);
  const cropRight = cropLeft + cropW;
  const cropBottom = cropTop + cropH;

  const getEdge = (mx: number, my: number): Edge => {
    const threshold = 15;
    if (Math.abs(my - cropTop) < threshold && mx >= cropLeft - threshold && mx <= cropRight + threshold) return "top";
    if (Math.abs(my - cropBottom) < threshold && mx >= cropLeft - threshold && mx <= cropRight + threshold) return "bottom";
    if (Math.abs(mx - cropLeft) < threshold && my >= cropTop - threshold && my <= cropBottom + threshold) return "left";
    if (Math.abs(mx - cropRight) < threshold && my >= cropTop - threshold && my <= cropBottom + threshold) return "right";
    return null;
  };

  const getCursor = (edge: Edge) => {
    if (edge === "top" || edge === "bottom") return "ns-resize";
    if (edge === "left" || edge === "right") return "ew-resize";
    return "default";
  };

  const [hoverEdge, setHoverEdge] = useState<Edge>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const edge = getEdge(mx, my);
    if (!edge) return;

    setDraggingEdge(edge);
    const pos = edge === "top" || edge === "bottom" ? e.clientY : e.clientX;
    dragStartRef.current = { pos, margin: margins[edge] };
    e.preventDefault();
  }, [margins, cropTop, cropBottom, cropLeft, cropRight]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (!draggingEdge) {
      setHoverEdge(getEdge(mx, my));
      return;
    }

    const edge = draggingEdge;
    const isVertical = edge === "top" || edge === "bottom";
    const currentPos = isVertical ? e.clientY : e.clientX;
    const delta = currentPos - dragStartRef.current.pos;
    const pdfDelta = delta / s;

    let newMargin: number;
    if (edge === "top" || edge === "left") {
      newMargin = Math.max(0, dragStartRef.current.margin + pdfDelta);
    } else {
      newMargin = Math.max(0, dragStartRef.current.margin - pdfDelta);
    }

    const maxDim = isVertical ? dims.pdfH : dims.pdfW;
    const oppositeEdge = edge === "top" ? "bottom" : edge === "bottom" ? "top" : edge === "left" ? "right" : "left";
    newMargin = Math.min(newMargin, maxDim - margins[oppositeEdge] - 20);

    onMarginsChange({ ...margins, [edge]: Math.round(newMargin) });
  }, [draggingEdge, margins, s, dims, onMarginsChange]);

  const handleMouseUp = useCallback(() => {
    setDraggingEdge(null);
  }, []);

  const activeCursor = draggingEdge ? getCursor(draggingEdge) : hoverEdge ? getCursor(hoverEdge) : "default";

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h4 className="font-headline text-[10px] font-bold uppercase tracking-widest text-surface-tint">Spatio-Temporal Crop</h4>
        <div className="flex items-center gap-2">
          <button onClick={() => setActivePage(Math.max(1, activePage - 1))} className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span className="text-[10px] font-mono text-outline-variant uppercase tracking-widest">SLATE {activePage} / {pageCount}</span>
          <button onClick={() => setActivePage(Math.min(pageCount, activePage + 1))} className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto rounded-2xl overflow-hidden cursor-move border border-white/5 bg-black/40 shadow-2xl select-none"
        style={{ width: canvasSize.width, height: canvasSize.height, cursor: activeCursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="block w-full h-full opacity-60" />

        {/* Dimmed overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bg-surface-container-highest/60 backdrop-blur-sm" style={{ top: 0, left: 0, right: 0, height: Math.max(0, cropTop) }} />
          <div className="absolute bg-surface-container-highest/60 backdrop-blur-sm" style={{ bottom: 0, left: 0, right: 0, height: Math.max(0, canvasSize.height - cropBottom) }} />
          <div className="absolute bg-surface-container-highest/60 backdrop-blur-sm" style={{ top: cropTop, left: 0, width: Math.max(0, cropLeft), height: Math.max(0, cropH) }} />
          <div className="absolute bg-surface-container-highest/60 backdrop-blur-sm" style={{ top: cropTop, right: 0, width: Math.max(0, canvasSize.width - cropRight), height: Math.max(0, cropH) }} />

          {/* Crop border */}
          <div
            className="absolute border-2 border-surface-tint shadow-[0_0_30px_rgba(0,220,229,0.3)] transition-all"
            style={{ top: cropTop, left: cropLeft, width: Math.max(0, cropW), height: Math.max(0, cropH) }}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-surface-tint rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-surface-tint rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-surface-tint rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-surface-tint rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Margin values display */}
      <div className="grid grid-cols-4 gap-4 p-4 glass-card bg-surface-container-lowest/50 border-white/5 rounded-2xl">
        {(["top", "right", "bottom", "left"] as const).map(side => (
          <div key={side} className="space-y-2">
            <span className="text-[9px] font-headline font-black uppercase tracking-widest text-on-surface-variant block text-center px-1">{side}</span>
            <input
              type="number"
              value={margins[side]}
              onChange={(e) => onMarginsChange({ ...margins, [side]: Math.max(0, Number(e.target.value)) })}
              className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-2 py-3 text-white font-headline text-center text-sm focus:ring-1 focus:ring-surface-tint transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
