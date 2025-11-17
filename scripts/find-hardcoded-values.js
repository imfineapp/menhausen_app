#!/usr/bin/env node

/**
 * Скрипт для поиска захардкоженных значений в проекте
 * Ищет hex-коды цветов, фиксированные размеры шрифтов и размеры элементов
 */

const fs = require('fs');
const path = require('path');

// Паттерны для поиска
const patterns = {
  hexColors: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,
  rgbaColors: /rgba?\([^)]+\)/g,
  fixedFontSizes: /text-\[(\d+)px\]|fontSize:\s*['"]?(\d+)px?['"]?/g,
  fixedSizes: /(?:w|h|p|m|gap)-\[(\d+)px\]/g,
};

// Исключения (файлы, которые не нужно проверять)
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.svg$/,
  /design-tokens\.md/,
  /find-hardcoded-values\.js/,
];

// Файлы для проверки
const checkExtensions = ['.tsx', '.ts', '.jsx', '.js', '.css'];

// Результаты
const results = {
  hexColors: [],
  rgbaColors: [],
  fixedFontSizes: [],
  fixedSizes: [],
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
 * Рекурсивно обходит директорию
 */
function walkDir(dir, fileList = []) {
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

  // Hex цвета
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.hexColors);
    for (const match of matches) {
      // Пропускаем комментарии в CSS/JS
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      results.hexColors.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim(),
      });
    }
  });

  // RGBA цвета
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.rgbaColors);
    for (const match of matches) {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      // Пропускаем CSS переменные
      if (match[0].includes('var(')) {
        continue;
      }
      results.rgbaColors.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim(),
      });
    }
  });

  // Фиксированные размеры шрифтов
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.fixedFontSizes);
    for (const match of matches) {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      results.fixedFontSizes.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim(),
      });
    }
  });

  // Фиксированные размеры элементов
  lines.forEach((line, index) => {
    const matches = line.matchAll(patterns.fixedSizes);
    for (const match of matches) {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      results.fixedSizes.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim(),
      });
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
  console.log('\n=== Результаты поиска захардкоженных значений ===\n');

  // Hex цвета
  if (results.hexColors.length > 0) {
    console.log(`\n📌 Найдено ${results.hexColors.length} захардкоженных hex-кодов:\n`);
    const grouped = groupByFile(results.hexColors);
    Object.keys(grouped).slice(0, 10).forEach(file => {
      console.log(`  ${file}:`);
      grouped[file].slice(0, 5).forEach(item => {
        console.log(`    Строка ${item.line}: ${item.value} - ${item.context.substring(0, 60)}...`);
      });
      if (grouped[file].length > 5) {
        console.log(`    ... и еще ${grouped[file].length - 5} совпадений`);
      }
    });
    if (Object.keys(grouped).length > 10) {
      console.log(`\n  ... и еще ${Object.keys(grouped).length - 10} файлов`);
    }
  } else {
    console.log('✅ Захардкоженных hex-кодов не найдено');
  }

  // RGBA цвета
  if (results.rgbaColors.length > 0) {
    console.log(`\n📌 Найдено ${results.rgbaColors.length} захардкоженных rgba значений:\n`);
    const grouped = groupByFile(results.rgbaColors);
    Object.keys(grouped).slice(0, 10).forEach(file => {
      console.log(`  ${file}:`);
      grouped[file].slice(0, 5).forEach(item => {
        console.log(`    Строка ${item.line}: ${item.value} - ${item.context.substring(0, 60)}...`);
      });
    });
  } else {
    console.log('\n✅ Захардкоженных rgba значений не найдено');
  }

  // Фиксированные размеры шрифтов
  if (results.fixedFontSizes.length > 0) {
    console.log(`\n📌 Найдено ${results.fixedFontSizes.length} захардкоженных размеров шрифтов:\n`);
    const grouped = groupByFile(results.fixedFontSizes);
    Object.keys(grouped).slice(0, 10).forEach(file => {
      console.log(`  ${file}:`);
      grouped[file].slice(0, 5).forEach(item => {
        console.log(`    Строка ${item.line}: ${item.value} - ${item.context.substring(0, 60)}...`);
      });
    });
  } else {
    console.log('\n✅ Захардкоженных размеров шрифтов не найдено');
  }

  // Фиксированные размеры элементов
  if (results.fixedSizes.length > 0) {
    console.log(`\n📌 Найдено ${results.fixedSizes.length} захардкоженных размеров элементов:\n`);
    const grouped = groupByFile(results.fixedSizes);
    Object.keys(grouped).slice(0, 10).forEach(file => {
      console.log(`  ${file}:`);
      grouped[file].slice(0, 5).forEach(item => {
        console.log(`    Строка ${item.line}: ${item.value} - ${item.context.substring(0, 60)}...`);
      });
    });
  } else {
    console.log('\n✅ Захардкоженных размеров элементов не найдено');
  }

  console.log('\n=== Конец отчета ===\n');
}

// Главная функция
function main() {
  const targetDir = process.argv[2] || './components';
  console.log(`Поиск захардкоженных значений в: ${targetDir}\n`);

  const files = walkDir(targetDir);

  console.log(`Найдено ${files.length} файлов для проверки...\n`);

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      findMatches(file, content);
    } catch (error) {
      console.error(`Ошибка при чтении файла ${file}:`, error.message);
    }
  });

  printResults();

  // Возвращаем код выхода
  const totalIssues = results.hexColors.length + results.rgbaColors.length + 
                      results.fixedFontSizes.length + results.fixedSizes.length;
  process.exit(totalIssues > 0 ? 1 : 0);
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { findMatches, shouldCheckFile };


