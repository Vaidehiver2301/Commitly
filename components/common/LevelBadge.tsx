
import React from 'react';
import { LevelName } from '../../types';
import { LEVELS } from '../../constants';

interface LevelBadgeProps {
  levelName: LevelName;
  size?: 'sm' | 'md' | 'lg';
}

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);


export const LevelBadge: React.FC<LevelBadgeProps> = ({ levelName, size = 'md' }) => {
  const level = LEVELS.find(l => l.name === levelName);
  if (!level) return null;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <div className={`inline-flex items-center gap-1.5 font-bold text-white rounded-full ${level.badgeColor} ${sizeStyles[size]}`}>
        <StarIcon className="w-4 h-4 text-yellow-300" />
        <span>{level.name}</span>
    </div>
  );
};
