/**
 * Скрипт для генерации badges.json из CSV
 * Запуск: node scripts/generateBadges.js
 */

const fs = require('fs');
const path = require('path');

// Простой CSV парсер
function parseCSVLine(line) {
  const columns = [];
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
  columns.push(current.trim());
  
  return columns;
}

/**
 * Извлекает все числа из описания и возвращает объект с распределенными значениями
 * @param {string|string[]} conditionType - тип условия (может быть массивом для комбинированных)
 * @param {string} description - описание достижения на английском
 * @returns {Object} объект с conditionValue, conditionRepeatValue, conditionTopicsCount
 */
function extractConditionValues(conditionType, description) {
  // Извлекаем все числа из описания
  const numbers = [];
  const numberRegex = /\d+/g;
  let match;
  while ((match = numberRegex.exec(description)) !== null) {
    numbers.push(parseInt(match[0], 10));
  }
  
  // Специальный случай для registration_checkin
  if (typeof conditionType === 'string' && conditionType.includes('registration_checkin')) {
    return { conditionValue: 1 };
  }
  
  // Если нет чисел, возвращаем undefined
  if (numbers.length === 0) {
    return {};
  }
  
  // Если условие простое (не массив и не содержит +)
  const isCombined = Array.isArray(conditionType) || 
                     (typeof conditionType === 'string' && conditionType.includes('+'));
  
  if (!isCombined) {
    // Простое условие - используем первое число
    return { conditionValue: numbers[0] };
  }
  
  // Комбинированное условие
  const conditionTypes = Array.isArray(conditionType) 
    ? conditionType 
    : conditionType.split('+').map(c => c.trim());
  
  const result = {};
  
  // Определяем порядок условий
  const firstType = conditionTypes[0];
  const secondType = conditionTypes[1];
  
  // Специальный случай: cards_opened + streak_repeat (harmony_seeker, pathfinder)
  // Формат: "5 cards in 3 topics + 7 repeat days"
  // - первое число (5) - cards_opened (conditionValue)
  // - второе число (3) - количество тем (conditionTopicsCount)
  // - третье число (7) - repeat days для streak_repeat (conditionRepeatValue)
  // Если только 2 числа: "5 cards + 7 repeat days" (без topics)
  // - первое число (5) - cards_opened (conditionValue)
  // - второе число (7) - repeat days для streak_repeat (conditionRepeatValue)
  if ((firstType === 'cards_opened' && secondType === 'streak_repeat') ||
      (firstType === 'cards_opened' && conditionTypes.some(t => t === 'streak_repeat'))) {
    if (numbers.length >= 1) result.conditionValue = numbers[0]; // cards для cards_opened
    if (numbers.length === 3) {
      // Формат с topics: "5 cards in 3 topics + 7 repeat days"
      result.conditionTopicsCount = numbers[1]; // topics
      result.conditionRepeatValue = numbers[2]; // repeat days для streak_repeat
    } else if (numbers.length === 2) {
      // Формат без topics: "5 cards + 7 repeat days"
      result.conditionRepeatValue = numbers[1]; // repeat days для streak_repeat
    }
    return result;
  }
  
  // Специальный случай: streak_repeat как первое или второе условие (но не с cards_opened)
  // Для streak_repeat: первое число - streak (conditionValue), второе - repeat (conditionRepeatValue)
  if (secondType === 'streak_repeat' || firstType === 'streak_repeat') {
    if (numbers.length >= 1) result.conditionValue = numbers[0];
    if (numbers.length >= 2) result.conditionRepeatValue = numbers[1];
    // Если есть третье число, это может быть количество тем
    if (numbers.length >= 3) result.conditionTopicsCount = numbers[2]; // третье число - темы
    return result;
  }
  
  // Общий случай для комбинированных условий: первое число для первого условия, второе для второго
  // Примеры:
  // - cards_repeated + streak: "Repeat 5 cards + 3 consecutive active days" -> conditionValue=5, conditionRepeatValue=3
  // - topic_repeated + streak: "Repeat all cards in 1 topic + 5 active days" -> conditionValue=1, conditionRepeatValue=5
  // - streak + cards_repeated: "14 active days + repeat 10 cards" -> conditionValue=14, conditionRepeatValue=10
  // - topic_completed + topic_repeated: "Completed 2 topics + repeated all in one" -> conditionValue=2, conditionRepeatValue=1
  // - referral_invite + referral_premium: "Invite 5 + 1 bought premium" -> conditionValue=5, conditionRepeatValue=1
  if (numbers.length >= 1) result.conditionValue = numbers[0];
  if (numbers.length >= 2) result.conditionRepeatValue = numbers[1];
  // Если есть третье число, это может быть количество тем (например, для topic_repeated)
  if (numbers.length >= 3) result.conditionTopicsCount = numbers[2];
  
  return result;
}

