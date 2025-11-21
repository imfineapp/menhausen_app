// Импортируем SVG пути для страницы Privacy Policy
import svgPaths from "../imports/svg-e41m9aecp1";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useLanguage } from './LanguageContext';

// Типы для пропсов компонента
interface PrivacyPolicyScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
}

/**
 * Компонент световых эффектов для фона
 * Идентичен эффектам на других экранах
 */
// Light переиспользуется из общего компонента

/**
 * Главный контент страницы Privacy Policy
 * Содержит заголовок и весь текст политики на английском языке
 */
function MainContent() {
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-10 items-start justify-start leading-[0] px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] w-full max-w-[351px] mx-auto"
      data-name="main_content"
    >
      {/* Заголовок страницы */}
      <div className="typography-h2 text-[#e1ff00] text-center w-full">
        <h2 className="block">{getText('Политика конфиденциальности', 'Privacy policy')}</h2>
      </div>
      
      {/* Контейнер для прокручиваемого контента */}
      <div className="typography-caption text-[#ffffff] text-left w-full overflow-y-auto pr-2 h-[calc(100vh-180px)]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="block leading-none mb-0">{getText('Дата вступления в силу: 2 августа 2025', 'Effective Date: August 2, 2025')}</p>
            <p className="block leading-none mb-0">{getText('Последнее обновление: 2 августа 2025', 'Last Updated: August 2, 2025')}</p>
          </div>
          
          <p className="block leading-none mb-0">
            {getText('Menhausen ("мы", "нас" или "наш") уважает вашу конфиденциальность и стремится защищать анонимность пользователей ("вы"), которые получают доступ к нашему мини-приложению для психического благополучия через Telegram (далее "Сервис").', 'Menhausen ("we," "us," or "our") respects your privacy and is committed to protecting the anonymity of users ("you") who access our mental well-being mini-application via Telegram (the "Service").')}
          </p>
          
          <p className="block leading-none mb-0">
            {getText('Эта Политика конфиденциальности описывает, какие данные мы собираем (если таковые имеются), как мы их используем, и ваши права в отношении этих данных.', 'This Privacy Policy outlines what data we collect (if any), how we use it, and your rights regarding that data.')}
          </p>

          {/* Секция 1 - No PII */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('1. Отсутствие личной информации', '1. No Personally Identifiable Information (PII)')}</p>
            <p className="block leading-none mb-0">
              {getText('Мы разработали Menhausen с анонимностью как основной ценностью. По умолчанию мы не собираем и не храним никакой личной информации, такой как ваше имя, адрес электронной почты, номер телефона или IP-адрес.', 'We designed Menhausen with anonymity as a core value. By default, we do not collect or store any personally identifiable information (PII) such as your name, email address, phone number, or IP address.')}
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">{getText('Для использования Сервиса регистрация не требуется.', 'No sign-up is required to use the Service.')}</li>
              <li className="leading-none">
                {getText('Вы идентифицируетесь только случайным токеном сессии (непостоянным) в среде Telegram.', 'You are identified only by a random session token (non-persistent) within the Telegram environment.')}
              </li>
              <li className="leading-none">
                {getText('Вы можете по желанию подключить TON кошелек или делать пожертвования с помощью криптовалюты или фиата. Это строго добровольно и максимально анонимизировано.', 'You may optionally choose to connect a TON wallet or donate using crypto or fiat. This is strictly optional and anonymized to the extent possible.')}
              </li>
            </ul>
          </div>

          {/* Секция 2 - Data Collection */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('2. Данные, которые мы можем собирать (только анонимные)', '2. Data We May Collect (Anonymous Only)')}</p>
            <p className="block leading-none mb-0">
              {getText('Для улучшения вашего опыта и функциональности приложения мы можем собирать и обрабатывать следующую неличную и агрегированную информацию:', 'To improve your experience and app functionality, we may collect and process the following non-personal and aggregated information:')}
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">{getText('Анонимная история взаимодействий (например, какие карточки вы открыли)', 'Anonymous interaction history (e.g., which cards you\'ve opened)')}</li>
              <li className="leading-none">{getText('Данные проверки настроения (неидентифицирующие)', 'Mood check-in data (non-identifying)')}</li>
              <li className="leading-none">{getText('События сессии (например, клики, продолжительность)', 'Session events (e.g., clicks, duration)')}</li>
              <li className="leading-none">{getText('Тип устройства/браузера', 'Device/browser type')}</li>
              <li className="leading-none">{getText('Зашифрованный адрес TON кошелька (если подключен)', 'Encrypted TON wallet address (if connected)')}</li>
            </ul>
            <p className="block leading-none mb-0">
              {getText('Все такие данные собираются без привязки к какой-либо личности и хранятся безопасно с использованием отраслевых стандартов.', 'All such data is collected without linkage to any identity and is stored securely using industry standards.')}
            </p>
          </div>

          {/* Секция 3 - Telegram Integration */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('3. Интеграция с Telegram', '3. Telegram Integration')}</p>
            <p className="block leading-none mb-0">
              {getText('Как Telegram Mini App, Menhausen работает в экосистеме Telegram.', 'As a Telegram Mini App, Menhausen operates within the Telegram ecosystem.')}
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">
                {getText('Telegram может обрабатывать базовые метаданные (ID пользователя, время использования приложения) в соответствии с их Политикой конфиденциальности.', 'Telegram may process basic metadata (user ID, app usage time), subject to their Privacy Policy.')}
              </li>
              <li className="leading-none">
                {getText('Мы не передаем собранные пользовательские данные в Telegram или третьим лицам, если это не требуется по закону.', 'We do not share any collected user data with Telegram or third parties unless required by law.')}
              </li>
              <li className="leading-none">
                {getText('Мы не получаем доступ к вашим сообщениям Telegram, контактам или номеру телефона.', 'We do not access your Telegram messages, contacts, or phone number.')}
              </li>
            </ul>
          </div>

          {/* Секция 4 - Contact */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('4. Контактная информация', '4. Contact Information')}</p>
            <p className="leading-none mb-0">
              <span>{getText('По вопросам или проблемам, связанным с этой Политикой конфиденциальности, обращайтесь: ', 'For questions or concerns about this Privacy Policy, please contact: ')}</span>
              <span className="text-[#e1ff00]">support@menhausen.com</span>
            </p>
          </div>
          
          <p className="block leading-none">
            {getText('Используя Menhausen, вы подтверждаете, что прочитали, поняли и согласились с этой Политикой конфиденциальности.', 'By using Menhausen, you acknowledge that you have read, understood, and agreed to this Privacy Policy.')}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент символа логотипа (повторно используемый)
 */
