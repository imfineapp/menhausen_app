# Typography System - Menhausen App (Main Branch Analysis)

## Полный анализ стилей текста в приложении Menhausen

На основе изучения всех компонентов приложения, собран comprehensive данные о всех стилях текста, используемых в приложении.

### 1. **Основные шрифты**

#### 1.1 Kreon (Regular)
- **Используется для**: заголовков, названий карточек, основных элементов интерфейса
- **Стили**: `font-['Kreon:Regular',_sans-serif] font-normal`
- **Размеры**: `text-[20px] sm:text-[22px] md:text-[24px]` (адаптивные)
- **Цвета**: `text-[#e1ff00]` (основной желтый)

#### 1.2 PT Sans
- **Используется для**: кнопок, описаний, основного текста
- **Стили**: `font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif]`
- **Варианты**: `font-bold`, `font-normal`, `not-italic`
- **Размеры**: от `text-[14px]` до `text-[20px]` с адаптивными вариантами
- **Цвета**: `text-[#2d2b2b]` (темный), `text-[#ffffff]` (белый), `text-[#696969]` (серый)

#### 1.3 Roboto Slab
- **Используется для**: заголовков, названий разделов
- **Стили**: `font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal`
- **Размеры**: `text-[22px] sm:text-[24px]`, `text-[24px]`, `text-[36px]`
- **Цвета**: `text-[#e1ff00]` (основной желтый), `text-[#cfcfcf]` (светло-серый)

### 2. **Цветовая палитра текста**

#### 2.1 Основные цвета:
- `#e1ff00` - Основной желтый (заголовки, акценты)
- `#ffffff` - Белый (основной текст)
- `#2d2b2b` - Темно-серый (кнопки, важный текст)
- `#696969` - Средне-серый (вторичный текст)
- `#cfcfcf` - Светло-серый (описания)
- `#d4d4d4` - Светло-серый (подзаголовки)

#### 2.2 Специальные цвета:
- `#888888` - Placeholder текст
- `#999999` - Помощь текст
- `#666666` - Счетчик символов
- `#3a3a3a` - Границы неактивных элементов

### 3. **Адаптивные размеры текста**

#### 3.1 Responsive классы (из tailwind.config.js):
- `text-responsive-xs`: `clamp(10px, 2vw, 12px)`
- `text-responsive-sm`: `clamp(12px, 2.2vw, 14px)`
- `text-responsive-base`: `clamp(14px, 2.5vw, 16px)`
- `text-responsive-lg`: `clamp(16px, 3vw, 18px)`
- `text-responsive-xl`: `clamp(18px, 3.5vw, 20px)`
- `text-responsive-2xl`: `clamp(20px, 4vw, 24px)`
- `text-responsive-3xl`: `clamp(24px, 5vw, 28px)`
- `text-responsive-4xl`: `clamp(28px, 6vw, 32px)`

#### 3.2 Стандартные адаптивные размеры:
- `text-[18px] sm:text-[19px] md:text-[20px]`
- `text-[20px] sm:text-[22px] md:text-[24px]`
- `text-[22px] sm:text-[23px] md:text-[24px]`

### 4. **Стили кнопок**

#### 4.1 Основные кнопки:
```css
font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] 
font-bold 
leading-[0] 
not-italic 
relative 
shrink-0 
text-[#2d2b2b] 
text-[15px] 
text-center 
text-nowrap 
tracking-[-0.43px]
```

#### 4.2 Кнопки с акцентом:
```css
font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] 
font-bold 
leading-[0] 
not-italic 
relative 
shrink-0 
text-[#e1ff00] 
text-[14px] 
text-center
```

### 5. **Стили заголовков**

#### 5.1 Основные заголовки:
```css
font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] 
font-normal 
relative 
shrink-0 
text-[#e1ff00] 
text-[24px] 
text-center
```

#### 5.2 Заголовки разделов:
```css
font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] 
text-[22px] 
sm:text-[24px] 
text-[#e1ff00] 
text-left
```

### 6. **Стили описаний и основного текста**

#### 6.1 Основной текст:
```css
font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] 
not-italic 
relative 
shrink-0 
text-[#ffffff] 
text-[20px]
```

#### 6.2 Вторичный текст:
```css
font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] 
not-italic 
relative 
shrink-0 
text-[#cfcfcf] 
text-[20px]
```

### 7. **Стили полей ввода**

