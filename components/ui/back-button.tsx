import { useTelegramBackButton } from '../../utils/useTelegramBackButton'
import { useEffect, useMemo, useState } from 'react'
import { isTelegramWebAppAvailable } from '@/src/effects/telegram.effects'
import { useStore } from '@nanostores/react'
import { $backButtonOverride } from '@/src/stores/back-button-override.store'

interface BackButtonProps {
  onBack?: () => void
  fallbackIcon?: boolean
  isHomePage?: boolean
}

export function BackButton({ onBack, fallbackIcon: _fallbackIcon = true, isHomePage = false }: BackButtonProps) {
  const _override = useStore($backButtonOverride)
  const [_isTelegramWebAppAvailable, setIsTelegramWebAppAvailable] = useState(false)
  
  // Определяем функцию возврата - используем переданную или возвращаемся в историю
  const handleBack = useMemo(() => _override?.onBack ?? onBack ?? (() => window.history.back()), [_override?.onBack, onBack])
  const isVisible = useMemo(() => _override?.isVisible ?? !isHomePage, [_override?.isVisible, isHomePage])
  
  // Инициализация проверки Telegram WebApp
  useEffect(() => {
    setIsTelegramWebAppAvailable(isTelegramWebAppAvailable())
  }, [])
  
  // Используем хук для Telegram Back Button только если не на главной странице
  useTelegramBackButton(isVisible, handleBack)
  
  // Не отображаем визуальную кнопку - только функциональность через Telegram WebApp
  return null
}
