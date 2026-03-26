import { AlertTriangle, Droplet, TrendingUp } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  hmpi: number;
  heavyMetals: string[];
}

interface LocationDetailsProps {
  location: Location | null;
}

export function LocationDetails({ location }: LocationDetailsProps) {
  if (!location) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center h-64">
        <p className="text-slate-400">Select a location to view details</p>
      </div>
    );
  }

  const getStatusInfo = (hmpi: number) => {
    if (hmpi < 50) {
      return {
        status: 'Low Pollution', color: 'text-green-600', bg: 'bg-green-50',
        description: 'Groundwater quality is within acceptable limits.',
        recommendation: 'Continue regular monitoring.',
      };
    }
    if (hmpi < 100) {
      return {
        status: 'Moderate Pollution', color: 'text-yellow-600', bg: 'bg-yellow-50',
        description: 'Groundwater shows moderate contamination levels.',
        recommendation: 'Increase monitoring frequency and consider remediation measures.',
      };
    }
    if (hmpi < 200) {
      return {
        status: 'High Pollution', color: 'text-orange-600', bg: 'bg-orange-50',
        description: 'Groundwater is significantly contaminated.',
        recommendation: 'Immediate remediation required. Not suitable for consumption.',
      };
    }
    return {
      status: 'Critical Pollution', color: 'text-red-600', bg: 'bg-red-50',
      description: 'Groundwater is severely contaminated with heavy metals.',
      recommendation: 'Urgent intervention required. Site should be closed for use.',
    };
  };

  const statusInfo = getStatusInfo(location.hmpi);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold">{location.name}</h2>
          <p className="text-sm text-slate-500">
            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        </div>
        {location.hmpi >= 200 && (
          <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
        )}
      </div>

      <div className={`${statusInfo.bg} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold ${statusInfo.color}`}>
            {statusInfo.status}
          </span>
          <span className={`text-3xl font-black ${statusInfo.color}`}>
            {location.hmpi.toFixed(1)}
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className={`h-full ${
              location.hmpi < 50 ? 'bg-green-500' : location.hmpi < 100 ? 'bg-yellow-500' : location.hmpi < 200 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, (location.hmpi / 300) * 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold">Detected Heavy Metals</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {location.heavyMetals.map((metal) => (
              <div
                key={metal}
                className="px-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 font-medium"
              >
                {metal}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 mt-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold">Assessment</h3>
          </div>
          <p className="text-sm text-slate-700 mb-2">{statusInfo.description}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Recommendation:</strong> {statusInfo.recommendation}
            </p>
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <h3 className="mb-2 font-bold text-slate-800">HMPI Interpretation Matrix</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p>• HMPI &lt; 50: Low pollution level</p>
            <p>• HMPI 50-100: Moderate pollution</p>
            <p>• HMPI 100-200: High pollution</p>
            <p>• HMPI &gt; 200: Critical pollution (BIS IS 10500)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
