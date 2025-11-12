#!/usr/bin/env node

/**
 * Скрипт для валидации переводов
 * Проверяет, что все ключи переводов существуют в обоих языках
 */

/* eslint-env node */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пути к файлам переводов
const TRANSLATIONS_DIR = path.join(__dirname, "..", "data", "content");
const LANGUAGES = ["en", "ru"];

/**
 * Рекурсивно собирает все ключи из объекта переводов
 */
function collectKeys(obj, prefix = "") {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...collectKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Загружает переводы для указанного языка
 */
function loadTranslations(language) {
  const translations = {};
  const languageDir = path.join(TRANSLATIONS_DIR, language);
  
  if (!fs.existsSync(languageDir)) {
    console.error(` Директория для языка ${language} не найдена: ${languageDir}`);
    return null;
  }
  
  const files = fs.readdirSync(languageDir);
  
  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(languageDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      
      try {
        const data = JSON.parse(content);
        const baseName = path.basename(file, ".json");
        translations[baseName] = data;
      } catch (error) {
        console.error(` Ошибка парсинга файла ${filePath}:`, error.message);
        return null;
      }
    }
  }
  
  return translations;
}

/**
 * Проверяет, что все ключи из source существуют в target
 */
function validateKeys(sourceKeys, targetKeys, sourceLang, targetLang) {
  const missingKeys = sourceKeys.filter(key => !targetKeys.includes(key));
  const extraKeys = targetKeys.filter(key => !sourceKeys.includes(key));
  
  let isValid = true;
  
  if (missingKeys.length > 0) {
    console.error(` Отсутствующие ключи в ${targetLang} (есть в ${sourceLang}):`);
    missingKeys.forEach(key => console.error(`  - ${key}`));
    isValid = false;
  }
  
  if (extraKeys.length > 0) {
    console.warn(`  Дополнительные ключи в ${targetLang} (нет в ${sourceLang}):`);
    extraKeys.forEach(key => console.warn(`  - ${key}`));
  }
  
  return isValid;
}

/**
 * Основная функция валидации
 */
function validateTranslations() {
  console.log(" Начинаем валидацию переводов...\n");
  
  // Загружаем переводы для всех языков
  const allTranslations = {};
  for (const language of LANGUAGES) {
    allTranslations[language] = loadTranslations(language);
    if (!allTranslations[language]) {
      console.error(` Не удалось загрузить переводы для языка ${language}`);
      process.exit(1);
    }
  }
  
  let allValid = true;
  
  // Проверяем каждый файл переводов
  for (const language of LANGUAGES) {
    const otherLanguages = LANGUAGES.filter(lang => lang !== language);
    
    for (const [fileName, translations] of Object.entries(allTranslations[language])) {
      console.log(` Проверяем файл: ${fileName}.json`);
      
      const sourceKeys = collectKeys(translations);
      
      for (const otherLang of otherLanguages) {
        if (allTranslations[otherLang][fileName]) {
          const targetKeys = collectKeys(allTranslations[otherLang][fileName]);
          const isValid = validateKeys(sourceKeys, targetKeys, language, otherLang);
          
          if (!isValid) {
            allValid = false;
          }
        } else {
          console.error(` Файл ${fileName}.json отсутствует в языке ${otherLang}`);
          allValid = false;
        }
      }
      
      console.log(` Файл ${fileName}.json проверен\n`);
    }
  }
  
  // Проверяем общую структуру
  console.log(" Общая статистика:");
  for (const language of LANGUAGES) {
    const totalKeys = Object.values(allTranslations[language])
      .reduce((sum, translations) => sum + collectKeys(translations).length, 0);
    console.log(`  ${language}: ${totalKeys} ключей`);
  }
  
  if (allValid) {
    console.log("\n Все переводы валидны!");
    process.exit(0);
  } else {
    console.log("\n Найдены проблемы с переводами!");
    process.exit(1);
  }
}

// Запускаем валидацию
validateTranslations();

export { validateTranslations, collectKeys, loadTranslations };
