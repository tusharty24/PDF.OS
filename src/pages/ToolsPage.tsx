import { useNavigate, useSearchParams } from "react-router-dom";
import { toolsData } from "../lib/toolsData";

export default function ToolsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const category = searchParams.get("category");

    const filteredTools = Object.entries(toolsData).filter(([id, tool]) => {
        const matchesQuery = tool.title.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            id.toLowerCase().includes(query);
        const matchesCategory = category ? tool.category === category : true;
        return matchesQuery && matchesCategory;
    });

    return (
        <div className="animate-fade-in-up">
            <section className="mb-16">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-2 h-2 bg-surface-tint rounded-full shadow-[0_0_15px_rgba(0,220,229,1)]"></span>
                            <span className="text-[10px] font-headline font-black uppercase tracking-[0.4em] text-surface-tint">Tool Directory</span>
                        </div>
                        <h2 className="font-headline text-7xl text-white font-black tracking-tighter uppercase leading-none">Find Your<br /><span className="text-white/20">Helper</span></h2>
                    </div>
                </div>
            </section>

            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-20">
                    {filteredTools.map(([id, tool]) => (
                        <div
                            key={id}
                            onClick={() => navigate(`/tool/${id}`)}
                            className="glass-card bg-surface-container-lowest border border-white/5 rounded-3xl p-8 transition-all hover:-translate-y-2 hover:bg-surface-tint/[0.03] hover:border-surface-tint/30 group cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-surface-tint/10 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-white/20 group-hover:text-surface-tint group-hover:scale-110 transition-all">
                                    {tool.icon || 'description'}
                                </span>
                            </div>
                            <h4 className="font-headline text-xl text-white font-black tracking-tight uppercase mb-3">{tool.title}</h4>
                            <p className="text-[11px] font-body text-on-surface-variant leading-relaxed mb-8 opacity-60 group-hover:opacity-100 transition-opacity whitespace-pre-wrap">
                                {tool.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-surface-tint group-hover:animate-ping"></span>
                                    <span className="text-[9px] font-headline font-black uppercase tracking-widest text-on-surface-variant">{tool.category}</span>
                                </div>
                                <span className="material-symbols-outlined text-white/5 group-hover:text-surface-tint transition-colors">arrow_forward</span>
                            </div>
                        </div>
                    ))}

                    {filteredTools.length === 0 && (
                        <div className="col-span-full py-40 text-center space-y-6">
                            <span className="material-symbols-outlined text-6xl text-white/10">search_off</span>
                            <p className="font-headline text-xl text-white/40 uppercase tracking-widest">No tools found for "{query}"</p>
                            <button
                                onClick={() => navigate('/tools')}
                                className="text-[10px] font-headline font-black text-surface-tint uppercase border-b border-surface-tint/50 pb-1 tracking-[0.2em] hover:text-white hover:border-white transition-all"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
