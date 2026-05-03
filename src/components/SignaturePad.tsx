import { useRef, useState, useEffect, useCallback } from "react";

interface SignaturePadProps {
  onSignature: (dataUrl: string) => void;
}

export function SignaturePad({ onSignature }: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [isEmpty, setIsEmpty] = useState(true);
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Load Dancing Script font
  useEffect(() => {
    if (!document.querySelector('link[href*="Dancing+Script"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }, []);

  useEffect(() => {
    clearCanvas();
    setTypedName("");
  }, [mode, clearCanvas]);

  // Render typed text onto canvas
  useEffect(() => {
    if (mode !== "type") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (typedName.trim()) {
      ctx.font = '48px "Dancing Script", cursive';
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [typedName, mode]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== "draw") return;
    isDrawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || mode !== "draw") return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const endDraw = () => {
    isDrawing.current = false;
  };

  const handleUse = () => {
    if (isEmpty) return;
    const dataUrl = canvasRef.current!.toDataURL("image/png");
    onSignature(dataUrl);
  };

  return (
    <div className="glass-card rounded-2xl p-10 animate-fade-in-up bg-surface-container-low border-white/5 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-2xl text-white font-black tracking-tighter uppercase">Signature Matrix</h3>

        {/* Mode tabs */}
        <div className="flex gap-2 p-1 bg-surface-container-high rounded-full border border-white/5">
          {(["draw", "type"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-2 rounded-full text-[10px] font-headline font-black uppercase tracking-widest transition-all ${mode === m
                  ? "bg-surface-tint text-surface shadow-[0_0_20px_rgba(0,220,229,0.3)]"
                  : "text-on-surface-variant hover:text-white"
                }`}
            >
              {m === "draw" ? "Ink" : "Text"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Type input */}
        {mode === "type" && (
          <div className="group animate-fade-in-up">
            <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-2 px-1">Identity String</label>
            <input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="TYPE IDENTIFIER"
              className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-4 text-white font-headline text-xl focus:ring-1 focus:ring-surface-tint transition-all placeholder:text-white/10"
            />
          </div>
        )}

        {/* Canvas */}
        <div className="bg-surface-container-lowest glass-card rounded-2xl border-white/5 relative overflow-hidden group">
          <div className="absolute top-2 left-2 text-[8px] font-mono text-white/10 uppercase tracking-[0.4em] pointer-events-none">Vector Plane</div>
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full h-[200px] cursor-crosshair opacity-90 transition-opacity group-hover:opacity-100"
            style={{ touchAction: "none" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={handleUse}
          disabled={isEmpty}
          className="flex-1 bg-primary-container text-on-primary-container py-4 rounded-xl font-headline font-black text-sm tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale shadow-[0_0_30px_rgba(0,235,245,0.15)] flex items-center justify-center gap-2 group/btn"
        >
          <span className="material-symbols-outlined text-sm group-hover/btn:translate-y-1 transition-transform">verified</span>
          Authorize Signature
        </button>
        <button onClick={clearCanvas} className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/5 text-outline-variant hover:bg-white/5 hover:text-error transition-all">
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}
