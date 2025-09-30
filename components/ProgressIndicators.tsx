// Progress Indicators Component for Smart Navigation
// Based on creative phase UX design decisions

import { ProgressIndicator } from '../types/userState';

interface ProgressIndicatorsProps {
  indicators: ProgressIndicator[];
}

/**
 * Individual Progress Bar Component
 */
function ProgressBar({ indicator }: { indicator: ProgressIndicator }) {
  const statusColors = {
    completed: 'bg-green-500',
    'in-progress': 'bg-blue-500',
    'not-started': 'bg-gray-500'
  };

  const statusTextColors = {
    completed: 'text-green-400',
    'in-progress': 'text-blue-400',
    'not-started': 'text-gray-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{indicator.icon}</span>
          <h3 className="text-white font-medium">{indicator.title}</h3>
        </div>
        <span className={`text-sm ${statusTextColors[indicator.status]}`}>
          {indicator.progress}%
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${statusColors[indicator.status]}`}
          style={{ width: `${indicator.progress}%` }}
        />
      </div>
      <p className="text-gray-400 text-sm">{indicator.description}</p>
    </div>
  );
}

/**
 * Progress Indicators Container Component
 */
export function ProgressIndicators({ indicators }: ProgressIndicatorsProps) {
  if (indicators.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Your Progress</h2>
      {indicators.map((indicator, index) => (
        <ProgressBar key={index} indicator={indicator} />
      ))}
    </div>
  );
}
