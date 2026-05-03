import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, X, Plus, GripVertical } from "lucide-react";
import { toolsData } from "../lib/toolsData";
import { DropZone } from "../components/DropZone";
import { PageGrid } from "../components/PageGrid";
import { ProgressBar } from "../components/ProgressBar";
import { SuccessState } from "../components/SuccessState";
import { SignaturePad } from "../components/SignaturePad";
import { SignaturePlacer } from "../components/SignaturePlacer";
import { FormFiller } from "../components/FormFiller";
import { RedactionCanvas } from "../components/RedactionCanvas";
import { CropPreview } from "../components/CropPreview";
import * as pdfTools from "../lib/pdfTools";

type PDFDoc = import("pdfjs-dist").PDFDocumentProxy;

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }
  return pdfjsLib;
}

async function loadPdfDoc(file: File): Promise<PDFDoc> {
  const lib = await getPdfjsLib();
  const data = await file.arrayBuffer();
  return lib.getDocument({ data }).promise;
}

type WorkspaceState = "idle" | "loaded" | "processing" | "done";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function WatermarkPreview({ pdfDoc, text, opacity }: { pdfDoc: PDFDoc; text: string; opacity: number }) {
  const totalPages = pdfDoc.numPages;
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 1; i <= totalPages; i++) {
        if (cancelled) return;
        try {
          const page = await pdfDoc.getPage(i);
          const baseVp = page.getViewport({ scale: 1 });
          const scale = 220 / baseVp.width;
          const viewport = page.getViewport({ scale });
          const canvas = canvasRefs.current[i - 1];
          if (!canvas || cancelled) return;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;
          if (cancelled) return;
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 4);
          ctx.globalAlpha = opacity;
          ctx.fillStyle = "#00dce5";
          const fontSize = Math.min(canvas.width, canvas.height) * 0.08;
          ctx.font = `bold ${fontSize}px Space Grotesk, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text || "WATERMARK", 0, 0);
          ctx.restore();
        } catch { /* unmounted */ }
      }
    })();
    return () => { cancelled = true; };
  }, [pdfDoc, text, opacity, totalPages]);

  return (
    <div className="mb-4">
      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-2">
        Page Preview ({totalPages} Pages)
      </label>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {Array.from({ length: totalPages }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 group">
            <canvas
              ref={(el) => { canvasRefs.current[i] = el; }}
              className="rounded-lg border border-white/5 bg-surface-container-low shadow-sm max-w-full group-hover:border-surface-tint/30 transition-colors"
            />
            <span className="text-[10px] font-mono text-outline">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MergeFileOrder({ files, onReorder }: { files: File[]; onReorder: (files: File[]) => void }) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      const next = [...files];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      onReorder(next);
    }
    setDragIdx(null);
    setDropIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDropIdx(null);
  };

  return (
    <div className="space-y-1 mt-4">
      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-4">
        File Order — Drag to Reorder
      </label>
      {files.map((f, i) => (
        <div
          key={`${f.name}-${i}`}
          draggable
          onDragStart={(e) => handleDragStart(e, i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={(e) => handleDrop(e, i)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-4 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing select-none transition-all ${dragIdx === i ? "opacity-40 scale-95" : ""
            } ${dropIdx === i && dragIdx !== i ? "bg-surface-tint/10 border-surface-tint/30" : "bg-surface-container-low border-white/5"} border`}
        >
          <span className="material-symbols-outlined text-outline-variant">drag_indicator</span>
          <span className="text-xs font-mono text-outline w-6">{i + 1}.</span>
          <span className="text-sm font-headline text-white flex-1 truncate font-medium">{f.name}</span>
          <span className="text-[10px] font-mono text-outline-variant">{formatSize(f.size)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const tool = toolsData[toolId || ""];

  const [state, setState] = useState<WorkspaceState>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [pdfDoc, setPdfDoc] = useState<PDFDoc | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processingError, setProcessingError] = useState("");

  const [compressionLevel, setCompressionLevel] = useState<pdfTools.CompressionLevel>('balanced');
  const [compressProgressMsg, setCompressProgressMsg] = useState('');
  const [compressStats, setCompressStats] = useState<{ originalSize: number; compressedSize: number; savedPercent: number } | null>(null);
  const [result, setResult] = useState<Blob | Blob[] | string | null>(null);
  const [resultFilename, setResultFilename] = useState("");

  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [splitRanges, setSplitRanges] = useState("");
  const [margins, setMargins] = useState({ top: 50, right: 50, bottom: 50, left: 50 });
  const [blankAfter, setBlankAfter] = useState("");
  const [removedMetadata, setRemovedMetadata] = useState<string[]>([]);

  const [signStep, setSignStep] = useState<"pad" | "place" | "processing" | "done">("pad");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");

  const [formFields, setFormFields] = useState<Array<{ name: string; type: string; options?: string[] }>>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const [redactions, setRedactions] = useState<pdfTools.RedactionArea[]>([]);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [redactActivePage, setRedactActivePage] = useState(0);
  const [redactProgressMsg, setRedactProgressMsg] = useState('');

  const [mergeDocs, setMergeDocs] = useState<{ doc: PDFDoc; pages: number; fileName: string }[]>([]);

  useEffect(() => {
    if (toolId !== "redact" || !pdfDoc) {
      setPageImages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const images: string[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (cancelled) return;
        const page = await pdfDoc.getPage(i);
        const baseVp = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, 700 / baseVp.width);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport } as any).promise;
        images.push(canvas.toDataURL('image/png'));
      }
      if (!cancelled) {
        setPageImages(images);
        setRedactActivePage(0);
      }
    })();
    return () => { cancelled = true; };
  }, [toolId, pdfDoc]);

  useEffect(() => {
    if (tool) document.title = `${tool.title} — PDF.OS`;
    return () => { document.title = 'PDF.OS'; };
  }, [tool]);

  useEffect(() => {
    setState("idle");
    setFiles([]);
    setPdfDoc(null);
    setPageCount(0);
    setResult(null);
    setSelectedPages(new Set());
    setPageRotations({});
    setPageOrder([]);
    setPassword("");
    setConfirmPassword("");
    setOwnerPassword("");
    setWatermarkText("CONFIDENTIAL");
    setWatermarkOpacity(0.3);
    setSplitRanges("");
    setRemovedMetadata([]);
    setSignStep("pad");
    setSignatureDataUrl("");
    setFormFields([]);
    setFormValues({});
    setRedactions([]);
    setMergeDocs([]);
    setCompressionLevel('balanced');
    setCompressProgressMsg('');
    setCompressStats(null);
    setProcessingError('');
  }, [toolId]);

  useEffect(() => {
    if (toolId !== "merge" || files.length === 0) {
      setMergeDocs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const docs = await Promise.all(
          files.map(async (f) => {
            const doc = await loadPdfDoc(f);
            return { doc, pages: doc.numPages, fileName: f.name };
          })
        );
        if (!cancelled) setMergeDocs(docs);
      } catch { /* */ }
    })();
    return () => { cancelled = true; };
  }, [toolId, files]);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    if (tool?.inputType === "multi" || tool?.inputType === "images") {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
    setState("loaded");

    if (tool?.inputType === "single" && newFiles[0]?.type === "application/pdf") {
      try {
        const doc = await loadPdfDoc(newFiles[0]);
        setPdfDoc(doc);
        setPageCount(doc.numPages);
        setPageOrder(Array.from({ length: doc.numPages }, (_, i) => i));

        if (toolId === "fill-forms") {
          const fields = await pdfTools.detectFormFields(newFiles[0]);
          setFormFields(fields);
          const defaults: Record<string, string> = {};
          fields.forEach(f => { defaults[f.name] = ''; });
          setFormValues(defaults);
        }
      } catch (e) {
        console.error("Failed to load PDF for preview:", e);
      }
    }
  }, [tool, toolId]);

  const handleProcess = async () => {
    if (!tool || files.length === 0) return;
    setState("processing");

    try {
      let output: Blob | Blob[] | string;
      const file = files[0];

      switch (toolId) {
        case "merge":
          output = await pdfTools.mergePdfs(files);
          setResultFilename("merged.pdf");
          break;
        case "split": {
          const ranges = pdfTools.parseSplitRanges(splitRanges);
          if (ranges.length === 0) { setState("loaded"); return; }
          output = await pdfTools.splitPdf(file, ranges);
          setResultFilename("split.pdf");
          break;
        }
        case "remove-pages":
          output = await pdfTools.removePages(file, Array.from(selectedPages));
          setResultFilename("pages-removed.pdf");
          break;
        case "reorder":
          output = await pdfTools.reorderPages(file, pageOrder);
          setResultFilename("reordered.pdf");
          break;
        case "rotate":
          output = await pdfTools.rotatePdf(file, pageRotations);
          setResultFilename("rotated.pdf");
          break;
        case "compress": {
          setCompressProgressMsg('');
          setProcessingError('');
          const compResult = await pdfTools.compressPdf(file, compressionLevel, (msg) => {
            setCompressProgressMsg(msg);
          });
          if (compResult.compressedSize >= compResult.originalSize) {
            setProcessingError('This PDF is already well optimized — compression did not reduce its size further.');
          }
          setCompressStats({
            originalSize: compResult.originalSize,
            compressedSize: compResult.compressedSize,
            savedPercent: compResult.savedPercent,
          });
          output = compResult.blob;
          setResultFilename("compressed.pdf");
          break;
        }
        case "repair":
          output = await pdfTools.repairPdf(file);
          setResultFilename("repaired.pdf");
          break;
        case "protect":
          if (password !== confirmPassword || !password) { setState("loaded"); return; }
          output = await pdfTools.protectPdf(file, password, ownerPassword || password);
          setResultFilename("protected.pdf");
          break;
        case "unlock":
          output = await pdfTools.unlockPdf(file, password);
          setResultFilename("unlocked.pdf");
          break;
        case "watermark":
          output = await pdfTools.addWatermark(file, watermarkText, watermarkOpacity);
          setResultFilename("watermarked.pdf");
          break;
        case "page-numbers":
          output = await pdfTools.addPageNumbers(file);
          setResultFilename("numbered.pdf");
          break;
        case "images-to-pdf":
          output = await pdfTools.imagesToPdf(files);
          setResultFilename("images.pdf");
          break;
        case "pdf-to-images": {
          const imgBlobs = await pdfTools.pdfToImages(file);
          if (imgBlobs.length > 1) {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            imgBlobs.forEach((blob, i) => {
              zip.file(`page-${String(i + 1).padStart(3, '0')}.png`, blob);
            });
            output = await zip.generateAsync({ type: 'blob' });
            setResultFilename(`${file.name.replace('.pdf', '')}-images.zip`);
          } else {
            output = imgBlobs[0];
            setResultFilename('page-1.png');
          }
          break;
        }
        case "pdf-to-text":
          output = await pdfTools.pdfToText(file);
          setResultFilename("extracted.txt");
          break;
        case "pdf-to-ai":
          output = await pdfTools.pdfToAI(file);
          setResultFilename("ai-optimized.json");
          break;
        case "crop":
          output = await pdfTools.cropPdf(file, margins);
          setResultFilename("cropped.pdf");
          break;
        case "remove-metadata": {
          const { blob, removed } = await pdfTools.removeMetadata(file);
          output = blob;
          setResultFilename("clean.pdf");
          break;
        }
        case "fill-forms":
          output = await pdfTools.fillAndFlattenForm(file, formValues);
          setResultFilename("filled.pdf");
          break;
        case "redact":
          output = await pdfTools.redactPdf(file, redactions, (msg) => setRedactProgressMsg(msg));
          setResultFilename("redacted.pdf");
          break;
        case "blank-pages": {
          const positions = blankAfter.split(",").map(s => Number(s.trim()) - 1).filter(n => !isNaN(n) && n >= 0);
          output = await pdfTools.addBlankPages(file, positions);
          setResultFilename("with-blanks.pdf");
          break;
        }
        case "pdf-to-zip":
          output = await pdfTools.pdfToZip(file);
          setResultFilename("pages.zip");
          break;
        default:
          setState("loaded");
          return;
      }
      setResult(output);
      setState("done");
    } catch (err) {
      console.error("Processing error:", err);
      setState("loaded");
    }
  };

  const handleSignConfirm = async (
    pageIndex: number,
    position: { x: number; y: number; width: number; height: number }
  ) => {
    setState("processing");
    try {
      const output = await pdfTools.signPdf(files[0], signatureDataUrl, pageIndex, position);
      setResult(output);
      setResultFilename("signed.pdf");
      setState("done");
    } catch (err) {
      console.error("Sign error:", err);
      setState("loaded");
      setSignStep("pad");
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    const { saveFile } = await import('../lib/platform');
    const filename = resultFilename;
    const blob = result instanceof Blob
      ? result
      : Array.isArray(result)
        ? new Blob(result as any, { type: 'application/pdf' })
        : new Blob([result], { type: 'text/plain' });
    await saveFile(blob, filename);
  };

  if (!tool) {
    return (
      <div className="p-12 text-center animate-fade-in-up">
        <p className="font-headline text-on-surface-variant font-light">Mission critical tool not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-surface-tint underline">Return to Command Center</button>
      </div>
    );
  }

  const accept = tool.inputType === "images" ? "image/png,image/jpeg" : ".pdf";
  const isSignTool = toolId === "sign";

  const splitColors = ["#00dce5", "#8422dc", "#ffb4ab", "#00ebf5", "#efdbff"];
  const parsedSplitRanges = splitRanges ? pdfTools.parseSplitRanges(splitRanges) : [];
  const splitHighlightRanges = parsedSplitRanges.map((range, i) => ({
    pages: Array.from({ length: range[1] - range[0] + 1 }, (_, j) => range[0] + j),
    color: splitColors[i % splitColors.length],
  }));

  const processLabel = (() => {
    if (toolId === "remove-pages" && selectedPages.size > 0)
      return `DELETE ${selectedPages.size} PAGES`;
    if (toolId === "rotate") return "ROTATE PDF";
    return "START PROCESS";
  })();

  const processDisabled =
    state !== "loaded" ||
    (toolId === "remove-pages" && selectedPages.size === 0) ||
    (toolId === "redact" && redactions.length === 0);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      {/* Tool Header */}
      <div className="mb-12">
        <button onClick={() => navigate("/")} className="px-4 py-2 rounded-full bg-white/5 text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint hover:bg-white/10 transition-all mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Tools
        </button>
        <div className="flex items-end gap-6">
          <div className="w-20 h-20 bg-surface-container-high rounded-2xl flex items-center justify-center border border-surface-tint/20 group">
            <span className="material-symbols-outlined text-4xl text-surface-tint">{tool.icon}</span>
          </div>
          <div>
            <span className="font-headline text-sm font-medium tracking-[0.3em] text-surface-tint uppercase mb-2 block">Tool Operation</span>
            <h1 className="font-headline text-5xl font-light tracking-tighter text-primary">{tool.title.split(' ')[0]} <span className="font-black">{tool.title.split(' ').slice(1).join(' ')}</span></h1>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          {state === "idle" && (
            <DropZone accept={accept} multiple={tool.inputType !== "single"} onFiles={handleFiles} />
          )}

          {state !== "idle" && state !== "done" && (
            <div className="space-y-6">
              {/* File Metadata Card */}
              <div className="glass-card rounded-2xl p-6 border-white/5 bg-surface-container-lowest/50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-surface-tint/10 rounded-xl flex items-center justify-center border border-surface-tint/20">
                    <span className="material-symbols-outlined text-surface-tint">description</span>
                  </div>
                  <div>
                    <p className="text-white font-headline font-bold text-sm truncate max-w-xs">{files[0]?.name}</p>
                    <p className="text-[10px] font-body text-on-surface-variant uppercase tracking-widest">{formatSize(files[0]?.size || 0)} • {pageCount || '...'} PAGES</p>
                  </div>
                </div>
                {state === "loaded" && (
                  <button onClick={() => setState("idle")} className="w-10 h-10 rounded-full flex items-center justify-center text-outline-variant hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined">restart_alt</span>
                  </button>
                )}
              </div>

              {/* Main Interaction Area */}
              {state === "loaded" && (
                <div className="glass-card rounded-2xl p-8 border-white/5 min-h-[400px]">
                  {/* Tool-specific UI */}
                  {toolId === "remove-pages" && pdfDoc && (
                    <div className="animate-fade-in-up">
                      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-6 px-1">Select Pages to Delete</label>
                      <PageGrid pdfDoc={pdfDoc} pageCount={pageCount} mode="select" selectedPages={selectedPages} onSelectionChange={setSelectedPages} />
                    </div>
                  )}

                  {toolId === "reorder" && pdfDoc && (
                    <div className="animate-fade-in-up">
                      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-6 px-1">Drag Pages to Reorder</label>
                      <PageGrid pdfDoc={pdfDoc} pageCount={pageCount} mode="reorder" pageOrder={pageOrder} onOrderChange={setPageOrder} />
                    </div>
                  )}

                  {toolId === "rotate" && pdfDoc && (
                    <div className="animate-fade-in-up">
                      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-6 px-1">Rotate Your Pages</label>
                      <PageGrid pdfDoc={pdfDoc} pageCount={pageCount} mode="rotate" pageRotations={pageRotations} onRotationsChange={setPageRotations} />
                    </div>
                  )}

                  {toolId === "split" && pdfDoc && (
                    <div className="animate-fade-in-up">
                      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-6 px-1">Specify Pages to Split</label>
                      <div className="mb-8 p-6 bg-surface-container-lowest glass-card rounded-xl border-white/5">
                        <input value={splitRanges} onChange={(e) => setSplitRanges(e.target.value)} placeholder="E.G. 1-3, 5-7" className="w-full bg-transparent border-none text-white font-headline text-2xl placeholder:text-white/10 focus:ring-0" />
                        <p className="text-[10px] font-body text-on-surface-variant mt-2 uppercase tracking-widest">Example: 1-3, 5-10</p>
                      </div>
                      <PageGrid pdfDoc={pdfDoc} pageCount={pageCount} mode="view" highlightRanges={splitHighlightRanges} />
                    </div>
                  )}

                  {toolId === "watermark" && pdfDoc && (
                    <div className="animate-fade-in-up">
                      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-6 px-1">Customize Your Watermark</label>
                      <WatermarkPreview pdfDoc={pdfDoc} text={watermarkText} opacity={watermarkOpacity} />
                    </div>
                  )}

                  {toolId === "redact" && pdfDoc && pageImages.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setRedactActivePage(Math.max(0, redactActivePage - 1))} disabled={redactActivePage === 0} className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 disabled:opacity-30">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                          </button>
                          <span className="text-[10px] font-body text-on-surface-variant uppercase tracking-widest">Page {redactActivePage + 1} / {pageImages.length}</span>
                          <button onClick={() => setRedactActivePage(Math.min(pageImages.length - 1, redactActivePage + 1))} disabled={redactActivePage === pageImages.length - 1} className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 disabled:opacity-30">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                          </button>
                        </div>
                        <button onClick={() => setRedactions([])} className="text-[10px] font-headline font-bold uppercase tracking-widest text-error/60 hover:text-error transition-colors">Clear All Selections</button>
                      </div>
                      <RedactionCanvas
                        pageImageUrl={pageImages[redactActivePage]}
                        pageIndex={redactActivePage}
                        redactions={redactions}
                        onAdd={(r) => setRedactions([...redactions, r])}
                        onClear={(idx) => setRedactions(redactions.filter(r => r.page !== idx))}
                      />
                    </div>
                  )}

                  {toolId === "sign" && signStep === "pad" && (
                    <SignaturePad onSignature={(url) => { setSignatureDataUrl(url); setSignStep("place"); }} />
                  )}
                  {toolId === "sign" && signStep === "place" && pdfDoc && (
                    <SignaturePlacer pdfDoc={pdfDoc} pageCount={pageCount} signatureDataUrl={signatureDataUrl} onConfirm={handleSignConfirm} onBack={() => setSignStep("pad")} />
                  )}

                  {toolId === "merge" && mergeDocs.length > 0 && (
                    <div className="animate-fade-in-up">
                      <MergeFileOrder files={files} onReorder={setFiles} />
                      <div className="mt-8 flex items-center gap-4 p-4 bg-surface-tint/5 rounded-xl border border-surface-tint/10">
                        <span className="material-symbols-outlined text-surface-tint">info</span>
                        <p className="text-xs font-body text-surface-tint">Combining {files.length} files into a single {mergeDocs.reduce((a, b) => a + b.pages, 0)} page PDF.</p>
                      </div>
                    </div>
                  )}

                  {toolId === "blank-pages" && pdfDoc && (
                    <div className="animate-fade-in-up">
                      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-6 px-1">Where to add blank pages?</label>
                      <div className="mb-8 p-6 bg-surface-container-lowest glass-card rounded-xl border-white/5">
                        <input value={blankAfter} onChange={(e) => setBlankAfter(e.target.value)} placeholder="E.G. 1, 3, 5" className="w-full bg-transparent border-none text-white font-headline text-2xl placeholder:text-white/10 focus:ring-0" />
                        <p className="text-[10px] font-body text-on-surface-variant mt-2 uppercase tracking-widest">Add a blank page after these page numbers</p>
                      </div>
                      <PageGrid pdfDoc={pdfDoc} pageCount={pageCount} mode="view" />
                    </div>
                  )}

                  {toolId === "fill-forms" && (
                    <div className="animate-fade-in-up">
                      <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint block mb-8 px-1">Fill in the fields below</label>
                      <FormFiller fields={formFields} onChange={setFormValues} />
                    </div>
                  )}

                  {/* Standard Loaded Generic View */}
                  {state === "loaded" && !["remove-pages", "reorder", "rotate", "split", "watermark", "redact", "sign", "merge", "fill-forms", "blank-pages"].includes(toolId) && (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <span className="material-symbols-outlined text-6xl text-white/5 mb-6">ready_to_launch</span>
                      <p className="text-white font-headline text-xl font-light mb-2 uppercase tracking-widest">File Ready</p>
                      <p className="text-on-surface-variant text-sm font-light max-w-xs mx-auto">Click "START PROCESS" below to begin.</p>
                    </div>
                  )}
                </div>
              )}

              {state === "processing" && (
                <div className="glass-card rounded-2xl p-12 border-white/5 min-h-[400px] flex flex-col items-center justify-center text-center animate-pulse">
                  <div className="w-24 h-24 bg-surface-tint/10 rounded-full flex items-center justify-center mb-8 border border-surface-tint/20 animate-spin-slow">
                    <span className="material-symbols-outlined text-5xl text-surface-tint">automation</span>
                  </div>
                  <h3 className="font-headline text-3xl text-white mb-2 font-black tracking-tighter uppercase">Processing</h3>
                  <p className="text-sm font-body text-surface-tint font-bold tracking-[0.3em] uppercase mb-10">{compressProgressMsg || redactProgressMsg || 'PLEASE WAIT'}</p>
                  <div className="w-full max-w-md mx-auto">
                    <ProgressBar active />
                  </div>
                </div>
              )}
            </div>
          )}

          {state === "done" && (
            <SuccessState originalSize={files[0]?.size} resultSize={result instanceof Blob ? result.size : 0} filename={resultFilename} onDownload={handleDownload} />
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {state === "loaded" && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8 border-white/5 bg-surface-container-low">
                <h4 className="font-headline text-[10px] font-bold uppercase tracking-widest text-surface-tint mb-8">Tool Settings</h4>

                {/* Tool Specific Controls in Sidebar */}
                {toolId === "compress" && (
                  <div className="space-y-6">
                    <label className="text-xs font-headline font-bold text-white uppercase tracking-widest">Select Intensity</label>
                    <div className="grid grid-cols-1 gap-3">
                      {(['lossless', 'balanced', 'max'] as pdfTools.CompressionLevel[]).map(l => (
                        <button key={l} onClick={() => setCompressionLevel(l)} className={`px-6 py-4 rounded-xl font-headline font-black text-xs tracking-widest uppercase transition-all border ${compressionLevel === l ? 'bg-surface-tint text-surface border-surface-tint' : 'border-white/5 text-on-surface-variant hover:bg-white/5'}`}>
                          {l === 'lossless' ? 'Lossless (Quality)' : l === 'balanced' ? 'Balanced (Rec)' : 'Maximum (Power)'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {["protect", "unlock"].includes(toolId) && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-headline font-bold text-white uppercase tracking-widest">New Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-sm focus:ring-1 focus:ring-surface-tint transition-all" />
                    </div>
                    {toolId === "protect" && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-headline font-bold text-white uppercase tracking-widest">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-sm focus:ring-1 focus:ring-surface-tint transition-all" />
                      </div>
                    )}
                  </div>
                )}

                {toolId === "watermark" && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-headline font-bold text-white uppercase tracking-widest">Watermark Text</label>
                      <input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-sm focus:ring-1 focus:ring-surface-tint transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-headline font-bold text-white uppercase tracking-widest">Transparency</label>
                      <input type="range" min="0.05" max="1" step="0.05" value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-surface-tint h-1.5" />
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-white/5 mt-8">
                  <button onClick={handleProcess} disabled={processDisabled} className="w-full bg-primary-container text-on-primary-container p-4 rounded-xl font-headline font-black text-sm tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale shadow-[0_0_40px_rgba(0,235,245,0.2)]">
                    {processLabel}
                  </button>
                  <p className="text-[10px] text-center mt-4 text-on-surface-variant font-body uppercase tracking-widest">Your files never leave your computer</p>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-8 border-white/5 bg-surface-container-lowest/30">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-headline text-[10px] font-bold uppercase tracking-widest text-surface-tint">System Integrity</h4>
                  <span className="material-symbols-outlined text-surface-tint text-sm">enhanced_encryption</span>
                </div>
                <p className="text-xs font-body text-on-surface-variant font-light leading-relaxed mb-4">Your files are processed locally. No document data is ever uploaded to our servers, ensuring absolute privacy and security.</p>
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-surface-tint rounded-full animate-ping"></span>
                  <span className="text-[10px] font-body text-surface-tint uppercase tracking-widest">Secure & Private</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
