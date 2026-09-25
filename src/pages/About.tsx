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
  Activity,
  Terminal,
  Calculator,
  Compass,
  FileText
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
      desc: 'Signal controller interface standard ensuring direct compatibility with municipal actuation hardware, BIU racks, and master controllers.',
      badge: 'Controller Interface'
    },
    {
      title: 'Sub-100ms Fail-Safe Watchdog',
      desc: 'Automatic optical occlusion fallback: reverts to calibrated fixed-time Webster cycles upon edge sensor disconnect, cable fault, or adverse weather.',
      badge: 'Fail-Safe Safety'
    },
    {
      title: 'IRC 106-1990 & HCM 2022',
      desc: 'Capacity calculations calibrated against Indian Roads Congress guidelines for heterogeneous non-lane-based traffic flows and PCU conversion.',
      badge: 'Capacity Standard'
    }
  ];

  return (
    <div id="about-page" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-14 space-y-12 font-mono">
      
      {/* 1. Header & Platform Authority */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#090D15] border border-[#1E2632] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#1E2632]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#d4880f] flex items-center justify-center text-[#0A0E14] font-bold shrink-0 shadow-lg shadow-[#F5A623]/20 border border-[#F5A623]/40">
              <Radio className="w-7 h-7 text-[#0A0E14]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F5A623] tracking-widest uppercase">
                  ENGINEERING SPECIFICATION & RESEARCH WHITEPAPER
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Encroach<span className="text-[#F5A623]">AI</span> Architecture
              </h1>
              <p className="text-xs sm:text-sm text-[#8B94A3] mt-0.5">
                Autonomous Vision-Edge Dynamic Signal Actuation via Curbside Constriction Estimation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRouteChange('/tool')}
              className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
            >
              <span>Operator SCADA Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#38BDF8] font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Platform Overview & Engineering Mandate</span>
          </div>
          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            EncroachAI is an industrial Intelligent Transportation Systems (ITS) framework engineered to eliminate a structural failure mode in urban traffic management: the assumption that carriageway capacity is a static geometric constant. Deployed at the edge along Anna Salai (SH-1), Chennai, EncroachAI continuously extracts physical road constriction caused by informal vendors, double-parked vehicles, and pedestrian spillover, computes usable road width, and directly modulates signal controllers via NEMA TS2 SDLC serial packets.
          </p>
        </div>
      </section>

      {/* 2. Mathematical Formulations & Capacity Modeling */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#090D15] border border-[#1E2632] space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2632]">
          <div className="flex items-center gap-2 text-xs text-[#F5A623] font-bold uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Mathematical Foundations & Traffic Flow Actuation Models</span>
          </div>
          <span className="text-xs text-[#8B94A3]">HCM 2022 / Webster Formulation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Formula 1: Usable Carriageway Ratio (Gamma) */}
          <div className="p-5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>1. Curbside Constriction Ratio (γ)</span>
              <span className="text-[10px] text-[#2ECC71]">Continuous Metric</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070A0E] border border-[#1C2534] text-center text-sm font-bold text-[#F5A623]">
              γ(t) = W_eff(t) / W_nom = 1 - ( Σ w_obs,k / W_nom )
            </div>
            <p className="text-xs text-[#8B94A3] leading-relaxed">
              Where <code>W_nom</code> is the marked physical approach width (e.g. 10.5m for 3 lanes), and <code>w_obs,k</code> represents the lateral penetration of the k-th detected obstacle into the active carriageway.
            </p>
          </div>

          {/* Formula 2: Modulated Saturation Flow */}
          <div className="p-5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>2. Modulated Approach Saturation Flow</span>
              <span className="text-[10px] text-[#38BDF8]">PCU Flow Model</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070A0E] border border-[#1C2534] text-center text-sm font-bold text-[#38BDF8]">
              s_eff(t) = s_0 × γ(t) = 1,800 × γ(t) [PCU / lane-hr]
            </div>
            <p className="text-xs text-[#8B94A3] leading-relaxed">
              Under severe lateral constriction (e.g. fruit pushcarts and loading vans occupying 4.2m of lane 0), saturation flow drops from nominal 1,800 PCU/hr to 1,080 PCU/hr, triggering queue accumulation under static timing.
            </p>
          </div>

          {/* Formula 3: Webster Dynamic Green Allocation */}
          <div className="p-5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>3. Webster Dynamic Green Split Compensation</span>
              <span className="text-[10px] text-[#A78BFA]">Controller Actuation</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070A0E] border border-[#1C2534] text-center text-sm font-bold text-[#A78BFA]">
              g_act(t) = min( g_nom / γ(t), g_nom + Δg_max )
            </div>
            <p className="text-xs text-[#8B94A3] leading-relaxed">
              Dynamically scales green split durations to clear queuing vehicles through constricted lateral bottlenecks, bounded by a strict safety extension cap <code>Δg_max</code> to prevent starvation of conflicting phases.
            </p>
          </div>

          {/* Formula 4: ST-GNN Chebyshev Spatial-Temporal Graph */}
          <div className="p-5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>4. Corridor-Wide Spatial-Temporal Graph Reasoning</span>
              <span className="text-[10px] text-[#2ECC71]">Multi-Hop GNN</span>
            </div>
            <div className="p-3 rounded-lg bg-[#070A0E] border border-[#1C2534] text-center text-sm font-bold text-[#2ECC71]">
              X^(l+1) = σ( Σ θ_k T_k( L~ ) X^(l) )
            </div>
            <p className="text-xs text-[#8B94A3] leading-relaxed">
              Evaluates inter-junction platoon progression across all 7 nodes of Anna Salai. Calculates upstream metering holds to prevent shockwave propagation into mid-corridor gridlocks.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Distributed 3-Tier System Architecture */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#090D15] border border-[#1E2632] space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2632]">
          <div className="flex items-center gap-2 text-xs text-[#38BDF8] font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Distributed 3-Tier Edge Architecture</span>
          </div>
          <span className="text-xs text-[#8B94A3]">Sub-50ms Closed-Loop Control</span>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F5A623]">Tier 1: Curbside Vision-Edge Sensor Pipeline</span>
              <span className="text-[#8B94A3] text-[10px]">YOLOv10 TensorRT • 38 FPS</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Roadside optical units process live RTSP streams using accelerated TensorRT INT8 inference on low-power edge units (NVIDIA Jetson Xavier / Orin). Detects and segments physical obstacle classes (pushcarts, illegal stalls, double-parked vehicles, pedestrian spillover) and computes real-time effective road geometry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#38BDF8]">Tier 2: Spatial-Temporal Corridor Reasoning (ST-GNN)</span>
              <span className="text-[#8B94A3] text-[10px]">Chebyshev Spectral Graph Conv</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Models the 6.8 km Anna Salai corridor as a directed arterial topology. Projects queue discharge profiles 5 to 15 minutes ahead, preventing upstream intersections from discharging platoons into downstream constricted bottlenecks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2ECC71]">Tier 3: Controller Actuation & SDLC Gateway</span>
              <span className="text-[#8B94A3] text-[10px]">NEMA TS2 / NTCIP 1202 Serial Bus</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Interfaces directly with municipal signal cabinets via Bus Interface Units (BIU) over RS-485. Encodes Webster green split offsets into standard Type 1 controller frames with sub-50ms serial cycle execution and full CRC-16 checksum validation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Fail-Safe Safety Watchdog & Standards Compliance */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#090D15] border border-[#1E2632] space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2632]">
          <div className="flex items-center gap-2 text-xs text-[#2ECC71] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Fail-Safe Operational Safety & Municipal Standards</span>
          </div>
          <span className="text-xs text-[#8B94A3]">Mission-Critical Infrastructure</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standards.map((std, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{std.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A222D] text-[#38BDF8] border border-[#2B384A]">
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

      {/* 5. Technology Stack & Execution Infrastructure */}
      <section className="p-8 sm:p-10 rounded-2xl bg-[#090D15] border border-[#1E2632] space-y-5 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-[#8B94A3] uppercase tracking-wider font-bold">
          <Code className="w-4 h-4 text-[#F5A623]" />
          <span>Core Technology Stack & Deployment Footprint</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {technologies.map((tech, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-1 text-xs hover:border-[#F5A623]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
                  <span className="text-white font-bold">{tech.name}</span>
                </div>
                <span className="text-[10px] text-[#8B94A3]">{tech.spec}</span>
              </div>
              <div className="text-[#64748B] text-[11px] pl-4">{tech.category}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
