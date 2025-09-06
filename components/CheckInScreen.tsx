import { useState, useRef, useCallback, useEffect } from 'react';
import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

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
  const { content } = useContent();
  
  return (
    <BottomFixedButton 
      onClick={onClick}
      disabled={disabled}
    >
      {content.ui.checkin.send}
    </BottomFixedButton>
  );
}

function HeroBlockQuestion() {
  const { content } = useContent();
  
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full"
      data-name="Hero_block_question"
    >
      <div className="typography-h1 text-[#e1ff00] w-full">
        <h1 className="block">{content.ui.checkin.title}</h1>
      </div>
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">{content.ui.checkin.subtitle}</p>
      </div>
    </div>
  );
}

function MoodProgressBar({ 
  selectedMood, 
  onMoodChange,
  moodOptions
}: { 
  selectedMood: number | null; 
  onMoodChange: (mood: number) => void;
  moodOptions: MoodOption[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateMoodFromPosition = useCallback((clientX: number): number => {
    if (!trackRef.current) return 2;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(percentage * (moodOptions.length - 1));
  }, [moodOptions.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const moodIndex = calculateMoodFromPosition(e.clientX);
    onMoodChange(moodIndex);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const moodIndex = calculateMoodFromPosition(e.clientX);
    onMoodChange(moodIndex);
  }, [isDragging, onMoodChange, calculateMoodFromPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      className="relative h-2 w-full bg-[rgba(217,217,217,0.1)] rounded-full cursor-pointer"
    >
      <div 
        className="absolute h-full bg-gradient-to-r from-[#666666] via-[#ff6b6b] via-[#ffd93d] via-[#6bcf7f] to-[#4ecdc4] rounded-full"
        style={{ width: selectedMood !== null ? `${((selectedMood + 1) / moodOptions.length) * 100}%` : '0%' }}
      />
    </div>
  );
}

function MoodDisplay({ selectedMood, moodOptions }: { selectedMood: number | null; moodOptions: MoodOption[] }) {
  if (selectedMood === null || !moodOptions[selectedMood]) {
    return (
      <div className="text-center">
        <div className="typography-body text-white">Выберите настроение</div>
      </div>
    );
  }

  const mood = moodOptions[selectedMood];
  
  return (
    <div className="text-center">
      <div 
        className="w-8 h-8 rounded-full mx-auto mb-2"
        style={{ backgroundColor: mood.color }}
      />
      <div className="typography-body text-white">{mood.label}</div>
    </div>
  );
}

function MoodContainer({ 
  selectedMood, 
  onMoodChange,
  moodOptions
}: { 
  selectedMood: number | null; 
  onMoodChange: (mood: number) => void;
  moodOptions: MoodOption[];
}) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-10 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <MoodDisplay selectedMood={selectedMood} moodOptions={moodOptions} />
      <div className="h-[30px] w-full">
        <MoodProgressBar selectedMood={selectedMood} onMoodChange={onMoodChange} moodOptions={moodOptions} />
      </div>
    </div>
  );
}

function ContentContainer({ 
  selectedMood, 
  onMoodChange,
  moodOptions
}: { 
  selectedMood: number | null; 
  onMoodChange: (mood: number) => void;
  moodOptions: MoodOption[];
}) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-20 items-center justify-start p-0 relative size-full"
      data-name="Container"
    >
      <HeroBlockQuestion />
      <MoodContainer selectedMood={selectedMood} onMoodChange={onMoodChange} moodOptions={moodOptions} />
    </div>
  );
}

export function CheckInScreen({ onSubmit, onBack: _onBack }: CheckInScreenProps) {
  const { content } = useContent();
  const [selectedMood, setSelectedMood] = useState<number | null>(2);

  // Создаем MOOD_OPTIONS с переводами и обновляем глобальную переменную
  const moodOptions: MoodOption[] = [
    { id: 'down', label: content.ui.checkin.moodOptions.down, value: 0, color: '#666666' },
    { id: 'anxious', label: content.ui.checkin.moodOptions.anxious, value: 1, color: '#ff6b6b' },
    { id: 'neutral', label: content.ui.checkin.moodOptions.neutral, value: 2, color: '#ffd93d' },
    { id: 'energized', label: content.ui.checkin.moodOptions.energized, value: 3, color: '#6bcf7f' },
    { id: 'happy', label: content.ui.checkin.moodOptions.happy, value: 4, color: '#4ecdc4' }
  ];


  const handleMoodChange = (moodIndex: number) => {
    setSelectedMood(moodIndex);
  };

  const handleSubmit = () => {
    if (selectedMood !== null) {
      const moodData = moodOptions[selectedMood];
      
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
            <ContentContainer selectedMood={selectedMood} onMoodChange={handleMoodChange} moodOptions={moodOptions} />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <SendButton onClick={handleSubmit} disabled={!canSubmit} />

    </div>
  );
}