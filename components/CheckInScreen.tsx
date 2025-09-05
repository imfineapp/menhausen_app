import { useState, useRef, useCallback, useEffect } from 'react';
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';

interface CheckInScreenProps {
  onSubmit: (mood: string) => void;
  onBack: () => void;
}

interface MoodOption {
  id: string;
  label: string;
  value: number;
  color: string;
}
const MOOD_OPTIONS: MoodOption[] = [
  { id: 'down', label: "I'm feeling down...", value: 0, color: '#666666' },
  { id: 'anxious', label: "I'm anxious", value: 1, color: '#ff6b6b' },
  { id: 'neutral', label: "I'm neutral", value: 2, color: '#ffd93d' },
  { id: 'energized', label: "I'm energized", value: 3, color: '#6bcf7f' },
  { id: 'happy', label: "I'm happy!", value: 4, color: '#4ecdc4' }
];

function Light() {
  return (
    <div
      className="absolute h-[130px] top-[-65px] translate-x-[-50%] w-[185px]"
      data-name="Light"
      style={{ left: "calc(50% + 2px)" }}
    >
      <div className="absolute inset-[-196.15%_-137.84%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 695 640">
          <g id="Light">
            <g filter="url(#filter0_f_1_395)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_1_395"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_395" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SendButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <BottomFixedButton 
      onClick={onClick}
      disabled={disabled}
    >
      Send
    </BottomFixedButton>
  );
}

function HeroBlockQuestion() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full"
      data-name="Hero_block_question"
    >
      <div className="font-heading font-normal relative shrink-0 text-[#e1ff00] text-[36px] w-full">
        <p className="block leading-[0.8]">How are you?</p>
      </div>
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">{`Check in with yourself — it's the first step to self-care! Do it everyday.`}</p>
      </div>
    </div>
  );
}

function MoodProgressBar({ 
  selectedMood, 
  onMoodChange 
}: { 
  selectedMood: number | null; 
  onMoodChange: (mood: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateMoodFromPosition = (clientX: number): number => {
    if (!trackRef.current) return 2;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    const moodIndex = Math.round(percentage * 4);
    return moodIndex;
  };

  // Обработчики для мыши
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const mood = calculateMoodFromPosition(e.clientX);
    onMoodChange(mood);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const mood = calculateMoodFromPosition(e.clientX);
    onMoodChange(mood);
  }, [isDragging, onMoodChange]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Обработчики для сенсорных событий
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const mood = calculateMoodFromPosition(touch.clientX);
    onMoodChange(mood);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const mood = calculateMoodFromPosition(touch.clientX);
      onMoodChange(mood);
      
      // Предотвращаем скроллинг страницы при перетаскивании
      e.preventDefault();
    }
  }, [isDragging, onMoodChange]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      const mood = calculateMoodFromPosition(e.clientX);
      onMoodChange(mood);
    }
  };

  // Регистрируем обработчики событий
  useEffect(() => {
    if (isDragging) {
      // Обработчики для мыши
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Обработчики для сенсорных событий
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
      
      return () => {
        // Удаляем обработчики для мыши
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Удаляем обработчики для сенсорных событий
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

  const fillWidth = selectedMood !== null ? Math.max(30, (selectedMood / 4) * 351) : 186;

  return (
    <div className="bg-[#2d2b2b] relative rounded-xl h-[30px] w-full" data-name="Mood_prograssbar">
      {/* Заполняющая полоса */}
      <div 
        className="absolute bg-[#e1ff00] h-[30px] left-0 rounded-xl top-0" 
        style={{ width: `${fillWidth}px` }}
        data-name="Block"
      >
        <div
          aria-hidden="true"
          className="absolute border-2 border-[#2d2b2b] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      
      {/* Визуальный ползунок для перетаскивания */}
      {selectedMood !== null && (
        <div 
          className="absolute h-[34px] w-[34px] bg-white rounded-full border-4 border-[#e1ff00] top-[-2px] cursor-grab"
          style={{ 
            left: `${(selectedMood / 4) * 100}%`,
            transform: 'translateX(-50%)',
            boxShadow: '0 0 10px rgba(225, 255, 0, 0.5)'
          }}
          data-name="Slider"
        />
      )}
      
      {/* Подсказка для пользователя */}
      <div className="absolute -top-8 left-0 right-0 text-center text-[#999999] text-sm">
        Перетащите ползунок для выбора настроения
      </div>
      
      {/* Область для взаимодействия */}
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="absolute inset-0 cursor-pointer select-none"
        style={{ touchAction: 'none' }}
      />
      
      {/* Метки */}
      {MOOD_OPTIONS.map((_, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0 w-1 pointer-events-none"
          style={{ left: `${(index / 4) * 100}%` }}
        />
      ))}
    </div>
  );
}

function MoodDisplay({ selectedMood }: { selectedMood: number | null }) {
  const currentMood = selectedMood !== null ? MOOD_OPTIONS[selectedMood] : MOOD_OPTIONS[2];

  return (
    <div className="h-[26px] relative shrink-0 w-full" data-name="I'm feeling down...">
      <div className="absolute font-['Kreon:Regular',_sans-serif] font-normal inset-0 leading-[0] text-[#ffffff] text-[32px] text-center">
        <p className="block leading-[0.8]">
          {currentMood.label}
        </p>
      </div>
    </div>
  );
}

function MoodContainer({ 
  selectedMood, 
  onMoodChange 
}: { 
  selectedMood: number | null; 
  onMoodChange: (mood: number) => void;
}) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-10 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <MoodDisplay selectedMood={selectedMood} />
      <div className="h-[30px] w-full">
        <MoodProgressBar selectedMood={selectedMood} onMoodChange={onMoodChange} />
      </div>
    </div>
  );
}

function ContentContainer({ 
  selectedMood, 
  onMoodChange 
}: { 
  selectedMood: number | null; 
  onMoodChange: (mood: number) => void;
}) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-20 items-center justify-start p-0 relative size-full"
      data-name="Container"
    >
      <HeroBlockQuestion />
      <MoodContainer selectedMood={selectedMood} onMoodChange={onMoodChange} />
    </div>
  );
}

export function CheckInScreen({ onSubmit, onBack: _onBack }: CheckInScreenProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(2);

  const handleMoodChange = (moodIndex: number) => {
    setSelectedMood(moodIndex);
  };

  const handleSubmit = () => {
    if (selectedMood !== null) {
      const moodData = MOOD_OPTIONS[selectedMood];
      
      // Логируем данные о настроении
      console.log('Mood check-in:', {
        mood_id: moodData.id,
        mood_label: moodData.label,
        mood_value: moodData.value,
        timestamp: new Date().toISOString()
      });
      
      onSubmit(moodData.label);
    }
  };

  const canSubmit = selectedMood !== null;

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Основной контент */}
            <ContentContainer selectedMood={selectedMood} onMoodChange={handleMoodChange} />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <SendButton onClick={handleSubmit} disabled={!canSubmit} />

    </div>
  );
}