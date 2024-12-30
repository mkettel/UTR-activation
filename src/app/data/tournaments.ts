// In data/tournaments.ts
export interface Tournament {
    id: string;
    name: string;
    sport: 'tennis' | 'pickleball' | 'both';
    location: {
      lat: number;
      lng: number;
    };
    address: string;
    city: string;
    state: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'all';
    price: number;
    spotsAvailable: number;
    totalSpots: number;
  }
  
  export const mockTournaments: Tournament[] = [
    {
      id: 't1',
      name: 'NYC Summer Tennis Open',
      sport: 'tennis',
      location: {
        lat: 40.7829,
        lng: -73.9654
      },
      address: 'Central Park Tennis Center',
      city: 'New York',
      state: 'NY',
      startDate: '2024-07-15',
      endDate: '2024-07-17',
      registrationDeadline: '2024-07-01',
      level: 'all',
      price: 75,
      spotsAvailable: 12,
      totalSpots: 32
    }
    // Add more mock tournaments as needed
  ];
  
  // In your existing courts.ts file, add a type for the view mode
  export type ViewMode = 'tournaments' | 'courts';