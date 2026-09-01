import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  id?: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  sublabel?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  accentColor?: 'amber' | 'green' | 'red';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  label,
  sublabel,
  trend,
  trendValue,
  accentColor = 'amber',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const duration = 1200; // 1.2s animation as specced

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easeProgress * value;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  const colorStyles = {
    amber: 'text-[#F5A623] border-[#242C38] hover:border-[#F5A623]/50 border-glow',
    green: 'text-[#2ECC71] border-[#242C38] hover:border-[#2ECC71]/50 border-glow-green',
    red: 'text-[#E74C3C] border-[#242C38] hover:border-[#E74C3C]/50 border-glow-red',
  };

  const badgeStyles = {
    amber: 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30',
    green: 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30',
    red: 'bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30',
  };

  return (
    <motion.div
      ref={ref}
      id={id || `stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`bg-surface border border-muted rounded-xl p-5 md:p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${colorStyles[accentColor]} ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl md:text-4xl font-bold font-mono tracking-tight text-white">
            {prefix}
            {displayValue.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
            <span className={accentColor === 'amber' ? 'text-amber' : accentColor === 'green' ? 'text-green' : 'text-red'}>
              {suffix}
            </span>
          </span>
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${badgeStyles[accentColor]}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>

      <p className="text-xs uppercase tracking-wider font-semibold text-[#8B94A3]">
        {label}
      </p>

      {sublabel && (
        <p className="text-[11px] text-[#8B94A3]/70 font-mono mt-1">
          {sublabel}
        </p>
      )}

      {/* Styled progress bar with rounded-full container */}
      <div className="mt-4 h-1 w-full bg-[#242C38] rounded-full overflow-hidden">
        <div 
          className={`h-full ${accentColor === 'amber' ? 'bg-amber' : accentColor === 'green' ? 'bg-green' : 'bg-red'} transition-all duration-1000`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </motion.div>
  );
};
