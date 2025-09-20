// Quick Actions Component for Smart Navigation
// Based on creative phase UX design decisions

import { QuickAction } from '../types/userState';

interface QuickActionsProps {
  actions: QuickAction[];
}

/**
 * Individual Quick Action Button Component
 */
function QuickActionButton({ action }: { action: QuickAction }) {
  if (!action.visible) {
    return null;
  }

  return (
    <button
      onClick={action.action}
      className={`${action.color} text-white p-4 rounded-lg text-center hover:opacity-80 transition-opacity min-h-[100px] flex flex-col items-center justify-center`}
    >
      <div className="text-2xl mb-2">{action.icon}</div>
      <div className="font-medium text-sm">{action.title}</div>
      <div className="text-xs opacity-80 mt-1">{action.description}</div>
    </button>
  );
}

/**
 * Quick Actions Container Component
 */
export function QuickActions({ actions }: QuickActionsProps) {
  const visibleActions = actions.filter(action => action.visible);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {visibleActions.map((action) => (
          <QuickActionButton key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}
