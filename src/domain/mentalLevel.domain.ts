import type { CheckinData } from '@/utils/DailyCheckinManager'

export type MentalLevelChartPoint = {
  date: string // DD.MM
  value: number | null // null = no check-in that day (gap in display)
}

function formatDDMM(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Builds chart data for the last `daysCount` days (default 14).
 * When multiple check-ins exist for a single day the chart value is the
 * rounded average of their normalised moods (`checkin.value + 1`).
 * Days without any check-in return `value: null` so the chart can render
 * a dotted bridging line instead of dropping to zero.
 */
export function buildMentalLevelChartData(params: {
  checkins: CheckinData[]
  today?: Date
  daysCount?: number
}): MentalLevelChartPoint[] {
  const { checkins, daysCount = 14 } = params
  const today = params.today ? new Date(params.today) : new Date()
  today.setHours(0, 0, 0, 0)

  // Group check-in values by date key
  const checkinsByDay = new Map<string, number[]>()

  for (const checkin of checkins) {
    const checkinDate = new Date(checkin.date)
    checkinDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff >= 0 && daysDiff < daysCount) {
      const values = checkinsByDay.get(checkin.date) || []
      values.push(checkin.value + 1) // normalise to 1..5 scale
      checkinsByDay.set(checkin.date, values)
    }
  }

  // Compute average per day
  const checkinsAvg = new Map<string, number>()
  for (const [dateKey, values] of checkinsByDay) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    checkinsAvg.set(dateKey, Math.round(avg))
  }

  // Build chart points — null for empty days
  const days: MentalLevelChartPoint[] = []
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const value = checkinsAvg.get(dateKey) ?? null

    days.push({ date: formatDDMM(date), value })
  }

  return days
}
