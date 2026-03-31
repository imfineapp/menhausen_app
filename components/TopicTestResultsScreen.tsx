import { BottomFixedButton } from './BottomFixedButton'
import { MiniStripeLogo } from './ProfileLayoutComponents'
import { Light } from './ProfileLayoutComponents'
import { useStore } from '@nanostores/react'
import { useContent } from './ContentContext'
import { homeMessages } from '@/src/i18n/messages/home'
import { navigationMessages } from '@/src/i18n/messages/navigation'

type TopicTestResultsScreenProps = {
  themeTitle: string
  percentage: number
  onContinue: () => void
  onBack: () => void
}

export function TopicTestResultsScreen({ themeTitle, percentage, onContinue, onBack }: TopicTestResultsScreenProps) {
  const { content } = useContent()
  const home = useStore(homeMessages)
  const nav = useStore(navigationMessages)
  const template = home.themeMatchPercentage
  const line = template.replace('{percentage}', String(Math.round(percentage)))

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden bg-[#111111] flex flex-col">
      <Light />
      <MiniStripeLogo />

      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[100px] pb-[200px]">
          <div className="max-w-[351px] mx-auto text-center">
            <button
              type="button"
              onClick={onBack}
              className="typography-body text-[#8a8a8a] mb-8 hover:text-white min-h-[44px] self-start"
            >
              ← {nav.back}
            </button>
            <h1 className="typography-h1 text-white mb-4">{themeTitle}</h1>
            <p className="typography-h2 text-[#e1ff00] mb-6">{line}</p>
            <p className="typography-body text-[#d4d4d4]">{content.psychologicalTest?.results?.subtitle ?? ''}</p>
          </div>
        </div>
      </div>

      <BottomFixedButton onClick={onContinue} dataName="Topic test continue" ariaLabel="Continue">
        {content.psychologicalTest?.results?.buttonText ?? nav.next}
      </BottomFixedButton>
    </div>
  )
}
