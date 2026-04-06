import React from 'react'

export function TechniquePrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-lg typography-button transition-colors min-h-[44px] min-w-[44px] ${
        disabled
          ? 'bg-[#333] text-[#8a8a8a] cursor-not-allowed'
          : 'bg-[#e1ff00] text-[#2d2b2b] hover:bg-[#d4e600]'
      }`}
    >
      {children}
    </button>
  )
}

export function TechniqueSecondaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-lg typography-button transition-colors min-h-[44px] min-w-[44px] ${
        disabled
          ? 'border border-[#333] text-[#8a8a8a] cursor-not-allowed'
          : 'border border-[#e1ff00] text-[#e1ff00] hover:bg-[#e1ff00] hover:text-[#2d2b2b]'
      }`}
    >
      {children}
    </button>
  )
}

export function TechniqueControlsRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 w-full">{children}</div>
}

