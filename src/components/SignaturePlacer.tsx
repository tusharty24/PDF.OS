import { useEffect, useRef, useState } from "react";

interface SignaturePlacerProps {
  pdfDoc: any;
  pageCount: number;
  signatureDataUrl: string;
  onConfirm: (pageIndex: number, position: { x: number; y: number; width: number; height: number }) => void;
  onBack: () => void;
}

export function SignaturePlacer({ pdfDoc, pageCount, signatureDataUrl, onConfirm, onBack }: SignaturePlacerProps) {
  const [activePage, setActivePage] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [sigPos, setSigPos] = useState({ x: 50, y: 50 });
  const [sigSize, setSigSize] = useState({ width: 180, height: 70 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const scale = useRef(1);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const page = await pdfDoc.getPage(activePage);
      const baseVp = page.getViewport({ scale: 1 });
      const maxW = 800;
      const s = Math.min(1.5, maxW / baseVp.width);
      scale.current = s;
      const viewport = page.getViewport({ scale: s });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setCanvasSize({ width: viewport.width, height: viewport.height });
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport } as any).promise;
    };
    render();
    return () => { cancelled = true; };
  }, [pdfDoc, activePage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (Math.abs(mx - (sigPos.x + sigSize.width)) < 20 && Math.abs(my - (sigPos.y + sigSize.height)) < 20) {
      setResizing(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (mx >= sigPos.x && mx <= sigPos.x + sigSize.width && my >= sigPos.y && my <= sigPos.y + sigSize.height) {
      setDragging(true);
      dragStart.current = { x: e.clientX - sigPos.x, y: e.clientY - sigPos.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setSigPos({
        x: Math.max(0, Math.min(e.clientX - dragStart.current.x, canvasSize.width - sigSize.width)),
        y: Math.max(0, Math.min(e.clientY - dragStart.current.y, canvasSize.height - sigSize.height)),
      });
    } else if (resizing) {
      const dx = e.clientX - dragStart.current.x;
      const newW = Math.max(60, sigSize.width + dx);
      const ratio = newW / sigSize.width;
      setSigSize({ width: newW, height: sigSize.height * ratio });
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  const handleConfirm = async () => {
    const page = await pdfDoc.getPage(activePage);
    const baseVp = page.getViewport({ scale: 1 });
    const pdfH = baseVp.height;
    const s = scale.current;

    const pdfX = sigPos.x / s;
    const pdfSigW = sigSize.width / s;
    const pdfSigH = sigSize.height / s;
    const pdfY = pdfH - (sigPos.y / s) - pdfSigH;

    onConfirm(activePage - 1, { x: pdfX, y: pdfY, width: pdfSigW, height: pdfSigH });
  };

  return (
    <div className="glass-card rounded-2xl p-8 animate-fade-in-up bg-surface-container-low border-white/5 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-2xl text-white font-black tracking-tighter uppercase">Spatial Embed</h3>

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

      {/* Canvas + signature overlay */}
      <div
        ref={containerRef}
        className="relative mx-auto rounded-2xl overflow-hidden cursor-move border border-white/5 bg-black/40 shadow-2xl"
        style={{ width: canvasSize.width, height: canvasSize.height, transition: 'width 0.3s, height 0.3s' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="block" />

        {/* Signature Overlay */}
        <div
          className="absolute border-2 border-surface-tint shadow-[0_0_20px_rgba(0,220,229,0.4)] transition-shadow pointer-events-none"
          style={{
            left: sigPos.x,
            top: sigPos.y,
            width: sigSize.width,
            height: sigSize.height,
            backgroundColor: 'rgba(0, 220, 229, 0.05)'
          }}
        >
          <img
            src={signatureDataUrl}
            alt="Signature"
            className="w-full h-full object-contain filter brightness-0 invert"
          />
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-surface-tint rounded-tl-xl flex items-center justify-center cursor-nwse-resize"
            style={{ marginRight: -1, marginBottom: -1 }}
          >
            <span className="material-symbols-outlined text-surface text-[14px]">open_with</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <button
          onClick={handleConfirm}
          className="flex-1 bg-primary-container text-on-primary-container py-4 rounded-xl font-headline font-black text-sm tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,235,245,0.15)] flex items-center justify-center gap-2"
        >
          Finalize Placement
        </button>
        <button onClick={onBack} className="px-6 py-4 rounded-xl border border-white/5 text-[10px] font-headline font-bold uppercase tracking-widest text-outline-variant hover:bg-white/5 hover:text-white transition-all">
          Redraw Identity
        </button>
      </div>
    </div>
  );
}
