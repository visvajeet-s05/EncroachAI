import React from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  Cpu, 
  Code, 
  ShieldCheck, 
  Github,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Activity
} from 'lucide-react';

interface AboutProps {
  onRouteChange: (route: string) => void;
}

export const About: React.FC<AboutProps> = ({ onRouteChange }) => {
  const technologies = [
    { name: 'YOLOv10-Nano', category: 'Edge Vision Inference (38 FPS)', color: '#F5A623', spec: 'INT8 / FP16 TensorRT' },
    { name: 'PyTorch Geometric', category: 'Spatial-Temporal GNN (ST-GNN)', color: '#38BDF8', spec: 'Chebyshev Spectral Conv' },
    { name: 'SUMO 1.20 Micro-Sim', category: 'Microscopic Traffic Simulation', color: '#2ECC71', spec: 'Multi-Modal Vehicle Physics' },
    { name: 'TraCI / NEMA TS2', category: 'Actuator SDLC Controller Interface', color: '#A78BFA', spec: 'Sub-50ms Actuation Loop' },
    { name: 'NVIDIA Jetson Xavier', category: 'Edge Embedded Hardware', color: '#F97316', spec: '15W Low-Power Edge Unit' },
    { name: 'TypeScript & Vite', category: 'Real-Time Telemetry Dashboard', color: '#60A5FA', spec: 'High-Density ITS UI' },
    { name: 'Tailwind CSS', category: 'Design Architecture System', color: '#34D399', spec: 'Industrial HUD Theme' },
  ];

  const standards = [
    {
      title: 'NEMA TS2 / NTCIP 1202',
      desc: 'Signal controller interface standard ensuring direct compatibility with municipal actuation hardware and master controllers.',
      badge: 'Controller Interface'
    },
    {
      title: 'Sub-100ms Fail-Safe Watchdog',
      desc: 'Automatic optical occlusion fallback: reverts to calibrated fixed-time Webster cycles upon edge sensor disconnect or adverse weather.',
      badge: 'Fail-Safe Safety'
    },
    {
      title: 'IRC 106-1990 & HCM 2022',
      desc: 'Capacity calculations calibrated against Indian Roads Congress guidelines for heterogeneous non-lane-based traffic flows.',
      badge: 'Capacity Standard'
    }
  ];

  return (
    <div id="about-page" className="w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-16 space-y-12 md:space-y-16">
      
      {/* 1. System Specifications & Executive Summary */}
      <section className="p-8 sm:p-10 rounded-2xl bg-surface-elevated border border-muted shadow-xl shadow-black/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-muted">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#d4880f] flex items-center justify-center text-[#0A0E14] font-bold shrink-0 shadow-lg shadow-[#F5A623]/20 border border-[#F5A623]/40">
              <Radio className="w-7 h-7 text-[#0A0E14]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Encroach<span className="text-[#F5A623]">AI</span>
              </h1>
              <p className="text-sm font-mono text-[#8B94A3] mt-0.5">
                Autonomous Vision-Edge Signal Actuation Platform • System Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-white text-xs font-mono border border-muted flex items-center gap-2 transition-colors"
            >
              <Github className="w-4 h-4 text-[#F5A623]" />
              <span>Architecture Source</span>
            </a>
            <button
              onClick={() => onRouteChange('/tool')}
              className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
            >
              <span>Actuation Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Platform Overview & Engineering Mandate</span>
          </div>
          <p className="text-sm sm:text-base text-[#C8D1DC] leading-relaxed">
            EncroachAI is an enterprise-grade intelligent transportation systems (ITS) framework engineered to resolve a fundamental failure mode in contemporary urban traffic control: the assumption that road capacity is a static geometric constant. Deployed at the edge, EncroachAI continuously extracts physical carriageway constriction from high-frame-rate curbside video feeds, executes multi-hop spatial-temporal graph convolutions across arterial topologies, and directly actuates field signal controllers to dynamically reallocate phase green splits tailored to actual usable road geometry.
          </p>
        </div>
      </section>

      {/* 2. Engineering Motivation & 3-Tier System Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Problem Formulation (5 cols) */}
        <section className="lg:col-span-5 p-8 rounded-2xl bg-surface-elevated border border-muted shadow-xl shadow-black/30 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F5A623] font-semibold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Problem Formulation</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The Static Capacity Fallacy in Legacy ITS
            </h2>

            <p className="text-sm text-[#C8D1DC] leading-relaxed">
              Classical traffic signal controllers—from Webster’s 1958 formulation to legacy adaptive suites such as SCATS and SCOOT—rely on a foundational assumption: road capacity is a fixed constant governed strictly by curb-to-curb markings (nominal saturation flow s_0 ≈ 1,800–2,000 PCU/lane-hr).
            </p>

            <p className="text-sm text-[#94A3B8] leading-relaxed">
              In high-density Global South arterial corridors like Anna Salai (Chennai), informal curbside vendor stalls, commercial loading activities, double-parked vehicles, and pedestrian spillover usurp 30% to 50% of the physical carriageway. Computing signal timings on fictitious full-width capacity causes chronic phase under-allocation, severe queue spillbacks, and cascading arterial gridlock.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-muted text-xs font-mono space-y-2 text-[#8B94A3]">
            <div className="text-white font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2ECC71]" />
              <span>Closed-Loop Innovation</span>
            </div>
            <p className="text-[11px] leading-normal">
              Replacing static lane constants with continuous, vision-derived usable capacity multipliers (γ = W_eff / W_nominal) directly coupled to real-time saturation flow modulation (s_eff = s_0 × γ).
            </p>
          </div>
        </section>

        {/* Right Column: 3-Tier System Architecture Overview (7 cols) */}
        <section className="lg:col-span-7 p-8 rounded-2xl bg-surface-elevated border border-muted shadow-xl shadow-black/30 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-muted">
            <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Distributed 3-Tier System Architecture</span>
            </div>
            <span className="text-xs font-mono text-[#8B94A3]">Sub-50ms Closed Loop</span>
          </div>

          <div className="space-y-4">
            {/* Tier 1 */}
            <div className="p-4 rounded-xl bg-surface border border-muted space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#F5A623]">Tier 1: Curbside Vision-Edge Sensor Pipeline</span>
                <span className="text-[#8B94A3] text-[10px]">YOLOv10 TensorRT • 38 FPS</span>
              </div>
              <p className="text-xs sm:text-sm text-[#C8D1DC] leading-relaxed">
                IP67 roadside units process live camera feeds using accelerated TensorRT inference on low-power edge compute (NVIDIA Jetson Xavier / Orin) to detect, classify, and extract 2D perspective bounding polygons of lateral friction, calculating real-time effective carriageway width (W_eff).
              </p>
            </div>

            {/* Tier 2 */}
            <div className="p-4 rounded-xl bg-surface border border-muted space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#38BDF8]">Tier 2: Spatial-Temporal Corridor Reasoning (ST-GNN)</span>
                <span className="text-[#8B94A3] text-[10px]">Chebyshev Spectral Graph Conv</span>
              </div>
              <p className="text-xs sm:text-sm text-[#C8D1DC] leading-relaxed">
                Represents the entire 6.8 km arterial corridor as a directed graph topology. Evaluates inter-junction vehicle platoon arrival rates and forecasts upstream queue spillback bottlenecks 5 to 15 minutes ahead to prevent gridlock propagation.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="p-4 rounded-xl bg-surface border border-muted space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#2ECC71]">Tier 3: Controller Actuation & Split Modulation Gateway</span>
                <span className="text-[#8B94A3] text-[10px]">NEMA TS2 / TraCI SDLC Interface</span>
              </div>
              <p className="text-xs sm:text-sm text-[#C8D1DC] leading-relaxed">
                Dynamically modulates nominal saturation flow (s_eff = s_0 × γ) to compute Webster-compensated green splits and cycle balancing. Transmits phase adjustments directly to signal controllers via NEMA TS2 SDLC or TraCI actuation interfaces.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onRouteChange('/tool')}
              className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
            >
              <span>Explore Actuation Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

      </div>

      {/* 3. Fail-Safe Redundancy & Standards Compliance */}
      <section className="p-8 rounded-2xl bg-surface-elevated border border-muted space-y-6 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between pb-3 border-b border-muted">
          <div className="flex items-center gap-2 text-xs font-mono text-[#2ECC71] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Operational Safety & Standards Compliance</span>
          </div>
          <span className="text-xs font-mono text-[#8B94A3]">Mission-Critical ITS Grade</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {standards.map((std, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-surface border border-muted space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">{std.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A222D] text-[#38BDF8] border border-[#2B384A]">
                  {std.badge}
                </span>
              </div>
              <p className="text-xs text-[#8B94A3] leading-relaxed">
                {std.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Technology Stack & Execution Infrastructure */}
      <section className="p-8 rounded-2xl bg-surface-elevated border border-muted space-y-5 shadow-xl shadow-black/30">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8B94A3] uppercase tracking-wider font-semibold">
          <Code className="w-4 h-4 text-[#F5A623]" />
          <span>Core Technology Stack & Execution Environment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {technologies.map((tech, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface border border-muted space-y-1 text-xs font-mono hover:border-[#F5A623]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
                  <span className="text-white font-bold">{tech.name}</span>
                </div>
                <span className="text-[10px] text-[#8B94A3] font-mono">{tech.spec}</span>
              </div>
              <div className="text-[#64748B] text-[11px] pl-4">{tech.category}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
