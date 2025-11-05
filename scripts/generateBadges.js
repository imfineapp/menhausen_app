/**
 * Скрипт для генерации badges.json из CSV
 * Запуск: node scripts/generateBadges.js
 */

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
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

function extractConditionValue(conditionType, description) {
  const numberMatch = description.match(/(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }
  if (conditionType.includes('registration_checkin')) {
    return 1;
  }
  return undefined;
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
    
    const conditionValue = extractConditionValue(
      typeof conditionTypes === 'string' ? conditionTypes : conditionTypes[0],
      descriptionEn
    );
    
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
      conditionValue
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
  const metadata = achievements.map(a => ({
    id: a.id,
    xp: a.xp,
    iconName: a.iconName,
    conditionType: a.conditionType,
    category: a.category,
    conditionValue: a.conditionValue
  }));
  
  const metadataPath = path.join(__dirname, '..', 'data', 'achievements-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`Generated ${metadataPath}`);
  
  console.log('\n✅ Badges JSON files generated successfully!');
} catch (error) {
  console.error('Error generating badges:', error);
  process.exit(1);
}

