import { motion } from 'framer-motion';
import { Filter, MapPin, ArrowLeft, Navigation2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Court, mockCourts } from '@/app/data/courts';
import { Tournament, mockTournaments } from '@/app/data/tournaments';
import TournamentList from './TournamentList';
import CourtList from './CourtList';
import LocationSearch from '../location-search';
import RadiusSelector from './RadiusSelector';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { filterItems } from '@/app/utils/filtering';

interface SidebarProps {
  mode: 'tournament' | 'play';
  onModeSwitch: () => void;
  selectedCourt: Court | null;
  selectedTournament: Tournament | null;
  onSearch: (location: string) => void;
  onLocationSelect: (lng: number, lat: number) => void;
  onFilterChange: (filter: string) => void;
  sportFilter: string;
  onCourtSelect: (court: Court | null) => void;
  onTournamentSelect: (tournament: Tournament | null) => void;
  searchLocation: string;
  onBack: () => void;
  mapCenter: { lat: number; lng: number };
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
}

export default function Sidebar({
  mode,
  onModeSwitch,
  selectedCourt,
  selectedTournament,
  onSearch,
  onLocationSelect,
  onFilterChange,
  sportFilter,
  onCourtSelect,
  onTournamentSelect,
  searchLocation,
  onBack,
  mapCenter,
  searchRadius,
  onRadiusChange
}: SidebarProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Use reverse geocoding to get location name
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
          .then(res => res.json())
          .then(data => {
            const locationName = data.features[0].place_name;
            onSearch(locationName);
            onLocationSelect(longitude, latitude);
          })
          .finally(() => setIsLoadingLocation(false));
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
      }
    );
  };

  // Get filtered items based on current filters and location
  const filteredItems = mode === 'tournament' 
    ? filterItems(mockTournaments, mode, sportFilter, searchLocation, mapCenter, searchRadius)
    : filterItems(mockCourts, mode, sportFilter, searchLocation, mapCenter, searchRadius);

  return (
    <motion.div 
      className="w-96 bg-white shadow-lg p-6 overflow-y-auto"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <button
          onClick={onModeSwitch}
          className="flex items-center border p-2 border-blue-400 rounded-md text-blue-600 hover:text-blue-800"
        >
          {mode === 'tournament' ? 'Switch to Play' : 'Find Tournaments'}
        </button>
      </div>

      <Collapsible defaultOpen className="space-y-4 mb-6" open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center w-full text-left">
          <div className="flex items-center flex-1">
              <MapPin className="h-5 w-5 mr-2 text-gray-600" />
              <div className="text-lg">Location</div>
            </div>
            <ChevronDown 
              className={`h-5 w-5 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full p-3 bg-blue-50 text-black hover:bg-blue-100 rounded-lg border-2 border-blue-200 
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
          
          <LocationSearch 
            onSearch={onSearch}
            onLocationSelect={(lng, lat, locationName) => {
              onLocationSelect(lng, lat);
              onSearch(locationName || '');
            }}
          />
          
          <RadiusSelector
            currentLocation={mapCenter}
            radius={searchRadius}
            onRadiusChange={onRadiusChange}
            mode={mode}
          />
        </CollapsibleContent>
      </Collapsible>
      <hr  className='mb-6'/>

      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Filter className="h-5 text-gray-800 w-5 mr-2" />
          <h2 className="text-lg text-gray-800 font-semibold">Sport</h2>
        </div>
        <select
          className="w-full p-2 border text-gray-600 border-gray-800 rounded-lg"
          value={sportFilter}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">All Sports</option>
          <option value="tennis">Tennis Only</option>
          <option value="pickleball">Pickleball Only</option>
        </select>
      </div>
      <hr  className='mb-6'/>


      <h2 className="text-xl font-bold mb-4">
        {mode === 'tournament' ? 'Tournaments' : 'Courts'} Near You
      </h2>

      {mode === 'tournament' ? (
        <TournamentList
          tournaments={filteredItems as Tournament[]}
          selectedTournament={selectedTournament}
          onTournamentSelect={onTournamentSelect}
        />
      ) : (
        <CourtList
          courts={filteredItems as Court[]}
          selectedCourt={selectedCourt}
          onCourtSelect={onCourtSelect}
        />
      )}
    </motion.div>
  );
}