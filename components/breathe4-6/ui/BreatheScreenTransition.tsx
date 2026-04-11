import type { ReactNode } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type BreatheScreenTransitionProps = {
  /** Must change when the visible step changes (e.g. effectiveStep). */
  stepKey: number
  children: ReactNode
}

/**
 * Soft crossfade between rapid-techniques steps. Uses absolute stacking so exit/enter
 * can overlap (mode="sync") for a calmer handoff than instant swaps.
 * Respects prefers-reduced-motion.
 */
export function BreatheScreenTransition(props: BreatheScreenTransitionProps) {
  const { stepKey, children } = props
  const reduceMotion = useReducedMotion()
  const duration = reduceMotion ? 0 : 0.22

  return (
    <div className="relative h-full min-h-0 w-full">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={stepKey}
          className="absolute inset-0 flex h-full min-h-0 w-full flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
