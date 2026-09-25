import React from 'react';
import { Github, Mail, Sliders, User, Home as HomeIcon } from 'lucide-react';

interface FooterProps {
  onRouteChange: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onRouteChange }) => {
  return (
    <footer id="main-footer" className="bg-[#0B0F15] border-t border-[#1E2632] text-[#8B94A3] py-8">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        
        {/* Brand & Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-white tracking-tight">
              Encroach<span className="text-[#F5A623]">AI</span>
            </span>
            <span className="text-[#334155]">•</span>
            <span className="text-[#94A3B8]">
              Autonomous Vision-Edge Arterial Signal Actuation
            </span>
          </div>
          <span className="text-[#334155] hidden sm:inline">•</span>
          <span className="text-[#64748B] text-[11px]">
            Calibrated on Anna Salai (SH-1) ITS Corridor
          </span>
        </div>

        {/* Operational Navigation Links */}
        <div className="flex items-center gap-5 flex-wrap justify-center">
          <button
            onClick={() => onRouteChange('/')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Corridor Operations Dashboard
          </button>
          <button
            onClick={() => onRouteChange('/tool')}
            className="hover:text-white transition-colors cursor-pointer text-[#F5A623] font-semibold"
          >
            SCADA Actuation Console
          </button>
          <span className="text-[#334155]">•</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Firmware Spec</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
