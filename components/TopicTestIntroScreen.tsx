import { BottomFixedButton } from './BottomFixedButton'
import { MiniStripeLogo } from './ProfileLayoutComponents'
import { Light } from './ProfileLayoutComponents'
import { useContent } from './ContentContext'

type TopicTestIntroScreenProps = {
  themeTitle: string
  onNext: () => void
  onBack: () => void
}

/**
 * Segment C: short intro before 5 topic-specific Likert questions.
 */
export function TopicTestIntroScreen({ themeTitle, onNext, onBack }: TopicTestIntroScreenProps) {
  const { content } = useContent()
  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      <Light />
      <MiniStripeLogo />

      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">
            <button
              type="button"
              onClick={onBack}
              className="typography-body text-[#8a8a8a] mb-8 hover:text-white min-h-[44px]"
            >
              ← {content.ui.navigation.back}
            </button>
            <h1 className="typography-h1 text-white mb-6">{themeTitle}</h1>
            <p className="typography-body text-[#d4d4d4] whitespace-pre-line leading-relaxed">
              {content.psychologicalTest?.instruction ??
                'Answer 5 short questions so we can show how well this topic fits you right now.'}
            </p>
          </div>
        </div>
      </div>

      <BottomFixedButton onClick={onNext} dataName="Topic test start" ariaLabel="Start">
        {content.ui.navigation.next}
      </BottomFixedButton>
    </div>
  )
}
