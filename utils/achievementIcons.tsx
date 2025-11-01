/**
 * Утилита для получения иконок достижений из lucide-react
 */

import React from 'react';
import {
  UserPlus,
  Sprout,
  Search,
  School,
  CheckCircle,
  BookOpen,
  Key,
  Archive,
  Award,
  Compass,
  MapPin,
  Share2,
  Globe,
  ShieldCheck,
  Repeat,
  Sparkles,
  Scale,
  Lightbulb,
  Users,
  Brain,
  Anchor,
  Sword,
  Shield,
  UserCheck,
  Map,
  ZapOff,
  Trophy,
  Library,
  Crown,
  Target,
  Flame,
  Calendar,
  Smile,
  Sunrise,
  Moon
} from 'lucide-react';

/**
 * Маппинг имен иконок на компоненты
 */
const iconMap: Record<string, React.ComponentType<any>> = {
  'user-plus': UserPlus,
  'sprout': Sprout,
  'search': Search,
  'school': School,
  'check-circle': CheckCircle,
  'book-open': BookOpen,
  'key': Key,
  'archive': Archive,
  'award': Award,
  'compass': Compass,
  'map-pin': MapPin,
    'book-heart': BookOpen, // BookHeart не существует в lucide-react, используем BookOpen
  'share-2': Share2,
  'globe': Globe,
  'shield-check': ShieldCheck,
  'repeat': Repeat,
  'sparkles': Sparkles,
  'scale': Scale,
  'lightbulb': Lightbulb,
  'users': Users,
  'brain': Brain,
  'anchor': Anchor,
  'sword': Sword,
  'shield': Shield,
  'user-check': UserCheck,
  'map': Map,
  'zap-off': ZapOff,
  'trophy': Trophy,
  'library': Library,
  'crown': Crown,
  'target': Target,
  'flame': Flame,
  'calendar': Calendar,
  'smile': Smile,
  'sunrise': Sunrise,
  'moon': Moon
};

/**
 * Получение компонента иконки по имени
 */
export function getAchievementIcon(iconName: string, props?: any): React.ReactNode {
  const IconComponent = iconMap[iconName.toLowerCase()];
  
  if (!IconComponent) {
    console.warn(`Icon not found: ${iconName}, using default Award icon`);
    const DefaultIcon = iconMap['award'] || Award;
    return <DefaultIcon {...props} />;
  }
  
  return <IconComponent {...props} />;
}

/**
 * Получение всех доступных имен иконок
 */
export function getAvailableIconNames(): string[] {
  return Object.keys(iconMap);
}