function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const achievements = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    if (columns.length < 10) continue;
    
    const [, id, titleRu, titleEn, descriptionRu, descriptionEn, xpStr, iconName, conditionType, category] = columns;
    
    if (!id || !id.trim()) continue;
    
    const xp = parseInt(xpStr, 10) || 0;
    const conditionTypes = conditionType.includes('+')
      ? conditionType.split('+').map(c => c.trim())
      : conditionType.trim();
    
    // Извлекаем все значения условий
    const conditionValues = extractConditionValues(conditionTypes, descriptionEn);
    
    achievements.push({
      id: id.trim(),
      titleRu: titleRu.trim(),
      titleEn: titleEn.trim(),
      descriptionRu: descriptionRu.trim(),
      descriptionEn: descriptionEn.trim(),
      xp,
      iconName: iconName.trim(),
      conditionType: conditionTypes,
      category: category.trim(),
      conditionValue: conditionValues.conditionValue,
      conditionRepeatValue: conditionValues.conditionRepeatValue,
      conditionTopicsCount: conditionValues.conditionTopicsCount
    });
  }
  
  return achievements;
}

function generateRuJSON(achievements) {
  const achievementsObj = {};
  
  achievements.forEach(achievement => {
    achievementsObj[achievement.id] = {
      title: achievement.titleRu,
      description: achievement.descriptionRu
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

function generateEnJSON(achievements) {
  const achievementsObj = {};
  
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

// Основная логика
try {
  const csvPath = path.join(__dirname, '..', 'imports', 'Achievements.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  const achievements = parseCSV(csvContent);
  console.log(`Parsed ${achievements.length} achievements`);
  
  // Генерация RU JSON
  const ruJSON = generateRuJSON(achievements);
  const ruPath = path.join(__dirname, '..', 'data', 'content', 'ru', 'badges.json');
  fs.writeFileSync(ruPath, JSON.stringify(ruJSON, null, 2), 'utf8');
  console.log(`Generated ${ruPath}`);
  
  // Генерация EN JSON
  const enJSON = generateEnJSON(achievements);
  const enPath = path.join(__dirname, '..', 'data', 'content', 'en', 'badges.json');
  fs.writeFileSync(enPath, JSON.stringify(enJSON, null, 2), 'utf8');
  console.log(`Generated ${enPath}`);
  
  // Генерация метаданных
  const metadata = achievements.map(a => {
    const meta = {
      id: a.id,
      xp: a.xp,
      iconName: a.iconName,
      conditionType: a.conditionType,
      category: a.category
    };
    
    // Добавляем conditionValue только если оно определено
    if (a.conditionValue !== undefined) {
      meta.conditionValue = a.conditionValue;
    }
    
    // Добавляем conditionRepeatValue только если оно определено
    if (a.conditionRepeatValue !== undefined) {
      meta.conditionRepeatValue = a.conditionRepeatValue;
    }
    
    // Добавляем conditionTopicsCount только если оно определено
    if (a.conditionTopicsCount !== undefined) {
      meta.conditionTopicsCount = a.conditionTopicsCount;
    }
    
    return meta;
  });
  
  const metadataPath = path.join(__dirname, '..', 'data', 'achievements-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`Generated ${metadataPath}`);
  
  console.log('\n✅ Badges JSON files generated successfully!');
} catch (error) {
  console.error('Error generating badges:', error);
  process.exit(1);
}

