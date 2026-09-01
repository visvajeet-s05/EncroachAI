import React from 'react';
import { SeverityLevel } from '../types';

interface SeverityBadgeProps {
  level: SeverityLevel;
  className?: string;
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  level,
  className = '',
  showIcon = true,
}) => {
  const configs = {
    light: {
      label: 'Light Encroachment',
      shortLabel: 'Light',
      bg: 'bg-[#2ECC71]/15',
      text: 'text-[#2ECC71]',
      border: 'border-[#2ECC71]/30',
      dot: 'bg-[#2ECC71]',
    },
    moderate: {
      label: 'Moderate Encroachment',
      shortLabel: 'Moderate',
      bg: 'bg-[#F5A623]/15',
      text: 'text-[#F5A623]',
      border: 'border-[#F5A623]/30',
      dot: 'bg-[#F5A623]',
    },
    heavy: {
      label: 'Heavy Encroachment',
      shortLabel: 'Heavy',
      bg: 'bg-[#E74C3C]/15',
      text: 'text-[#E74C3C]',
      border: 'border-[#E74C3C]/30',
      dot: 'bg-[#E74C3C]',
    },
  };

  const current = configs[level] || configs.moderate;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {showIcon && (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      )}
      <span>{current.shortLabel}</span>
    </span>
  );
};
