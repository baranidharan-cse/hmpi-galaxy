import { useState, useEffect } from 'react';
import { LocationMap } from './components/LocationMap';
import { HMPICalculator } from './components/HMPICalculator';
import { LocationDetails } from './components/LocationDetails';
import { Statistics } from './components/Statistics';
import { Droplets, RefreshCw } from 'lucide-react';

const API_BASE = 'https://hmpi-galaxy.onrender.com/api';

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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Top Banner */}
      <div className="bg-orange-500 text-white text-xs font-bold px-4 py-1 flex justify-between tracking-widest uppercase">
        <span>Strategic Analytical Dashboard</span>
        <span>Environment Intelligence System</span>
      </div>
      
      <header className="bg-[#003366] text-white shadow-md border-b-4 border-green-600 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-full hidden sm:block shadow-inner">
               <Droplets className="w-8 h-8 text-[#003366]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-black tracking-wide">HMPI GALAXY</h1>
              <p className="text-blue-200 text-xs md:text-sm font-semibold tracking-widest uppercase">AI-Powered Groundwater Monitoring Portal</p>
            </div>
          </div>
          <button 
            onClick={fetchLiveWrisSync} 
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded font-bold shadow-md transition-all border border-green-900"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
            {loading ? 'SYNCHRONIZING...' : 'INDIA-WRIS LIVE SYNC'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border-2 border-slate-300 shadow-sm rounded-sm overflow-hidden">
            <div className="bg-slate-200 border-b-2 border-slate-300 px-4 py-2 font-bold text-[#003366] uppercase text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                National Geographic Information System (GIS)
            </div>
            <div className="h-[400px]">
                <LocationMap locations={locations} onLocationSelect={setSelectedLocation} selectedLocationId={selectedLocation?.id} />
            </div>
          </div>
          <div className="bg-white border-2 border-slate-300 shadow-sm rounded-sm flex flex-col">
            <div className="bg-slate-200 border-b-2 border-slate-300 px-4 py-2 font-bold text-[#003366] uppercase text-sm">
                Node Telemetry Profile
            </div>
            <div className="flex-1">
                <LocationDetails location={selectedLocation} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border-2 border-slate-300 shadow-sm rounded-sm">
            <div className="bg-slate-200 border-b-2 border-slate-300 px-4 py-2 font-bold text-[#003366] uppercase text-sm">
                Statistical Aggregation & Reporting
            </div>
            <div className="p-4">
                <Statistics locations={locations} />
            </div>
          </div>
          <div className="bg-white border-2 border-slate-300 shadow-sm rounded-sm">
            <div className="bg-slate-200 border-b-2 border-slate-300 px-4 py-2 font-bold text-[#003366] uppercase text-sm">
                Diagnostic Computation Terminal
            </div>
            <div className="p-4">
                <HMPICalculator onCalculate={handleCalculate} />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 border-t-4 border-orange-500 text-slate-300 mt-8">
        <div className="container mx-auto px-4 py-6 text-center text-xs font-semibold uppercase tracking-wider">
          <p className="mb-2">Advanced Hackathon Implementation Architecture by CHEMOVATE 2.0</p>
          <p>Heavy Metal Pollution Index mapped strictly to BIS (IS-10500:2012) Statutory Guidelines.</p>
        </div>
      </footer>
    </div>
  );
}
