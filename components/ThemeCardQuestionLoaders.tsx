import React, { useEffect, useState } from 'react'

import { QuestionScreen01 } from '@/components/QuestionScreen01'
import { QuestionScreen02 } from '@/components/QuestionScreen02'
import { FinalCardMessageScreen } from '@/components/FinalCardMessageScreen'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useStore } from '@nanostores/react'
import { cardsMessages } from '@/src/i18n/messages/cards'
import { commonMessages } from '@/src/i18n/messages/common'

export function QuestionScreen01WithLoader({
  onBack,
  onNext,
  cardId,
  cardTitle,
  getCardQuestions,
  currentLanguage,
}: {
  onBack: () => void
  onNext: (answer: string) => void
  cardId: string
  cardTitle: string
  getCardQuestions: (cardId: string, language: string) => Promise<string[]>
  currentLanguage: string
}) {
  const cards = useStore(cardsMessages)
  const [questions, setQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const cardQuestions = await getCardQuestions(cardId, currentLanguage)
        setQuestions(cardQuestions)
      } catch (error) {
        console.error('Error loading questions:', error)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    void loadQuestions()
  }, [cardId, currentLanguage, getCardQuestions])

  if (loading) {
    return <LoadingScreen />
  }

  const questionText = questions[0] || ''

  return (
    <QuestionScreen01
      onBack={onBack}
      onNext={onNext}
      cardId={cardId}
      cardTitle={cardTitle}
      questionText={questionText}
    />
  )
}

export function QuestionScreen02WithLoader({
  onBack,
  onNext,
  cardId,
  cardTitle,
  getCardQuestions,
  currentLanguage,
  previousAnswer,
}: {
  onBack: () => void
  onNext: (answer: string) => void
  cardId: string
  cardTitle: string
  getCardQuestions: (cardId: string, language: string) => Promise<string[]>
  currentLanguage: string
  previousAnswer: string
}) {
  const cards = useStore(cardsMessages)
  const [questions, setQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const cardQuestions = await getCardQuestions(cardId, currentLanguage)
        setQuestions(cardQuestions)
      } catch (error) {
        console.error('Error loading questions:', error)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    void loadQuestions()
  }, [cardId, currentLanguage, getCardQuestions])

  if (loading) {
    return <LoadingScreen />
  }

  const questionText = questions[1] || ''

  return (
    <QuestionScreen02
      onBack={onBack}
      onNext={onNext}
      cardId={cardId}
      cardTitle={cardTitle}
      questionText={questionText}
      previousAnswer={previousAnswer}
    />
  )
}

export function FinalCardMessageScreenWithLoader({
  onBack,
  onNext,
  cardId,
  cardTitle,
  getCardMessageData,
  currentLanguage,
}: {
  onBack: () => void
  onNext: () => void
  cardId: string
  cardTitle: string
  getCardMessageData: (
    cardId: string,
    language: string
  ) => Promise<{
    finalMessage: string
    practiceTask: string
    whyExplanation: string
  }>
  currentLanguage: string
}) {
  const cards = useStore(cardsMessages)
  const common = useStore(commonMessages)
  const [messageData, setMessageData] = useState<{
    finalMessage: string
    practiceTask: string
    whyExplanation: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMessageData = async () => {
      try {
        const data = await getCardMessageData(cardId, currentLanguage)
        setMessageData(data)
      } catch (error) {
        console.error('Error loading message data:', error)
        setMessageData({
          finalMessage: cards.noAttempts ?? '',
          practiceTask: cards.startExercise ?? '',
          whyExplanation: '',
        })
      } finally {
        setLoading(false)
      }
    }
    void loadMessageData()
  }, [cardId, cards.noAttempts, cards.startExercise, currentLanguage, getCardMessageData])

  if (loading) {
    return <LoadingScreen />
  }

  if (!messageData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg text-red-400">{common.error}</div>
        </div>
      </div>
    )
  }

  return (
    <FinalCardMessageScreen
      onBack={onBack}
      onNext={onNext}
      cardId={cardId}
      cardTitle={cardTitle}
      finalMessage={messageData.finalMessage}
      practiceTask={messageData.practiceTask}
      whyExplanation={messageData.whyExplanation}
    />
  )
}
