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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Activity className="w-6 h-6 text-blue-600" />
          Pollution Distribution Analytics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-b pb-8">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 shadow-sm hover:shadow transform transition">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-700 uppercase tracking-wide text-sm">Low</span>
            </div>
            <div className="text-4xl font-black text-green-700">{lowPollution}</div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm hover:shadow transform transition">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-700 uppercase tracking-wide text-sm">Moderate</span>
            </div>
            <div className="text-4xl font-black text-yellow-700">{moderate}</div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 shadow-sm hover:shadow transform transition">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="font-bold text-orange-700 uppercase tracking-wide text-sm">High</span>
            </div>
            <div className="text-4xl font-black text-orange-700">{high}</div>
          </div>

          <div className="bg-red-50 rounded-xl p-4 border border-red-200 shadow-sm hover:shadow transform transition">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-bold text-red-700 uppercase tracking-wide text-sm">Critical</span>
            </div>
            <div className="text-4xl font-black text-red-700">{critical}</div>
          </div>
        </div>

        {locations.length > 0 && (
          <div>
            <h3 className="mb-4 font-bold text-slate-700 uppercase tracking-widest text-sm">HMPI by Diagnostic Node</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" height={100} tick={{fontSize: 12, fill: '#475569'}} />
                    <YAxis tick={{fontSize: 12, fill: '#475569', fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="mb-5 font-bold text-slate-800 text-lg flex items-center gap-2">
            Most Frequently Detected Heavy Metals Matrix
          </h2>
          <div className="space-y-4">
            {topMetals.map(([metal, count]) => (
              <div key={metal} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700">{metal}</span>
                  <span className="text-sm font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {count} location{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-in-out"
                    style={{ width: `${(count / locations.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
