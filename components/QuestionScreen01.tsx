// Импортируем необходимые хуки и SVG пути
import { useState, useRef, useEffect } from 'react';
import svgPaths from "../imports/svg-c5dzwxr04w";
import { BottomFixedButton } from "./BottomFixedButton";
import { useStore } from '@nanostores/react';
import { cardsMessages } from '@/src/i18n/messages/cards';
import { navigationMessages } from '@/src/i18n/messages/navigation';
import { FormScreenLayout } from './FormScreenLayout';

// Типы для пропсов компонента
interface QuestionScreen01Props {
  onBack: () => void; // Функция для возврата к предыдущему экрану
  onNext: (answer: string) => void; // Функция для перехода к следующему экрану с ответом
  cardId: string; // ID карточки
  cardTitle?: string; // Название карточки (опционально)
  questionText?: string; // Текст вопроса (опционально)
}

/**
 * Адаптивный компонент световых эффектов для фона
 */
// Light переиспользуется из общего компонента



/**
 * Адаптивная иконка замка для блока шифрования
 */
function LockShieldFilled() {
  return (
    <div className="relative shrink-0 size-7" data-name="Lock Shield Filled">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Lock Shield Filled">
          <path d={svgPaths.p70b1000} fill="var(--fill-0, #8a8a8a)" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Адаптивный блок информации о шифровании
 */
function EncryptInfoBlock() {
  const cards = useStore(cardsMessages);
  
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full max-w-[351px]"
      data-name="Encrypt_info_block"
    >
      <LockShieldFilled />
      <div className="typography-caption text-[#8a8a8a] text-left flex-1">
        <p className="block">{cards.question.encryption}</p>
      </div>
    </div>
  );
}

/**
 * Адаптивный блок текстового поля для ввода ответа
 */
function InputAnswerBlock({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматически изменяем высоту textarea при вводе текста
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  return (
    <div
      className="bg-[rgba(217,217,217,0.04)] box-border content-stretch flex flex-col gap-2.5 min-h-[340px] sm:min-h-[360px] md:min-h-[383px] items-start justify-start p-[20px] relative rounded-xl shrink-0 w-full max-w-[351px]"
      data-name="Input answer block"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl"
      />
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="typography-body bg-transparent border-none outline-none resize-none text-[#cfcfcf] text-left w-full h-full placeholder:text-[#8a8a8a] min-h-[280px] sm:min-h-[300px] md:min-h-[320px]"
        style={{ overflow: 'hidden' }}
        onInput={adjustTextareaHeight}
      />
    </div>
  );
}

/**
 * Адаптивный блок ответа с полем ввода и информацией о шифровании
 */
function AnswerBlock({ answer, onAnswerChange }: { answer: string; onAnswerChange: (value: string) => void }) {
  const cards = useStore(cardsMessages);
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative shrink-0 w-full max-w-[351px]"
      data-name="Answer block"
    >
      <InputAnswerBlock 
        value={answer}
        onChange={onAnswerChange}
        placeholder={cards.question.placeholder}
      />
      <EncryptInfoBlock />
    </div>
  );
}

/**
 * Адаптивный контентный блок с вопросом и полем ответа
 */
function ContentBlock({ questionText, answer, onAnswerChange }: { 
  questionText: string; 
  answer: string; 
  onAnswerChange: (value: string) => void; 
}) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start w-full"
      data-name="Content block"
    >
      <div className="typography-body min-h-[40px] sm:min-h-[44px] text-[#ffffff] text-left w-full">
        <p className="block">{questionText}</p>
      </div>
      <AnswerBlock answer={answer} onAnswerChange={onAnswerChange} />
    </div>
  );
}



/**
 * Главный компонент экрана первого вопроса карточки
 * Адаптивный дизайн с поддержкой mobile-first подхода
 */
export function QuestionScreen01({ onBack, onNext, cardId, cardTitle: _cardTitle, questionText }: QuestionScreen01Props) {
  const nav = useStore(navigationMessages);
  
  // Состояние для хранения ответа пользователя
  const [answer, setAnswer] = useState('');
  
  // Вопрос по умолчанию, если не передан
  const defaultQuestionText = "What in other people's behavior most often irritates or offends you?";
  
  /**
   * Функция для обработки кнопки "Next"
   * Переходит к следующему экрану с ответом пользователя
   */
  const handleNext = () => {
    if (answer.trim()) {
      console.log(`Question 1 answer for card: ${cardId}`, answer);
      onNext(answer.trim());
    }
  };

  /**
   * Функция для обработки кнопки "Back" 
   * Возвращается к предыдущему экрану
   */
  const _handleBack = () => {
    console.log(`Going back from question 1 for card: ${cardId}`);
    onBack();
  };

  /**
   * Функция для обработки изменения ответа
   */
  const handleAnswerChange = (value: string) => {
    setAnswer(value);
  };

  return (
    <FormScreenLayout dataName="Question Answer 01"
      bottomActions={
        <BottomFixedButton 
          onClick={handleNext}
          disabled={!answer.trim()}
        >
          {nav.next}
        </BottomFixedButton>
      }
    >
      <ContentBlock 
        questionText={questionText || defaultQuestionText}
        answer={answer}
        onAnswerChange={handleAnswerChange}
      />
    </FormScreenLayout>
  );
}