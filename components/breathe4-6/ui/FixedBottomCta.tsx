import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type FixedBottomCtaProps = {
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  secondaryLabel?: string
  onSecondary?: () => void
  secondaryDisabled?: boolean
  secondaryAnimate?: boolean
}

export function FixedBottomCta(props: FixedBottomCtaProps) {
  const { primaryLabel, onPrimary, primaryDisabled, secondaryLabel, onSecondary, secondaryDisabled, secondaryAnimate } = props

  return (
    <div className="fixed inset-x-0 bottom-0 pb-[35px] flex flex-col items-center gap-3 z-50 pointer-events-auto">
      {secondaryAnimate ? (
        <AnimatePresence>
          {secondaryLabel && onSecondary ? (
            <motion.button
              type="button"
              onClick={onSecondary}
              disabled={!!secondaryDisabled}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`w-[350px] min-h-[44px] min-w-[44px] h-[46px] rounded-xl border border-[#212121] bg-[rgba(217,217,217,0.04)] ${
                secondaryDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-[rgba(217,217,217,0.08)] active:scale-[0.98] transition-all duration-200'
              }`}
              data-name="Bottom Fixed Secondary CTA Button"
            >
              <div className="typography-button text-white text-center text-nowrap tracking-[-0.43px]">
                <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">{secondaryLabel}</p>
              </div>
            </motion.button>
          ) : null}
        </AnimatePresence>
      ) : secondaryLabel && onSecondary ? (
        <button
          type="button"
          onClick={onSecondary}
          disabled={!!secondaryDisabled}
          className={`w-[350px] min-h-[44px] min-w-[44px] h-[46px] rounded-xl border border-[#212121] bg-[rgba(217,217,217,0.04)] ${
            secondaryDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-[rgba(217,217,217,0.08)] active:scale-[0.98] transition-all duration-200'
          }`}
          data-name="Bottom Fixed Secondary CTA Button"
        >
          <div className="typography-button text-white text-center text-nowrap tracking-[-0.43px]">
            <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">{secondaryLabel}</p>
          </div>
        </button>
      ) : null}

      <button
        type="button"
        onClick={onPrimary}
        disabled={!!primaryDisabled}
        className={`bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center rounded-xl w-[350px] min-h-[44px] min-w-[44px] ${
          primaryDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-[#d1ef00] active:scale-[0.98] transition-all duration-200'
        }`}
        data-name="Bottom Fixed CTA Button"
      >
        <div className="typography-button text-[#2d2b2b] text-center text-nowrap tracking-[-0.43px]">
          <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">{primaryLabel}</p>
        </div>
      </button>
    </div>
  )
}

