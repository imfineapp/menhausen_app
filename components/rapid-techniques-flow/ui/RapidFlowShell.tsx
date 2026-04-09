import React from 'react'

import { Light } from '@/components/Light'
import { MiniStripeLogo } from '@/components/ProfileLayoutComponents'

export function RapidFlowShell(props: { children: React.ReactNode; logoOpacity?: number }) {
  const { children, logoOpacity = 1 } = props

  return (
    <div className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-bg-primary flex flex-col">
      <Light />
      <div style={{ opacity: logoOpacity, transition: 'opacity 0.2s ease-out' }}>
        <MiniStripeLogo />
      </div>
      {children}
    </div>
  )
}

