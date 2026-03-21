import type { ActivityData, ActivityType } from '@/utils/ActivityDataManager'

export type ActivityHeatmapDay = {
  date: Date
  activityType: ActivityType
  exerciseCount: number
  dateKey: string
}

export type ActivityHeatmapGrid = Array<Array<ActivityHeatmapDay>>

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Builds a grid shaped as: [dayOfWeek][weekIndex].
 * Each row corresponds to a day of week (Mon..Sun), and each column to a week.
 */
export function buildActivityHeatmapDaysOfWeekData(params: {
  activityData: ActivityData[]
  weeksCount: number
  today?: Date
}): ActivityHeatmapGrid {
  const { activityData, weeksCount } = params
  const today = params.today ? new Date(params.today) : new Date()

  // Build a quick lookup by dateKey.
  const activityMap = new Map<string, { activityType: ActivityType; exerciseCount: number }>()
  for (const item of activityData) {
    activityMap.set(item.date, {
      activityType: item.activityType,
      exerciseCount: item.exerciseCount ?? 0
    })
  }

  // "today" is used to anchor the grid to the current week (Mon..Sun).
  today.setHours(23, 59, 59, 999)

  // Monday of the current week.
  const currentMonday = new Date(today)
  const dayOfWeek = currentMonday.getDay() // 0=Sun..6=Sat
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  currentMonday.setDate(currentMonday.getDate() - daysToMonday)
  currentMonday.setHours(0, 0, 0, 0)

  // Monday N-1 weeks back.
  const startMonday = new Date(currentMonday)
  startMonday.setDate(startMonday.getDate() - ((weeksCount - 1) * 7))

  const endDate = new Date(currentMonday)
  endDate.setDate(endDate.getDate() + 6) // Sunday
  endDate.setHours(23, 59, 59, 999)

  // Create a flat list for N weeks worth of days.
  const allDays: ActivityHeatmapDay[] = []
  const dateIterator = new Date(startMonday)
  while (dateIterator <= endDate) {
    const dateKey = formatDateKey(dateIterator)
    const activityInfo = activityMap.get(dateKey)

    allDays.push({
      date: new Date(dateIterator),
      activityType: activityInfo?.activityType ?? 0,
      exerciseCount: activityInfo?.exerciseCount ?? 0,
      dateKey
    })

    dateIterator.setDate(dateIterator.getDate() + 1)
  }

  // Group into weeks: [weekIndex][dayIndex]
  const weeks: ActivityHeatmapDay[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  // Transpose into [dayOfWeek][weekIndex] where dayOfWeek order is Mon..Sun.
  // (This matches the original component logic: group[weekIndex][dayIndex], dayIndex 0..6 corresponds to Mon..Sun)
  const daysOfWeekData: ActivityHeatmapGrid = []
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const dayRow: ActivityHeatmapDay[] = []
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      if (weeks[weekIndex] && weeks[weekIndex][dayIndex]) {
        dayRow.push(weeks[weekIndex][dayIndex])
      }
    }
    daysOfWeekData.push(dayRow)
  }

  return daysOfWeekData
}

