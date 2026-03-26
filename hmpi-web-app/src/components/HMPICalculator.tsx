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
    <div className="bg-white p-2 text-slate-800">
      <div className="space-y-5">
        <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-[#003366] mb-1">Testing Site Identifier</label>
            <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-sm focus:outline-none focus:border-[#003366] text-slate-800 placeholder-slate-400" placeholder="e.g., Regional Monitor A2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[#003366] mb-1">Latitude</label>
                <input type="number" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-sm focus:outline-none focus:border-[#003366] text-slate-800 placeholder-slate-400" placeholder="12.9716" />
            </div>
            <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[#003366] mb-1">Longitude</label>
                <input type="number" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-sm focus:outline-none focus:border-[#003366] text-slate-800 placeholder-slate-400" placeholder="77.5946" />
            </div>
        </div>

        <div className="mt-4 border-t-2 border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#003366] text-sm uppercase">Heavy Metal Sub-Matrix</h3>
                <button onClick={addMetal} className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-bold bg-green-50 border border-green-200 px-2 py-1 rounded-sm transition-colors">
                    <Plus className="w-4 h-4" /> ADD ENTRY
                </button>
            </div>

            <div className="space-y-2">
                {metals.map((metal) => (
                    <div key={metal.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-sm border border-slate-200">
                        <select 
                            value={metal.name} 
                            onChange={(e) => updateMetal(metal.id, 'name', e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-sm text-sm text-slate-800 focus:border-[#003366] outline-none font-medium"
                        >
                            <option value="">Select Target...</option>
                            {COMMON_METALS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </select>
                        <div className="w-24">
                            <input type="number" value={metal.concentration || ''} onChange={e => updateMetal(metal.id, 'concentration', parseFloat(e.target.value))} className="w-full px-2 py-1 bg-white border border-slate-300 rounded-sm text-sm text-slate-800 focus:border-[#003366] outline-none" placeholder="mg/L" step="0.001" />
                        </div>
                        <div className="w-20 hidden sm:block">
                            <input title="Standard Limit" type="number" value={metal.standard || ''} onChange={e => updateMetal(metal.id, 'standard', parseFloat(e.target.value))} className="w-full px-2 py-1 bg-slate-100 border border-slate-300 text-slate-500 rounded-sm text-sm cursor-not-allowed font-bold" placeholder="Std" step="0.001" readOnly />
                        </div>
                        <button onClick={() => removeMetal(metal.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-sm transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <button onClick={handleCalculate} className="mt-6 w-full bg-[#003366] text-white font-bold tracking-widest uppercase py-3 rounded-sm hover:bg-blue-900 transition-colors shadow-sm border border-blue-950 flex justify-center items-center gap-2">
                <Calculator className="w-4 h-4" /> COMPUTE DIAGNOSTICS
            </button>
        </div>
      </div>
    </div>
  );
}
