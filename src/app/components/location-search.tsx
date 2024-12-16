import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchResult {
  place_name: string;
  center: [number, number];
  text: string;
}

interface LocationSearchProps {
  onSearch: (location: string) => void;
  onLocationSelect: (lng: number, lat: number) => void;
}

export default function LocationSearch({ onSearch, onLocationSelect }: LocationSearchProps) {
    const [searchValue, setSearchValue] = useState('New York'); // Default to NYC
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!searchValue) {
      setSearchValue('New York');
      onSearch('New York');
      onLocationSelect(-74.0060, 40.7128); // NYC coordinates
    }
  }, []);

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=US&types=place,region`
      );
      const data = await response.json();
      setSearchResults(data.features);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setSearchValue(result.place_name);
    onSearch(result.text);  // This will be used for filtering
    onLocationSelect(result.center[0], result.center[1]);
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border text-gray-600 border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by city or state..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-800" />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border text-gray-800 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <p className="text-sm font-medium">{result.place_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}