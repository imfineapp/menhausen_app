import React from 'react';
import { useContent } from './ContentContext';

/**
 * LoadingScreen - Simple loading screen shown during app initialization
 */
export const LoadingScreen: React.FC = () => {
  const { getUI } = useContent();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
      <div className="text-white text-center">
        <div className="text-lg animate-pulse">
          {getUI().common.loading || 'Loading...'}
        </div>
      </div>
    </div>
  );
};

