import React, { useEffect, useState } from 'react'

import { QuestionScreen01 } from '@/components/QuestionScreen01'
import { QuestionScreen02 } from '@/components/QuestionScreen02'
import { FinalCardMessageScreen } from '@/components/FinalCardMessageScreen'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useContent } from '@/components/ContentContext'

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
  const { getUI } = useContent()
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

  const questionText = questions[0] || getUI().cards.questionNotFound

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
  const { getUI } = useContent()
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

  const questionText = questions[1] || getUI().cards.questionNotFound

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
  const { getUI } = useContent()
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
          finalMessage: getUI().cards.techniqueNotFound || 'Technique not found',
          practiceTask: getUI().cards.practiceTaskNotFound || 'Practice task not found',
          whyExplanation: getUI().cards.explanationNotFound || 'Explanation not found',
        })
      } finally {
        setLoading(false)
      }
    }
    void loadMessageData()
  }, [cardId, currentLanguage, getCardMessageData, getUI])

  if (loading) {
    return <LoadingScreen />
  }

  if (!messageData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-white text-center">
          <div className="text-lg text-red-400">{getUI().common.error || 'Error'}</div>
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
