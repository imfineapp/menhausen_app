import React from 'react';
import { useStore } from '@nanostores/react';
import { commonMessages } from '@/src/i18n/messages/common';

/**
 * LoadingScreen - Simple loading screen shown during app initialization
 */
export const LoadingScreen: React.FC = () => {
  const common = useStore(commonMessages)
  const altText = common.appName || 'Menhausen'

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

