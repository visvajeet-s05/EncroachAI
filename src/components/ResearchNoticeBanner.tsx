import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { ProvenanceTag } from './ProvenanceTag';

interface ResearchNoticeBannerProps {
  className?: string;
  compact?: boolean;
}

export const ResearchNoticeBanner: React.FC<ResearchNoticeBannerProps> = ({ 
  className = '',
  compact = false 
}) => {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B222D] border border-[#242C38] text-[11px] font-mono text-[#8B94A3] ${className}`}>
        <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping shrink-0" />
        <span>
          <strong className="text-white">Data Provenance:</strong> Metrics tagged with <ProvenanceTag provenance="real" size="xs" /> or <ProvenanceTag provenance="projected" size="xs" /> throughout.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-[#131820] border border-[#242C38] shadow-sm relative overflow-hidden ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              Data Provenance & Transparency Notice
            </span>
            <div className="flex items-center gap-1.5">
              <ProvenanceTag provenance="real" size="xs" />
              <ProvenanceTag provenance="projected" size="xs" />
            </div>
          </div>
          <p className="text-[#8B94A3] leading-relaxed">
            Individual results throughout this platform are explicitly tagged by origin: <strong className="text-[#2ECC71]">Measured</strong> indicates values derived from real edge camera inference and field recordings, while <strong className="text-[#F5A623]">Projected</strong> denotes baseline benchmark metrics from calibrated SUMO micro-simulations.
          </p>
        </div>
      </div>
    </div>
  );
};
