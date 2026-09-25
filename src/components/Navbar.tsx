import React from 'react';
import { Radio, Terminal, Cpu, Activity } from 'lucide-react';

interface NavbarProps {
  currentRoute?: string;
  onRouteChange?: (route: string) => void;
  onOpenSdlcDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSdlcDrawer }) => {
  return (
    <>
      {/* Main Single-Page Header */}
      <header 
        id="main-navbar"
        className="sticky top-0 left-0 w-full z-40 bg-[#0A0E14]/95 backdrop-blur-md border-b border-[#242C38] shadow-lg shadow-black/40"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#d4880f] flex items-center justify-center shadow-md shadow-[#F5A623]/25 border border-[#F5A623]/40">
              <Radio className="w-4 h-4 text-[#0A0E14]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#F2F4F7] font-mono">
                Encroach<span className="text-[#F5A623]">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141B24] text-[#8B94A3] border border-[#242C38]">
                EDGE ACTUATION SYSTEM
              </span>
            </div>
          </div>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E131C] border border-[#1E2632] text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ECC71]"></span>
              </span>
              <span className="text-[#CBD5E1]">OPTICAL SENSOR</span>
              <span className="text-[#334155]">•</span>
              <span className="text-[#2ECC71] font-bold">ONLINE</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
