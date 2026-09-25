import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Activity } from 'lucide-react';

export const LoadingFallback: React.FC = () => {
  return (
    <div 
      id="app-loading-fallback"
      className="w-full flex-1 min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative mb-6">
        {/* Radar concentric pulse rings */}
        <motion.div
          animate={{ scale: [1, 1.8, 2.2], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute -inset-4 rounded-full border border-[#F5A623]/40 -z-10"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1.8], opacity: [0.4, 0.1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          className="absolute -inset-2 rounded-full border border-[#38BDF8]/30 -z-10"
        />

        {/* Central glowing hub */}
        <div className="w-16 h-16 rounded-2xl bg-[#131820] border border-[#242C38] flex items-center justify-center text-[#F5A623] shadow-lg shadow-[#F5A623]/10">
          <Cpu className="w-8 h-8 animate-pulse text-[#F5A623]" />
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131820] border border-[#242C38] text-[11px] font-mono text-[#F5A623]">
          <Activity className="w-3 h-3 animate-spin" />
          <span>INITIALIZING CORRIDOR MODULE</span>
        </div>
        <p className="text-xs text-[#8B94A3] font-mono">
          Loading neural telemetry & spatial-temporal graphs...
        </p>
      </div>
    </div>
  );
};
