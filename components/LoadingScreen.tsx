import React from 'react';
import { useContent } from './ContentContext';

/**
 * LoadingScreen - Simple loading screen shown during app initialization
 */
export const LoadingScreen: React.FC = () => {
  const { getUI } = useContent();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
      <div className="relative flex flex-col items-center justify-center">
        <img
          src="/android-chrome-512x512.png"
          alt={getUI().common.loading || 'Loading...'}
          className="w-32 h-32 animate-breathe rounded-full"
        />
      </div>
    </div>
  );
};

