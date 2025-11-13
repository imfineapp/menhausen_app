// ========================================================================================
// ЭКРАН ИНСТРУКЦИИ ПСИХОЛОГИЧЕСКОГО ТЕСТА
// ========================================================================================

import { BottomFixedButton } from './BottomFixedButton';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './ProfileLayoutComponents';
import { useContent } from './ContentContext';

interface PsychologicalTestInstructionScreenProps {
  onNext: () => void;
}

/**
 * Компонент большого логотипа SVG
 * Размещается между MiniStripeLogo и основным контентом
 */
function BigLogo() {
  return (
    <div className="flex justify-center items-center w-full mb-8">
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
        <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M269.881 486.487C262.541 493.838 250.643 493.838 243.303 486.487L123.686 366.701C116.352 359.35 116.348 347.434 123.686 340.086C131.025 332.738 142.923 332.741 150.264 340.086L237.797 427.743L237.797 248.237L178.505 248.237C168.009 248.237 159.5 239.913 159.5 229.644C159.5 219.376 168.009 211.053 178.505 211.053L237.797 211.053L237.797 172.032C237.797 171.868 237.799 171.704 237.804 171.541C204.675 163.168 180.157 133.164 180.157 97.4335C180.157 55.2202 214.378 20.9999 256.592 20.9999C298.805 21 333.026 55.2202 333.026 97.4335C333.026 133.164 308.509 163.167 275.381 171.541C275.385 171.704 275.387 171.868 275.387 172.032L275.387 211.053L330.547 211.053C341.043 211.053 349.553 219.376 349.553 229.644C349.553 239.913 341.043 248.237 330.547 248.237L275.387 248.237L275.387 427.743L362.92 340.086C370.26 332.741 382.16 332.737 389.498 340.086C396.836 347.434 396.832 359.35 389.498 366.701L269.881 486.487ZM256.592 135.651C277.698 135.651 294.809 118.54 294.809 97.4335C294.808 76.327 277.698 59.2168 256.592 59.2167C235.485 59.2167 218.375 76.3269 218.375 97.4335C218.375 118.54 235.485 135.651 256.592 135.651Z" fill="#E1FF00"/>
        </svg>
      </div>
    </div>
  );
}

/**
 * Экран инструкции психологического теста
 * Показывает инструкции по прохождению теста
 */
export function PsychologicalTestInstructionScreen({ onNext }: PsychologicalTestInstructionScreenProps) {
  const { content } = useContent();
  const testContent = content.psychologicalTest;

  if (!testContent) {
    return (
      <div className="w-full h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white">Error loading test content</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      {/* Световые эффекты */}
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      {/* Центральный блок контента с равными отступами */}
      <div className="flex-1 flex flex-col justify-center items-center px-[16px] sm:px-[20px] md:px-[21px]">
        <div className="max-w-[351px] mx-auto flex flex-col items-center justify-center gap-12">
          {/* Большой логотип SVG */}
          <BigLogo />
          
          {/* Текст инструкции */}
          <div className="text-center">
            <div className="typography-body text-[#d4d4d4] whitespace-pre-line leading-relaxed">
              {testContent.instruction}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <BottomFixedButton
        onClick={onNext}
        dataName="Next button"
        ariaLabel="Next"
      >
        {content.ui.navigation.next}
      </BottomFixedButton>
    </div>
  );
}

