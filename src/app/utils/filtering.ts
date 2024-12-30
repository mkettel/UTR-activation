import { Court } from "@/app/data/courts";
import { Tournament } from "@/app/data/tournaments";
import { calculateDistance } from "../components/ui/RadiusSelector";

export const filterItems = (
  items: Court[] | Tournament[],
  mode: 'tournament' | 'play',
  sportFilter: string,
  searchLocation: string,
  center: { lat: number; lng: number },
  radius: number
) => {
  // First apply radius filter - this is our primary filter
  let filtered = items.filter(item => {
    const distance = calculateDistance(
      center.lat,
      center.lng,
      item.location.lat,
      item.location.lng
    );
    console.log(`Distance for ${item.name}: ${distance} miles`);
    return distance <= radius;
  });

  // Then apply sport filter
  filtered = filtered.filter(item => {
    return mode === 'tournament'
      ? sportFilter === 'all' ? true : item.sport === sportFilter
      : sportFilter === 'all' ? true : item.sport === sportFilter || item.sport === 'both';
  });

  // Don't filter by location text/city/state - let radius be the location filter
  console.log(`Filtered from ${items.length} to ${filtered.length} items`);
  return filtered;
};