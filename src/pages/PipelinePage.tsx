import { useState, useEffect } from "react";
import { DropZone } from "@/components/DropZone";
import { SuccessState } from "@/components/SuccessState";
import { PipelineStepCard } from "@/components/PipelineStepCard";
import { pipelineTools, getToolById } from "@/lib/toolsData";
import { runPipeline, type PipelineStep, type PipelineResult, type StepSettings } from "@/lib/pipeline";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PipelinePage() {
  useEffect(() => {
    document.title = 'Automate — PDF.OS';
    return () => { document.title = 'PDF.OS'; };
  }, []);

  const [inputFile, setInputFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [pipelineState, setPipelineState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [stepResults, setStepResults] = useState<Record<string, PipelineResult>>({});
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [inputSize, setInputSize] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const handleFiles = (files: File[]) => {
    if (files[0]) {
      setInputFile(files[0]);
      setInputSize(files[0].size);
    }
  };

  const addStep = (toolId: string) => {
    const defaultSettings: StepSettings = {};
    if (toolId === 'watermark') {
      defaultSettings.watermarkText = 'CONFIDENTIAL';
      defaultSettings.watermarkOpacity = 0.3;
    }
    if (toolId === 'rotate') defaultSettings.rotateAllDegrees = 90;
    if (toolId === 'crop') defaultSettings.margins = { top: 0, right: 0, bottom: 0, left: 0 };

    setSteps(prev => [...prev, {
      id: crypto.randomUUID(),
      toolId,
      settings: defaultSettings,
    }]);
    setShowPicker(false);
  };

  const updateStep = (id: string, settings: StepSettings) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, settings } : s));
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const moveStep = (id: string, dir: -1 | 1) => {
    setSteps(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const handleRun = async () => {
    if (!inputFile || steps.length === 0) return;
    setPipelineState("running");
    setStepResults({});

    try {
      const output = await runPipeline(
        inputFile,
        steps,
        (stepId, result) => {
          setStepResults(prev => ({ ...prev, [stepId]: result }));
        }
      );
      setOutputBlob(output);
      setPipelineState("done");
    } catch {
      setPipelineState("error");
    }
  };

  const handleDownload = async () => {
    if (!outputBlob || !inputFile) return;
    const { saveFile } = await import('@/lib/platform');
    const name = inputFile.name.replace('.pdf', '-processed.pdf');
    await saveFile(outputBlob, name);
  };

  const handleReset = () => {
    setInputFile(null);
    setInputSize(0);
    setStepResults({});
    setOutputBlob(null);
    setPipelineState("idle");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 bg-surface-tint rounded-full shadow-[0_0_15px_rgba(0,220,229,1)]"></span>
            <span className="text-[10px] font-headline font-black uppercase tracking-[0.4em] text-surface-tint">Multi-Tasker</span>
          </div>
          <h1 className="font-headline text-8xl text-white font-black tracking-tighter uppercase leading-[0.85]">Auto<br /><span className="text-white/20">Process</span></h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-body text-on-surface-variant uppercase tracking-widest leading-relaxed">
            Pick a file and add multiple tools to it.<br />We'll process them all at once.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Source & Sequence */}
        <div className="lg:col-span-8 space-y-16">
          {/* Step 1: Input */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-headline font-black text-white/40 border border-white/5">01</div>
              <h2 className="font-headline text-lg text-white font-black tracking-widest uppercase">Select Your PDF</h2>
            </div>

            {!inputFile ? (
              <DropZone accept=".pdf" multiple={false} onFiles={handleFiles} />
            ) : (
              <div className="glass-card bg-surface-container-low border-white/5 rounded-2xl p-8 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-surface-tint/10 rounded-xl flex items-center justify-center border border-surface-tint/20">
                    <span className="material-symbols-outlined text-surface-tint text-3xl">description</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-white font-black tracking-tight uppercase text-lg">{inputFile.name}</h4>
                    <p className="text-[10px] font-body text-on-surface-variant uppercase tracking-widest mt-1">{formatSize(inputFile.size)} · STATUS: READY</p>
                  </div>
                </div>
                <button onClick={handleReset} className="w-12 h-12 flex items-center justify-center hover:bg-error/10 text-on-surface-variant hover:text-error rounded-xl transition-all">
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
            )}
          </section>

          {/* Step 2: Pipeline */}
          {inputFile && (
            <section className="space-y-8 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-headline font-black text-white/40 border border-white/5">02</div>
                  <h2 className="font-headline text-lg text-white font-black tracking-widest uppercase">Your Steps</h2>
                </div>
                {steps.length > 0 && (
                  <button onClick={() => setSteps([])} className="text-[10px] font-headline font-bold text-error/60 hover:text-error uppercase tracking-widest transition-colors">Clear All</button>
                )}
              </div>

              <div className="space-y-4 relative">
                {steps.length > 0 && <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-surface-tint/40 to-transparent"></div>}

                {steps.map((step, i) => (
                  <PipelineStepCard
                    key={step.id}
                    step={step}
                    index={i}
                    total={steps.length}
                    result={stepResults[step.id]}
                    onChange={updateStep}
                    onRemove={removeStep}
                    onMoveUp={(id) => moveStep(id, -1)}
                    onMoveDown={(id) => moveStep(id, 1)}
                  />
                ))}

                <div className="pt-4">
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className={`w-full group py-10 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${showPicker ? 'bg-surface-tint/10 border-surface-tint border-solid' : 'bg-surface-container-lowest border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                  >
                    <span className={`material-symbols-outlined text-4xl transition-transform ${showPicker ? 'rotate-45 text-surface-tint' : 'text-white/20 group-hover:text-white/40'}`}>add_circle</span>
                    <span className={`text-[10px] font-headline font-black uppercase tracking-[0.3em] ${showPicker ? 'text-surface-tint' : 'text-white/20 group-hover:text-white/40'}`}>Add Another Tool</span>
                  </button>

                  {/* Tool picker */}
                  <div className={`overflow-hidden transition-all duration-500 ease-out ${showPicker ? 'max-h-[1000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-8 glass-card bg-surface-container-low border-white/5 rounded-3xl">
                      {pipelineTools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => addStep(tool.id)}
                          className="group flex flex-col items-start gap-4 p-5 rounded-2xl border border-white/5 bg-surface-container-lowest hover:bg-surface-tint/10 hover:border-surface-tint/40 transition-all text-left"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-surface-tint/20 transition-colors">
                            <span className="material-symbols-outlined text-white/40 group-hover:text-surface-tint transition-all group-hover:scale-110">{getToolById(tool.id)?.icon || 'settings_input_component'}</span>
                          </div>
                          <div>
                            <h4 className="text-[11px] font-headline font-black text-white uppercase tracking-widest">{tool.name}</h4>
                            <p className="text-[8px] font-body text-on-surface-variant uppercase tracking-tighter mt-1">{tool.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Col: Operations */}
        <div className="lg:col-span-4 lg:sticky lg:top-36 h-fit">
          <div className="glass-card bg-surface-container-low border-white/5 rounded-3xl p-10 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-surface-tint/5 blur-3xl pointer-events-none"></div>
            <div className="space-y-3">
              <h3 className="font-headline text-xl text-white font-black tracking-widest uppercase">Ready to Run</h3>
              <p className="text-[10px] font-body text-on-surface-variant uppercase tracking-widest">Everything looks good</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-[11px] font-body uppercase tracking-widest">
                <span className="text-on-surface-variant">Tools Added</span>
                <span className="text-white font-black">{steps.length} Tool{steps.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-body uppercase tracking-widest">
                <span className="text-on-surface-variant">File Size</span>
                <span className="text-white font-black">{formatSize(inputSize)}</span>
              </div>
            </div>

            {pipelineState === "idle" || pipelineState === "running" ? (
              <button
                onClick={handleRun}
                disabled={!inputFile || steps.length === 0 || pipelineState === "running"}
                className="w-full bg-white text-black py-6 rounded-2xl font-headline font-black text-xs tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:grayscale shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group"
              >
                <span className={`material-symbols-outlined text-xl ${pipelineState === "running" ? 'animate-spin' : 'group-hover:translate-x-1 transition-transform'}`}>
                  {pipelineState === "running" ? "sync" : "play_circle"}
                </span>
                {pipelineState === "running" ? "Processing..." : "Start Processing"}
              </button>
            ) : pipelineState === "done" ? (
              <div className="space-y-4 animate-fade-in-up">
                <button
                  onClick={handleDownload}
                  className="w-full bg-surface-tint text-surface py-6 rounded-2xl font-headline font-black text-xs tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(0,220,229,0.3)] flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-xl">download</span>
                  Download Result
                </button>
                <button
                  onClick={() => { setStepResults({}); setOutputBlob(null); setPipelineState("idle"); }}
                  className="w-full py-4 text-[10px] font-headline font-black uppercase tracking-[0.3em] text-on-surface-variant hover:text-white transition-colors"
                >
                  Reset All
                </button>
              </div>
            ) : (
              <div className="p-8 bg-error/10 border border-error/20 rounded-3xl text-center space-y-5 animate-shake">
                <div className="w-16 h-16 bg-error/20 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-error text-3xl">error</span>
                </div>
                <p className="text-[11px] font-headline font-black text-error uppercase tracking-[0.2em]">Something went wrong</p>
                <button onClick={() => setPipelineState("idle")} className="text-[10px] font-body text-on-surface-variant hover:text-white uppercase border-b border-white/20 pb-1 transition-all">Try Again</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
