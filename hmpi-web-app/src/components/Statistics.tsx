import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  hmpi: number;
  heavyMetals: string[];
}

interface StatisticsProps {
  locations: Location[];
}

export function Statistics({ locations }: StatisticsProps) {
  const lowPollution = locations.filter((l) => l.hmpi < 50).length;
  const moderate = locations.filter((l) => l.hmpi >= 50 && l.hmpi < 100).length;
  const high = locations.filter((l) => l.hmpi >= 100 && l.hmpi < 200).length;
  const critical = locations.filter((l) => l.hmpi >= 200).length;

  const chartData = locations.map((location) => ({
    id: location.id,
    name: location.name,
    hmpi: location.hmpi,
  }));

  const getBarColor = (hmpi: number) => {
    if (hmpi < 50) return '#22c55e';
    if (hmpi < 100) return '#eab308';
    if (hmpi < 200) return '#f97316';
    return '#ef4444';
  };

  const allMetals = new Map<string, number>();
  locations.forEach((location) => {
    location.heavyMetals.forEach((metal) => {
      allMetals.set(metal, (allMetals.get(metal) || 0) + 1);
    });
  });

  const topMetals = Array.from(allMetals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 bg-transparent p-4 sm:p-6 text-slate-200">
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-white tracking-widest uppercase">
          <Activity className="w-6 h-6 text-cyan-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          Pollution Distribution Analytics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-b border-white/10 pb-8">
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transform transition relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              <span className="font-bold text-green-400 uppercase tracking-widest text-xs">Low Risk</span>
            </div>
            <div className="text-4xl font-black text-white">{lowPollution}</div>
          </div>

          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transform transition relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
              <span className="font-bold text-yellow-400 uppercase tracking-widest text-xs">Moderate</span>
            </div>
            <div className="text-4xl font-black text-white">{moderate}</div>
          </div>

          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transform transition relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
              <span className="font-bold text-orange-400 uppercase tracking-widest text-xs">Warning</span>
            </div>
            <div className="text-4xl font-black text-white">{high}</div>
          </div>

          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transform transition relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              <span className="font-bold text-red-500 uppercase tracking-widest text-xs">Critical</span>
            </div>
            <div className="text-4xl font-black text-white">{critical}</div>
          </div>
        </div>

        {locations.length > 0 && (
          <div>
            <h3 className="mb-4 font-bold text-cyan-200 uppercase tracking-widest text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div> HMPI by Diagnostic Node
            </h3>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 shadow-inner">
                <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" height={100} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="hmpi" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.id}`} fill={getBarColor(entry.hmpi)} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {topMetals.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <h2 className="mb-5 font-bold text-white text-lg flex items-center gap-2 uppercase tracking-wide">
            <Activity className="w-5 h-5 text-indigo-400" />
            Most Frequently Detected Toxins
          </h2>
          <div className="space-y-4">
            {topMetals.map(([metal, count]) => (
              <div key={metal} className="bg-slate-900/50 p-3 rounded-lg border border-white/5 group transition-colors hover:bg-slate-800/80 hover:border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-cyan-100">{metal}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {count} node{count !== 1 ? 's' : ''} detected
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-in-out relative"
                    style={{ width: `${(count / locations.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
