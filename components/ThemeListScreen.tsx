import React, { useState, useEffect } from 'react';
import { ThemeLoader, ThemeData } from '../utils/ThemeLoader';

/**
 * Экран со списком всех доступных тем
 */
export default function ThemeListScreen() {
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем текущий язык (можно расширить логику)
      const currentLanguage = 'ru'; // TODO: получать из контекста языка
      
      const loadedThemes = await ThemeLoader.loadThemes(currentLanguage);
      setThemes(loadedThemes);
    } catch (err) {
      console.error('Error loading themes:', err);
      setError('Ошибка загрузки тем');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeClick = (themeId: string) => {
    // TODO: навигация к экрану темы
    console.log('Navigate to theme:', themeId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка тем...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
        <button 
          onClick={loadThemes}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Темы для развития
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <ThemeCard 
              key={theme.id} 
              theme={theme} 
              onClick={() => handleThemeClick(theme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Карточка темы
 */
function ThemeCard({ theme, onClick }: { theme: ThemeData; onClick: () => void }) {
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
          PREMIUM
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
            {theme.cards.length} карточек
          </span>
          
          <div className="text-yellow-400">
            →
          </div>
        </div>
      </div>
    </button>
  );
}
