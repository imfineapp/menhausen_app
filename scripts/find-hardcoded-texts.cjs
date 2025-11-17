#!/usr/bin/env node

/**
 * Скрипт для поиска захардкоженных текстовых блоков в проекте
 * Ищет строки, которые должны быть локализованы через i18n систему
 */

const fs = require('fs');
const path = require('path');

// Паттерны для поиска захардкоженных текстов
const patterns = {
  // JSX текст (текст между тегами)
  jsxText: /<[^>]+>([^<{]+[А-Яа-яЁёA-Za-z]{3,}[^<{]+)<\/[^>]+>/g,
  
  // Строки в JSX выражениях
  jsxExpression: /\{['"]([^'"]*[А-Яа-яЁёA-Za-z]{3,}[^'"]*)['"]\}/g,
  
  // Строки в атрибутах
  attributeString: /(placeholder|title|alt|aria-label|label)=["']([^"']*[А-Яа-яЁёA-Za-z]{3,}[^"']*)["']/g,
  
  // Тернарные операторы с русским/английским текстом
  ternary: /\?['"]([^'"]*[А-Яа-яЁё]{3,}[^'"]*)['"]\s*:\s*['"]([^'"]*[A-Za-z]{3,}[^'"]*)['"]/g,
  
  // Прямые строки в props
  propString: /(\w+)=["']([^"']*[А-Яа-яЁёA-Za-z]{3,}[^"']*)["']/g,
};

// Исключения (файлы, которые не нужно проверять)
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.svg$/,
  /\.json$/,
  /\.md$/,
  /\.test\./,
  /\.spec\./,
  /find-hardcoded-texts\./,
  /ContentContext\.tsx/, // Содержит fallback значения
  /LanguageContext\.tsx/, // Содержит константы
];

// Исключения (строки, которые не нужно проверять)
const excludeStrings = [
  'console.log',
  'className',
  'data-testid',
  'data-name',
  'import',
  'export',
  'require',
  'http',
  'https',
  'www.',
  '.com',
  '.ru',
  '.json',
  '.tsx',
  '.ts',
  '.js',
  '.css',
  'useState',
  'useEffect',
  'useCallback',
  'React',
  'TypeScript',
  'JavaScript',
  'CSS',
  'HTML',
  'JSON',
  'API',
  'URL',
  'ID',
  'UUID',
  'px',
  'rem',
  'em',
  '%',
  'rgba',
  'rgb',
  '#',
  'getText',
  'getLocalizedText',
  'useLanguage',
  'useContent',
  'useUIText',
];

// Файлы для проверки
const checkExtensions = ['.tsx', '.ts', '.jsx', '.js'];

// Результаты
const results = {
  jsxText: [],
  jsxExpression: [],
  attributeString: [],
  ternary: [],
  propString: [],
};

/**
 * Проверяет, нужно ли проверять файл
 */
function shouldCheckFile(filePath) {
  // Проверяем расширение
  const ext = path.extname(filePath);
  if (!checkExtensions.includes(ext)) {
    return false;
  }

  // Проверяем исключения
  return !excludePatterns.some(pattern => pattern.test(filePath));
}

/**
 * Проверяет, нужно ли проверять строку
 */
function shouldCheckString(text) {
  if (!text || text.trim().length < 3) {
    return false;
  }

  // Пропускаем технические строки
  if (excludeStrings.some(exclude => text.includes(exclude))) {
    return false;
  }

  // Пропускаем строки, которые уже используют i18n
  if (text.includes('getText(') || 
      text.includes('getLocalizedText(') || 
      text.includes('useUIText(') ||
      text.includes('useLanguage(') ||
      text.includes('useContent(')) {
    return false;
  }

  // Пропускаем строки, которые выглядят как переменные или функции
  if (/^[a-z][a-zA-Z0-9]*$/.test(text.trim()) && text.length < 20) {
    return false;
  }

  // Пропускаем строки, которые выглядят как пути или URLs
  if (text.includes('/') || text.includes('\\') || text.includes('@')) {
    return false;
  }

  // Пропускаем строки, которые выглядят как CSS классы
  if (text.includes('bg-') || text.includes('text-') || text.includes('p-') || 
      text.includes('m-') || text.includes('w-') || text.includes('h-')) {
    return false;
  }

  return true;
}

/**
 * Рекурсивно обходит директорию
 */
function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (shouldCheckFile(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Находит все совпадения в файле
 */
function findMatches(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  const lines = content.split('\n');

  // JSX текст
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.jsxText);
    for (const match of matches) {
      const text = match[1]?.trim();
      if (text && shouldCheckString(text)) {
        results.jsxText.push({
          file: relativePath,
          line: index + 1,
          text: text,
          context: line.trim(),
        });
      }
    }
  });

  // JSX выражения
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.jsxExpression);
    for (const match of matches) {
      const text = match[1]?.trim();
      if (text && shouldCheckString(text)) {
        results.jsxExpression.push({
          file: relativePath,
          line: index + 1,
          text: text,
          context: line.trim(),
        });
      }
    }
  });

  // Атрибуты
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.attributeString);
    for (const match of matches) {
      const text = match[2]?.trim();
      if (text && shouldCheckString(text)) {
        results.attributeString.push({
          file: relativePath,
          line: index + 1,
          attribute: match[1],
          text: text,
          context: line.trim(),
        });
      }
    }
  });

  // Тернарные операторы
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.ternary);
    for (const match of matches) {
      const ruText = match[1]?.trim();
      const enText = match[2]?.trim();
      if (ruText && enText && shouldCheckString(ruText) && shouldCheckString(enText)) {
        results.ternary.push({
          file: relativePath,
          line: index + 1,
          ruText: ruText,
          enText: enText,
          context: line.trim(),
        });
      }
    }
  });

  // Props строки (более общий паттерн)
  lines.forEach((line, index) => {
    // Пропускаем строки, которые уже обработаны как атрибуты
    if (line.match(patterns.attributeString)) {
      return;
    }
    
    const matches = line.matchAll(patterns.propString);
    for (const match of matches) {
      const propName = match[1];
      const text = match[2]?.trim();
      
      // Пропускаем технические props
      if (['className', 'id', 'key', 'ref', 'data-testid', 'data-name'].includes(propName)) {
        continue;
      }
      
      if (text && shouldCheckString(text)) {
        results.propString.push({
          file: relativePath,
          line: index + 1,
          prop: propName,
          text: text,
          context: line.trim(),
        });
      }
    }
  });
}

