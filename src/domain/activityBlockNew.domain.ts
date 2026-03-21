import type { ActivityType } from '@/utils/ActivityDataManager'
import type { SupportedLanguage } from '@/types/content'

export type ActivityDayCell = {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  label: string
  activityType: ActivityType
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function getCurrentWeekMonday(date: Date): Date {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)

  const dayOfWeek = monday.getDay() // 0=Sun..6=Sat
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  monday.setDate(monday.getDate() - daysToMonday)

  return monday
}

export function buildDaysOfWeekLabels(args: { language: SupportedLanguage; baseDate?: Date }): Array<{
  key: (typeof DAY_KEYS)[number]
  label: string
}> {
  const { language, baseDate = new Date() } = args
  const locale = language === 'ru' ? 'ru-RU' : 'en-US'
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })

  const monday = getCurrentWeekMonday(baseDate)

  return DAY_KEYS.map((key, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)

    let label = formatter.format(d)
    label = label.replace(/\.$/, '').trim()

    // Match existing UI expectation:
    // - Russian: keep as-is
    // - English: capitalize first letter
    if (language !== 'ru' && label) {
      label = label.charAt(0).toUpperCase() + label.slice(1)
    }

    return { key, label }
  })
}

export function buildActivityDayCells(args: {
  activityMap: Map<string, ActivityType>
  monday: Date
  daysOfWeek: Array<{ key: (typeof DAY_KEYS)[number]; label: string }>
}): ActivityDayCell[] {
  const { activityMap, monday, daysOfWeek } = args

  return daysOfWeek.map((day) => {
    const dayIndex = DAY_KEYS.indexOf(day.key)

    const targetDate = new Date(monday)
    targetDate.setDate(monday.getDate() + dayIndex)
    targetDate.setHours(0, 0, 0, 0)

    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(
      targetDate.getDate()
    ).padStart(2, '0')}`

    return {
      key: day.key,
      label: day.label,
      activityType: activityMap.get(dateKey) ?? (0 as ActivityType)
    }
  })
}

