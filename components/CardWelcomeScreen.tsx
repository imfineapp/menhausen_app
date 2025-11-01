// Импортируем необходимые хуки и SVG пути
import { BottomFixedButton } from "./BottomFixedButton";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useContent } from './ContentContext';

// Типы для пропсов компонента
interface CardWelcomeScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onNext: () => void; // Функция для перехода к следующему экрану (упражнению)
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  cardDescription?: string; // Описание карточки (опционально)
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
// Light переиспользуется из общего компонента

/**
 * Адаптивный компонент символа логотипа
 */

/**
 * Адаптивный компонент названия приложения с версией beta
 */

/**
 * Адаптивный мини-логотип с символом и названием
 */




/**
 * Адаптивный текстовый блок с описанием карточки
 */
function CardDescription({ description }: { description: string }) {
  return (
    <div 
      className="absolute left-1/2 top-[310px] sm:top-[330px] md:top-[347px] translate-x-[-50%] w-full max-w-[351px] px-4 sm:px-6 md:px-0"
      data-name="Card Description"
    >
      <div className="typography-body h-auto min-h-[60px] sm:min-h-[70px] md:min-h-[89px] text-[#ffffff] text-center">
        <p className="block">{description}</p>
      </div>
    </div>
  );
}

/**
 * Главный компонент стартовой страницы карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function CardWelcomeScreen({ onBack, onNext, cardId: _cardId, cardTitle: _cardTitle, cardDescription }: CardWelcomeScreenProps) {
  const { content } = useContent();
  
  // Используем переданное описание или fallback
  const description = cardDescription || content.ui.cards.welcome.subtitle;
  
  /**
   * Функция для обработки кнопки "Next"
   * Переходит к упражнению карточки
   */
  const handleNext = () => {
    onNext();
  };

  /**
   * Функция для обработки кнопки "Back" 
   * Возвращается к предыдущему экрану
   */
  const _handleBack = () => {
    onBack();
  };

  return (
    <div 
      className="bg-[#111111] relative size-full min-h-screen" 
      data-name="Card Welcome Page"
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Мини-логотип */}
      <MiniStripeLogo />
      
      {/* Текстовое описание карточки */}
      <CardDescription 
        description={description}
      />
      
      {/* Bottom Fixed CTA Button согласно Guidelines.md */}
      <BottomFixedButton onClick={handleNext}>
        {content?.ui?.themes?.welcome?.start || 'Начать'}
      </BottomFixedButton>
    </div>
  );
}