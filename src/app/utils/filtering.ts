import { Court } from "../data/courts";
import { Tournament } from "../data/tournaments";

// First, let's extract the filtering logic into a shared utility function
// In a new file, e.g., utils/filtering.ts
export const extractLocationParts = (location: string) => {
    const lowercaseLocation = location.toLowerCase();
    const stateMatches = lowercaseLocation.match(/\b(ny|new york|nj|new jersey)\b/);
    const cityMatches = lowercaseLocation.match(/\b(new york|brooklyn|queens|hoboken)\b/);
    
    return {
      state: stateMatches ? stateMatches[0] : '',
      city: cityMatches ? cityMatches[0] : ''
    };
  };
  
  export const filterItems = (
    items: Court[] | Tournament[],
    mode: 'tournament' | 'play',
    sportFilter: string,
    searchLocation: string
  ) => {
    return items.filter(item => {
      const matchesSport = mode === 'tournament'
        ? sportFilter === 'all' ? true : item.sport === sportFilter
        : sportFilter === 'all' ? true : item.sport === sportFilter || item.sport === 'both';
      
      if (!searchLocation) return matchesSport;
      
      const { city, state } = extractLocationParts(searchLocation);
      const matchesLocation = 
        item.city.toLowerCase().includes(city) ||
        item.state.toLowerCase().includes(state);
      
      return matchesSport && matchesLocation;
    });
  };