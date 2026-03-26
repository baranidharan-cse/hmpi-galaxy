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
    <div className="space-y-6 bg-white text-slate-800">
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-sm p-4 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-2 border-b pb-2 border-slate-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-slate-700 uppercase text-xs">Safe Zones</span>
            </div>
            <div className="text-3xl font-black text-green-700">{lowPollution}</div>
          </div>

          <div className="bg-white rounded-sm p-4 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-2 border-b pb-2 border-slate-100">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-slate-700 uppercase text-xs">Moderate</span>
            </div>
            <div className="text-3xl font-black text-yellow-600">{moderate}</div>
          </div>

          <div className="bg-white rounded-sm p-4 border-2 border-slate-200">
             <div className="flex items-center gap-2 mb-2 border-b pb-2 border-slate-100">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-slate-700 uppercase text-xs">Elevated</span>
            </div>
            <div className="text-3xl font-black text-orange-600">{high}</div>
          </div>

          <div className="bg-white rounded-sm p-4 border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-2 border-b pb-2 border-slate-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-bold text-slate-700 uppercase text-xs">Critical</span>
            </div>
            <div className="text-3xl font-black text-red-700">{critical}</div>
          </div>
        </div>

        {locations.length > 0 && (
          <div>
            <div className="bg-slate-50 p-2 border border-slate-300">
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" height={80} tick={{fontSize: 11, fill: '#475569'}} />
                    <YAxis tick={{fontSize: 12, fill: '#334155', fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #94a3b8', backgroundColor: '#fff', boxShadow: 'none', color: '#0f172a' }} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="hmpi" maxBarSize={50}>
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
        <div className="pt-4 border-t-2 border-slate-200">
          <h2 className="mb-4 font-bold text-[#003366] text-sm uppercase">
            Official Contamination Frequency
          </h2>
          <div className="space-y-3">
            {topMetals.map(([metal, count]) => (
              <div key={metal} className="bg-white p-2 border-2 border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700 text-sm">{metal}</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300">
                    {count} Zones Detected
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 overflow-hidden border border-slate-300">
                  <div
                    className="bg-[#003366] h-full"
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
