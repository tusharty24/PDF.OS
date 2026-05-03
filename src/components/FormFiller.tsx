import { useState, useEffect } from "react";

interface FormFillerProps {
  fields: Array<{ name: string; type: string; options?: string[] }>;
  onChange: (values: Record<string, string>) => void;
}

export function FormFiller({ fields, onChange }: FormFillerProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const defaults: Record<string, string> = {};
    fields.forEach(f => { defaults[f.name] = ""; });
    setValues(defaults);
  }, [fields]);

  const update = (name: string, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    onChange(next);
  };

  if (fields.length === 0) {
    return (
      <div className="py-12 text-center glass-card rounded-2xl border-white/5 bg-surface-container-lowest/30">
        <span className="material-symbols-outlined text-4xl text-white/5 mb-4">settings_input_component</span>
        <p className="text-sm font-headline text-on-surface-variant font-light px-8 leading-relaxed">
          No fillable fields detected in this PDF. You can still flatten it to lock the document structure and improve compatibility.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3 px-1">
        <span className="w-1.5 h-1.5 bg-surface-tint rounded-full animate-pulse"></span>
        <p className="text-[10px] font-mono text-surface-tint uppercase tracking-widest">{fields.length} SYSTEM INPUT VECTORS DETECTED</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(field => (
          <div key={field.name} className="space-y-2 group">
            <label className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant block mb-1 px-1 group-focus-within:text-surface-tint transition-colors">
              {field.name} <span className="opacity-40 normal-case font-mono ml-2">[{field.type}]</span>
            </label>

            {field.type === "Text" && (
              <input
                value={values[field.name] || ""}
                onChange={(e) => update(field.name, e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-sm focus:ring-1 focus:ring-surface-tint transition-all placeholder:text-white/10"
                placeholder="ENTER DATA..."
              />
            )}

            {field.type === "CheckBox" && (
              <label className="flex items-center gap-4 cursor-pointer p-3 rounded-xl bg-surface-container-lowest border border-white/5 hover:bg-white/5 transition-all">
                <input
                  type="checkbox"
                  checked={values[field.name] === "true"}
                  onChange={(e) => update(field.name, e.target.checked ? "true" : "false")}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${values[field.name] === "true" ? 'bg-surface-tint shadow-[0_0_15px_rgba(0,220,229,0.3)]' : 'bg-white/5 border border-white/10'}`}>
                  {values[field.name] === "true" && <span className="material-symbols-outlined text-surface text-sm">check</span>}
                </div>
                <span className="text-xs font-headline font-bold text-white uppercase tracking-widest">Toggle Binary</span>
              </label>
            )}

            {field.type === "Dropdown" && (
              <div className="relative">
                <select
                  value={values[field.name] || ""}
                  onChange={(e) => update(field.name, e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-sm focus:ring-1 focus:ring-surface-tint transition-all"
                >
                  <option value="" className="bg-surface">Select Option...</option>
                  {field.options?.map(opt => <option key={opt} value={opt} className="bg-surface">{opt}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            )}

            {field.type === "Radio" && (
              <div className="flex flex-wrap gap-3">
                {field.options?.map(opt => (
                  <label key={opt} className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border transition-all ${values[field.name] === opt ? 'bg-surface-tint/10 border-surface-tint/40' : 'bg-surface-container-lowest border-white/5 hover:bg-white/5'}`}>
                    <input
                      type="radio"
                      name={field.name}
                      value={opt}
                      checked={values[field.name] === opt}
                      onChange={() => update(field.name, opt)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${values[field.name] === opt ? 'border-surface-tint' : 'border-white/20'}`}>
                      {values[field.name] === opt && <div className="w-2 h-2 rounded-full bg-surface-tint shadow-[0_0_10px_rgba(0,220,229,0.5)]"></div>}
                    </div>
                    <span className={`text-[10px] font-headline font-bold uppercase tracking-widest ${values[field.name] === opt ? 'text-surface-tint' : 'text-on-surface-variant'}`}>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {!["Text", "CheckBox", "Dropdown", "Radio"].includes(field.type) && (
              <input
                value={values[field.name] || ""}
                onChange={(e) => update(field.name, e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-3 text-white font-headline text-sm focus:ring-1 focus:ring-surface-tint transition-all placeholder:text-white/10"
                placeholder="GENERIC DATA..."
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
