import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Custom hook to automatically fly to a selected location
function MapAutoFly({ selectedLocation }: { selectedLocation?: Location }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 8, { animate: true, duration: 1.5 });
    }
  }, [selectedLocation, map]);
  return null;
}

export function LocationMap({ locations, onLocationSelect, selectedLocationId }: LocationMapProps) {
  const getStatusColor = (hmpi: number) => {
    if (hmpi < 50) return '#22c55e'; // Green
    if (hmpi < 100) return '#eab308'; // Yellow
    if (hmpi < 200) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const selectedLoc = locations.find(l => l.id === selectedLocationId);
  const centerPosition: [number, number] = [20.5937, 78.9629]; // Default India Center

  return (
    <div className="w-full h-full relative" style={{ minHeight: '450px', zIndex: 0 }}>
      {/* Floating Glass Panel */}
      <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 border border-slate-200 shadow-lg rounded-xl flex items-center gap-3">
          <div className="flex -space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse border border-white shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
          </div>
          <span className="text-xs font-bold text-slate-700 tracking-wide">Live Aquifer Sync</span>
      </div>

      <MapContainer 
        center={centerPosition} 
        zoom={5} 
        style={{ height: '100%', width: '100%', minHeight: '450px' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapAutoFly selectedLocation={selectedLoc} />

        {locations.map((loc) => {
            const markerColor = getStatusColor(loc.hmpi);
            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            return (
                <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]} 
                    icon={customIcon}
                    eventHandlers={{ click: () => onLocationSelect(loc) }}
                >
                    <Popup className="saas-popup">
                        <div className="text-slate-800 font-sans min-w-[220px] p-1">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 uppercase text-[11px] tracking-wider flex justify-between items-center">
                                {loc.name}
                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px]">ID: {loc.id.substring(0,6)}</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] mb-4">
                                <div className="font-semibold text-slate-400 uppercase tracking-widest">Coordinates</div>
                                <div className="text-right font-mono text-slate-600 bg-slate-50 px-1 py-0.5 rounded">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-xl border border-slate-200/60 shadow-inner">
                                <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Toxicity Index</div>
                                <div className="text-2xl font-black tracking-tight" style={{ color: markerColor }}>
                                    {loc.hmpi.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            );
        })}
      </MapContainer>
    </div>
  );
}
