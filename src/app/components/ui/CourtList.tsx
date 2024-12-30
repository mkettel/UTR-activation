import { Court } from '@/app/data/courts';
import { MapPin, Sun, Moon } from 'lucide-react';

interface CourtListProps {
  courts: Court[];
  selectedCourt: Court | null;
  onCourtSelect: (court: Court | null) => void;
}

export default function CourtList({
  courts,
  selectedCourt,
  onCourtSelect,
}: CourtListProps) {
  const handleCourtClick = (court: Court) => {
    if (selectedCourt?.id === court.id) {
      onCourtSelect(null);
    } else {
      onCourtSelect(court);
    }
  };

  return (
    <div className="space-y-4">
      {courts.length === 0 ? (
        <p className="text-center text-gray-600">No courts found in this area</p>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Showing {courts.length} courts
          </p>
          {courts.map((court) => (
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
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    court.isOpen
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {court.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {court.address}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {court.courtCount} courts • {court.surface}
                </span>
                <span>
                  {court.lighting ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}