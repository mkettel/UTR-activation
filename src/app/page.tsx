'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, Suspense } from 'react';
import MapView from './components/ui/map-view';
import Sidebar from './components/ui/sidebar';
import { Court } from './data/courts';
import { Tournament } from './data/tournaments';
import LandingChoice from './components/ui/LandingChoice';
import LocationStep from './components/ui/LocationSelection';

type Step = 'landing' | 'location' | 'main';
type Mode = 'tournament' | 'play';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  );
}

export default function Home() {
  // Flow control
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [mode, setMode] = useState<Mode>('tournament');

  // Data state
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [mapCenter, setMapCenter] = useState({ lng: -73.935242, lat: 40.730610 });
  const [searchRadius, setSearchRadius] = useState(4); // Default 10 mile radius

  const handlePathSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    setCurrentStep('location');
  };

  const handleLocationSelect = (location: string, lng: number, lat: number) => {
    setSearchLocation(location);
    setMapCenter({ lng, lat });
    setCurrentStep('main');
  };

  const handleBack = () => {
    if (currentStep === 'location') {
      setCurrentStep('landing');
    } else if (currentStep === 'main') {
      setCurrentStep('location');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <div className='flex'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-w-96"
            >
              <LandingChoice onPathSelect={handlePathSelect} />
            </motion.div>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            exit={{ opacity: 0 }}
            >
              <img className='w-full h-full' src="pickle-bg.webp" alt="" />
            </motion.div>
          </div>
        );
      case 'location':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-96"
          >
            <LocationStep 
              onBack={handleBack}
              onLocationSelect={handleLocationSelect}
              mode={mode}
            />
          </motion.div>
        );
      case 'main':
        return (
          <>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-96 overflow-scroll"
            >
              <Sidebar 
                mode={mode}
                onModeSwitch={() => {
                  setMode(mode === 'tournament' ? 'play' : 'tournament');
                  setSelectedCourt(null);
                  setSelectedTournament(null);
                }}
                selectedCourt={selectedCourt}
                selectedTournament={selectedTournament}
                onSearch={setSearchLocation}
                onLocationSelect={(lng, lat) => setMapCenter({ lng, lat })}
                onFilterChange={setSportFilter}
                sportFilter={sportFilter}
                onCourtSelect={setSelectedCourt}
                onTournamentSelect={setSelectedTournament}
                searchLocation={searchLocation}
                onBack={handleBack}
                mapCenter={mapCenter}
                searchRadius={searchRadius}
                onRadiusChange={setSearchRadius}
              />
            </motion.div>
            <Suspense fallback={<LoadingFallback />}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1"
              >
                <MapView 
                  mode={mode}
                  location={searchLocation}
                  mapCenter={mapCenter}
                  onCourtSelect={setSelectedCourt}
                  onTournamentSelect={setSelectedTournament}
                  selectedCourt={selectedCourt}
                  selectedTournament={selectedTournament}
                  sportFilter={sportFilter}
                  searchRadius={searchRadius}
                />
              </motion.div>
            </Suspense>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}