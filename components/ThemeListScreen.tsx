import React, { useState, useEffect } from 'react';
import { ThemeLoader, ThemeData } from '../utils/ThemeLoader';
import { LoadingScreen } from './LoadingScreen';
import { useStore } from '@nanostores/react';
import { useLanguage } from './LanguageContext';

import { themeListMessages } from '@/src/i18n/messages/themeList';
import { errorsMessages } from '@/src/i18n/messages/errors';
import { commonMessages } from '@/src/i18n/messages/common';
import { profileMessages } from '@/src/i18n/messages/profile';

import { pluralizeEnglish, pluralizeRussian } from '../utils/pluralization';

/**
 * Экран со списком всех доступных тем
 */
export default function ThemeListScreen() {
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguage();
  const themeList = useStore(themeListMessages);
  const errors = useStore(errorsMessages);
  const common = useStore(commonMessages);
  const profile = useStore(profileMessages);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedThemes = await ThemeLoader.loadThemes(language);
      setThemes(loadedThemes);
    } catch (err) {
      console.error('Error loading themes:', err);
      setError(errors.themeListLoadingError);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeClick = (themeId: string) => {
    // TODO: навигация к экрану темы
    console.log('Navigate to theme:', themeId);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
        <button 
          onClick={loadThemes}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {common.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {themeList.title}
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => {
            const cardsCount = theme.cards.length;
            const forms = themeList.cardsCount as { singular: string; few: string; many: string };
            const cardsWord =
              language === 'ru'
                ? pluralizeRussian(cardsCount, [forms.singular, forms.few, forms.many])
                : pluralizeEnglish(cardsCount, forms.singular, forms.many);

            return (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onClick={() => handleThemeClick(theme.id)}
                cardsCountLabel={`${cardsCount} ${cardsWord}`}
                premiumLabel={profile.premium}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Карточка темы
 */
function ThemeCard({
  theme,
  onClick,
  cardsCountLabel,
  premiumLabel,
}: {
  theme: ThemeData;
  onClick: () => void;
  cardsCountLabel: string;
  premiumLabel: string;
}) {
  const isPremium = theme.isPremium;
  
  return (
    <button
      onClick={onClick}
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-300
        ${isPremium 
          ? 'border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20' 
          : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
        }
        hover:scale-105 active:scale-95
      `}
    >
      {/* Premium badge */}
      {isPremium && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
          {premiumLabel}
        </div>
      )}
      
      <div className="text-left">
        <h2 className="text-xl font-bold mb-2 text-white">
          {theme.title}
        </h2>
        
        <p className="text-gray-300 mb-4 text-sm">
          {theme.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {cardsCountLabel}
          </span>
          
          <div className="text-yellow-400">
            →
          </div>
        </div>
      </div>
    </button>
  );
}
