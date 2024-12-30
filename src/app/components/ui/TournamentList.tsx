import { Tournament } from '@/app/data/tournaments';
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react';

interface TournamentListProps {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
}

export default function TournamentList({
  tournaments,
  selectedTournament,
  onTournamentSelect,
}: TournamentListProps) {
  const handleTournamentClick = (tournament: Tournament) => {
    if (selectedTournament?.id === tournament.id) {
      onTournamentSelect(null);
    } else {
      onTournamentSelect(tournament);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-4">
      {tournaments.length === 0 ? (
        <p className="text-center text-gray-600">
          No tournaments found in this area
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Showing {tournaments.length} tournaments
          </p>
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedTournament?.id === tournament.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleTournamentClick(tournament)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{tournament.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs 
                  ${tournament.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    tournament.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    tournament.level === 'advanced' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'}`}
                >
                  {tournament.level}
                </span>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {tournament.address}
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>
                    {tournament.spotsAvailable}/{tournament.totalSpots} spots left
                  </span>
                </div>
                <div className="flex items-center font-medium text-green-600">
                  <DollarSign className="h-4 w-4" />
                  {tournament.price}
                </div>
              </div>
              {tournament.registrationDeadline && (
                <p className="text-xs text-gray-500 mt-2">
                  Registration deadline: {formatDate(tournament.registrationDeadline)}
                </p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}