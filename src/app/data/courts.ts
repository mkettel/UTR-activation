export interface Court {
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
      city: 'New York',
        state: 'NY',
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
        city: 'Brooklyn',
        state: 'NY',
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
        city: 'New York',
        state: 'NY',
      isOpen: false,
      courtCount: 8,
      surface: 'Hard',
      lighting: true
    },
    {
        id: '4',
        name: 'Queens Tennis Center',
        sport: 'tennis',
        location: {
            lat: 40.7412,
            lng: -73.8449
        },
        address: 'Flushing Meadows-Corona Park, Queens, NY',
            city: 'Queens',
            state: 'NY',
        isOpen: true,
        courtCount: 10,
        surface: 'Clay',
        lighting: true
    },
    // New Jersey
    {
        id: '5',
        name: 'Hoboken Tennis Club',
        sport: 'tennis',
        location: {
            lat: 40.7434,
            lng: -74.0324
        },
        address: 'Hoboken, NJ',
            city: 'Hoboken',
            state: 'NJ',
        isOpen: false,
        courtCount: 2,
        surface: 'Hard',
        lighting: false
    }
  ];