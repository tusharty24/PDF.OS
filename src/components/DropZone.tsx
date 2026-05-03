import { useCallback, useState, useRef } from "react";

const MAX_SIZE_MB = 100;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
}

export function DropZone({ accept, multiple = false, onFiles, label }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = useCallback((files: File[]) => {
    const oversized = files.filter(f => f.size > MAX_SIZE_BYTES);
    if (oversized.length > 0) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (accept === '.pdf') {
      const wrongType = files.filter(f => f.type !== 'application/pdf');
      if (wrongType.length > 0) {
        setError('Please select a valid PDF file.');
        return;
      }
    }

    setError('');
    onFiles(files);
  }, [accept, onFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) validateAndEmit(files);
  }, [validateAndEmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) validateAndEmit(files);
  }, [validateAndEmit]);

  return (
    <div className="animate-fade-in-up">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`glass-card rounded-3xl p-16 sm:p-24 text-center cursor-pointer transition-all duration-500 group border-2 border-dashed ${dragOver
          ? "border-surface-tint bg-surface-tint/10 shadow-[0_0_50px_rgba(0,220,229,0.2)] scale-[0.99]"
          : "border-white/5 hover:border-surface-tint/30 hover:bg-white/5"
          }`}
      >
        <div className="w-20 h-20 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-active:scale-90 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <span className="material-symbols-outlined text-4xl text-surface-tint group-hover:animate-pulse">upload_file</span>
        </div>
        <h3 className="font-headline text-3xl text-white mb-3 font-black tracking-tighter uppercase whitespace-pre-wrap">
          {label || "Drop Your PDF Here"}
        </h3>
        <p className="text-[10px] font-body text-on-surface-variant uppercase tracking-[0.3em]">
          OR <span className="text-surface-tint underline decoration-surface-tint/30 underline-offset-[6px]">CLICK TO BROWSE</span> YOUR FILES
        </p>
        <div className="mt-12 flex justify-center gap-4">
          <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] text-on-surface-variant uppercase tracking-widest font-black">
            Format: {accept === '.pdf' ? 'PDF' : 'Images'}
          </span>
          <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] text-on-surface-variant uppercase tracking-widest font-black">
            Selection: {multiple ? 'Multiple' : 'Single'}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && (
        <div className="mt-6 px-6 py-4 bg-error/10 border border-error/20 rounded-2xl text-center animate-shake">
          <p className="text-[10px] font-headline font-black text-error uppercase tracking-widest">{error}</p>
        </div>
      )}
    </div>
  );
}