function _SymbolBig() {
  return (
    <div className="relative size-full" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d={svgPaths.p377b7c00} fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Компонент названия приложения (повторно используемый)
 */
function _Menhausen() {
  return (
    <div className="absolute inset-[2.21%_1.17%_7.2%_15.49%]" data-name="Menhausen">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 12">
        <g id="Menhausen">
          <path d={svgPaths.p32d14cf0} fill="var(--fill-0, #CFCFCF)" id="Vector" />
          <path d={svgPaths.p1786c280} fill="var(--fill-0, #CFCFCF)" id="Vector_2" />
          <path d={svgPaths.p23ce7e00} fill="var(--fill-0, #CFCFCF)" id="Vector_3" />
          <path d={svgPaths.p35fc2600} fill="var(--fill-0, #CFCFCF)" id="Vector_4" />
          <path d={svgPaths.p30139900} fill="var(--fill-0, #CFCFCF)" id="Vector_5" />
          <path d={svgPaths.p33206e80} fill="var(--fill-0, #CFCFCF)" id="Vector_6" />
          <path d={svgPaths.p2cb2bd40} fill="var(--fill-0, #CFCFCF)" id="Vector_7" />
          <path d={svgPaths.p3436ffe0} fill="var(--fill-0, #CFCFCF)" id="Vector_8" />
          <path d={svgPaths.p2d60800} fill="var(--fill-0, #CFCFCF)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}


/**
 * Главный компонент страницы Privacy Policy
 * Отображает полную политику конфиденциальности с навигацией
 */
export function PrivacyPolicyScreen({ onBack: _onBack }: PrivacyPolicyScreenProps) {
  return (
    <div className="bg-[#111111] relative size-full overflow-hidden" data-name="002_privacy policy">
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Основной контент документа */}
      <MainContent />
    </div>
  );
}