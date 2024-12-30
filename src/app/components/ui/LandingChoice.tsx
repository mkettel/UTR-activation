import { Trophy, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingChoiceProps {
  onPathSelect: (path: 'tournament' | 'play') => void;
}

export default function LandingChoice({ onPathSelect }: LandingChoiceProps) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">How would you like to play?</h1>
      
      <div className="space-y-6 w-full max-w-md">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPathSelect('tournament')}
          className="w-full p-6 min-h-36 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 
                   flex items-center transition-colors duration-200"
        >
          <Trophy className="h-8 w-8 text-blue-600 mr-4" />
          <div className="text-left">
            <h2 className="text-xl font-semibold text-blue-900">Find a Tournament</h2>
            <p className="text-blue-700 mt-1">Join competitive matches in your area</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPathSelect('play')}
          className="w-full p-6 min-h-36 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 
                   flex items-center transition-colors duration-200"
        >
          <PlayCircle className="h-8 w-8 text-green-600 mr-4" />
          <div className="text-left">
            <h2 className="text-xl font-semibold text-green-900">Play Now</h2>
            <p className="text-green-700 mt-1">Find available courts for casual play</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}