#### 7.1 Textarea:
```css
font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] 
leading-[22px] 
not-italic 
bg-transparent 
border-none 
outline-none 
resize-none 
text-[#cfcfcf] 
text-[18px] 
sm:text-[19px] 
md:text-[20px] 
text-left 
w-full 
h-full 
placeholder:text-[#696969]
```

#### 7.2 Input:
```css
font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] 
leading-[22px] 
not-italic 
bg-transparent 
border-none 
outline-none 
resize-none 
text-[#cfcfcf] 
text-[18px] 
sm:text-[19px] 
md:text-[20px] 
text-left 
w-full 
h-full 
placeholder:text-[#696969]
```

### 8. **Стили для опросов (SurveyScreenTemplate)**

#### 8.1 Заголовки опросов:
```css
font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] 
font-normal 
text-white 
text-responsive-3xl 
mb-4 
leading-[0.8]
```

#### 8.2 Подзаголовки:
```css
text-responsive-base 
text-[#d4d4d4]
```

#### 8.3 Варианты ответов:
- **Выбранные**: `border-[#e1ff00] bg-[#e1ff00]/10 text-white`
- **Невыбранные**: `border-[#3a3a3a] bg-[#2a2a2a] text-[#d4d4d4]`

### 9. **Специальные стили**

#### 9.1 Информация о шифровании:
```css
font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] 
font-bold 
leading-[0] 
not-italic 
relative 
shrink-0 
text-[#696969] 
text-[14px] 
text-left 
flex-1
```

#### 9.2 Ошибки:
```css
text-red-400 
text-sm 
text-center
```

#### 9.3 Счетчик символов:
```css
text-xs 
text-[#666666]
```

### 10. **Адаптивность**

Приложение использует mobile-first подход с breakpoints:
- `xs`: 320px
- `sm`: 375px  
- `md`: 640px
- `lg`: 768px
- `xl`: 1024px
- `2xl`: 1280px

Все текстовые элементы адаптируются под разные размеры экранов с помощью responsive классов и clamp() функций.

### 11. **Типографические особенности**

- **Line-height**: в основном `leading-[0]`, `leading-[0.8]`, `leading-[22px]`
- **Letter-spacing**: `tracking-[-0.43px]` для кнопок
- **Text-align**: `text-center`, `text-left`, `text-right`
- **Font-weight**: `font-normal`, `font-bold`, `font-medium`
- **Text-decoration**: `text-nowrap` для кнопок

### 12. **Примеры использования по экранам**

#### 12.1 HomeScreen
- **Hero текст**: `font-['Kreon:Regular',_sans-serif] text-[#e1ff00] text-[20px] sm:text-[22px] md:text-[24px]`
- **Кнопки**: `font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold text-[#2d2b2b] text-[15px]`
- **Описания**: `text-[#ffffff] text-[16px] sm:text-[18px] md:text-[20px]`

#### 12.2 OnboardingScreen01
- **Заголовок**: `font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] text-[#cfcfcf] text-[36px]`
- **Описание**: `font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] text-[#ffffff] text-[20px]`
- **Кнопка**: `font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold text-[#2d2b2b] text-[15px]`

#### 12.3 CheckInScreen
- **Вопрос**: `font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] text-[#e1ff00] text-[36px]`
- **Настроение**: `font-['Kreon:Regular',_sans-serif] text-[#ffffff] text-[32px]`

#### 12.4 UserProfileScreen
- **Заголовки разделов**: `font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] text-[#e1ff00] text-[22px] sm:text-[24px]`
- **Язык**: `font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] text-[#ffffff] text-[18px] sm:text-[20px]`

### 13. **Заключение**

Приложение использует консистентную типографическую систему с четкой иерархией шрифтов, цветов и размеров, адаптированную для мобильных устройств. Основные принципы:

1. **Иерархия**: Kreon для заголовков, Roboto Slab для подзаголовков, PT Sans для основного текста
2. **Цветовая схема**: Желтый (#e1ff00) для акцентов, белый для основного текста, серые оттенки для вторичного текста
3. **Адаптивность**: Все размеры адаптируются под разные экраны с помощью responsive классов
4. **Консистентность**: Единообразные стили для похожих элементов (кнопки, заголовки, описания)

Система хорошо продумана и обеспечивает отличную читаемость и пользовательский опыт на всех устройствах.
