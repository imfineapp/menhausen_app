// Импортируем SVG пути для страницы Privacy Policy
import svgPaths from "../imports/svg-e41m9aecp1";
import { MiniStripeLogo } from './ProfileLayoutComponents';

// Типы для пропсов компонента
interface PrivacyPolicyScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
}

/**
 * Компонент световых эффектов для фона
 * Идентичен эффектам на других экранах
 */
function Light() {
  return (
    <div
      className="absolute h-[917px] top-[-65px] translate-x-[-50%] w-[211px]"
      data-name="Light"
      style={{ left: "calc(50% + 1px)" }}
    >
      <div className="absolute inset-[-27.81%_-120.85%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 721 1427">
          <g id="Light">
            <g filter="url(#filter0_f_1_264)" id="Ellipse 2">
              <ellipse cx="361.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
            <g filter="url(#filter1_f_1_264)" id="Ellipse 1">
              <ellipse cx="360.5" cy="1113.5" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="105.5" ry="58.5" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_1_264"
              width="695"
              x="14"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_264" stdDeviation="127.5" />
            </filter>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="627"
              id="filter1_f_1_264"
              width="721"
              x="0"
              y="800"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_264" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Главный контент страницы Privacy Policy
 * Содержит заголовок и весь текст политики на английском языке
 */
function MainContent() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-10 items-start justify-start leading-[0] px-[21px] pt-[100px] w-full max-w-[351px] mx-auto"
      data-name="main_content"
    >
      {/* Заголовок страницы */}
      <div className="font-heading font-normal relative shrink-0 text-[#e1ff00] text-[24px] text-center w-full">
        <p className="block leading-[0.8]">Privacy policy</p>
      </div>
      
      {/* Контейнер для прокручиваемого контента */}
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] text-[14px] text-left w-full max-h-[600px] overflow-y-auto pr-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="block leading-none mb-0">Effective Date: August 2, 2025</p>
            <p className="block leading-none mb-0">Last Updated: August 2, 2025</p>
          </div>
          
          <p className="block leading-none mb-0">
            Menhausen ("we," "us," or "our") respects your privacy and is committed to protecting the anonymity of users
            ("you") who access our mental well-being mini-application via Telegram (the "Service").
          </p>
          
          <p className="block leading-none mb-0">
            This Privacy Policy outlines what data we collect (if any), how we use it, and your rights regarding that
            data.
          </p>

          {/* Секция 1 - No PII */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">1. No Personally Identifiable Information (PII)</p>
            <p className="block leading-none mb-0">
              We designed Menhausen with anonymity as a core value. By default, we do not collect or store any personally 
              identifiable information (PII) such as your name, email address, phone number, or IP address.
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">No sign-up is required to use the Service.</li>
              <li className="leading-none">
                You are identified only by a random session token (non-persistent) within the Telegram environment.
              </li>
              <li className="leading-none">
                You may optionally choose to connect a TON wallet or donate using crypto or fiat. This is strictly
                optional and anonymized to the extent possible.
              </li>
            </ul>
          </div>

          {/* Секция 2 - Data Collection */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">2. Data We May Collect (Anonymous Only)</p>
            <p className="block leading-none mb-0">
              To improve your experience and app functionality, we may collect and process the following non-personal and
              aggregated information:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">Anonymous interaction history (e.g., which cards you've opened)</li>
              <li className="leading-none">Mood check-in data (non-identifying)</li>
              <li className="leading-none">Session events (e.g., clicks, duration)</li>
              <li className="leading-none">Device/browser type</li>
              <li className="leading-none">Encrypted TON wallet address (if connected)</li>
            </ul>
            <p className="block leading-none mb-0">
              All such data is collected without linkage to any identity and is stored securely using industry standards.
            </p>
          </div>

          {/* Секция 3 - Telegram Integration */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">3. Telegram Integration</p>
            <p className="block leading-none mb-0">
              As a Telegram Mini App, Menhausen operates within the Telegram ecosystem.
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">
                Telegram may process basic metadata (user ID, app usage time), subject to their Privacy Policy.
              </li>
              <li className="leading-none">
                We do not share any collected user data with Telegram or third parties unless required by law.
              </li>
              <li className="leading-none">
                We do not access your Telegram messages, contacts, or phone number.
              </li>
            </ul>
          </div>

          {/* Секция 4 - Crypto Payments */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">4. Crypto Payments and Web3</p>
            <p className="block leading-none mb-0">
              If you choose to make a donation or use Web3 features (e.g., connect a wallet):
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">
                Transactions are handled via decentralized protocols or external providers (e.g., TON, P2P exchanges).
              </li>
              <li className="leading-none">
                We do not store private keys, wallet balances, or transaction logs.
              </li>
              <li className="leading-none">
                Wallet addresses, if connected, are stored in hashed or encrypted form only for technical purposes.
              </li>
            </ul>
            <p className="block leading-none mb-0">
              Note: Blockchain activity is public by nature, and you are responsible for your own wallet privacy.
            </p>
          </div>

          {/* Секция 5 - Cookies & Analytics */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">5. Cookies & Analytics</p>
            <p className="block leading-none mb-0">
              Menhausen does not use cookies or web tracking pixels in the Telegram Mini App environment.
              We may use local device storage to maintain user session state, but this is ephemeral and fully anonymous.
            </p>
          </div>

          {/* Секция 6 - Data Security */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">6. Data Security</p>
            <p className="block leading-none mb-0">
              We apply AES-256 encryption for data in transit and at rest (if stored).
              All data is hosted on GDPR-compliant and/or ISO-certified infrastructure.
              Data is not stored outside the country or region unless anonymized and aggregated.
            </p>
          </div>

          {/* Секция 7 - Your Rights */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">7. Your Rights</p>
            <p className="block leading-none mb-0">You may request to:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">Access the anonymous data associated with your session token;</li>
              <li className="leading-none">Delete all local usage data (via app settings or upon request);</li>
              <li className="leading-none">Opt out of future tracking or analytics.</li>
            </ul>
            <p className="block leading-none mb-0">
              Since we do not collect PII, these actions are limited to data that can be technically associated with your
              session.
            </p>
          </div>

          {/* Секция 8 - Contact */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">8. Contact Us</p>
            <p className="block leading-none mb-0">
              If you have any questions about this policy or how your data is handled, please contact:
            </p>
            <p className="block leading-none mb-0 text-[#e1ff00]">privacy@menhausen.app</p>
          </div>
          
          <p className="block leading-none">
            By using Menhausen, you agree to this Privacy Policy and the anonymous, self-help nature of the Service.
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