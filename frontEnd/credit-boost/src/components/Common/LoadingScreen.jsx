import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading screen component for route transitions and suspense fallbacks
 */
const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-white dark:bg-gray-900"></div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;