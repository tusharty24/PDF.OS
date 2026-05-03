import { HashRouter, Routes, Route, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "./pages/Home";
import ToolPage from "./pages/ToolPage";
import ToolsPage from "./pages/ToolsPage";
import PipelinePage from "./pages/PipelinePage";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 flex flex-col justify-between py-10 h-screen w-72 border-r border-white/5 bg-gradient-to-b from-[#131313] to-[#0e0e0e] shadow-[20px_0_40px_rgba(0,0,0,0.3)] z-50">
      <div>
        <div className="px-8 mb-12 cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-2xl font-black tracking-tighter text-white font-headline">PDF.OS</h1>
          <p className="font-headline text-[10px] tracking-widest uppercase text-surface-tint/60 mt-1">Easy PDF Suite</p>
        </div>
        <nav className="space-y-1">
          {[
            { id: 'all', label: 'All Tools', icon: 'grid_view', path: '/tools' },
            { id: 'organize', label: 'Organize', icon: 'folder', path: '/tools?category=organize' },
            { id: 'convert', label: 'Convert', icon: 'sync', path: '/tools?category=convert' },
            { id: 'optimize', label: 'Optimize', icon: 'bolt', path: '/tools?category=optimize' },
            { id: 'security', label: 'Security', icon: 'shield', path: '/tools?category=security' },
            { id: 'edit', label: 'Edit PDF', icon: 'edit', path: '/tools?category=edit' },
            { id: 'pipeline', label: 'Automate', icon: 'auto_fix_high', path: '/pipeline' },
          ].map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/tools' && location.search.includes(`category=${item.id}`)) || (location.pathname === item.path && item.id === 'all');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-[calc(100%-1.5rem)] mx-3 px-6 py-3.5 flex items-center gap-4 transition-all font-headline font-bold tracking-tight rounded-2xl group ${isActive
                  ? 'bg-surface-tint/10 text-surface-tint border border-surface-tint/20 shadow-[0_0_30px_rgba(0,220,229,0.1)]'
                  : 'text-outline-variant hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                <span className="text-[13px] uppercase tracking-[0.05em]">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-surface-tint shadow-[0_0_10px_rgba(0,220,229,1)]" />}
              </button>
            );
          })}
        </nav>
        <div className="mt-10 px-6">
          <button onClick={() => navigate('/tools')} className="w-full bg-surface-container-highest text-white py-5 rounded-2xl font-headline font-black text-[11px] tracking-[0.2em] uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/5 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            New Task
          </button>
        </div>
      </div>
      <div className="pb-10 space-y-1">
        {[
          { icon: 'settings', label: 'Settings' },
          { icon: 'help', label: 'Support' },
        ].map(item => (
          <button key={item.label} className="w-[calc(100%-1.5rem)] text-outline-variant hover:text-white mx-3 px-6 py-3.5 transition-all hover:bg-white/5 flex items-center gap-4 font-headline font-bold tracking-tight rounded-2xl opacity-60 hover:opacity-100">
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[12px] uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

const Header = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tools?q=${encodeURIComponent(search)}`);
  };

  const handleChange = (val: string) => {
    setSearch(val);
    navigate(`/tools?q=${encodeURIComponent(val)}`, { replace: true });
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-18rem)] z-40 bg-neutral-900/20 backdrop-blur-2xl flex items-center justify-between px-12 h-20">
      <div className="flex-1 max-w-2xl">
        <form onSubmit={handleSearch} className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-surface-tint transition-colors">search</span>
          <input
            className="w-full bg-surface-container-lowest border-none rounded-full py-3 pl-12 pr-6 text-xs tracking-[0.2em] font-body focus:ring-1 focus:ring-primary-container transition-all placeholder:text-outline-variant/50"
            placeholder="SEARCH FOR TOOLS OR DOCUMENTS..."
            type="text"
            value={search}
            onChange={(e) => handleChange(e.target.value)}
          />
        </form>
      </div>
      <div className="flex items-center gap-6 ml-8">
        <button className="text-neutral-400 hover:bg-white/5 rounded-full p-2 transition-all relative">
          <span className="material-symbols-outlined">notifications_none</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-surface-tint rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-outline-variant/30"></div>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right">
            <p className="text-[10px] tracking-widest text-surface-tint uppercase font-headline font-bold">Pro Account</p>
            <p className="text-xs text-on-surface-variant">User</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-surface-tint/20 p-0.5 group-hover:border-surface-tint/50 transition-colors bg-surface-container-low flex items-center justify-center overflow-hidden">
            <img src="/user_avatar.jpg" alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

const App = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        if (!window.location.pathname.includes('/tool/')) return;
        e.preventDefault();
        document.getElementById('global-file-input')?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="min-h-screen bg-surface text-on-surface font-body overflow-hidden">
          <Sidebar />
          <Header />
          <main className="ml-72 pt-28 px-12 pb-12 h-screen overflow-y-auto bg-surface custom-scrollbar">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/tool/:toolId" element={<ToolPage />} />
            </Routes>
          </main>
          <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,235,245,0.4)] hover:scale-110 active:scale-95 transition-all z-50">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
