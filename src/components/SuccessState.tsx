interface SuccessStateProps {
  originalSize?: number;
  resultSize?: number;
  onDownload: () => void;
  filename: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function SuccessState({ originalSize, resultSize, onDownload, filename }: SuccessStateProps) {
  return (
    <div className="glass-card rounded-3xl p-12 sm:p-16 text-center animate-fade-in-up border-white/10 bg-surface-tint/[0.02] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-surface-tint/10 blur-[80px] -mr-24 -mt-24 transition-opacity opacity-50 group-hover:opacity-100"></div>

      <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-surface-container-high mb-8 border border-surface-tint/20 group-hover:scale-110 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <span className="material-symbols-outlined text-5xl text-surface-tint" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>

      <h3 className="font-headline text-5xl text-white mb-3 font-black tracking-tighter uppercase leading-none">Task<br /><span className="text-surface-tint">Finished!</span></h3>
      <p className="text-[10px] font-body text-on-surface-variant uppercase tracking-[0.4em] font-black mb-12">Your file is ready for download.</p>

      <div className="bg-surface-container-lowest glass-card py-5 px-8 rounded-2xl inline-block mb-12 border-white/5 mx-auto max-w-full">
        <p className="text-xs font-body font-bold text-surface-tint truncate whitespace-nowrap overflow-hidden max-w-[200px] sm:max-w-xs uppercase tracking-widest">{filename}</p>
      </div>

      {originalSize != null && resultSize != null && (
        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 mb-16 text-center">
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-[0.3em] text-on-surface-variant block font-black">Original Size</span>
            <span className="text-3xl text-white font-headline font-black tracking-tighter uppercase">{formatSize(originalSize)}</span>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10 self-center"></div>
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-[0.3em] text-surface-tint block font-black">New Size</span>
            <span className="text-3xl text-surface-tint font-headline font-black tracking-tighter uppercase">{formatSize(resultSize)}</span>
          </div>
        </div>
      )}

      <button
        onClick={onDownload}
        className="w-full bg-white text-black py-6 rounded-2xl font-headline font-black text-xs tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 group/btn"
      >
        <span className="material-symbols-outlined text-xl group-hover/btn:translate-y-1 transition-transform">download</span>
        Download Now
      </button>
    </div>
  );
}
