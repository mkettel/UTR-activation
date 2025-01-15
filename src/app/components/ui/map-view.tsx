import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { Court, mockCourts } from '@/app/data/courts';
import { Tournament, mockTournaments } from '@/app/data/tournaments';
import 'mapbox-gl/dist/mapbox-gl.css';
import { filterItems } from '@/app/utils/filtering';
import * as turf from '@turf/turf';
import TournamentPopup from './TournamentPopup';
import * as ReactDOMServer from 'react-dom/server';
import CourtPopup from './CourtPopup';
import { TournamentLayer } from '../3d/TournamentLayer';

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
  const tournamentLayerRef = useRef<any>(null);
  

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    // This gets the filtered items
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
    if (mode === 'tournament') {
      return new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        maxWidth: '320px'
      }).setHTML(
        ReactDOMServer.renderToString(
          <TournamentPopup tournament={item as Tournament} />
        )
      );
    } else {
      return new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        maxWidth: '320px'
      }).setHTML(
        ReactDOMServer.renderToString(
          <CourtPopup court={item as Court} />
        )
      );
    }
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

    // Only create markers for courts, tournaments will use 3D models
    if (mode === 'play') {
      getFilteredItems().forEach(item => {
        const el = createMarkerElement(item as Court);
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
          if (selectedCourt?.id === item.id) {
            onCourtSelect(null);
            marker.togglePopup();
          } else {
            onCourtSelect(item as Court);
          }
        });

        markersRef.current[item.id] = marker;
      });
    }
  };

  // Add this effect to handle tournament layer
  useEffect(() => {
    if (!map.current || !mapLoaded || mode !== 'tournament') {
      console.log('Skipping tournament layer:', { map: !!map.current, mapLoaded, mode });
      return;
    }

    // Remove existing tournament layer if it exists
    if (map.current.getLayer('3d-tournaments')) {
      map.current.removeLayer('3d-tournaments');
    }

    // Create new tournament layer
    const filteredTournaments = getFilteredItems() as Tournament[];
    console.log('filteredTournaments:', filteredTournaments);

    // Wait for style to be fully loaded
    if (!map.current.isStyleLoaded()) {
      console.log('Style not loaded yet, waiting...');
      map.current.once('style.load', () => {
        addTournamentLayer();
      });
      return;
    }

    addTournamentLayer();

    function addTournamentLayer() {
      try {
        // Get all available layers
        const layers = map.current?.getStyle()?.layers || [];
        console.log('Available layers:', layers.map(l => l.id));

        // Create the tournament layer
        tournamentLayerRef.current = new TournamentLayer(map.current!, filteredTournaments);
        const customLayer = tournamentLayerRef.current.createLayer();

        // Try to find a suitable layer to add before
        // Look for label or symbol layers, or any layer that might be above the base map
        const targetLayer = layers.find(layer => 
          layer.type === 'symbol' || 
          layer.id.includes('label') ||
          layer.id.includes('poi') ||
          layer.type === 'fill-extrusion'
        );

        console.log('Adding 3D layer before:', targetLayer?.id || 'at the top');

        if (targetLayer) {
          map.current!.addLayer(customLayer, targetLayer.id);
        } else {
          map.current!.addLayer(customLayer);
        }
      } catch (error) {
        console.error('Error adding tournament layer:', error);
      }
    }

    // Cleanup
    return () => {
      if (map.current?.getLayer('3d-tournaments')) {
        map.current.removeLayer('3d-tournaments');
      }
    };
  }, [mode, sportFilter, mapLoaded, searchRadius]);

  

  // Map initialization and cleanup
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: zoom,
      antialias: true
    });

    newMap.on('style.load', () => {
      console.log('Style loaded');
      const layers = newMap.getStyle()?.layers;
      console.log('Initial layers:', layers?.map(l => l.id));
      console.log('style:', newMap.getStyle());

      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      )?.id;
      console.log('layers:', layers);

      // Add the 3D buildings layer before labels
      newMap.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#01C0F7',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.95
          }
        },
        labelLayerId
      );
      // Add custom styling
    
    
      // LAND & STRUCTURE LAYERS
      const landLayers = [
        'landuse',
        'landcover',
        'land-structure-polygon',
        'landuse-commercial',
        'landuse-civic',
        'commercial',
        'commercial-building'
      ];

      landLayers.forEach(layer => {
        if (newMap.getLayer(layer)) {
          newMap.setPaintProperty(layer, 'fill-color', '#00decb');
          newMap.setPaintProperty(layer, 'fill-opacity', 0.8);
        }
      });

      // WATER FEATURES
      const waterLayers = [
        'water',
        // 'waterway',
        // 'water-shadow',
        // 'waterway-shadow',
        // 'water-depth'
      ];

      waterLayers.forEach(layer => {
        if (newMap.getLayer(layer)) {
          newMap.setPaintProperty(layer, 'fill-color', '#01C0F7');
          newMap.setPaintProperty(layer, 'fill-opacity', 1);
        }
      });

      // ROADS - MAJOR
      const majorRoadLayers = [
        'road-motorway-trunk',
        'road-primary',
        'road-secondary-tertiary',
        'bridge-motorway-trunk',
        'bridge-primary',
        'bridge-secondary-tertiary',
        'tunnel-motorway-trunk',
        'tunnel-primary',
        'tunnel-secondary-tertiary'
      ];

      majorRoadLayers.forEach(layer => {
        if (newMap.getLayer(layer)) {
          newMap.setPaintProperty(layer, 'line-color', '#ffffff');
          newMap.setPaintProperty(layer, 'line-width', 2);
          newMap.setPaintProperty(layer, 'line-opacity', 0.8);
        }
      });

      // ROADS - CASES (OUTLINES)
      const roadCaseLayers = [
        'road-motorway-trunk-case',
        'road-primary-case',
        'road-secondary-tertiary-case',
        'road-street-case',
        'bridge-motorway-trunk-case',
        'bridge-primary-case',
        'bridge-secondary-tertiary-case',
        'bridge-street-case'
      ];

      roadCaseLayers.forEach(layer => {
        if (newMap.getLayer(layer)) {
          newMap.setPaintProperty(layer, 'line-color', '#7DE0D3');
          newMap.setPaintProperty(layer, 'line-width', 3);
          newMap.setPaintProperty(layer, 'line-opacity', 0.5);
        }
      });

      // ROADS - MINOR
      const minorRoadLayers = [
        'road-minor',
        'road-minor-low',
        'road-street',
        'road-street-low',
        'bridge-minor',
        'bridge-street',
        'tunnel-minor',
        'tunnel-street'
      ];

      minorRoadLayers.forEach(layer => {
        if (newMap.getLayer(layer)) {
          newMap.setPaintProperty(layer, 'line-color', '#ffffff');
          newMap.setPaintProperty(layer, 'line-width', 1);
          newMap.setPaintProperty(layer, 'line-opacity', 0.4);
        }
      });

      // PATHS & PEDESTRIAN
      const pathLayers = [
        'road-path',
        'road-pedestrian',
        'road-steps',
        'bridge-path',
        'bridge-pedestrian',
        'bridge-steps',
        'tunnel-path',
        'tunnel-pedestrian',
        'tunnel-steps'
      ];

      pathLayers.forEach(layer => {
        if (newMap.getLayer(layer)) {
          newMap.setPaintProperty(layer, 'line-color', '#4a8f88');
          newMap.setPaintProperty(layer, 'line-width', 0.5);
          newMap.setPaintProperty(layer, 'line-opacity', 0.3);
        }
      });

      // TRANSIT
      const transitLayers = [
        'road-rail',
        'road-rail-tracks',
        'bridge-rail',
        'bridge-rail-tracks',
        'tunnel-rail',
        'tunnel-rail-tracks'
      ];

      transitLayers.forEach(layer => {
        if (newMap.getLayer(layer)) {
          newMap.setPaintProperty(layer, 'line-color', '#2a2e33');
          newMap.setPaintProperty(layer, 'line-opacity', 0.5);
        }
      });
      
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