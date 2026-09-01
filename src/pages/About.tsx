import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Cpu, 
  Building2, 
  FileCheck, 
  Github, 
  Linkedin, 
  Mail, 
  BookOpen, 
  Layers, 
  ExternalLink,
  Award,
  Calendar,
  Radio,
  Compass,
  Zap,
  Activity
} from 'lucide-react';
import { ResearchNoticeBanner } from '../components/ResearchNoticeBanner';

interface AboutProps {
  onRouteChange: (route: string) => void;
}

export const About: React.FC<AboutProps> = ({ onRouteChange }) => {
  return (
    <div id="about-page" className="w-full pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 text-xs font-mono text-[#F5A623] mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#2ECC71]" />
            <span>Engineering Architecture & Platform Profile</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F2F4F7] mb-4">
            About EncroachAI
          </h1>

          <p className="text-base md:text-lg text-[#8B94A3] leading-relaxed">
            EncroachAI is a high-performance Intelligent Transportation Systems (ITS) and Edge AI platform engineered for real-time traffic signal optimization and carriageway constriction compensation in high-density urban corridors.
          </p>
        </div>

        {/* Real-time Status Banner */}
        <div className="mb-12">
          <ResearchNoticeBanner />
        </div>

        {/* 1. LEAD ARCHITECT & SYSTEM CONTEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12 sm:mb-16">
          {/* Author / Architect Card */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#131820] border border-[#242C38] flex flex-col justify-between space-y-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#d97706] p-0.5 shadow-xl shadow-[#F5A623]/15 shrink-0 flex items-center justify-center text-[#0A0E14] font-mono font-bold text-xl sm:text-2xl">
                VK
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Visvajeet (Kabilan V)
                </h2>
                <div className="text-xs font-mono text-[#F5A623]">
                  Lead ITS & Computer Vision Systems Architect
                </div>
                <div className="text-xs text-[#8B94A3] flex items-center gap-1.5 pt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Intelligent Transportation Systems Group, Chennai, India
                </div>
              </div>
            </div>

            <p className="text-xs md:text-sm text-[#8B94A3] leading-relaxed">
              Specializing in real-time computer vision, Spatio-Temporal Graph Neural Networks, and Autonomous Traffic Control. Designing and deploying edge-accelerated AI models that dynamically resolve informal, heterogeneous, and high-density urban transit friction.
            </p>

            <div className="pt-4 border-t border-[#242C38] flex flex-wrap items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#0A0E14] hover:bg-[#1B222D] text-white text-xs font-mono border border-[#242C38] flex items-center gap-2 transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-[#F5A623]" /> GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#0A0E14] hover:bg-[#1B222D] text-white text-xs font-mono border border-[#242C38] flex items-center gap-2 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#38BDF8]" /> LinkedIn
              </a>
              <a
                href="mailto:visvajeetofficial@gmail.com"
                className="px-3.5 py-2 rounded-lg bg-[#0A0E14] hover:bg-[#1B222D] text-white text-xs font-mono border border-[#242C38] flex items-center gap-2 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#F5A623]" /> Contact Engineering
              </a>
            </div>
          </div>

          {/* System Specs Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#131820] border border-[#242C38] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#F5A623] uppercase tracking-wider mb-2">
                <Cpu className="w-4 h-4" />
                <span>System Architecture</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Autonomous Corridor Engine
              </h3>
              <p className="text-xs text-[#8B94A3]">
                Production Edge Node & Graph Synchronization Service (v1.4 Architecture)
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-[#0A0E14] border border-[#242C38] space-y-1">
                <div className="text-[#8B94A3]">Target Corridor Deployment</div>
                <div className="text-white font-bold">Anna Salai & T. Nagar Arterial Grid (Chennai)</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0A0E14] border border-[#242C38] space-y-1">
                <div className="text-[#8B94A3]">Compute Hardware Target</div>
                <div className="text-white font-bold">NVIDIA Jetson Orin Nano / TensorRT Edge Node</div>
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-[#2ECC71] flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Real-Time Autonomous ITS Controller</span>
            </div>
          </div>
        </div>

        {/* 2. RESEARCH LINEAGE & EVOLUTION (SLOTS / SLOTIFY) */}
        <section className="mb-12 sm:mb-16 p-6 sm:p-8 md:p-10 rounded-2xl bg-[#131820] border border-[#242C38] space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Platform Evolution</span>
          </div>

          <h2 className="text-2xl font-bold text-white">
            Civic-Tech Mobility & Dynamic Urban Flow
          </h2>

          <p className="text-xs md:text-sm text-[#8B94A3] leading-relaxed">
            EncroachAI builds upon earlier civic-tech mobility systems by the team, notably the <strong className="text-white">SLOTS / SLOTIFY</strong> urban parking analytics framework. While SLOTS focused on static curb parking occupancy modeling, real-world arterial field analysis revealed that curb parking and vendor stalls directly spill into active driving lanes during peak traffic hours.
          </p>

          <p className="text-xs md:text-sm text-[#8B94A3] leading-relaxed">
            This insight drove the transition from passive curb tracking to <strong className="text-[#F5A623]">active real-time vision-edge signal synchronization</strong> — converting camera feeds into dynamic control signals that directly prevent bottlenecked intersection gridlock.
          </p>

          <div className="pt-4 border-t border-[#242C38] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#0A0E14] border border-[#242C38]">
              <div className="text-[#38BDF8] font-bold mb-1">Phase 1: SLOTS / SLOTIFY</div>
              <div className="text-[#8B94A3]">Curb occupancy modeling & parking search friction analysis.</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0A0E14] border border-[#242C38]">
              <div className="text-[#F5A623] font-bold mb-1">Phase 2: EncroachAI (Real-Time System)</div>
              <div className="text-[#8B94A3]">Autonomous carriageway vision-edge signal timing optimization.</div>
            </div>
          </div>
        </section>

        {/* 3. REAL-TIME DEPLOYMENT & INTEGRATION CTA */}
        <section className="p-8 md:p-10 rounded-2xl bg-gradient-to-r from-[#131820] to-[#1B222D] border border-[#242C38] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time Operational Ready</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              Corridor Deployment & Autonomous Signal Actuation
            </h3>
            <p className="text-xs text-[#8B94A3] max-w-xl">
              Equipped with TraCI micro-simulation actuation and direct NTCIP / SCATS controller integration interfaces for municipal arterial grids.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onRouteChange('/simulation')}
              className="px-6 py-3 rounded-lg bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-mono font-bold transition-all shadow-lg shadow-[#F5A623]/20 cursor-pointer"
            >
              Open Simulation Console
            </button>
            <button
              onClick={() => onRouteChange('/demo')}
              className="px-5 py-3 rounded-lg bg-[#1B222D] hover:bg-[#242C38] text-white text-xs font-mono border border-[#242C38] cursor-pointer"
            >
              Launch Live Demo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
