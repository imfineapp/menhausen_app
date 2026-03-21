import type { CheckinData } from '@/utils/DailyCheckinManager'

export type MentalLevelChartPoint = {
  date: string // DD.MM
  value: number
}

function formatDDMM(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Builds chart data for the last `daysCount` days (default 14).
 * Normalizes checkin values by mapping `checkin.value + 1` to the chart scale.
 */
export function buildMentalLevelChartData(params: {
  checkins: CheckinData[]
  today?: Date
  daysCount?: number
}): MentalLevelChartPoint[] {
  const { checkins, daysCount = 14 } = params
  const today = params.today ? new Date(params.today) : new Date()
  today.setHours(0, 0, 0, 0)

  const checkinsMap = new Map<string, number>()

  for (const checkin of checkins) {
    const checkinDate = new Date(checkin.date)
    checkinDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff >= 0 && daysDiff < daysCount) {
      checkinsMap.set(checkin.date, checkin.value + 1)
    }
  }

  const days: MentalLevelChartPoint[] = []
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Use the same string format as checkin.date keys.
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const value = checkinsMap.get(dateKey) || 0

    days.push({ date: formatDDMM(date), value })
  }

  return days
}

