export type SquareCoord = { x: number; y: number }

/**
 * Computes the dot position for square breathing based on:
 * - position: which side (0..3)
 * - progress: 0..100 along that side
 */
export function getSquareBreathingDotPosition(
  position: number,
  progress: number,
  sideLength = 140,
  padding = 20
): SquareCoord {
  const p = Math.max(0, Math.min(100, progress))
  const t = (sideLength * p) / 100

  switch (position) {
    case 0: // left side (up)
      return { x: padding, y: padding + t }
    case 1: // top side (right)
      return { x: padding + t, y: padding }
    case 2: // right side (down)
      return { x: padding + sideLength, y: padding + t }
    case 3: // bottom side (left)
      return { x: padding + sideLength - t, y: padding + sideLength }
    default:
      return { x: padding, y: padding }
  }
}

