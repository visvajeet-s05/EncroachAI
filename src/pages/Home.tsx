import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Eye, 
  Cpu, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  BarChart3,
  Layers,
  MapPin,
  Radio,
  Play
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PipelineStep } from '../components/PipelineStep';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { SeverityBadge } from '../components/SeverityBadge';
import { ResearchNoticeBanner } from '../components/ResearchNoticeBanner';
import { ProvenanceTag } from '../components/ProvenanceTag';
import { ThreeIntersectionViewer } from '../components/ThreeIntersectionViewer';
import { DetectionSample } from '../types';
import detectionSamples from '../data/detectionSamples.json';
import simulationResults from '../data/simulationResults.json';

interface HomeProps {
  onRouteChange: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onRouteChange }) => {
  const sample1 = detectionSamples[0] as unknown as DetectionSample;
  const heavyData = simulationResults.heavy;

  return (
    <div id="home-page" className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 pt-10 sm:pt-14 md:pt-20 pb-12 sm:pb-16 overflow-hidden">
        {/* Animated City Grid Drift Background */}
        <div className="absolute inset-0 traffic-grid-pattern opacity-40 pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Live System Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B222D] border border-[#242C38] text-xs font-mono text-[#F5A623] mb-6 shadow-lg shadow-black/40"
        >
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
          <span>Real-Time Autonomous ITS • Vision-Edge Adaptive Signal Control</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[#F2F4F7] max-w-5xl leading-[1.1] mb-6"
        >
          Traffic signals that see the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#ffb944] to-[#fcd34d]">real road</span>.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-[#8B94A3] max-w-3xl leading-relaxed mb-10"
        >
          Static traffic models assume ideal road capacity. Real streets have vendors, double-parked vehicles, and informal stalls. We built a vision-edge system that sees the difference — and dynamically adapts signal cycles using Spatial-Temporal Graph Neural Networks.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            id="hero-cta-demo"
            onClick={() => onRouteChange('/demo')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] font-semibold text-sm transition-all duration-200 shadow-xl shadow-[#F5A623]/25 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Eye className="w-4 h-4" />
            Launch Edge Vision Stream
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="hero-cta-simulation"
            onClick={() => onRouteChange('/simulation')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#131820] hover:bg-[#1B222D] text-[#F2F4F7] border border-[#242C38] hover:border-[#8B94A3]/50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#10B981]" />
            Signal Actuator & 3D Twin
          </button>
        </motion.div>

        {/* Quick Corridor Snapshot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 pt-8 border-t border-[#242C38]/60 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#8B94A3]"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F5A623]" /> Evaluated on Anna Salai & T. Nagar, Chennai
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#2ECC71]" /> YOLOv10 Edge Vision + ST-GNN
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#38BDF8]" /> SUMO Micro-simulation Validated
          </span>
        </motion.div>
      </section>

      {/* 2. 3D INTERSECTION DIGITAL TWIN SHOWCASE */}
      <section className="py-12 md:py-16 bg-[#090D13] border-t border-[#242C38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                  Interactive 3D Digital Twin
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 text-[10px] font-mono font-bold uppercase">
                  Real-Time Three.js
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Live Mixed-Traffic Approach Simulator
              </h2>
              <p className="text-xs md:text-sm text-[#8B94A3] mt-1 max-w-xl">
                Experience real-time vehicle deceleration, lateral lane merges around vendor pushcarts, and dynamic signal phase reallocation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onRouteChange('/simulation')}
                className="text-xs font-mono text-[#F5A623] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Open Full Simulation Workbench →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ThreeIntersectionViewer initialEncroachment="moderate" />
          </div>
        </div>
      </section>

      {/* 3. PROBLEM STATS STRIP */}
      <section className="py-12 sm:py-16 md:py-24 bg-[#0A0E14] border-t border-[#242C38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Research Notice */}
          <div className="mb-10 max-w-4xl mx-auto">
            <ResearchNoticeBanner />
          </div>

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                Empirical Field Evidence
              </span>
              <ProvenanceTag provenance="projected" size="sm" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F2F4F7] mt-1">
              The Cost of Assuming Ideal Roadways
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              id="stat-encroachment"
              value={52}
              suffix="%"
              label="Urban corridors with informal encroachment"
              sublabel="Based on Chennai arterial survey"
              trend="up"
              trendValue="High Impact"
              accentColor="amber"
            />
            <StatCard
              id="stat-capacity-loss"
              value={38}
              suffix="%"
              label="Avg. functional capacity loss observed"
              sublabel="Carriageway width reduction"
              trend="down"
              trendValue="-38% Flow"
              accentColor="red"
            />
            <StatCard
              id="stat-baselines"
              value={3}
              label="Traffic signal baseline models compared"
              sublabel="Fixed, SCATS-like & EncroachAI"
              accentColor="amber"
            />
            <StatCard
              id="stat-improvement"
              value={27.8}
              decimals={1}
              suffix="%"
              label="Wait-time improvement, heavy scenario"
              sublabel="SUMO micro-simulation result"
              trend="up"
              trendValue="Statistically Sig."
              accentColor="green"
            />
          </div>
        </div>
      </section>

      {/* 5. PIPELINE TEASER */}
      <section className="py-16 md:py-24 bg-[#0D1219] border-t border-[#242C38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                System Architecture
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F2F4F7] mt-1">
                How EncroachAI Works
              </h2>
              <p className="text-sm text-[#8B94A3] mt-2 max-w-xl">
                A closed-loop 3-stage intelligence pipeline running from intersection edge cameras to corridor-wide green wave coordination.
              </p>
            </div>

            <button
              id="pipeline-see-full-btn"
              onClick={() => onRouteChange('/architecture')}
              className="inline-flex items-center gap-2 text-sm font-mono font-medium text-[#F5A623] hover:text-[#ffb944] transition-colors cursor-pointer self-start md:self-auto"
            >
              See full architecture <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            <PipelineStep
              step={1}
              title="Perception: Edge Vision"
              subtitle="YOLOv10 Encroachment Classifier"
              description="Edge cameras detect and classify informal road intrusions (vendor carts, double parking, illegal stalls, pedestrians) and compute real-time effective carriageway width."
              icon={Eye}
              tags={['YOLOv10', 'Bounding Box IoU', 'Width Reduction %']}
              onClick={() => onRouteChange('/architecture')}
            />
            <PipelineStep
              step={2}
              title="Reasoning: Spatial-Temporal Graph"
              subtitle="ST-GNN Network Topology"
              description="A Spatio-Temporal Graph Neural Network models adjacent intersection dependencies, predicting how localized capacity constrictions propagate along the corridor."
              icon={Cpu}
              tags={['PyTorch Geometric', 'GCN + Temporal Conv', 'Queue Propagation']}
              onClick={() => onRouteChange('/architecture')}
            />
            <PipelineStep
              step={3}
              title="Control: Dynamic Signal Tuning"
              subtitle="SUMO Micro-simulation Dispatch"
              description="Dynamically recomputes green-wave splits and cycle offsets to clear bottlenecks before upstream queues spill back and gridlock the arterial corridor."
              icon={Sliders}
              tags={['SUMO TraCI', 'Webster Adaptation', 'Green Wave Sync']}
              isLast={true}
              onClick={() => onRouteChange('/architecture')}
            />
          </div>
        </div>
      </section>

      {/* 6. BEFORE / AFTER SHOWCASE */}
      <section className="py-16 md:py-24 bg-[#0A0E14] border-t border-[#242C38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
              Empirical Comparison
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F2F4F7] mt-1">
              One Intersection, Two Realities
            </h2>
            <p className="text-sm text-[#8B94A3] mt-2 leading-relaxed">
              Slide to observe the gap between what standard traffic signal controllers assume (ideal 3-lane design capacity) versus what actually exists on Chennai streets during peak hours.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <BeforeAfterSlider
              id="home-before-after"
              sample={sample1}
              beforeLabel="Assumed Nominal Capacity (Fixed / SCATS)"
              afterLabel="Detected Functional Capacity (EncroachAI)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center justify-between gap-4 p-4 rounded-xl bg-[#131820] border border-[#242C38]">
              <div className="flex items-center gap-3">
                <SeverityBadge level="heavy" />
                <span className="text-xs font-mono text-[#8B94A3]">
                  Usman Road Northbound • Detected 38% saturation capacity drop
                </span>
              </div>

              <div className="sm:text-right">
                <button
                  id="home-explore-demo-gallery"
                  onClick={() => onRouteChange('/demo')}
                  className="text-xs font-mono text-[#F5A623] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Explore all 8 Chennai detection samples in Demo Gallery →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

