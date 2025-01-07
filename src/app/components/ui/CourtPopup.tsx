import React from 'react';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, CircleDot } from 'lucide-react';

const CourtPopup = ({ court }: any) => {
  const {
    name = "Central Park Tennis Center",
    address = "Central Park, New York",
    courtCount = 4,
    surface = "Hard",
    isOpen = true,
    sport = "tennis",
    hours = "6:00 AM - 10:00 PM"
  } = court || {};

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">{name}</CardTitle>
          <Badge 
            variant={isOpen ? "default" : "destructive"} 
            className="uppercase"
          >
            {isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{hours}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CircleDot className="h-4 w-4" />
              <span>{courtCount} {sport} courts</span>
            </div>
            <Badge variant="outline" className="uppercase">
              {surface}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 rounded-b-lg py-3">
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          Book Court
        </Button>
      </CardFooter>
    </>
  );
};

export default CourtPopup;