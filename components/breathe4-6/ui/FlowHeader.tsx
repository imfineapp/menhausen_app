import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { isTelegramWebAppAvailable } from '@/src/effects/telegram.effects'

export function FlowHeader(props: { backLabel: string; onBack: () => void; right?: React.ReactNode }) {
  const { backLabel, onBack, right } = props
  const [isTma, setIsTma] = useState(false)

  useEffect(() => {
    setIsTma(isTelegramWebAppAvailable())
  }, [])

  return (
    <div className="flex items-center justify-between">
      {isTma ? (
        <div />
      ) : (
        <Button variant="ghost" onClick={onBack} type="button">
          {backLabel}
        </Button>
      )}
      {right ?? <div />}
    </div>
  )
}

