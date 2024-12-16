export interface Court {
    id: string;
    name: string;
    sport: 'tennis' | 'pickleball' | 'both';
    location: {
      lat: number;
      lng: number;
    };
    address: string;
    isOpen: boolean;
    courtCount: number;
    surface: string;
    lighting: boolean;
  }
  
  export const mockCourts: Court[] = [
    {
      id: '1',
      name: 'Central Park Tennis Courts',
      sport: 'tennis',
      location: {
        lat: 40.7829,
        lng: -73.9654
      },
      address: 'Central Park, New York, NY',
      isOpen: true,
      courtCount: 4,
      surface: 'Hard',
      lighting: true
    },
    {
      id: '2',
      name: 'Brooklyn Bridge Park Courts',
      sport: 'both',
      location: {
        lat: 40.7024,
        lng: -73.9875
      },
      address: 'Brooklyn Bridge Park, Brooklyn, NY',
      isOpen: true,
      courtCount: 6,
      surface: 'Hard',
      lighting: false
    },
    {
      id: '3',
      name: 'Riverside Pickleball Club',
      sport: 'pickleball',
      location: {
        lat: 40.7986,
        lng: -73.9778
      },
      address: 'Riverside Park, New York, NY',
      isOpen: false,
      courtCount: 8,
      surface: 'Hard',
      lighting: true
    }
  ];