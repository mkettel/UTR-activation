import { motion } from 'framer-motion';
import { Filter, MapPin, Sun, Moon, ArrowLeft, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Court, mockCourts } from '@/app/data/courts';
import { Tournament, mockTournaments } from '@/app/data/tournaments';
import TournamentList from './TournamentList';
import CourtList from './CourtList';
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
  onBack
}: SidebarProps) {
  const extractLocationParts = (location: string) => {
    // Convert to lowercase for case-insensitive matching
    const lowercaseLocation = location.toLowerCase();
    
    // Common US state abbreviations and full names that might appear in the address
    const stateMatches = lowercaseLocation.match(/\b(ny|new york|nj|new jersey)\b/);
    const cityMatches = lowercaseLocation.match(/\b(new york|brooklyn|queens|hoboken)\b/);
    
    return {
      state: stateMatches ? stateMatches[0] : '',
      city: cityMatches ? cityMatches[0] : ''
    };
  };
  
  const filteredItems = mode === 'tournament' 
  ? filterItems(mockTournaments, mode, sportFilter, searchLocation)
  : filterItems(mockCourts, mode, sportFilter, searchLocation);

  // Add debug logging
  console.log('Filtered items:', filteredItems);
  console.log('Search location:', searchLocation);
  console.log('Sport filter:', sportFilter);
  console.log('Mode:', mode);


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
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          {mode === 'tournament' ? 'Switch to Play' : 'Find Tournaments'}
        </button>
      </div>

      <h1 className="text-2xl text-black font-bold mb-6">
        {mode === 'tournament' ? 'Tournaments Near You' : 'Available Courts'}
      </h1>

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