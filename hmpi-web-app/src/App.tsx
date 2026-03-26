import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Activity, Database, FileText, LayoutDashboard, UploadCloud, BrainCircuit, Settings, Search, AlertTriangle, TrendingUp, MapPin, Download, ChevronRight, Beaker } from 'lucide-react';

// --- Hack for Leaflet Icons in React ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Mock Data Generators for AI UI ---
const generateTrendData = () => Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  hmpi: Math.floor(Math.random() * 150) + 50
}));

const shapData = [
  { feature: 'Lead (Pb)', impact: 42, color: '#ef4444' },
  { feature: 'Arsenic (As)', impact: 28, color: '#f97316' },
  { feature: 'Cadmium (Cd)', impact: 15, color: '#eab308' },
  { feature: 'Mercury (Hg)', impact: 10, color: '#22c55e' },
  { feature: 'Chromium (Cr)', impact: 5, color: '#3b82f6' }
];

const mockRawData = Array.from({ length: 15 }, (_, i) => ({
    id: `NODE-${1000 + i}`,
    lat: (12.9716 + (Math.random() - 0.5) * 5).toFixed(4),
    lng: (77.5946 + (Math.random() - 0.5) * 5).toFixed(4),
    hmpi: (Math.random() * 350).toFixed(1),
    status: Math.random() > 0.7 ? 'Critical' : Math.random() > 0.4 ? 'Amber' : 'Safe',
    date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
}));

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trendData] = useState(generateTrendData());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate DNN Loading State
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Semantic Coloring Logic
  const getSemanticColor = (val: number) => val < 100 ? '#22c55e' : val <= 300 ? '#f59e0b' : '#ef4444';
  const getSemanticClass = (status: string) => 
    status === 'Safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
    status === 'Amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
    'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <div className="flex h-screen bg-[#050f14] text-slate-300 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* 1. Sidebar Navigation - Environmental Blue/Green */}
      <aside className="w-64 bg-[#08171e] border-r border-emerald-900/20 flex flex-col justify-between shrink-0 z-20 shadow-2xl">
        <div>
          <div className="p-6 border-b border-emerald-900/20 flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white font-serif">ARENA GALAXY</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-500 font-bold mt-0.5">Environmental Intelligence</p>
            </div>
          </div>
          
          <div className="p-4 space-y-1.5 mt-4">
             {[['Dashboard Overview', LayoutDashboard, 'dashboard'], 
               ['Data Upload', UploadCloud, 'upload'], 
               ['AI Insights', Activity, 'ai'], 
               ['Regulatory Reports', FileText, 'reports']].map(([label, Icon, id]) => (
                <div key={id as string} onClick={() => setActiveTab(id as string)}
                     className={`px-4 py-3 rounded-xl font-medium flex items-center justify-between cursor-pointer transition-all duration-300 text-sm ${activeTab === id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                    <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" /> {label as string}
                    </div>
                    {activeTab === id && <ChevronRight className="w-4 h-4 opacity-50" />}
                </div>
             ))}
          </div>
        </div>

        <div className="p-6 border-t border-emerald-900/20 space-y-3">
            <div className="bg-[#0b212c] rounded-xl p-4 border border-emerald-900/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-700"></div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">System Online</span>
                </div>
                <p className="text-xs text-slate-500 relative z-10">FastAPI Engine synced with WHO/BIS standards.</p>
            </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none z-0"></div>
        
        {/* Top Header */}
        <header className="h-16 bg-[#08171e]/80 backdrop-blur-md border-b border-emerald-900/20 flex items-center justify-between px-8 z-10 shrink-0">
            <div className="relative w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Search coordinates or node IDs..." 
                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-[#0b212c] border border-emerald-900/30 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600" />
            </div>
            <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Settings className="w-4 h-4" /> SETTINGS
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)] border-2 border-[#050f14]">
                    AI
                </div>
            </div>
        </header>

        {/* Dynamic Content Area with CSS Fade-in (Framer Motion substitute) */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 z-10 animate-[fadeIn_0.5s_ease-in-out]">
            
            {/* 3. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#08171e] rounded-2xl p-6 border border-emerald-900/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"><Activity className="w-16 h-16 text-emerald-500" /></div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Average HMPI Score</div>
                    <div className="flex items-end gap-3">
                        {loading ? <div className="h-10 w-24 bg-slate-800 animate-pulse rounded-lg"></div> : <div className="text-4xl font-black text-amber-400">142.4</div>}
                        <div className="text-sm font-medium text-slate-400 mb-1">Amber Zone</div>
                    </div>
                </div>
                <div className="bg-[#08171e] rounded-2xl p-6 border border-emerald-900/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"><AlertTriangle className="w-16 h-16 text-rose-500" /></div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total High-Risk Zones</div>
                    <div className="flex items-end gap-3">
                        {loading ? <div className="h-10 w-16 bg-slate-800 animate-pulse rounded-lg"></div> : <div className="text-4xl font-black text-rose-500">24</div>}
                        <div className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-rose-500"/> +12% this month</div>
                    </div>
                </div>
                <div className="bg-[#08171e] rounded-2xl p-6 border border-emerald-900/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"><Beaker className="w-16 h-16 text-emerald-500" /></div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Top Contaminant</div>
                    <div className="flex items-end gap-3">
                        {loading ? <div className="h-10 w-32 bg-slate-800 animate-pulse rounded-lg"></div> : <div className="text-4xl font-black text-slate-200">Lead <span className="text-emerald-500">(Pb)</span></div>}
                        <div className="text-sm font-medium text-slate-400 mb-1">42% Impact</div>
                    </div>
                </div>
            </div>

            {/* Middle Grid: Map & SHAP Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* 2. Full-Screen Interactive GIS Map */}
                <div className="lg:col-span-2 bg-[#08171e] rounded-2xl border border-emerald-900/20 shadow-lg overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-emerald-900/20 flex items-center justify-between bg-[#08171e]">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <MapPin className="w-4 h-4 text-emerald-500" /> Global GIS Visualization
                        </h3>
                        <div className="flex items-center gap-2 bg-[#0b212c] border border-emerald-900/30 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">CartoDB Dark Matter</span>
                        </div>
                    </div>
                    <div className="h-[450px] w-full relative bg-[#0b212c]">
                        {loading ? (
                             <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 z-50 bg-[#08171e]">
                                 <Database className="w-8 h-8 text-emerald-500 animate-bounce" />
                                 <div className="text-xs font-mono text-emerald-400 tracking-widest uppercase">Deep Neural Network Connecting...</div>
                             </div>
                        ) : (
                            <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={true}>
                                <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                {mockRawData.slice(0, 5).map(loc => {
                                    const mColor = getSemanticColor(parseFloat(loc.hmpi));
                                    const icon = L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `<div style="background-color: ${mColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #050f14; box-shadow: 0 0 15px ${mColor};"></div>`,
                                    });
                                    return (
                                        <Marker key={loc.id} position={[parseFloat(loc.lat), parseFloat(loc.lng)]} icon={icon}>
                                            <Popup className="dark-saas-popup">
                                                <div className="bg-[#08171e] text-slate-300 p-2 rounded-xl border border-emerald-900/30 w-48 shadow-2xl">
                                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Target ID</div>
                                                    <div className="text-sm font-bold text-white mb-3 border-b border-white/10 pb-2">{loc.id}</div>
                                                    <div className="bg-[#050f14] p-3 rounded-lg border border-white/5 mb-2">
                                                        <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">HMPI Score</div>
                                                        <div className="text-2xl font-black" style={{color: mColor}}>{loc.hmpi}</div>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )
                                })}
                            </MapContainer>
                        )}
                    </div>
                </div>

                {/* 5. Explainable AI (XAI) Panel */}
                <div className="bg-[#08171e] rounded-2xl border border-emerald-900/20 shadow-lg flex flex-col">
                    <div className="px-6 py-4 border-b border-emerald-900/20">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Activity className="w-4 h-4 text-emerald-500" /> Explainable AI (SHAP)
                        </h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            Feature Importance Matrix isolating the highest heavy metal pollution drivers across the neural network timeframe.
                        </p>
                        {loading ? (
                            <div className="flex-1 space-y-4">
                                {[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-slate-800/50 rounded-md animate-pulse"></div>)}
                            </div>
                        ) : (
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                    <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} width={90}/>
                                        <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px'}} />
                                        <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                                            {shapData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Data Table & Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 4. Shadcn/UI Style Data Table */}
                <div className="lg:col-span-2 bg-[#08171e] rounded-2xl border border-emerald-900/20 shadow-lg overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-emerald-900/20 flex justify-between items-center">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Database className="w-4 h-4 text-emerald-500" /> Raw Sensor Telemetry
                        </h3>
                        <button className="flex items-center gap-2 text-[10px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                            <Download className="w-3 h-3" /> EXPORT
                        </button>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-[#0b212c]/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold border-b border-emerald-900/20">Node ID</th>
                                    <th className="px-6 py-4 font-bold border-b border-emerald-900/20">Coordinates</th>
                                    <th className="px-6 py-4 font-bold border-b border-emerald-900/20">Timestamp</th>
                                    <th className="px-6 py-4 font-bold border-b border-emerald-900/20">HMPI Index</th>
                                    <th className="px-6 py-4 font-bold border-b border-emerald-900/20">Zone Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? Array.from({length: 5}).map((_, i) => (
                                    <tr key={i} className="border-b border-emerald-900/10">
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-800 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-800 animate-pulse rounded-full"></div></td>
                                    </tr>
                                )) : mockRawData.filter(d => d.id.toLowerCase().includes(searchQuery.toLowerCase())).slice(0,6).map((row) => (
                                    <tr key={row.id} className="border-b border-emerald-900/10 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-300">{row.id}</td>
                                        <td className="px-6 py-4 font-mono text-[11px]">{row.lat}, {row.lng}</td>
                                        <td className="px-6 py-4 text-xs">{row.date}</td>
                                        <td className="px-6 py-4 font-bold" style={{color: getSemanticColor(parseFloat(row.hmpi))}}>{row.hmpi}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSemanticClass(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 6. Predictive Time Series Chart */}
                <div className="bg-[#08171e] rounded-2xl border border-emerald-900/20 shadow-lg flex flex-col">
                    <div className="px-6 py-4 border-b border-emerald-900/20">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> 12-Month Predictive Trend
                        </h3>
                    </div>
                    <div className="p-6 flex-1 h-[300px]">
                        {loading ? (
                             <div className="w-full h-full flex items-end justify-between pb-4 gap-2">
                                 {Array.from({length: 12}).map((_, i) => <div key={i} className="w-full bg-slate-800 rounded-t-sm animate-pulse" style={{height: `${Math.random() * 80 + 20}%`}}></div>)}
                             </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorHmpi" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                                    <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc'}} cursor={{stroke: '#1e293b', strokeWidth: 2}} />
                                    <Area type="monotone" dataKey="hmpi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHmpi)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
                
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .leaflet-container { background: #050f14 !important; font-family: inherit; }
                .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                .leaflet-popup-tip { display: none !important; }
            `}} />
            
        </div>
      </main>
    </div>
  );
}
