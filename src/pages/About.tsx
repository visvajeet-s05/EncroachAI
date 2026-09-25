import React from 'react';
import { Activity, Radio, Sliders, ArrowRight } from 'lucide-react';

interface AboutProps {
  onRouteChange: (route: string) => void;
}

export const About: React.FC<AboutProps> = ({ onRouteChange }) => {
  return (
    <div id="about-page" className="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-12 space-y-6 font-mono">
      <div className="p-8 rounded-2xl bg-[#090D15] border border-[#1E2632] shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#d4880f] flex items-center justify-center text-[#0A0E14] font-bold mx-auto shadow-lg shadow-[#F5A623]/20">
          <Radio className="w-7 h-7 text-[#0A0E14]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 text-xs font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
            <span>OPERATIONAL SCADA ENGINE ONLINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Architecture Integrated Into Live Operations
          </h1>
          <p className="text-xs text-[#8B94A3] max-w-lg mx-auto">
            All theoretical whitepapers and static documentation have been compiled directly into the real-time autonomous edge perception pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
          <button
            onClick={() => onRouteChange('/')}
            className="p-4 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Corridor Operations Dashboard</span>
          </button>

          <button
            onClick={() => onRouteChange('/tool')}
            className="p-4 rounded-xl bg-[#141B24] hover:bg-[#1E2632] text-white font-bold text-xs border border-[#2B384A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#38BDF8]" />
            <span>SCADA Actuation Console</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[#1C2534] flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#64748B]">
          <span>NVIDIA Jetson Xavier FP16</span>
          <span>•</span>
          <span>NEMA TS2 SDLC 50ms</span>
          <span>•</span>
          <span>Anna Salai SH-1 (6.8 km)</span>
        </div>
      </div>
    </div>
  );
};
