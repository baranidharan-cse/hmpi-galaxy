import { MapPin } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  hmpi: number;
  heavyMetals: string[];
}

interface LocationMapProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  selectedLocationId?: string;
}

export function LocationMap({ locations, onLocationSelect, selectedLocationId }: LocationMapProps) {
  const getStatusColor = (hmpi: number) => {
    if (hmpi < 50) return 'bg-green-500';
    if (hmpi < 100) return 'bg-yellow-500';
    if (hmpi < 200) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusText = (hmpi: number) => {
    if (hmpi < 50) return 'Low Pollution';
    if (hmpi < 100) return 'Moderate';
    if (hmpi < 200) return 'High Pollution';
    return 'Critical';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <MapPin className="w-5 h-5 text-blue-600" />
        Groundwater Monitor Node Map
      </h2>
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg overflow-y-auto min-h-[400px]">
         <div className="p-4 grid gap-3 grid-cols-1 md:grid-cols-2">
            {locations.map((loc) => {
                const colorClass = getStatusColor(loc.hmpi);
                return (
                    <button 
                        key={loc.id} 
                        onClick={() => onLocationSelect(loc)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${selectedLocationId === loc.id ? 'border-blue-500 shadow-md transform scale-[1.02]' : 'border-transparent shadow hover:shadow-md'} bg-white`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-4 h-4 rounded-full ${colorClass} shadow-sm border border-white`} />
                            <h3 className="font-bold text-slate-800 flex-1">{loc.name}</h3>
                        </div>
                        <div className="text-sm text-slate-500 mb-1">Coordinates: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</div>
                        <div className="flex items-center justify-between mt-2">
                           <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md">HMPI: {loc.hmpi.toFixed(1)}</span>
                           <span className={`text-xs font-bold ${colorClass.replace('bg-', 'text-')}`}>{getStatusText(loc.hmpi)}</span>
                        </div>
                    </button>
                )
            })}
         </div>
      </div>
    </div>
  );
}
