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
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 filter drop-shadow-md" />
             <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">HMPI Galaxy</h1>
              <p className="text-blue-100 text-xs md:text-sm font-medium">Groundwater Quality Assessment System</p>
            </div>
          </div>
          <button onClick={fetchLiveWrisSync} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg font-bold transition shadow-inner">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Syncing...' : 'Live Sync'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 shadow-xl rounded-xl overflow-hidden border border-slate-200 bg-white">
            <LocationMap locations={locations} onLocationSelect={setSelectedLocation} selectedLocationId={selectedLocation?.id} />
          </div>
          <div className="shadow-xl rounded-xl">
            <LocationDetails location={selectedLocation} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 shadow-xl rounded-xl">
            <Statistics locations={locations} />
          </div>
          <div className="shadow-xl rounded-xl">
            <HMPICalculator onCalculate={handleCalculate} />
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t-4 border-blue-600 text-slate-400">
        <div className="container mx-auto px-4 py-6 text-center text-sm font-medium">
          <p>Heavy Metal Pollution Index (HMPI) is mathematically calculated based on rigorous <strong>WHO / EPA / BIS</strong> standards for drinking water.</p>
        </div>
      </footer>
    </div>
  );
}
