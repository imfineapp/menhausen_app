// Импортируем SVG пути для страницы Privacy Policy
import svgPaths from "../imports/svg-e41m9aecp1";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useContent } from './ContentContext';

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
  const { content } = useContent();
  const privacy = content.legal?.privacyPolicy;
  if (!privacy) return null;
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-10 items-start justify-start leading-[0] px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] w-full max-w-[351px] mx-auto"
      data-name="main_content"
    >
      {/* Заголовок страницы */}
      <div className="typography-h2 text-[#e1ff00] text-center w-full">
        <h2 className="block">{privacy.title}</h2>
      </div>
      
      {/* Контейнер для прокручиваемого контента */}
      <div className="typography-caption text-[#ffffff] text-left w-full overflow-y-auto pr-2 h-[calc(100vh-180px)]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="block leading-none mb-0">{privacy.effectiveDate}</p>
            <p className="block leading-none mb-0">{privacy.lastUpdated}</p>
          </div>

          {privacy.intro.map((item) => (
            <p key={item} className="block leading-none mb-0">
              {item}
            </p>
          ))}

          {/* Секция 1 - No PII */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{privacy.sections.noPii.title}</p>
            {privacy.sections.noPii.paragraphs.map((text) => (
              <p key={text} className="block leading-none mb-0">
                {text}
              </p>
            ))}
            <ul className="list-disc ml-5 space-y-1">
              {privacy.sections.noPii.bullets?.map((item) => <li key={item} className="leading-none">{item}</li>)}
            </ul>
          </div>

          {/* Секция 2 - Data Collection */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{privacy.sections.dataCollection.title}</p>
            <p className="block leading-none mb-0">{privacy.sections.dataCollection.paragraphs[0]}</p>
            <ul className="list-disc ml-5 space-y-1">
              {privacy.sections.dataCollection.bullets?.map((item) => <li key={item} className="leading-none">{item}</li>)}
            </ul>
            <p className="block leading-none mb-0">{privacy.sections.dataCollection.paragraphs[1]}</p>
          </div>

          {/* Секция 3 - Telegram Integration */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{privacy.sections.telegramIntegration.title}</p>
            <p className="block leading-none mb-0">{privacy.sections.telegramIntegration.paragraphs[0]}</p>
            <ul className="list-disc ml-5 space-y-1">
              {privacy.sections.telegramIntegration.bullets?.map((item) => <li key={item} className="leading-none">{item}</li>)}
            </ul>
          </div>

          {/* Секция 4 - Contact */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{privacy.sections.contact.title}</p>
            <p className="leading-none mb-0">{privacy.sections.contact.paragraphs[0]}</p>
          </div>
          
          <p className="block leading-none">
            {privacy.closing}
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