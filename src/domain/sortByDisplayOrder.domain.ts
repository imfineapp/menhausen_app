export function sortByDisplayOrder<T extends { id: string }>(items: T[], displayOrder: string[]): T[] {
  return items.slice().sort((a, b) => {
    const indexA = displayOrder.indexOf(a.id)
    const indexB = displayOrder.indexOf(b.id)

    const aInOrder = indexA !== -1
    const bInOrder = indexB !== -1

    if (aInOrder && bInOrder) return indexA - indexB
    if (aInOrder) return -1
    if (bInOrder) return 1

    // Preserve original relative order when both are unknown.
    return 0
  })
}

