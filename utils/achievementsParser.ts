/**
 * Утилита для парсинга CSV файла с достижениями и генерации JSON структур
 */

interface CSVRow {
  id: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  pointsReward: number;
  iconName: string;
  conditionType: string;
  category: string;
}

interface ParsedAchievement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  pointsReward: number;
  iconName: string;
  conditionType: string | string[];
  category: string;
  conditionValue?: number;
}

/**
 * Парсинг CSV строки в объект
 */
function parseCSVLine(line: string): CSVRow | null {
  const columns: string[] = [];
  let current = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      columns.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  columns.push(current.trim()); // Последний столбец
  
  if (columns.length < 10) {
    return null;
  }
  
  // Пропускаем первую колонку (номер), используем остальные
  const [, id, titleRu, titleEn, descriptionRu, descriptionEn, pointsRewardStr, iconName, conditionType, category] = columns;
  
  const pointsReward = parseInt(pointsRewardStr, 10) || 0;
  
  return {
    id: id.trim(),
    titleRu: titleRu.trim(),
    titleEn: titleEn.trim(),
    descriptionRu: descriptionRu.trim(),
    descriptionEn: descriptionEn.trim(),
    pointsReward,
    iconName: iconName.trim(),
    conditionType: conditionType.trim(),
    category: category.trim()
  };
}

/**
 * Извлечение числового значения из условия
 */
function extractConditionValue(conditionType: string, description: string): number | undefined {
  // Ищем числа в описании условия
  const numberMatch = description.match(/(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }
  
  // Для некоторых типов условий значение по умолчанию
  if (conditionType.includes('registration_checkin')) {
    return 1;
  }
  
  return undefined;
}

/**
 * Парсинг CSV файла
 */
export function parseAchievementsCSV(csvContent: string): ParsedAchievement[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const achievements: ParsedAchievement[] = [];
  
  // Пропускаем заголовок
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (!row || !row.id) continue;
    
    // Обработка комбинированных условий
    const conditionTypes = row.conditionType.includes('+')
      ? row.conditionType.split('+').map(c => c.trim())
      : row.conditionType;
    
    const conditionValue = extractConditionValue(
      typeof conditionTypes === 'string' ? conditionTypes : conditionTypes[0],
      row.descriptionEn
    );
    
    achievements.push({
      id: row.id,
      title: row.titleRu,
      titleEn: row.titleEn,
      description: row.descriptionRu,
      descriptionEn: row.descriptionEn,
      pointsReward: row.pointsReward,
      iconName: row.iconName,
      conditionType: conditionTypes,
      category: row.category,
      conditionValue
    });
  }
  
  return achievements;
}

/**
 * Генерация структуры для RU badges.json
 */
export function generateRuBadgesJSON(achievements: ParsedAchievement[]): any {
  const achievementsObj: Record<string, any> = {};
  
  achievements.forEach(achievement => {
    achievementsObj[achievement.id] = {
      title: achievement.title,
      description: achievement.description
    };
  });
  
  return {
    title: "Достижения",
    subtitle: "Ваш прогресс в заботе о психическом здоровье",
    congratulations: "Поздравляем!",
    unlockedBadge: "Вы получили новое достижение!",
    shareButton: "Поделиться",
    shareMessage: "Я получил новое достижение в Menhausen! 🎉",
    shareDescription: "Присоединяйтесь к заботе о психическом здоровье",
    appLink: "https://t.me/menhausen_bot/app",
    lockedBadge: "Заблокировано",
    unlockCondition: "Условие разблокировки:",
    progress: "Прогресс",
    totalBadges: "Всего достижений",
    unlockedCount: "Разблокировано",
    inProgress: "В процессе",
    points: "очки",
    motivatingText: "Ваша настойчивость помогла вам получить новое достижение! Продолжайте в том же духе!",
    motivatingTextNoBadges: "Начните свой путь к психическому благополучию. Каждый день - новая возможность для роста.",
    received: "Получено",
    locked: "Заблокировано",
    cancel: "Отмена",
    unlocked: "Разблокировано",
    reward: {
      title: "Поздравляем!",
      subtitle: "Вы заработали достижение!",
      continueButton: "Продолжить",
      nextAchievement: "Следующее достижение",
      congratulations: "Отлично!",
      earnedAchievement: "Вы заработали достижение"
    },
    achievements: achievementsObj
  };
}

/**
 * Генерация структуры для EN badges.json
 */
export function generateEnBadgesJSON(achievements: ParsedAchievement[]): any {
  const achievementsObj: Record<string, any> = {};
  
  achievements.forEach(achievement => {
    achievementsObj[achievement.id] = {
      title: achievement.titleEn,
      description: achievement.descriptionEn
    };
  });
  
  return {
    title: "Achievements",
    subtitle: "Your mental health progress",
    congratulations: "Congratulations!",
    unlockedBadge: "You unlocked a new achievement!",
    shareButton: "Share",
    shareMessage: "I got a new achievement in Menhausen! 🎉",
    shareDescription: "Join me in caring for mental health",
    appLink: "https://t.me/menhausen_bot/app",
    lockedBadge: "Locked",
    unlockCondition: "Unlock condition:",
    progress: "Progress",
    totalBadges: "Total achievements",
    unlockedCount: "Unlocked",
    inProgress: "In Progress",
    points: "points",
    motivatingText: "Your dedication helped you get a new achievement! Keep up the great work!",
    motivatingTextNoBadges: "Start your journey to mental well-being. Every day is a new opportunity for growth.",
    received: "Received",
    locked: "Locked",
    cancel: "Cancel",
    unlocked: "Unlocked",
    reward: {
      title: "Congratulations!",
      subtitle: "You earned an achievement!",
      continueButton: "Continue",
      nextAchievement: "Next Achievement",
      congratulations: "Great!",
      earnedAchievement: "You earned an achievement"
    },
    achievements: achievementsObj
  };
}

/**
 * Генерация метаданных достижений для использования в коде
 */
export function generateAchievementsMetadata(achievements: ParsedAchievement[]): any {
  return achievements.map(achievement => ({
    id: achievement.id,
    pointsReward: achievement.pointsReward,
    iconName: achievement.iconName,
    conditionType: achievement.conditionType,
    category: achievement.category,
    conditionValue: achievement.conditionValue
  }));
}

