// Импортируем SVG пути для страницы Terms of Use
import svgPaths from "../imports/svg-k77qyw9djl";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useLanguage } from './LanguageContext';

// Типы для пропсов компонента
interface TermsOfUseScreenProps {
  onBack: () => void; // Функция для возврата к предыдущему экрану
}

/**
 * Компонент световых эффектов для фона
 * Идентичен эффектам на первом экране онбординга
 */
// Light переиспользуется из общего компонента

/**
 * Главный контент страницы Terms of Use
 * Содержит заголовок и весь текст документа на английском языке
 */
function MainContent() {
  const { language } = useLanguage();
  
  const getText = (ruText: string, enText: string) => {
    return language === 'ru' ? ruText : enText;
  };
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-10 items-start justify-start leading-[0] px-[21px] pt-[100px] w-full max-w-[351px] mx-auto"
      data-name="main_content"
    >
      {/* Заголовок страницы */}
      <div className="typography-h2 text-[#e1ff00] text-center w-full">
        <h2 className="block">{getText('Условия использования', 'Terms of use')}</h2>
      </div>
      
      {/* Контейнер для прокручиваемого контента */}
      <div className="typography-caption text-[#ffffff] text-left w-full overflow-y-auto pr-2 h-[calc(100vh-180px)]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="space-y-4">
          <p className="block leading-none mb-0">{getText('Последнее обновление: 2 августа 2025', 'Last updated: August 2, 2025')}</p>
          <p className="block leading-none mb-0">
            {getText('ВНИМАТЕЛЬНО ПРОЧТИТЕ ЭТИ УСЛОВИЯ ПЕРЕД ИСПОЛЬЗОВАНИЕМ СЕРВИСА.', 'PLEASE READ THESE TERMS CAREFULLY BEFORE USING THIS SERVICE.')}
          </p>
          <p className="block leading-none mb-0">
            {getText('Эти Условия использования ("Условия") регулируют ваш доступ к сервису Menhausen (далее "Сервис") и его использование. Сервис представляет собой цифровую платформу самопомощи, предназначенную для поддержки психического благополучия. Получая доступ к Сервису или используя его, вы соглашаетесь соблюдать эти Условия. Если вы не согласны с этими Условиями, пожалуйста, не используйте Сервис.', 'These Terms of Use ("Terms") govern your access to and use of Menhausen (the "Service"), a self-help digital platform designed to support mental well-being. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the Service.')}
          </p>
          
          {/* Секция 1 - Legal Disclaimer */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('1. Правовое уведомление — Не медицинский совет', '1. Legal Disclaimer — No Medical Advice')}</p>
            <p className="block leading-none mb-0">
              {getText('Menhausen не является медицинской или психиатрической службой. Контент, предоставляемый через Сервис, включая интерактивные карточки, отслеживание настроения и упражнения, предназначен только для информационных и саморефлексивных целей.', 'Menhausen is not a medical or psychiatric service. The content provided through the Service, including interactive cards, mood tracking, and exercises, is intended for informational and self-reflective purposes only.')}
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">
                {getText('Сервис не диагностирует, не лечит и не излечивает психические расстройства.', 'The Service does not diagnose, treat, or cure any mental health condition.')}
              </li>
              <li className="leading-none">
                {getText('Мы не лицензированные терапевты, клиницисты или поставщики медицинских услуг.', 'We are not licensed therapists, clinicians, or healthcare providers.')}
              </li>
              <li className="leading-none">
                {getText('Если вы переживаете психический кризис, суицидальные мысли или любую другую медицинскую чрезвычайную ситуацию, немедленно обратитесь за помощью к квалифицированному медицинскому работнику или вызовите службы экстренной помощи.', 'If you are experiencing a mental health crisis, suicidal thoughts, or any other medical emergency, please seek immediate help from a qualified healthcare professional or call emergency services.')}
              </li>
            </ul>
            <p className="block leading-none mb-0">{getText('Использование Сервиса осуществляется на ваш собственный риск.', 'Use of the Service is at your own risk.')}</p>
          </div>

          {/* Секция 2 - No Warranty */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('2. Отсутствие гарантий', '2. No Warranty or Guarantee of Outcomes')}</p>
            <p className="block leading-none mb-0">
              {getText('Menhausen не дает никаких заявлений или гарантий относительно эффективности, точности или результатов использования Сервиса. Мы не гарантируем:', 'Menhausen makes no representations or warranties about the effectiveness, accuracy, or outcomes of using the Service. We do not guarantee:')}
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">{getText('улучшение вашего психического или эмоционального состояния,', 'any improvement in your mental or emotional state,')}</li>
              <li className="leading-none">{getText('облегчение психологического дистресса,', 'any relief from psychological distress,')}</li>
              <li className="leading-none">{getText('изменение поведения или образа жизни.', 'any behavioral or lifestyle change.')}</li>
            </ul>
            <p className="block leading-none mb-0">
              {getText('Все материалы предоставляются "как есть", без каких-либо гарантий, явных или подразумеваемых.', 'All materials are provided "as is", without warranties of any kind, express or implied.')}
            </p>
          </div>

          {/* Секция 3 - Eligibility */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('3. Право на использование', '3. Eligibility')}</p>
            <p className="block leading-none mb-0">{getText('Для использования Сервиса вы должны:', 'To use the Service, you must:')}</p>
            <ul className="list-disc ml-5 space-y-1">
              <li className="leading-none">{getText('быть не моложе 18 лет;', 'be at least 18 years old;')}</li>
              <li className="leading-none">
                {getText('проживать в юрисдикции, где использование таких сервисов юридически разрешено;', 'reside in a jurisdiction where the use of such services is legally permitted;')}
              </li>
              <li className="leading-none">
                {getText('не использовать Сервис в нарушение применимого законодательства или правил.', 'not use the Service in violation of any applicable law or regulation.')}
              </li>
            </ul>
          </div>

          {/* Секция 4 - Privacy */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('4. Конфиденциальность и анонимность', '4. Privacy and Anonymity')}</p>
            <p className="block leading-none mb-0">
              {getText('Мы уважаем вашу конфиденциальность. Мы не собираем личную информацию, если вы явно ее не предоставили. Сервис предназначен для анонимной работы.', 'We respect your privacy. We do not collect personally identifiable information unless explicitly provided by you. The Service is designed to operate anonymously.')}
            </p>
          </div>

          {/* Секция 5 - Contact */}
          <div className="space-y-2">
            <p className="block leading-none mb-0 font-medium">{getText('5. Контактная информация', '5. Contact Information')}</p>
            <p className="leading-none mb-0">
              <span>{getText('По вопросам или проблемам, связанным с этими Условиями, обращайтесь: ', 'For questions or concerns about these Terms, please contact: ')}</span>
              <span className="text-[#e1ff00]">support@menhausen.com</span>
            </p>
          </div>
          
          <p className="block leading-none">
            {getText('Используя Menhausen, вы подтверждаете, что прочитали, поняли и согласились с этими Условиями использования.', 'By using Menhausen, you acknowledge that you have read, understood, and agreed to these Terms of Use.')}
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
 * Главный компонент страницы Terms of Use
 * Отображает полный документ с навигацией
 */
export function TermsOfUseScreen({ onBack: _onBack }: TermsOfUseScreenProps) {
  return (
    <div className="bg-[#111111] relative size-full overflow-hidden" data-name="002_terms of use">
      {/* Световые эффекты фона */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Основной контент документа */}
      <MainContent />
    </div>
  );
}