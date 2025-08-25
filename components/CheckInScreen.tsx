import { useState, useRef, useEffect, useCallback } from 'react';
import svgPaths from "../imports/svg-xgh5f6h0jm";
import { BottomFixedButton } from './BottomFixedButton';

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
      <div className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal relative shrink-0 text-[#e1ff00] text-[36px] w-full">
        <p className="block leading-[0.8]">How are you?</p>
      </div>
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
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

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      const mood = calculateMoodFromPosition(e.clientX);
      onMoodChange(mood);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const fillWidth = selectedMood !== null ? Math.max(30, (selectedMood / 4) * 351) : 186;

  return (
    <div className="bg-[#2d2b2b] relative rounded-xl h-[30px] w-full" data-name="Mood_prograssbar">
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
      
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        onMouseDown={handleMouseDown}
        className="absolute inset-0 cursor-pointer select-none"
      />
      
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

function SymbolBig() {
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

function Menhausen() {
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

function MiniStripeLogo() {
  return (
    <div className="absolute h-[13px] left-1/2 transform -translate-x-1/2 top-[69px] w-[89px]" data-name="Mini_stripe_logo">
      <div className="absolute bottom-0 flex items-center justify-center left-0 right-[91.01%] top-0">
        <div className="flex-none h-[13px] rotate-[180deg] w-2">
          <SymbolBig />
        </div>
      </div>
      <Menhausen />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="absolute left-[21px] size-12 top-[53px] cursor-pointer hover:opacity-80 touch-friendly" 
      data-name="Back Button"
      aria-label="Go back"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Back Button">
          <path
            d="M17 36L5 24L17 12"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </button>
  );
}

export function CheckInScreen({ onSubmit, onBack }: CheckInScreenProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(2);

  const handleMoodChange = (moodIndex: number) => {
    setSelectedMood(moodIndex);
  };

  const handleSubmit = () => {
    if (selectedMood !== null) {
      const moodData = MOOD_OPTIONS[selectedMood];
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
      
      {/* Кнопка назад */}
      <BackButton onBack={onBack} />
      
      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[120px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            
            {/* Основной контент */}
            <ContentContainer selectedMood={selectedMood} onMoodChange={setSelectedMood} />

          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <SendButton onClick={handleSubmit} disabled={selectedMood === null} />

    </div>
  );
}