import React from 'react';
import { useContent } from './ContentContext';

/**
 * LoadingScreen - Simple loading screen shown during app initialization
 */
export const LoadingScreen: React.FC = () => {
  const { getUI } = useContent();
  const altText = typeof getUI === 'function' ? getUI()?.common?.loading || 'Menhausen' : 'Menhausen'

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
      <div className="relative flex flex-col items-center justify-center">
        <img
          src="/android-chrome-256x256.webp"
          alt={altText}
          className="w-32 h-32 animate-breathe rounded-full"
          fetchPriority="high"
          width={128}
          height={128}
        />
      </div>
    </div>
  );
};

