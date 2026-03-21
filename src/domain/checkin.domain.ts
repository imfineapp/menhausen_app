/**
 * Pure check-in history helpers (streaks, consecutive days).
 */

export interface CheckinHistoryEntry {
  mood?: string
  timestamp?: string
  date: string
}

/**
 * Counts consecutive calendar days of check-ins from the last entry backward.
 * Expects `date` as YYYY-MM-DD. History is sorted ascending by date before walking.
 */
export function getConsecutiveDays(checkinHistory: CheckinHistoryEntry[]): number {
  if (checkinHistory.length === 0) return 0

  const sortedCheckins = [...checkinHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let consecutiveDays = 1
  let currentDate = new Date(sortedCheckins[0].date)

  for (let i = 1; i < sortedCheckins.length; i++) {
    const checkinDate = new Date(sortedCheckins[i].date)
    const expectedDate = new Date(currentDate)
    expectedDate.setDate(expectedDate.getDate() + 1)

    if (checkinDate.toDateString() === expectedDate.toDateString()) {
      consecutiveDays++
      currentDate = checkinDate
    } else {
      break
    }
  }

  return consecutiveDays
}
