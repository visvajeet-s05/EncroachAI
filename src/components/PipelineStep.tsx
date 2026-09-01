import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, ArrowRight } from 'lucide-react';

export interface PipelineStepProps {
  id?: string;
  step: number;
  title: string;
  subtitle?: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
  isLast?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

export const PipelineStep: React.FC<PipelineStepProps> = ({
  id,
  step,
  title,
  subtitle,
  description,
  icon: Icon,
  tags,
  isLast = false,
  onClick,
  isActive = false,
}) => {
  return (
    <div className="relative flex-1 group">
      <motion.div
        id={id || `pipeline-step-${step}`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
        onClick={onClick}
        className={`h-full bg-[#131820] border rounded-xl p-6 relative transition-all duration-200 cursor-pointer ${
          isActive 
            ? 'border-[#F5A623] shadow-lg shadow-[#F5A623]/10 bg-[#1B222D]' 
            : 'border-[#242C38] hover:border-[#F5A623]/60 hover:shadow-md hover:shadow-[#F5A623]/5'
        }`}
      >
        {/* Top row: step number + icon badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#1B222D] border border-[#242C38] text-[#8B94A3] group-hover:text-[#F5A623] group-hover:border-[#F5A623]/30 transition-colors">
            STAGE 0{step}
          </span>
          <div className="w-10 h-10 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Title & subtitle */}
        <h3 className="text-lg font-semibold text-[#F2F4F7] group-hover:text-white transition-colors mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs font-mono text-[#F5A623] mb-3">
            {subtitle}
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-[#8B94A3] leading-relaxed mb-4">
          {description}
        </p>

        {/* Tech tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#242C38]/60">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0A0E14] text-[#8B94A3] border border-[#242C38]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Connecting arrow/line on desktop */}
      {!isLast && (
        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 items-center justify-center pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-[#1B222D] border border-[#242C38] flex items-center justify-center text-[#F5A623] shadow-md">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};
