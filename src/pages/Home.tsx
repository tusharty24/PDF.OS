import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const tools = [
    { title: "Merge PDF", desc: "Combine multiple PDF files into one easily.", icon: "layers", id: "merge" },
    { title: "Split PDF", desc: "Separate a PDF into different files or pages.", icon: "call_split", id: "split" },
    { title: "Compress PDF", desc: "Reduce file size while keeping high quality.", icon: "compress", id: "compress" },
    { title: "PDF to AI", desc: "Extract and convert PDFs into LLM-ready JSON.", icon: "smart_toy", id: "pdf-to-ai" },
  ];

  const stats = [
    { label: "Successful Tasks", value: "99%", trend: "up" },
    { label: "Average Speed", value: "0.5s", trend: "down" },
    { label: "Files Handled", value: "1.2M", trend: "up" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-20 animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-surface-tint/20 to-transparent blur-[120px] -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="grid grid-cols-12 gap-12 items-center">
          <div className="col-span-12 lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-surface-tint rounded-full shadow-[0_0_15px_rgba(0,220,229,1)] px-0 py-0 animate-pulse"></span>
              <span className="text-[10px] font-headline font-black uppercase tracking-[0.4em] text-surface-tint">Status: AI Parsing Active</span>
            </div>
            <h1 className="font-headline text-8xl text-white font-black tracking-tighter uppercase leading-[0.85] select-none">
              AI-Ready<br />
              <span className="text-white/20" style={{ backgroundImage: 'linear-gradient(to right, #00dce5, #8422dc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Document</span><br />
              Parsing
            </h1>
            <p className="text-outline-variant font-body text-base max-w-md leading-relaxed">
              Instantly transform flat PDFs into deeply structured, token-optimized JSON context. Supercharge your Large Language Models directly from your browser.
            </p>
            <div className="flex wrap items-center gap-6 pt-4">
              <button onClick={() => navigate('/tool/pdf-to-ai')} className="bg-white text-black px-10 py-5 rounded-2xl font-headline font-black text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center gap-3 group">
                <span className="material-symbols-outlined group-hover:scale-125 transition-transform">smart_toy</span>
                Try PDF to AI
              </button>
              <button onClick={() => navigate('/tools')} className="border border-white/10 hover:border-surface-tint/40 hover:bg-surface-tint/5 text-white px-10 py-5 rounded-2xl font-headline font-black text-xs tracking-widest uppercase transition-all flex items-center gap-3">
                Other Tools
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="col-span-2 glass-card bg-surface-container-low border-white/5 p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center text-[10px] font-headline font-bold uppercase tracking-widest text-surface-tint">
                <span>System Health</span>
                <span className="material-symbols-outlined text-sm">analytics</span>
              </div>
              <div className="h-24 flex items-end gap-1 px-1">
                {[60, 40, 85, 30, 95, 20, 75, 55, 90, 15].map((h, i) => (
                  <div key={i} className="flex-1 bg-surface-tint/20 rounded-t-sm" style={{ height: `${h}%` }}>
                    <div className="w-full bg-surface-tint rounded-t-sm animate-pulse" style={{ height: `${Math.max(20, h - 20)}%`, animationDelay: `${i * 100}ms` }}></div>
                  </div>
                ))}
              </div>
            </div>
            {stats.map(stat => (
              <div key={stat.label} className="glass-card bg-white/5 border-white/5 p-6 rounded-2xl space-y-2">
                <p className="text-[9px] font-headline font-black uppercase tracking-widest text-outline-variant">{stat.label}</p>
                <p className="text-2xl font-headline font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/5 pb-8">
          <h2 className="font-headline text-2xl text-white font-black tracking-tight uppercase">Popular Tools</h2>
          <button onClick={() => navigate('/tools')} className="text-[10px] font-headline font-black uppercase tracking-widest text-surface-tint hover:underline transition-all">View All Tools</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => navigate(`/tool/${tool.id}`)}
              className="glass-card bg-surface-container-lowest border border-white/5 rounded-3xl p-8 transition-all hover:-translate-y-2 hover:bg-surface-tint/[0.03] hover:border-surface-tint/30 group cursor-pointer"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-surface-tint/10 transition-colors">
                <span className="material-symbols-outlined text-4xl text-white/20 group-hover:text-surface-tint group-hover:scale-110 transition-all">{tool.icon}</span>
              </div>
              <h4 className="font-headline text-xl text-white font-black tracking-tight uppercase mb-3">{tool.title}</h4>
              <p className="text-[11px] font-body text-on-surface-variant leading-relaxed mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
                {tool.desc}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-tint group-hover:animate-ping"></span>
                  <span className="text-[9px] font-headline font-black uppercase tracking-widest text-on-surface-variant">Instant</span>
                </div>
                <span className="material-symbols-outlined text-white/5 group-hover:text-surface-tint transition-colors">arrow_forward</span>
              </div>
            </div>
          ))}

          {/* PDF to AI Focus Card */}
          <div
            onClick={() => navigate('/tool/pdf-to-ai')}
            className="col-span-1 md:col-span-2 lg:col-span-2 glass-card bg-surface-tint/5 border border-surface-tint/20 rounded-3xl p-10 flex flex-col justify-between transition-all hover:-translate-y-2 hover:bg-surface-tint/10 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-surface-tint/10 blur-[60px] -mr-24 -mt-24 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-surface-tint/20 text-surface-tint rounded-2xl flex items-center justify-center border border-surface-tint/40 shadow-[0_0_30px_rgba(0,220,229,0.2)]">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-headline font-black text-surface-tint uppercase tracking-[0.3em] block mb-1">New Feature Alert</span>
                <span className="text-[9px] font-body text-outline-variant uppercase">Optimized for LLMs</span>
              </div>
            </div>
            <div>
              <h4 className="font-headline text-4xl text-white font-black tracking-tighter uppercase mb-4 leading-none">PDF to<br /><span className="text-surface-tint" style={{ backgroundImage: 'linear-gradient(to right, #00dce5, #8422dc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>AI Context</span></h4>
              <p className="text-xs font-body text-on-surface-variant uppercase tracking-widest leading-relaxed max-w-sm">
                Save massive token loads. Make your PDFs perfectly legible to AI systems rapidly locally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-body uppercase tracking-[0.4em] text-outline-variant">Safe & Private</span>
          <span className="text-[10px] font-body uppercase tracking-[0.4em] text-outline-variant">Encryption Enabled</span>
        </div>
        <p className="text-[10px] font-body uppercase tracking-[0.2em] text-outline-variant">© 2026 PDF.OS — Simple PDF Management</p>
      </footer>
    </div>
  );
}
