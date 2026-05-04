import { Home, Trophy, User, Wind } from 'lucide-react'
import { useStore } from '@nanostores/react'

import { navigationMessages } from '@/src/i18n/messages/navigation'

export type BottomNavRoute = 'home' | 'breathe46' | 'badges' | 'profile'
export type BottomNavDots = Partial<Record<BottomNavRoute, boolean>>

type BottomNavItem = {
  route: BottomNavRoute
  label: string
  Icon: typeof Home
}

export function BottomNav(props: { activeRoute: BottomNavRoute; onNavigate: (route: BottomNavRoute) => void; dots?: BottomNavDots }) {
  const nav = useStore(navigationMessages)

  const sideInsetPx = 16
  const bottomInsetPx = 16

  const items: BottomNavItem[] = [
    { route: 'home', label: nav.tabs?.home || 'Home', Icon: Home },
    { route: 'breathe46', label: nav.tabs?.breathe46 || 'Breathing', Icon: Wind },
    { route: 'badges', label: nav.tabs?.badges || 'Achievements', Icon: Trophy },
    { route: 'profile', label: nav.tabs?.profile || 'Profile', Icon: User },
  ]

  return (
    <nav aria-label="Основная навигация" className="fixed z-50" style={{ left: 0, right: 0, bottom: 0 }}>
      <div
        className="mx-auto w-full max-w-[560px]"
        style={{
          paddingLeft: `${sideInsetPx}px`,
          paddingRight: `${sideInsetPx}px`,
          paddingBottom: `calc(${bottomInsetPx}px + env(safe-area-inset-bottom))`,
        }}
      >
        <div
          className="w-full rounded-2xl"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 92%, transparent)',
            border: '1px solid var(--color-border-primary)',
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 26px rgba(0,0,0,0.45)',
          }}
        >
          <div className="flex items-stretch justify-between">
          {items.map(({ route, label, Icon }) => {
            const isActive = props.activeRoute === route
            const showDot = props.dots?.[route] === true
            return (
              <button
                key={route}
                type="button"
                onClick={() => props.onNavigate(route)}
                aria-current={isActive ? 'page' : undefined}
                className="flex-1 min-h-[56px] min-w-[44px] px-2 py-2 flex flex-col items-center justify-center gap-1 touch-friendly"
                style={{
                  color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {showDot && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 block size-2 rounded-full"
                      style={{ backgroundColor: 'var(--color-brand-primary)' }}
                    />
                  )}
                </span>
                <span className="typography-small leading-none">{label}</span>
              </button>
            )
          })}
          </div>
        </div>
      </div>
    </nav>
  )
}

