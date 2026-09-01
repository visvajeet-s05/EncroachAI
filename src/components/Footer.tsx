import React from 'react';
import { Github, FileText, Linkedin, Mail, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

interface FooterProps {
  onRouteChange: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onRouteChange }) => {
  return (
    <footer id="main-footer" className="bg-[#131820] border-t border-[#242C38] text-[#8B94A3] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#242C38]">
          {/* Brand & Abstract */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center text-[#0A0E14] font-bold font-mono">
                E
              </div>
              <span className="font-semibold text-lg text-[#F2F4F7] tracking-tight">
                Encroach<span className="text-[#F5A623]">AI</span>
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                Active Research
              </span>
            </div>
            <p className="text-sm text-[#8B94A3] leading-relaxed max-w-md">
              A Vision-Edge Traffic Signal Control framework that replaces ideal road-capacity assumptions with real-time YOLOv10 encroachment detection and Spatial-Temporal Graph Neural Networks.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-[#8B94A3]">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#F5A623]" /> Edge-Deployable
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" /> SUMO Validated
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#F2F4F7] font-semibold">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onRouteChange('/')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Command Center
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('/demo')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Edge Vision Stream
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('/simulation')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Signal Actuator & 3D Twin
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('/results')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Corridor Analytics & Telemetry
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('/architecture')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Neural ST-GNN Engine
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('/problem')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Urban Bottlenecks
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('/methodology')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Edge Calibration
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('/about')} className="hover:text-[#F5A623] transition-colors cursor-pointer">
                  Incident Dispatch & Cloud
                </button>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#F2F4F7] font-semibold">
              System Specification & Telemetry
            </h4>
            <div className="p-4 rounded-xl bg-[#1B222D] border border-[#242C38] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#F2F4F7]">Edge Architecture</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30">
                  Real-Time Active
                </span>
              </div>
              <p className="text-xs text-[#8B94A3]">
                Autonomous Vision-Edge Detection of Informal Road Constrictions for Dynamic Multi-Junction Traffic Signal Control.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F2F4F7] hover:text-[#F5A623] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" /> Source Engine
                </a>
                <button
                  onClick={() => onRouteChange('/methodology')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#F5A623] hover:underline cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> System Architecture →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8B94A3]">
          <div>
            EncroachAI Autonomous ITS Platform • Real-Time Edge Vision & ST-GNN Signal Control.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onRouteChange('/about')} className="hover:text-white transition-colors cursor-pointer">
              System Engineering & Team
            </button>
            <span>•</span>
            <span>Real-Time Corridor Telemetry Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
