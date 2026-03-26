import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="space-y-8 bg-white text-slate-800 font-sans">
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-50 p-1.5 rounded-lg group-hover:bg-green-100 transition-colors">
                 <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Safe Zones</span>
            </div>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-800">{lowPollution}</div>
                <div className="text-xs font-semibold text-green-500">Nodes</div>
            </div>
            <div className="w-full bg-slate-50 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-yellow-50 p-1.5 rounded-lg group-hover:bg-yellow-100 transition-colors">
                 <AlertCircle className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Moderate</span>
            </div>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-800">{moderate}</div>
                <div className="text-xs font-semibold text-yellow-600">Nodes</div>
            </div>
             <div className="w-full bg-slate-50 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full w-3/4"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
             <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-50 p-1.5 rounded-lg group-hover:bg-orange-100 transition-colors">
                 <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Elevated</span>
            </div>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-800">{high}</div>
                <div className="text-xs font-semibold text-orange-600">Nodes</div>
            </div>
            <div className="w-full bg-slate-50 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full w-1/2"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-red-50 p-1.5 rounded-lg group-hover:bg-red-100 transition-colors">
                 <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Critical</span>
            </div>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-800">{critical}</div>
                <div className="text-xs font-semibold text-red-600">Nodes</div>
            </div>
             <div className="w-full bg-slate-50 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full w-1/4"></div>
            </div>
          </div>
        </div>

        {locations.length > 0 && (
          <div className="mb-8">
            <div className="bg-white pt-2">
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" height={80} tick={{fontSize: 10, fill: '#64748b'}} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#64748b', fontWeight: '500'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', color: '#0f172a', fontWeight: 'bold' }} cursor={{fill: 'rgba(241,245,249,0.5)'}} />
                    <Bar dataKey="hmpi" maxBarSize={40} radius={[4, 4, 0, 0]}>
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
        <div className="pt-6 border-t border-slate-100">
          <h2 className="mb-5 font-bold text-slate-800 text-sm flex justify-between items-center">
            <span>Contamination Frequency (QA/QC)</span>
            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Top 5 Analyzed</span>
          </h2>
          <div className="space-y-4">
            {topMetals.map(([metal, count]) => (
              <div key={metal} className="group cursor-pointer">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="font-bold text-slate-700 text-sm group-hover:text-teal-600 transition-colors">{metal}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {count} Zones
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(count / locations.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
