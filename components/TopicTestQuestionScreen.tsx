import { useState, useEffect } from 'react'
import { MiniStripeLogo } from './ProfileLayoutComponents'
import { Light } from './ProfileLayoutComponents'
import { useStore } from '@nanostores/react'
import { useContent } from './ContentContext'
import { navigationMessages } from '@/src/i18n/messages/navigation'
import { LikertScaleAnswer } from '../types/psychologicalTest'
import { LoadingScreen } from './LoadingScreen'

type TopicTestQuestionScreenProps = {
  /** 1-based index within the 5-question topic test (1..5) */
  stepNumber: number
  /** Global question order from psychologicalTest.json (matches `order` field) */
  questionOrder: number
  onNext: (answer: LikertScaleAnswer) => void
  onBack: () => void
  initialAnswer?: LikertScaleAnswer | null
}

export function TopicTestQuestionScreen({
  stepNumber,
  questionOrder,
  onNext,
  onBack,
  initialAnswer = null,
}: TopicTestQuestionScreenProps) {
  const { content } = useContent()
  const nav = useStore(navigationMessages)
  const testContent = content.psychologicalTest
  const [selectedAnswer, setSelectedAnswer] = useState<LikertScaleAnswer | null>(initialAnswer)

  useEffect(() => {
    setSelectedAnswer(initialAnswer)
  }, [questionOrder, initialAnswer])

  if (!testContent) {
    return <LoadingScreen />
  }

  const question = testContent.questions.find((q) => q.order === questionOrder)
  if (!question) {
    return (
      <div className="w-full h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-white">Question not found</p>
      </div>
    )
  }

  const progress = (stepNumber / 5) * 100

  const answerOptions: Array<{ value: LikertScaleAnswer; label: string }> = [
    { value: 0, label: testContent.likertScale['0'] },
    { value: 1, label: testContent.likertScale['1'] },
    { value: 2, label: testContent.likertScale['2'] },
    { value: 3, label: testContent.likertScale['3'] },
    { value: 4, label: testContent.likertScale['4'] },
  ]

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
              ← {nav.back}
            </button>

            <div className="mb-8">
              <div className="w-full h-1 bg-[#3a3a3a] rounded-full overflow-hidden">
                <div className="h-full bg-[#e1ff00] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="typography-h1 text-white mb-4">{question.text}</h1>
            </div>

            <div className="space-y-3">
              {answerOptions.map((option) => {
                const isSelected = selectedAnswer === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedAnswer(option.value)
                      setTimeout(() => {
                        onNext(option.value)
                      }, 250)
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] min-w-[44px] ${
                      isSelected
                        ? 'border-[#e1ff00] bg-[#e1ff00]/10 text-white'
                        : 'border-[#3a3a3a] bg-[#2a2a2a] text-[#d4d4d4] hover:border-[#4a4a4a] hover:bg-[#333333]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 self-center ${
                          isSelected ? 'border-[#e1ff00] bg-[#e1ff00]' : 'border-[#666666]'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                      <span className="typography-body leading-relaxed">{option.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
