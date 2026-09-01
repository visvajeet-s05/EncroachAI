import React from 'react';
import { CheckCircle2, FlaskConical } from 'lucide-react';
import { DataProvenance } from '../types';

interface ProvenanceTagProps {
  provenance: DataProvenance;
  size?: 'sm' | 'xs';
  className?: string;
}

export const ProvenanceTag: React.FC<ProvenanceTagProps> = ({
  provenance,
  size = 'xs',
  className = '',
}) => {
  const isReal = provenance === 'real';

  const config = isReal
    ? {
        label: 'Measured',
        bg: 'bg-[#2ECC71]/15',
        text: 'text-[#2ECC71]',
        border: 'border-[#2ECC71]/35',
        Icon: CheckCircle2,
      }
    : {
        label: 'Projected',
        bg: 'bg-[#F5A623]/15',
        text: 'text-[#F5A623]',
        border: 'border-[#F5A623]/35',
        Icon: FlaskConical,
      };

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-[11px] gap-1.5';

  const iconSizeClasses = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-semibold uppercase tracking-wider border shadow-xs select-none ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      title={
        isReal
          ? 'Measured: Derived from direct edge camera detection & empirical road trials'
          : 'Projected: Illustrative benchmark from calibrated micro-simulation baseline'
      }
    >
      <config.Icon className={`${iconSizeClasses} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};
