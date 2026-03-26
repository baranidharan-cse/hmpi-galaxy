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

  const handleCalculate = () => {
    const validMetals = metals.filter(m => m.name && m.concentration > 0 && m.standard > 0);
    if (!validMetals.length || !locationName || !lat || !lng) {
        alert("Please completely formulate the hypothetical parameters.");
        return;
    }

    const subIndices = validMetals.map(m => (m.concentration / m.standard) * 100);
    const hmpi = subIndices.reduce((sum, si) => sum + si, 0) / validMetals.length;

    onCalculate({
      hmpi,
      metals: validMetals,
      locationName,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    });

    setLocationName('');
    setLat(''); setLng('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold bg-blue-50 p-3 rounded-lg text-blue-800">
        <Calculator className="w-5 h-5 text-blue-600" />
        Manual HMPI Calculator Simulator
      </h2>

      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Testing Site Identifier</label>
            <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Hypothetical Well Z" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                <input type="number" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="12.9716" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                <input type="number" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="77.5946" />
            </div>
        </div>

        <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800">Heavy Metal Contaminants Matrix</h3>
                <button onClick={addMetal} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">
                    <Plus className="w-4 h-4" /> Add Element
                </button>
            </div>

            <div className="space-y-3">
                {metals.map((metal) => (
                    <div key={metal.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <select 
                            value={metal.name} 
                            onChange={(e) => updateMetal(metal.id, 'name', e.target.value)}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                        >
                            <option value="">Select Target...</option>
                            {COMMON_METALS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </select>
                        <div className="w-24">
                            <input type="number" value={metal.concentration || ''} onChange={e => updateMetal(metal.id, 'concentration', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-slate-300 rounded text-sm" placeholder="mg/L" step="0.001" />
                        </div>
                        <div className="w-20">
                            <input title="Standard Limit" type="number" value={metal.standard || ''} onChange={e => updateMetal(metal.id, 'standard', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-slate-300 rounded text-sm bg-slate-100" placeholder="Std" step="0.001" />
                        </div>
                        <button onClick={() => removeMetal(metal.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <button onClick={handleCalculate} className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2">
                <Calculator className="w-5 h-5" /> Calculate Analytical HMPI
            </button>
        </div>
      </div>
    </div>
  );
}
