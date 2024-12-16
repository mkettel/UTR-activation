import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { Court, mockCourts } from '../../data/courts';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  location: string;
  selectedCourt: Court | null;
  onCourtSelect: (court: Court) => void;
  sportFilter: string;
}

export default function MapView({ location, selectedCourt, onCourtSelect, sportFilter }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [lng, setLng] = useState(-73.935242);
  const [lat, setLat] = useState(40.730610);
  const [zoom, setZoom] = useState(13);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Set your Mapbox token
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  // Filter courts based on sport
  const getFilteredCourts = () => {
    if (sportFilter === 'all') return mockCourts;
    return mockCourts.filter(court => 
      court.sport === sportFilter || court.sport === 'both'
    );
  };

  // Create marker element
  const createMarkerElement = (court: Court) => {
    const el = document.createElement('div');
    el.className = 'cursor-pointer';
    el.innerHTML = `
      <div class="relative group">
        <div class="w-8 h-8 bg-white rounded-full border-2 ${
          court.isOpen ? 'border-green-500' : 'border-red-500'
        } flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-110">
          ${court.sport === 'tennis' ? '🎾' : court.sport === 'pickleball' ? '🏓' : '🎾/🏓'}
        </div>
      </div>
    `;
    return el;
  };

  // Create popup for marker
  const createPopup = (court: Court) => {
    return new mapboxgl.Popup({
      offset: 25,
      closeButton: false
    }).setHTML(`
      <div class="p-2">
        <h3 class="font-bold text-black text-sm">${court.name}</h3>
        <p class="text-xs text-gray-800 mt-1">${court.address}</p>
        <p class="text-xs text-gray-800 mt-1">${court.courtCount} courts • ${court.surface}</p>
        <p class="text-xs mt-2 ${court.isOpen ? 'text-green-600' : 'text-red-600'}">
          ${court.isOpen ? 'Open' : 'Closed'}
        </p>
      </div>
    `);
  };

  // Initialize markers
  const initializeMarkers = () => {
    if (!map.current) return;

    getFilteredCourts().forEach(court => {
      if (markersRef.current[court.id]) return; // Skip if marker already exists

      const el = createMarkerElement(court);
      const popup = createPopup(court);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
        offset: [0, 0]
      })
        .setLngLat([court.location.lng, court.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onCourtSelect(court);
      });

      markersRef.current[court.id] = marker;
    });
  };

  // Update marker visibility
  const updateMarkerVisibility = () => {
    const filteredCourts = getFilteredCourts();
    const visibleCourtIds = new Set(filteredCourts.map(court => court.id));

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (visibleCourtIds.has(id)) {
        marker.getElement().style.display = '';
      } else {
        marker.getElement().style.display = 'none';
      }
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    newMap.on('move', () => {
      setLng(Number(newMap.getCenter().lng.toFixed(4)));
      setLat(Number(newMap.getCenter().lat.toFixed(4)));
      setZoom(Number(newMap.getZoom().toFixed(2)));
    });

    newMap.on('load', () => {
      setMapLoaded(true);
      initializeMarkers();
    });

    map.current = newMap;

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker visibility when filter changes
  useEffect(() => {
    if (mapLoaded) {
      updateMarkerVisibility();
    }
  }, [sportFilter, mapLoaded]);

  // Update map center when location search changes
  useEffect(() => {
    if (location && map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true
      });
    }
  }, [location]);

  // Handle selected court
  useEffect(() => {
    if (selectedCourt && map.current) {
      const marker = markersRef.current[selectedCourt.id];
      if (marker) {
        map.current.flyTo({
          center: [selectedCourt.location.lng, selectedCourt.location.lat],
          zoom: 15,
          essential: true
        });
        marker.togglePopup();
      }
    }
  }, [selectedCourt]);

  return (
    <motion.div 
      className="flex-1 h-full relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="absolute h-full inset-0" ref={mapContainer} />
      {mapLoaded && (
        <div className="absolute top-0 text-blue-700 backdrop-blur-md left-0 m-4 bg-white bg-opacity-30 p-2 rounded">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      )}
    </motion.div>
  );
}