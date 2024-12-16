'use client';

import { motion } from 'framer-motion';
import { useState, Suspense } from 'react';
import MapView from './components/ui/map-view';
import Sidebar from './components/ui/sidebar';
import { Court } from './data/courts';

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
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [sportFilter, setSportFilter] = useState('all');

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen overflow-hidden"
    >
      <Sidebar 
        selectedCourt={selectedCourt}
        onSearch={setSearchLocation}
        onFilterChange={setSportFilter}
        sportFilter={sportFilter}
        onCourtSelect={setSelectedCourt}
      />
      <Suspense fallback={<LoadingFallback />}>
        <MapView 
          location={searchLocation}
          onCourtSelect={setSelectedCourt}
          selectedCourt={selectedCourt}
          sportFilter={sportFilter}
        />
      </Suspense>
    </motion.main>
  );
}