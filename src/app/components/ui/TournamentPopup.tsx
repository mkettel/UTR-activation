import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, DollarSign, Trophy } from 'lucide-react';

const TournamentPopup = ({ tournament }: any) => {
  const {
    name = "NYC Summer Tennis Open",
    address = "Central Park Tennis Center",
    level = "all",
    spotsAvailable = 12,
    totalSpots = 32,
    price = 75,
    startDate = "Jul 14, 2024",
    endDate = "Jul 16, 2024",
    registrationDeadline = "Jun 30, 2024"
  } = tournament || {};

  return (
    <>
    {/* <Card className="w-80 shadow-lg"> */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{startDate} - {endDate}</span>
              <span className="text-xs text-gray-500">
                Registration closes {registrationDeadline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{spotsAvailable}/{totalSpots} spots remaining</span>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ 
                    width: `${(spotsAvailable / totalSpots) * 100}%`,
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center">
                <DollarSign className="h-4 w-4" />
                <span>${price}</span>
            </div>
            <Badge variant="secondary" className="uppercase text-center">
                {level === 'all' ? 'All Levels' : level}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 rounded-b-lg py-3">
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          Register Now
        </Button>
      </CardFooter>
     {/* </Card> */}
    </>
  );
};

export default TournamentPopup;