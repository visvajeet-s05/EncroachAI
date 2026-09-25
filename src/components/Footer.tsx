import React from 'react';

interface FooterProps {
  onRouteChange?: (route: string) => void;
  onOpenSdlcDrawer?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer id="main-footer" className="bg-[#070A0E] border-t border-[#1E2632] text-[#8B94A3] py-4 font-mono">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-tight">
            Encroach<span className="text-[#F5A623]">AI</span>
          </span>
          <span className="text-[#334155]">•</span>
          <span className="text-[#94A3B8]">
            Real-Time Vision-Edge Traffic Signal Actuation
          </span>
        </div>
      </div>
    </footer>
  );
};
