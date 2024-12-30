import React from 'react';
import { Slider } from '@/components/ui/slider';
import { MapIcon } from 'lucide-react';

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d * 0.621371; // Convert to miles
}

interface RadiusSelectorProps {
  currentLocation: { lat: number; lng: number };
  radius: number;
  onRadiusChange: (radius: number) => void;
  mode: 'tournament' | 'play';
}

const RadiusSelector = ({ currentLocation, radius, onRadiusChange, mode }: RadiusSelectorProps) => {
  const handleRadiusChange = (value: number[]) => {
    onRadiusChange(value[0]);
  };

  return (
    <div className="mb-6 px-2">
      <div className="flex items-center mb-3">
        <MapIcon className="h-5 w-5 text-gray-800 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Search Radius</h2>
      </div>
      <div className="space-y-4">
        <Slider
          defaultValue={[radius]}
          max={50}
          min={1}
          step={1}
          onValueChange={handleRadiusChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{radius} miles radius</span>
          <span>{mode === 'tournament' ? 
            `Finding tournaments within ${radius} miles` : 
            `Finding courts within ${radius} miles`}
          </span>
        </div>
      </div>
    </div>
  );
};

// Export the distance calculation function to be used in filtering
export { calculateDistance };
export default RadiusSelector;