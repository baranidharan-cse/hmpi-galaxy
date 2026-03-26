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

        const response = await fetch('https://hmpi-galaxy.onrender.com/api/engine/calculate', {
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
    <div className="bg-white p-2 text-slate-800 font-sans">
      <div className="space-y-6">
        <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1.5 flex items-center gap-2">
               Testing Site Identifier
            </label>
            <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-slate-800 placeholder-slate-400 transition-all font-medium text-sm" placeholder="e.g., Regional Monitor A2" />
        </div>
        
        <div className="grid grid-cols-2 gap-5">
            <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1.5">Latitude</label>
                <input type="number" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-slate-800 placeholder-slate-400 transition-all text-sm font-mono" placeholder="12.9716" />
            </div>
            <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1.5">Longitude</label>
                <input type="number" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-slate-800 placeholder-slate-400 transition-all text-sm font-mono" placeholder="77.5946" />
            </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">Heavy Metal Sub-Matrix</h3>
                <button onClick={addMetal} className="flex items-center gap-1.5 text-[11px] text-teal-700 hover:text-white hover:bg-teal-600 font-bold bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> ADD ENTRY
                </button>
            </div>

            <div className="space-y-3">
                {metals.map((metal) => (
                    <div key={metal.id} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-400 transition-all">
                        <select 
                            value={metal.name} 
                            onChange={(e) => updateMetal(metal.id, 'name', e.target.value)}
                            className="flex-1 bg-transparent text-sm text-slate-700 outline-none font-semibold cursor-pointer appearance-none"
                        >
                            <option value="" disabled className="text-slate-400">Select Parameter...</option>
                            {COMMON_METALS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </select>
                        <div className="w-24">
                            <input type="number" value={metal.concentration || ''} onChange={e => updateMetal(metal.id, 'concentration', parseFloat(e.target.value))} className="w-full bg-slate-50 px-3 py-1.5 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none border border-slate-100 font-mono focus:border-teal-300 transition-colors" placeholder="mg/L" step="0.001" />
                        </div>
                        <div className="w-16 hidden sm:block">
                            <input title="Standard Limit" type="number" value={metal.standard || ''} onChange={e => updateMetal(metal.id, 'standard', parseFloat(e.target.value))} className="w-full bg-transparent text-slate-400 text-xs cursor-not-allowed font-bold text-center outline-none" placeholder="Std" step="0.001" readOnly />
                        </div>
                        <button onClick={() => removeMetal(metal.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <button onClick={handleCalculate} className="mt-8 w-full bg-teal-600 text-white font-bold tracking-widest uppercase py-3.5 rounded-xl hover:bg-teal-500 transition-all shadow-lg hover:shadow-teal-500/30 flex justify-center items-center gap-2 text-sm">
                <Calculator className="w-4 h-4" /> COMPUTE QA/QC DIAGNOSTICS
            </button>
        </div>
      </div>
    </div>
  );
}
