import { useTelegramBackButton } from '../../utils/useTelegramBackButton';
import { useEffect, useState } from 'react';
import { isTelegramWebAppAvailable } from '@/src/effects/telegram.effects';

interface BackButtonProps {
  onBack?: () => void;
  fallbackIcon?: boolean;
  isHomePage?: boolean;
}

export function BackButton({ onBack, fallbackIcon: _fallbackIcon = true, isHomePage = false }: BackButtonProps) {
  const [_isTelegramWebAppAvailable, setIsTelegramWebAppAvailable] = useState(false);
  
  // Определяем функцию возврата - используем переданную или возвращаемся в историю
  const handleBack = onBack || (() => window.history.back());
  
  // Инициализация проверки Telegram WebApp
  useEffect(() => {
    setIsTelegramWebAppAvailable(isTelegramWebAppAvailable());
  }, []);
  
  // Используем хук для Telegram Back Button только если не на главной странице
  useTelegramBackButton(!isHomePage, handleBack);
  
  // Не отображаем визуальную кнопку - только функциональность через Telegram WebApp
  return null;
}
