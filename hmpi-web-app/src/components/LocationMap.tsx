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
    <div className="w-full h-full relative" style={{ minHeight: '400px', zIndex: 0 }}>
      <MapContainer 
        center={centerPosition} 
        zoom={4} 
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapAutoFly selectedLocation={selectedLoc} />

        {locations.map((loc) => {
            const markerColor = getStatusColor(loc.hmpi);
            // Create a custom colored circle marker for government styling
            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${markerColor}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
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
                    <Popup className="gov-popup">
                        <div className="text-slate-800 font-sans min-w-[200px]">
                            <h3 className="font-extrabold text-[#003366] border-b-2 border-slate-200 pb-1 mb-2 uppercase text-xs tracking-wider">
                                {loc.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                <div className="font-bold text-slate-500">Latitude:</div>
                                <div className="text-right font-mono">{loc.lat.toFixed(4)}</div>
                                <div className="font-bold text-slate-500">Longitude:</div>
                                <div className="text-right font-mono">{loc.lng.toFixed(4)}</div>
                            </div>
                            <div className="bg-slate-100 p-2 rounded-sm border border-slate-200 mt-3">
                                <div className="text-xs font-bold text-slate-600 mb-1">Toxicity Metric (HMPI)</div>
                                <div className="text-lg font-black" style={{ color: markerColor }}>
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
