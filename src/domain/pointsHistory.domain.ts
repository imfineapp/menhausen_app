export type Timestamped = { timestamp: string }

/**
 * Sorts a list of transactions (or any timestamped items) by `timestamp` descending.
 */
export function sortByTimestampDesc<T extends Timestamped>(items: T[]): T[] {
  return items
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Formats ISO timestamps as `DD.MM.YYYY` (legacy profile display format).
 */
export function formatDateDDMMYYYY(isoString: string): string {
  const d = new Date(isoString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

