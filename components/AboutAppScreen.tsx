// Импортируем необходимые хуки
import { useContent } from './ContentContext';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { ReferralSection } from './ProfileReferralSection';

// Типы для пропсов компонента
interface AboutAppScreenProps {
  onBack: () => void; // Функция для возврата к профилю пользователя
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
// Light переиспользуется из общего компонента




/**
 * Адаптивная секция с логотипом приложения
 */
function AppLogoSection({ content: _content }: { content: any }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5 w-full" data-name="App logo section">
      <div className="flex justify-center items-center w-full">
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
          <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M269.881 486.487C262.541 493.838 250.643 493.838 243.303 486.487L123.686 366.701C116.352 359.35 116.348 347.434 123.686 340.086C131.025 332.738 142.923 332.741 150.264 340.086L237.797 427.743L237.797 248.237L178.505 248.237C168.009 248.237 159.5 239.913 159.5 229.644C159.5 219.376 168.009 211.053 178.505 211.053L237.797 211.053L237.797 172.032C237.797 171.868 237.799 171.704 237.804 171.541C204.675 163.168 180.157 133.164 180.157 97.4335C180.157 55.2202 214.378 20.9999 256.592 20.9999C298.805 21 333.026 55.2202 333.026 97.4335C333.026 133.164 308.509 163.167 275.381 171.541C275.385 171.704 275.387 171.868 275.387 172.032L275.387 211.053L330.547 211.053C341.043 211.053 349.553 219.376 349.553 229.644C349.553 239.913 341.043 248.237 330.547 248.237L275.387 248.237L275.387 427.743L362.92 340.086C370.26 332.741 382.16 332.737 389.498 340.086C396.836 347.434 396.832 359.35 389.498 366.701L269.881 486.487ZM256.592 135.651C277.698 135.651 294.809 118.54 294.809 97.4335C294.808 76.327 277.698 59.2168 256.592 59.2167C235.485 59.2167 218.375 76.3269 218.375 97.4335C218.375 118.54 235.485 135.651 256.592 135.651Z" fill="#E1FF00"/>
          </svg>
        </div>
      </div>
        <div className="flex flex-col items-center gap-2">
          <div className="typography-h1 text-brand-primary text-center">
            <h1 className="block">Menhausen</h1>
          </div>
        </div>
    </div>
  );
}

/**
 * Адаптивная секция информации о приложении
 */
function AppInfoSection({ content }: { content: any }) {
  return (
    <div className="bg-bg-card rounded-xl p-4 sm:p-5 relative w-full" data-name="App info section">
      <div
        aria-hidden="true"
        className="absolute border border-border-primary border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="flex flex-col gap-4">
        <div className="typography-h2 text-brand-primary text-left">
          <h2 className="block">{content?.about?.title || 'О приложении'}</h2>
        </div>
        <div className="typography-body text-secondary text-left whitespace-pre-line">
          <p className="block">
            {content?.about?.description || `Menhausen — это ваш персональный помощник для ментального здоровья, созданный специально для Telegram.

Наше приложение помогает вам отслеживать свое эмоциональное состояние, развивать здоровые привычки и поддерживать психологическое благополучие через ежедневные чекины и осознанные упражнения.

Основные возможности:
• Ежедневное отслеживание настроения и эмоциональных состояний
• Персонализированные упражнения для ментального здоровья
• Отслеживание прогресса с уровнями и достижениями
• Полная конфиденциальность — ваши данные остаются вашими
• Интеграция с Telegram Mini Apps

Menhausen использует научно обоснованные методы когнитивно-поведенческой терапии (КПТ), терапии принятия и обязательств (АКТ) и позитивной психологии, чтобы помочь вам справиться с тревожностью, стрессом и другими эмоциональными вызовами.

Приложение разработано командой специалистов в области ментального здоровья и технологий, которые верят, что забота о психологическом благополучии должна быть доступной, удобной и эффективной для каждого.

Сделано с ❤️ для сообщества Telegram.`}
          </p>
        </div>
      </div>
    </div>
  );
}


/**
 * Главный компонент страницы "О приложении"
 * Полностью адаптивный с поддержкой всех устройств и min-h-[44px] min-w-[44px] элементами
 */
export function AboutAppScreen({ onBack: _onBack }: AboutAppScreenProps) {
  const { content, currentLanguage } = useContent();
  console.log('AboutAppScreen: Current language:', currentLanguage);
  console.log('AboutAppScreen: Content loaded:', !!content);
  console.log('AboutAppScreen: About content:', content?.about);
  
  // Если контент не загружен, показываем загрузку
  if (!content || !content.about || !content.about.title) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <div className="text-lg text-brand-primary">Загрузка контента...</div>
          <div className="text-sm text-secondary mt-2">Язык: {currentLanguage}</div>
          <div className="text-xs text-tertiary mt-1">Контент: {content ? 'загружен' : 'не загружен'}</div>
          <div className="text-xs text-tertiary mt-1">About: {content?.about ? 'есть' : 'нет'}</div>
          <div className="text-xs text-tertiary mt-1">UI: {content?.ui ? 'есть' : 'нет'}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="bg-bg-primary relative w-full h-full min-h-screen overflow-y-auto safe-top safe-bottom overflow-x-hidden" 
      data-name="About App Page"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Основной контент */}
      <div className="flex flex-col gap-8 sm:gap-10 px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] w-full max-w-[351px] mx-auto pb-6 sm:pb-8">
        
        {/* Логотип и название приложения */}
        <AppLogoSection content={content} />
        
        {/* Информация о приложении */}
        <AppInfoSection content={content} />
        
        {/* Секция реферальной программы */}
        <ReferralSection />
        
      </div>
    </div>
  );
}