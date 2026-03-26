import { useState } from 'react';
import { LocationMap } from './components/LocationMap';
import { HMPICalculator } from './components/HMPICalculator';
import { LocationDetails } from './components/LocationDetails';
import { Statistics } from './components/Statistics';
import { Droplets } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  hmpi: number;
  heavyMetals: string[];
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Industrial Zone A',
      lat: 28.6139,
      lng: 77.2090,
      hmpi: 245.5,
      heavyMetals: ['Lead (Pb)', 'Arsenic (As)', 'Cadmium (Cd)', 'Chromium (Cr)'],
    },
    {
      id: '2',
      name: 'Agricultural Site B',
      lat: 19.0760,
      lng: 72.8777,
      hmpi: 78.3,
      heavyMetals: ['Copper (Cu)', 'Zinc (Zn)', 'Nickel (Ni)'],
    },
    {
      id: '3',
      name: 'Residential Well C',
      lat: 13.0827,
      lng: 80.2707,
      hmpi: 42.1,
      heavyMetals: ['Lead (Pb)', 'Copper (Cu)'],
    },
    {
      id: '4',
      name: 'Mining Area D',
      lat: 22.5726,
      lng: 88.3639,
      hmpi: 189.7,
      heavyMetals: ['Mercury (Hg)', 'Arsenic (As)', 'Lead (Pb)', 'Cadmium (Cd)'],
    },
  ]);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleCalculate = (result: {
    hmpi: number;
    metals: { name: string; concentration: number; standard: number }[];
    locationName: string;
    lat: number;
    lng: number;
  }) => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name: result.locationName,
      lat: result.lat,
      lng: result.lng,
      hmpi: result.hmpi,
      heavyMetals: result.metals.map((m) => m.name),
    };

    setLocations([...locations, newLocation]);
    setSelectedLocation(newLocation);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Heavy Metal Pollution Index Monitor</h1>
              <p className="text-blue-100 text-sm">
                Groundwater Quality Assessment System
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <LocationMap
              locations={locations}
              onLocationSelect={setSelectedLocation}
              selectedLocationId={selectedLocation?.id}
            />
          </div>
          <div>
            <LocationDetails location={selectedLocation} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Statistics locations={locations} />
          </div>
          <div>
            <HMPICalculator onCalculate={handleCalculate} />
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm">
          <p>
            Heavy Metal Pollution Index (HMPI) is calculated based on WHO/EPA standards for
            groundwater quality assessment
          </p>
        </div>
      </footer>
    </div>
  );
}
