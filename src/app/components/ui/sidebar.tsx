import { motion } from 'framer-motion';
import { Filter, MapPin, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Court, mockCourts } from '../../data/courts';
import LocationSearch from '../location-search';

interface SidebarProps {
  selectedCourt: Court | null;
  onSearch: (location: string) => void;
  onLocationSelect: (lng: number, lat: number) => void;
  onFilterChange: (filter: string) => void;
  sportFilter: string;
  onCourtSelect: (court: Court) => void;
}

export default function Sidebar({ 
  selectedCourt, 
  onSearch, 
  onLocationSelect,
  onFilterChange, 
  sportFilter,
  onCourtSelect 
}: SidebarProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Filter courts based on sport and location
  const filteredCourts = mockCourts.filter(court => {
    const matchesSport = sportFilter === 'all' ? true : court.sport === sportFilter || court.sport === 'both';
    const matchesLocation = !selectedLocation || 
      court.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      court.state.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSport && matchesLocation;
  });

  const handleLocationSelect = (searchText: string, lng: number, lat: number) => {
    setSelectedLocation(searchText);
    onSearch(searchText);
    onLocationSelect(lng, lat);
  };

  const handleCourtClick = (court: Court) => {
    onCourtSelect(court);
  };

  return (
    <motion.div 
      className="w-96 bg-white shadow-lg p-6 overflow-y-auto"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl text-black font-bold mb-6">Find Courts</h1>
      
      <div className="mb-6">
        <LocationSearch 
          onSearch={onSearch}
          onLocationSelect={(lng, lat) => handleLocationSelect(selectedLocation, lng, lat)}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Filter className="h-5 text-gray-800 w-5 mr-2" />
          <h2 className="text-lg text-gray-800 font-semibold">Filters</h2>
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

      <div className="space-y-4">
        {filteredCourts.length === 0 ? (
          <p className="text-center text-gray-600">No courts found in this area</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Showing {filteredCourts.length} {sportFilter === 'all' ? 'courts' : `${sportFilter} courts`}
              {selectedLocation ? ` in ${selectedLocation}` : ''}
            </p>
            {filteredCourts.map(court => (
              <div 
                key={court.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedCourt?.id === court.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleCourtClick(court)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{court.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    court.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {court.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {court.address}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{court.courtCount} courts • {court.surface}</span>
                  <span>{court.lighting ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}