import { getToolById } from "@/lib/toolsData";
import type { PipelineStep, PipelineResult, StepSettings } from "@/lib/pipeline";

interface PipelineStepCardProps {
  step: PipelineStep;
  index: number;
  total: number;
  result?: PipelineResult;
  onChange: (id: string, settings: StepSettings) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PipelineStepCard({
  step, index, total, result,
  onChange, onRemove, onMoveUp, onMoveDown,
}: PipelineStepCardProps) {
  const tool = getToolById(step.toolId);
  if (!tool) return null;

  const inputClass = "w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-xs focus:ring-1 focus:ring-surface-tint transition-all placeholder:text-white/10";
  const labelClass = "text-[9px] font-headline font-black uppercase tracking-widest text-on-surface-variant block mb-2 px-1";

  const updateSetting = (partial: Partial<StepSettings>) => {
    onChange(step.id, { ...step.settings, ...partial });
  };

  const renderSettings = () => {
    switch (step.toolId) {
      case 'watermark':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-fade-in-up">
            <div className="space-y-2">
              <label className={labelClass}>Overlay Descriptor</label>
              <input value={step.settings.watermarkText ?? 'CONFIDENTIAL'}
                onChange={(e) => updateSetting({ watermarkText: e.target.value })}
                placeholder="ENTER STRING..."
                className={inputClass} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className={labelClass}>Opacity Flux</label>
                <span className="text-[10px] font-mono text-surface-tint">{Math.round((step.settings.watermarkOpacity ?? 0.3) * 100)}%</span>
              </div>
              <input type="range" min="0.05" max="1" step="0.05"
                value={step.settings.watermarkOpacity ?? 0.3}
                onChange={(e) => updateSetting({ watermarkOpacity: Number(e.target.value) })}
                className="w-full accent-surface-tint" />
            </div>
          </div>
        );
      case 'rotate':
        return (
          <div className="mt-6 animate-fade-in-up md:max-w-xs">
            <label className={labelClass}>Vector Rotation</label>
            <div className="relative">
              <select value={step.settings.rotateAllDegrees ?? 90}
                onChange={(e) => updateSetting({ rotateAllDegrees: Number(e.target.value) })}
                className="w-full appearance-none bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-xs focus:ring-1 focus:ring-surface-tint transition-all">
                <option value={90} className="bg-surface">90° CLOCKWISE</option>
                <option value={-90} className="bg-surface">90° COUNTER-CLOCKWISE</option>
                <option value={180} className="bg-surface">180° INVERSION</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
            </div>
          </div>
        );
      case 'protect':
        return (
          <div className="mt-6 animate-fade-in-up md:max-w-xs">
            <label className={labelClass}>Master Cipher</label>
            <input type="password" value={step.settings.password ?? ''}
              onChange={(e) => updateSetting({ password: e.target.value })}
              placeholder="ENTER SECURE KEY"
              className={inputClass} />
          </div>
        );
      default:
        return (
          <div className="mt-6">
            <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">settings_input_component</span>
              Autonomous Processing Module — No Config Required
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`glass-card rounded-2xl p-8 border-white/5 bg-surface-container-low transition-all relative overflow-hidden group ${result ? 'border-surface-tint/20' : ''}`}>
      {/* Running/Success Indicator */}
      {result?.success && (
        <div className="absolute top-0 left-0 w-1 h-full bg-surface-tint shadow-[0_0_15px_rgba(0,220,229,1)]"></div>
      )}

      <div className="flex items-start gap-8">
        {/* Step number */}
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-xs font-headline font-black text-white/40 group-hover:text-surface-tint transition-colors border border-white/5">
          {String(index + 1).padStart(2, '0')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <h3 className="font-headline text-lg text-white font-black tracking-tighter uppercase">{tool.name}</h3>
            <span className="bg-surface-tint/10 text-surface-tint text-[8px] font-headline font-black px-2 py-0.5 rounded tracking-tighter uppercase border border-surface-tint/20">
              {tool.category} MODULE
            </span>
          </div>
          <p className="text-[10px] font-mono text-outline-variant mt-1 uppercase tracking-widest">{tool.description}</p>
          {renderSettings()}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button disabled={index === 0} onClick={() => onMoveUp(step.id)}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg disabled:opacity-10 text-outline-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-lg">expand_less</span>
          </button>
          <button disabled={index === total - 1} onClick={() => onMoveDown(step.id)}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg disabled:opacity-10 text-outline-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <button onClick={() => onRemove(step.id)}
            className="w-8 h-8 flex items-center justify-center hover:bg-error/10 rounded-lg text-outline-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      {/* Result row */}
      {result && (
        <div className={`mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest ${result.success ? 'text-surface-tint' : 'text-error'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">{result.success ? 'check_circle' : 'error'}</span>
            <span>{result.success ? 'Module Cycle Complete' : `Fault: ${result.error}`}</span>
          </div>
          {result.success && (
            <div className="flex gap-4 opacity-60">
              <span>Delta: {(result.durationMs / 1000).toFixed(2)}s</span>
              <span>Density: {formatSize(result.outputSize)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
