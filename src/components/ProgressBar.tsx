export function ProgressBar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden relative">
      <div className="h-full bg-surface-tint rounded-full shadow-[0_0_12px_rgba(0,220,229,0.5)] transition-all duration-300 animate-pulse w-full origin-left scale-x-75" />
    </div>
  );
}
