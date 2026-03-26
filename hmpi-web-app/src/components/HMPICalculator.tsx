import { useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';

interface HeavyMetal {
  id: string;
  name: string;
  concentration: number;
  standard: number;
}

interface HMPICalculatorProps {
  onCalculate: (result: {
    hmpi: number;
    metals: HeavyMetal[];
    locationName: string;
    lat: number;
    lng: number;
  }) => void;
}

const COMMON_METALS = [
  { name: 'Lead (Pb)', standard: 0.01 }, { name: 'Arsenic (As)', standard: 0.01 },
  { name: 'Cadmium (Cd)', standard: 0.003 }, { name: 'Chromium (Cr)', standard: 0.05 },
  { name: 'Mercury (Hg)', standard: 0.001 }, { name: 'Nickel (Ni)', standard: 0.02 },
  { name: 'Copper (Cu)', standard: 2.0 }, { name: 'Zinc (Zn)', standard: 3.0 },
  { name: 'Uranium (U)', standard: 0.03 },
];

export function HMPICalculator({ onCalculate }: HMPICalculatorProps) {
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [metals, setMetals] = useState<HeavyMetal[]>([
    { id: '1', name: 'Lead (Pb)', concentration: 0, standard: 0.01 }
  ]);

  const addMetal = () => {
    setMetals([...metals, { id: Date.now().toString(), name: '', concentration: 0, standard: 1 }]);
  };

  const updateMetal = (id: string, field: keyof HeavyMetal, value: string | number) => {
    setMetals(metals.map(m => m.id === id ? { ...m, [field]: value } : m));
    
    // Auto-update standard if known metal selected
    if (field === 'name') {
        const found = COMMON_METALS.find(x => x.name === value);
        if (found) {
            setMetals(prev => prev.map(m => m.id === id ? { ...m, name: value as string, standard: found.standard } : m));
        }
    }
  };

  const removeMetal = (id: string) => {
    if(metals.length > 1) setMetals(metals.filter(m => m.id !== id));
  };

  const handleCalculate = async () => {
    const validMetals = metals.filter(m => m.name && m.concentration > 0 && m.standard > 0);
    if (!validMetals.length || !locationName || !lat || !lng) {
        alert("Please completely formulate the hypothetical parameters.");
        return;
    }

    try {
        const payload: Record<string, number> = { Latitude: parseFloat(lat), Longitude: parseFloat(lng) };
        validMetals.forEach(m => {
            const symbolMatch = m.name.match(/\(([^)]+)\)/);
            if(symbolMatch) payload[symbolMatch[1]] = m.concentration;
        });

        const response = await fetch('https://hmpi-groundwater-monitoring-system-live.onrender.com/api/engine/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        onCalculate({
            hmpi: result.calculated_hmpi,
            metals: validMetals,
            locationName,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        });

        setLocationName('');
        setLat(''); setLng('');
    } catch(e) {
        console.error("Calculation Engine Offline", e);
    }
  };

  return (
    <div className="bg-transparent p-4 sm:p-6 text-slate-200">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold bg-cyan-950/40 border border-cyan-500/20 p-3 rounded-xl text-cyan-300 shadow-inner">
        <Calculator className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        Diagnostic HMPI Terminal
      </h2>

      <div className="space-y-5">
        <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-cyan-100/60 mb-2">Testing Site Identifier</label>
            <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-slate-500" placeholder="e.g., Hypothetical Well Z" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-cyan-100/60 mb-2">Latitude</label>
                <input type="number" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500 transition-all" placeholder="12.9716" />
            </div>
            <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-cyan-100/60 mb-2">Longitude</label>
                <input type="number" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500 transition-all" placeholder="77.5946" />
            </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-300">Heavy Metal Sub-Matrix</h3>
                <button onClick={addMetal} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-950/30 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all hover:bg-cyan-900/50">
                    <Plus className="w-4 h-4" /> INJECT ELEMENT
                </button>
            </div>

            <div className="space-y-3">
                {metals.map((metal) => (
                    <div key={metal.id} className="flex gap-2 items-center bg-slate-900/40 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <select 
                            value={metal.name} 
                            onChange={(e) => updateMetal(metal.id, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-800/80 border border-white/10 rounded-lg text-sm text-cyan-100 focus:ring-cyan-500 outline-none"
                        >
                            <option value="" className="bg-slate-800 text-slate-400">Target Element...</option>
                            {COMMON_METALS.map(m => <option key={m.name} value={m.name} className="bg-slate-800">{m.name}</option>)}
                        </select>
                        <div className="w-24">
                            <input type="number" value={metal.concentration || ''} onChange={e => updateMetal(metal.id, 'concentration', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-slate-800/80 border border-white/10 rounded-lg text-sm text-white focus:ring-cyan-500 outline-none" placeholder="mg/L" step="0.001" />
                        </div>
                        <div className="w-20 hidden sm:block">
                            <input title="Standard Limit" type="number" value={metal.standard || ''} onChange={e => updateMetal(metal.id, 'standard', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-slate-900/80 border border-white/5 text-slate-500 rounded-lg text-sm cursor-not-allowed" placeholder="Std" step="0.001" readOnly />
                        </div>
                        <button onClick={() => removeMetal(metal.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <button onClick={handleCalculate} className="group relative mt-8 w-full bg-cyan-600/80 text-white font-extrabold tracking-widest uppercase py-4 rounded-xl hover:bg-cyan-500 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] border border-cyan-400/50 flex justify-center items-center gap-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Calculator className="w-5 h-5 text-cyan-200" /> COMPUTE NEURAL TRAJECTORY
            </button>
        </div>
      </div>
    </div>
  );
}
