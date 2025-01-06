import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { Court, mockCourts } from '@/app/data/courts';
import { Tournament, mockTournaments } from '@/app/data/tournaments';
import 'mapbox-gl/dist/mapbox-gl.css';
import { filterItems } from '@/app/utils/filtering';
import * as turf from '@turf/turf';

interface MapViewProps {
  mode: 'tournament' | 'play';
  location: string;
  mapCenter: { lng: number; lat: number };
  selectedCourt: Court | null;
  selectedTournament: Tournament | null;
  onCourtSelect: (court: Court | null) => void;
  onTournamentSelect: (tournament: Tournament | null) => void;
  sportFilter: string;
  searchRadius: number; // Add this prop
}

export default function MapView({ 
  mode,
  location, 
  selectedCourt,
  selectedTournament,
  onCourtSelect,
  onTournamentSelect,
  sportFilter, 
  mapCenter, 
  searchRadius
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [lng, setLng] = useState(mapCenter.lng);
  const [lat, setLat] = useState(mapCenter.lat);
  const [zoom, setZoom] = useState(13);
  const [mapLoaded, setMapLoaded] = useState(false);
  const radiusCircleRef = useRef<mapboxgl.Layer | null>(null);

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const getFilteredItems = () => {
    const items = mode === 'tournament' ? mockTournaments : mockCourts;
    return filterItems(items, mode, sportFilter, location, mapCenter, searchRadius);
    
  };
  
  // Update marker visibility
  const updateMarkerVisibility = () => {
    const filteredItems = getFilteredItems();
    const visibleIds = new Set(filteredItems.map(item => item.id));
  
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (visibleIds.has(id)) {
        marker.getElement().style.display = '';
      } else {
        marker.getElement().style.display = 'none';
      }
    });
  };

  // Create marker element based on mode
  const createMarkerElement = (item: Court | Tournament) => {
    const el = document.createElement('div');
    el.className = 'cursor-pointer';
    el.innerHTML = `
      <div class="relative group">
        <div class="w-8 h-8 bg-white rounded-full border-2 ${
          mode === 'tournament' 
            ? 'border-blue-500'
            : (item as Court).isOpen ? 'border-green-500' : 'border-red-500'
        } flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-110">
          ${mode === 'tournament' ? '🏆' : (item as Court).sport === 'tennis' ? '🎾' : '🏓'}
        </div>
      </div>
    `;
    return el;
  };

  // Create popup content based on mode
  const createPopup = (item: Court | Tournament) => {
    console.log('data', item)
    return new mapboxgl.Popup({
      offset: 25,
      closeButton: false
    }).setHTML(
      mode === 'tournament' 
        ? `
          <div class="p-2">
            <h3 class="font-bold text-black text-sm">${(item as Tournament).name}</h3>
            <p class="text-xs text-gray-800 mt-1">${(item as Tournament).address}</p>
            <p class="text-xs text-gray-800 mt-1">Level: ${(item as Tournament).level}</p>
            <p class="text-xs mt-1">Spots: ${(item as Tournament).spotsAvailable}/${(item as Tournament).totalSpots}</p>
            <p class="text-xs mt-1">Price: $${(item as Tournament).price}</p>            
          </div>
        `
        : `
          <div class="p-2">
            <h3 class="font-bold text-black text-sm">${(item as Court).name}</h3>
            <p class="text-xs text-gray-800 mt-1">${(item as Court).address}</p>
            <p class="text-xs text-gray-800 mt-1">${(item as Court).courtCount} courts • ${(item as Court).surface}</p>
            <p class="text-xs mt-2 ${(item as Court).isOpen ? 'text-green-600' : 'text-red-600'}">
              ${(item as Court).isOpen ? 'Open' : 'Closed'}
            </p>
          </div>
        `
    );
  };

  const updateRadiusCircle = () => {
    if (!map.current) return;
  
    // Remove existing circle if it exists
    if (map.current.getSource('radius-circle')) {
      map.current.removeLayer('radius-circle-fill');
      map.current.removeLayer('radius-circle-outline');
      map.current.removeSource('radius-circle');
    }
  
    // Convert radius from miles to kilometers (mapbox uses kilometers)
    const radiusInKm = searchRadius * 1.60934;
  
    // Create a circle feature
    const center: [number, number] = [mapCenter.lng, mapCenter.lat];
    const options = { steps: 64, units: 'kilometers' as const };
    const circle = turf.circle(center, radiusInKm, options);
  
    // Add the circle source and layers
    map.current.addSource('radius-circle', {
      type: 'geojson',
      data: circle
    });
  
    // Add fill layer
    map.current.addLayer({
      id: 'radius-circle-fill',
      type: 'fill',
      source: 'radius-circle',
      paint: {
        'fill-color': '#4dabf7',
        'fill-opacity': 0.15
      }
    });
  
    // Add outline layer
    map.current.addLayer({
      id: 'radius-circle-outline',
      type: 'line',
      source: 'radius-circle',
      paint: {
        'line-color': '#4dabf7',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    });
  };

  // Initialize markers
  const initializeMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    getFilteredItems().forEach(item => {
      const el = createMarkerElement(item);
      const popup = createPopup(item);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
        offset: [0, 0]
      })
        .setLngLat([item.location.lng, item.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        if (mode === 'tournament') {
          if (selectedTournament?.id === item.id) {
            onTournamentSelect(null);
            marker.togglePopup();
          } else {
            onTournamentSelect(item as Tournament);
          }
        } else {
          if (selectedCourt?.id === item.id) {
            onCourtSelect(null);
            marker.togglePopup();
          } else {
            onCourtSelect(item as Court);
          }
        }
      });

      markersRef.current[item.id] = marker;
    });
  };

  const add3DBuildings = (map: mapboxgl.Map) => {
    // Add custom 3D building layer
    map.addLayer({
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['get', 'height'],
          0, '#e6e6e6',
          50, '#d9d9d9',
          100, '#cccccc',
          200, '#bfbfbf',
          400, '#b3b3b3'
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6,
        'fill-extrusion-vertical-gradient': true
      }
    }, 'waterway-label');
  };

  // Map initialization and cleanup
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: zoom
    });

    newMap.on('style.load', () => {
      add3DBuildings(newMap);
      newMap.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true
      }));
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
        // Remove radius circle layers and source
        if (map.current.getSource('radius-circle')) {
          map.current.removeLayer('radius-circle-fill');
          map.current.removeLayer('radius-circle-outline');
          map.current.removeSource('radius-circle');
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when mode or filter changes
  useEffect(() => {
    if (mapLoaded) {
      initializeMarkers();
    }
  }, [mode, sportFilter, mapLoaded, searchRadius]);

  useEffect(() => {
    if (mapLoaded && map.current) {
      updateRadiusCircle();
    }
  }, [mapCenter, searchRadius, mapLoaded]);

  // Handle selected item changes
  useEffect(() => {
    if (!map.current) return;

    const selectedItem = mode === 'tournament' ? selectedTournament : selectedCourt;
    if (selectedItem) {
      map.current.flyTo({
        center: [selectedItem.location.lng, selectedItem.location.lat],
        zoom: 17,
        pitch: 60,
        bearing: 45,
        essential: true,
        duration: 2000,
        curve: 1.5,
      });
      markersRef.current[selectedItem.id]?.togglePopup();
    } else {
      map.current.flyTo({
        pitch: 0,
        bearing: 0,
        zoom: 13,
        duration: 1500,
      });
    }
  }, [selectedCourt, selectedTournament]);

  // Update map center
  useEffect(() => {
    if (map.current && mapCenter) {
      map.current.flyTo({
        center: [mapCenter.lng, mapCenter.lat],
        zoom: 12,
        essential: true
      });
    }
  }, [mapCenter]);

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