// Recommendation Cards Component for Smart Navigation
// Based on creative phase UX design decisions

import { Recommendation } from '../types/userState';

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  onRecommendationAction: (recommendation: Recommendation) => void;
}

/**
 * Individual Recommendation Card Component
 */
function RecommendationCard({ 
  recommendation, 
  onAction 
}: { 
  recommendation: Recommendation; 
  onAction: () => void;
}) {
  const priorityColors = {
    high: 'border-red-500 bg-red-900/20',
    medium: 'border-yellow-500 bg-yellow-900/20',
    low: 'border-blue-500 bg-blue-900/20'
  };

  const priorityBadgeColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  if (!recommendation.visible) {
    return null;
  }

  return (
    <div className={`border rounded-lg p-4 mb-4 ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{recommendation.icon}</span>
          <h3 className="text-white font-medium">{recommendation.title}</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs text-white ${priorityBadgeColors[recommendation.priority]}`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-3">{recommendation.description}</p>
      <button 
        onClick={onAction}
        className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        {recommendation.action}
      </button>
    </div>
  );
}

/**
 * Recommendation Cards Container Component
 */
export function RecommendationCards({ 
  recommendations, 
  onRecommendationAction 
}: RecommendationCardsProps) {
  const visibleRecommendations = recommendations.filter(rec => rec.visible);

  if (visibleRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Recommended for You</h2>
      {visibleRecommendations.map((recommendation, index) => (
        <RecommendationCard 
          key={index} 
          recommendation={recommendation}
          onAction={() => onRecommendationAction(recommendation)}
        />
      ))}
    </div>
  );
}