/**
 * Группирует результаты по файлам
 */
function groupByFile(items) {
  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.file]) {
      grouped[item.file] = [];
    }
    grouped[item.file].push(item);
  });
  return grouped;
}

/**
 * Выводит результаты
 */
function printResults() {
  console.log('\n=== Результаты поиска захардкоженных текстов ===\n');

  const allResults = [
    ...results.jsxText,
    ...results.jsxExpression,
    ...results.attributeString,
    ...results.ternary,
    ...results.propString,
  ];

  if (allResults.length === 0) {
    console.log('✅ Захардкоженных текстов не найдено!\n');
    return;
  }

  console.log(`📊 Всего найдено: ${allResults.length} захардкоженных текстов\n`);

  // Группируем по файлам
  const grouped = groupByFile(allResults);
  const files = Object.keys(grouped).sort();

  console.log(`📁 Найдено в ${files.length} файлах:\n`);

  files.forEach(file => {
    console.log(`\n📄 ${file} (${grouped[file].length} строк):`);
    console.log('─'.repeat(80));
    
    grouped[file].forEach((item, idx) => {
      console.log(`\n  ${idx + 1}. Строка ${item.line}:`);
      if (item.text) {
        console.log(`     Текст: "${item.text}"`);
      }
      if (item.ruText && item.enText) {
        console.log(`     RU: "${item.ruText}"`);
        console.log(`     EN: "${item.enText}"`);
      }
      if (item.attribute) {
        console.log(`     Атрибут: ${item.attribute}`);
      }
      if (item.prop) {
        console.log(`     Prop: ${item.prop}`);
      }
      console.log(`     Контекст: ${item.context.substring(0, 100)}${item.context.length > 100 ? '...' : ''}`);
    });
  });

  // Статистика по типам
  console.log('\n\n📈 Статистика по типам:');
  console.log('─'.repeat(80));
  console.log(`  JSX текст:              ${results.jsxText.length}`);
  console.log(`  JSX выражения:          ${results.jsxExpression.length}`);
  console.log(`  Атрибуты:               ${results.attributeString.length}`);
  console.log(`  Тернарные операторы:    ${results.ternary.length}`);
  console.log(`  Props:                  ${results.propString.length}`);

  console.log('\n=== Конец отчета ===\n');
}

/**
 * Сохраняет результаты в JSON файл
 */
function saveResultsToFile() {
  const outputPath = path.join(process.cwd(), 'i18n-migration-results.json');
  const allResults = {
    summary: {
      total: [
        ...results.jsxText,
        ...results.jsxExpression,
        ...results.attributeString,
        ...results.ternary,
        ...results.propString,
      ].length,
      byType: {
        jsxText: results.jsxText.length,
        jsxExpression: results.jsxExpression.length,
        attributeString: results.attributeString.length,
        ternary: results.ternary.length,
        propString: results.propString.length,
      },
    },
    results: {
      jsxText: results.jsxText,
      jsxExpression: results.jsxExpression,
      attributeString: results.attributeString,
      ternary: results.ternary,
      propString: results.propString,
    },
  };

  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`\n💾 Результаты сохранены в: ${outputPath}\n`);
}

// Главная функция
function main() {
  const targetDir = process.argv[2] || './components';
  console.log(`🔍 Поиск захардкоженных текстов в: ${targetDir}\n`);

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Директория не найдена: ${targetDir}`);
    process.exit(1);
  }

  const files = walkDir(targetDir);

  console.log(`📂 Найдено ${files.length} файлов для проверки...\n`);

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      findMatches(file, content);
    } catch (error) {
      console.error(`⚠️  Ошибка при чтении файла ${file}:`, error.message);
    }
  });

  printResults();
  saveResultsToFile();

  // Возвращаем код выхода
  const totalIssues = [
    ...results.jsxText,
    ...results.jsxExpression,
    ...results.attributeString,
    ...results.ternary,
    ...results.propString,
  ].length;
  
  process.exit(totalIssues > 0 ? 1 : 0);
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { findMatches, shouldCheckFile, shouldCheckString };


