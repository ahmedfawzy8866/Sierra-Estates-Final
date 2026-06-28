import React from 'react';

interface LeadScoreBadgeProps {
  score: number;
}

export default function LeadScoreBadge({ score }: LeadScoreBadgeProps) {
  const getScoreClass = (s: number) => {
    if (s > 80) return 'intel-high';
    if (s > 50) return 'intel-mid';
    return 'intel-low';
  };

  const circumference = 94; // 2 * pi * r (r=15)
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className={`intel-score ${getScoreClass(score)}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" className="intel-svg">
        <circle 
          cx="17" 
          cy="17" 
          r="15" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
        />
      </svg>
      <span className="intel-score-val">{score}</span>
    </div>
  );
}
