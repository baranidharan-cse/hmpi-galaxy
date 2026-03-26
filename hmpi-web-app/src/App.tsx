import { useState, useEffect } from 'react';
import { LocationMap } from './components/LocationMap';
import { HMPICalculator } from './components/HMPICalculator';
import { LocationDetails } from './components/LocationDetails';
import { Statistics } from './components/Statistics';
import { Droplets, RefreshCw } from 'lucide-react';

const API_BASE = 'https://hmpi-groundwater-monitoring-system-live.onrender.com/api';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  hmpi: number;
  heavyMetals: string[];
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  const mapBackendToLocation = (item: any): Location => {
    const allMetals = ['As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe', 'Ni', 'Cu', 'Zn'];
    const detected: string[] = [];
    allMetals.forEach(m => {
        if (item[m] && parseFloat(item[m]) > 0) detected.push(`${m} (${parseFloat(item[m]).toFixed(4)} mg/L)`);
    });
    return {
      id: item.Sample_ID || String(Math.random()),
      name: item.Sample_ID || 'Live Diagnostic Node',
      lat: parseFloat(item.Latitude) || 0,
      lng: parseFloat(item.Longitude) || 0,
      hmpi: parseFloat(item.HMPI) || 0,
      heavyMetals: detected.length ? detected : ['Simulated Batch']
    };
  };

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/map/nodes`);
      const data = await response.json();
      setLocations(data.map(mapBackendToLocation));
    } catch (e) {
      console.error("Backend historical fetch failing", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveWrisSync = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/wris/sync`);
      const data = await response.json();
      setLocations(prev => [...data.map(mapBackendToLocation), ...prev]);
    } catch (e) {
      console.error("WRIS Live Sync failing", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const handleCalculate = (result: { hmpi: number; metals: { name: string; concentration: number; standard: number }[]; locationName: string; lat: number; lng: number; }) => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name: result.locationName,
      lat: result.lat,
      lng: result.lng,
      hmpi: result.hmpi,
      heavyMetals: result.metals.map((m) => m.name),
    };
    setLocations([newLocation, ...locations]);
    setSelectedLocation(newLocation);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-black text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-xl rounded-tl-none border border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Droplets className="w-8 h-8 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                HMPI Galaxy
              </h1>
              <p className="text-cyan-200/70 text-xs md:text-sm font-semibold tracking-wide uppercase mt-0.5">
                Advanced AI Groundwater Architecture
              </p>
            </div>
          </div>
          <button 
            onClick={fetchLiveWrisSync} 
            className="group relative flex items-center gap-2 bg-blue-600/80 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] border border-blue-400/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> 
            {loading ? 'SYNTHESIZING...' : 'LIVE WRIS SYNC'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <LocationMap locations={locations} onLocationSelect={setSelectedLocation} selectedLocationId={selectedLocation?.id} />
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-1 relative">
            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            <LocationDetails location={selectedLocation} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-1 relative">
            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <Statistics locations={locations} />
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-1 relative">
            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <HMPICalculator onCalculate={handleCalculate} />
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-white/10 text-slate-500 relative overflow-hidden">
        <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <div className="container mx-auto px-4 py-8 text-center text-sm font-medium">
          <p className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Heavy Metal Pollution Index (HMPI) Core powered by 
            <strong className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Gradient Boosting AI</strong> & 
            <strong className="text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Deep Learning metrics</strong>.
          </p>
        </div>
      </footer>
    </div>
  );
}
