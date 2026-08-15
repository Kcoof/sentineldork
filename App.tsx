
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  Zap, 
  LayoutGrid, 
  Cpu, 
  Info,
  ChevronRight,
  RefreshCw,
  Terminal,
  Globe,
  Database,
  Cloud,
  X,
  Activity,
  Github
} from 'lucide-react';
import { DORKS_DB } from './constants';
import { DorkItem, SearchEngine, AIAnalysis } from './types';
import { analyzeDork } from './services/aiService';

const App: React.FC = () => {
  const [target, setTarget] = useState('example.com');
  const [engine, setEngine] = useState<SearchEngine>('google');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ [id: string]: AIAnalysis }>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState<{ open: boolean; item?: DorkItem }>({ open: false });

  // Filtering Logic
  const filteredDorks = useMemo(() => {
    return DORKS_DB.map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        const matchesCat = !selectedCategory || cat.name === selectedCategory;
        const matchesSearch = !searchQuery || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesSearch;
      })
    })).filter(cat => cat.items.length > 0);
  }, [selectedCategory, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const buildSearchUrl = (query: string, domain: string, currentEngine: SearchEngine) => {
    let finalQuery = query.replace(/DOMAIN/g, domain);
    
    // Engine specific syntax corrections
    if (currentEngine === 'bing' || currentEngine === 'duckduckgo') {
      finalQuery = finalQuery.replace(/filetype:/g, "ext:");
      finalQuery = finalQuery.replace(/inurl:/g, "url:");
    }

    const urls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(finalQuery)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(finalQuery)}`,
      shodan: `https://www.shodan.io/search?query=${encodeURIComponent(finalQuery)}`,
      censys: `https://search.censys.io/search?q=${encodeURIComponent(finalQuery)}`
    };
    return urls[currentEngine];
  };

  const handleAIAnalyze = async (item: DorkItem) => {
    if (analysis[item.id]) {
      setShowAIModal({ open: true, item });
      return;
    }

    setAnalyzingId(item.id);
    try {
      const result = await analyzeDork(item.title, item.query);
      setAnalysis(prev => ({ ...prev, [item.id]: result }));
      setShowAIModal({ open: true, item });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800 bg-slate-900/50 hidden lg:block overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">SentinelDork</h1>
              <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">Version 3.0</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!selectedCategory ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'hover:bg-slate-800'}`}
            >
              <LayoutGrid size={18} />
              <span className="font-medium text-sm">All Library</span>
            </button>
            {DORKS_DB.map(cat => (
              <button 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedCategory === cat.name ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium text-sm">{cat.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recon Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">Ready</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Targeting</span>
                  <span className="text-indigo-400 truncate ml-2">{target}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Dorks Loaded</span>
                  <span className="text-slate-300">{DORKS_DB.reduce((acc, c) => acc + c.items.length, 0)}</span>
                </div>
              </div>
            </div>

            <a 
              href="https://github.com" 
              target="_blank" 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold"
            >
              <Github size={14} /> Source Code
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Vulnerability Dashboard</h2>
              <p className="text-slate-400 mt-1">Advanced asset discovery and risk assessment for ethical testing.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <Activity className="text-indigo-400 animate-pulse" size={14} />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Network Live</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm sticky top-4 z-40 shadow-2xl">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Globe size={12} /> Target Root Domain
              </label>
              <input 
                type="text" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="domain.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
              />
            </div>

            <div className="w-full md:w-64 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Search size={12} /> Search Engine
              </label>
              <select 
                value={engine}
                onChange={(e) => setEngine(e.target.value as SearchEngine)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="google">Google Search</option>
                <option value="bing">Bing Search</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="shodan">Shodan.io</option>
                <option value="censys">Censys Search</option>
              </select>
            </div>

            <div className="w-full md:w-80 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Terminal size={12} /> Filter Queries
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. env, backup..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                />
                <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
              </div>
            </div>
          </div>

          {/* Dorks Grid */}
          <div className="space-y-12">
            {filteredDorks.map(category => (
              <section key={category.name} className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{category.name}</h2>
                    <p className="text-xs text-slate-500">{category.items.length} Vulnerability Templates</p>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map(item => (
                    <DorkCard 
                      key={item.id} 
                      item={item} 
                      target={target} 
                      engine={engine}
                      buildSearchUrl={buildSearchUrl}
                      onCopy={handleCopy}
                      onAnalyze={handleAIAnalyze}
                      isAnalyzing={analyzingId === item.id}
                      hasAnalysis={!!analysis[item.id]}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* AI Analysis Modal (as previously defined but with better layout) */}
      {showAIModal.open && showAIModal.item && analysis[showAIModal.item.id] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.15)] animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Intel Report</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">{showAIModal.item.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIModal({ open: false })}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${
                  analysis[showAIModal.item.id].riskLevel.toLowerCase().includes('high') || analysis[showAIModal.item.id].riskLevel.toLowerCase().includes('critical')
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  Severity: {analysis[showAIModal.item.id].riskLevel}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <Info size={14} className="text-indigo-400" /> Explanation
                  </h4>
                  <div className="text-slate-400 text-sm leading-relaxed space-y-4">
                    {analysis[showAIModal.item.id].explanation}
                  </div>
                </div>

                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <ShieldAlert size={48} />
                  </div>
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <ShieldAlert size={14} className="text-emerald-400" /> Remediation Path
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                    {analysis[showAIModal.item.id].remediation}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-800/20 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setShowAIModal({ open: false })}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
              >
                Dismiss Intelligence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DorkCardProps {
  item: DorkItem;
  target: string;
  engine: SearchEngine;
  buildSearchUrl: (q: string, d: string, e: SearchEngine) => string;
  onCopy: (t: string) => void;
  onAnalyze: (i: DorkItem) => void;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
}

const DorkCard: React.FC<DorkCardProps> = ({ item, target, engine, buildSearchUrl, onCopy, onAnalyze, isAnalyzing, hasAnalysis }) => {
  const processedQuery = item.query.replace(/DOMAIN/g, target);
  const searchUrl = buildSearchUrl(item.query, target, engine);

  return (
    <div className="group relative bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{item.title}</h3>
            {item.impact === 'High' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>}
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
        </div>
        <div className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
          item.impact === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
          item.impact === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
          'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {item.impact} Risk
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-6 relative overflow-hidden group/query">
        <div className="mono text-[10px] text-indigo-400/80 break-all leading-relaxed pr-8">
          {processedQuery}
        </div>
        <button 
          onClick={() => onCopy(processedQuery)}
          className="absolute right-3 top-3.5 p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 opacity-0 group-hover/query:opacity-100 hover:text-white hover:border-slate-500 transition-all transform hover:scale-110 active:scale-95 shadow-xl"
          title="Copy Query"
        >
          <Copy size={14} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <a 
          href={searchUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-[2] bg-slate-100 hover:bg-white text-slate-950 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
        >
          Launch Recon <ExternalLink size={12} />
        </a>
        <button 
          onClick={() => onAnalyze(item)}
          disabled={isAnalyzing}
          className={`flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border shadow-xl active:scale-95 ${
            hasAnalysis 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          {isAnalyzing ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : hasAnalysis ? (
            <Cpu size={12} />
          ) : (
            <Zap size={12} />
          )}
          {isAnalyzing ? '...' : hasAnalysis ? 'Report' : 'Intel'}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {item.tags.map(tag => (
          <span key={tag} className="text-[8px] text-slate-500 bg-slate-800/30 px-2 py-0.5 rounded-md border border-slate-800/50 uppercase tracking-[0.1em] font-black group-hover:border-slate-700 transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default App;
