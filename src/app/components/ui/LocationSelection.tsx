import { useState, useEffect } from 'react';
import { ArrowLeft, Navigation2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationSearch from '../location-search';

interface LocationStepProps {
  onBack: () => void;
  onLocationSelect: (location: string, lng: number, lat: number) => void;
  mode: 'tournament' | 'play';
}

export default function LocationStep({ onBack, onLocationSelect, mode }: LocationStepProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        // Use reverse geocoding to get location name
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
          .then(res => res.json())
          .then(data => {
            const locationName = data.features[0].place_name;
            onLocationSelect(locationName, longitude, latitude);
            console.log('my location', locationName)
          })
          .finally(() => setIsLoadingLocation(false));
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <div className="h-full flex flex-col p-6 bg-white">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === 'tournament' ? 'Find Tournaments Near You' : 'Find Courts Near You'}
      </h1>

      <div className="space-y-6">
        <button
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="w-full p-4 bg-blue-50 text-black hover:bg-blue-100 rounded-lg border-2 border-blue-200 
                   flex items-center justify-center transition-colors duration-200"
        >
          {isLoadingLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          ) : (
            <>
              <Navigation2 className="h-5 w-5 text-black mr-2" />
              Use Current Location
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
            <div className="border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-sm text-gray-500">or</span>
          </div>
        </div>

        <div>
          <LocationSearch 
            onSearch={(location) => {}}
            onLocationSelect={(lng: any, lat: any, locationName : any) => onLocationSelect(locationName, lng, lat)}
          />
          <p className="text-sm text-gray-500 mt-2">
            Search for a city, state, or specific location
          </p>
        </div>
      </div>
    </div>
  );
}