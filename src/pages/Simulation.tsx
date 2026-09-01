import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  LineChart, 
  MapPin, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Info,
  Clock,
  ArrowRight,
  Radio,
  Eye,
  Box
} from 'lucide-react';
import { ComparisonChart } from '../components/ComparisonChart';
import { StatCard } from '../components/StatCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { ResearchNoticeBanner } from '../components/ResearchNoticeBanner';
import { ProvenanceTag } from '../components/ProvenanceTag';
import { ThreeIntersectionViewer } from '../components/ThreeIntersectionViewer';
import { ScenarioData, SeverityLevel, IntersectionMarker } from '../types';
import simulationResultsData from '../data/simulationResults.json';
import corridorMapData from '../data/corridorMap.json';

interface SimulationProps {
  onRouteChange: (route: string) => void;
}

export const Simulation: React.FC<SimulationProps> = ({ onRouteChange }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | '3d-twin'>('analytics');
  const [selectedScenario, setSelectedScenario] = useState<SeverityLevel>('heavy');
  const [selectedIntersection, setSelectedIntersection] = useState<IntersectionMarker>(
    corridorMapData.intersections[2] as unknown as IntersectionMarker // Default to Gemini Flyover
  );
  const [trafficAnimActive, setTrafficAnimActive] = useState<boolean>(true);

  const scenarioData: ScenarioData = (simulationResultsData as any)[selectedScenario];

  const seriesConfig = [
    { key: 'static', label: 'Static Fixed Webster (Baseline)', color: 'red' },
    { key: 'adaptive', label: 'Capacity-Agnostic Adaptive (SCATS-like)', color: 'amber' },
    { key: 'yourSystem', label: 'EncroachAI (Vision + ST-GNN)', color: 'green' },
  ];

  return (
    <div id="simulation-page" className="w-full pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-xs font-mono text-[#2ECC71] mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SUMO Micro-simulation Telemetry & 3D Digital Twin</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F2F4F7] mb-4">
              Adaptive Signal Actuator & 3D Twin
            </h1>

            <p className="text-base md:text-lg text-[#8B94A3] leading-relaxed">
              Real-time multi-junction signal control vs static fixed baselines across the 7-node Anna Salai arterial corridor under dynamic curbside constriction.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center p-1 rounded-xl bg-[#131820] border border-[#242C38]">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`relative px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer z-10 ${
                  activeTab === 'analytics'
                    ? 'text-[#0A0E14]'
                    : 'text-[#8B94A3] hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics & Topology
                {activeTab === 'analytics' && (
                  <motion.div
                    layoutId="simMainTabIndicator"
                    className="absolute inset-0 bg-[#F5A623] rounded-lg -z-10 shadow-md shadow-[#F5A623]/25"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('3d-twin')}
                className={`relative px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer z-10 ${
                  activeTab === '3d-twin'
                    ? 'text-[#0A0E14]'
                    : 'text-[#8B94A3] hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                3D Digital Twin
                {activeTab === '3d-twin' && (
                  <motion.div
                    layoutId="simMainTabIndicator"
                    className="absolute inset-0 bg-[#2ECC71] rounded-lg -z-10 shadow-md shadow-[#2ECC71]/25"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Research Disclaimer Banner */}
        <div className="mb-10">
          <ResearchNoticeBanner />
        </div>

        {activeTab === '3d-twin' ? (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#131820] border border-[#242C38]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#242C38]">
                <div>
                  <span className="text-xs font-mono text-[#2ECC71] uppercase tracking-wider">
                    Micro-Scale Spatial Rendering
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    3D Mixed-Traffic Physical Approach Simulator
                  </h2>
                </div>
                <div className="text-xs font-mono text-[#8B94A3]">
                  Corridor Node: <strong className="text-white">{selectedIntersection.name}</strong>
                </div>
              </div>
              <ThreeIntersectionViewer initialEncroachment={selectedScenario} />
            </div>
          </div>
        ) : (
          <>
            {/* 1. SCENARIO SELECTOR TABS */}
            <div className="p-6 rounded-2xl bg-[#131820] border border-[#242C38] mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#242C38]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                      Simulation Scenario Configuration
                    </span>
                    <ProvenanceTag provenance={scenarioData.provenance || 'projected'} size="sm" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Select Encroachment Severity Regime
                  </h2>
                </div>

                {/* Scenario Segmented Controller */}
                <div className="relative flex items-center p-1.5 rounded-xl bg-[#0A0E14] border border-[#242C38]">
                  {(['light', 'moderate', 'heavy'] as SeverityLevel[]).map((level) => {
                    const isSelected = selectedScenario === level;
                    return (
                      <button
                        key={level}
                        id={`scenario-tab-${level}`}
                        onClick={() => setSelectedScenario(level)}
                        className={`relative px-5 py-2 rounded-lg text-xs font-mono font-bold capitalize transition-colors cursor-pointer z-10 ${
                          isSelected
                            ? level === 'heavy' ? 'text-white' : 'text-[#0A0E14]'
                            : 'text-[#8B94A3] hover:text-white'
                        }`}
                      >
                        {level} Regime
                        {isSelected && (
                          <motion.div
                            layoutId="simScenarioTabIndicator"
                            className={`absolute inset-0 rounded-lg -z-10 shadow-md ${
                              level === 'light'
                                ? 'bg-[#2ECC71] shadow-[#2ECC71]/25'
                                : level === 'moderate'
                                ? 'bg-[#F5A623] shadow-[#F5A623]/25'
                                : 'bg-[#E74C3C] shadow-[#E74C3C]/25'
                            }`}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scenario Context Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-[#0A0E14] border border-[#242C38] flex items-center justify-between">
                  <span className="text-[#8B94A3]">Carriageway Reduction:</span>
                  <span className="font-bold text-white">
                    {selectedScenario === 'light' ? '8% – 14%' : selectedScenario === 'moderate' ? '22% – 35%' : '38% – 58%'}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0A0E14] border border-[#242C38] flex items-center justify-between">
                  <span className="text-[#8B94A3]">Encroachment Entities:</span>
                  <span className="font-bold text-white">
                    {selectedScenario === 'light' ? '1–2 per approach' : selectedScenario === 'moderate' ? '3–5 per approach' : '6–9 per approach'}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0A0E14] border border-[#242C38] flex items-center justify-between sm:col-span-2 lg:col-span-1">
                  <span className="text-[#8B94A3]">Simulation Seed:</span>
                  <span className="font-bold text-[#F5A623]">SUMO_SEED_42_PEAK</span>
                </div>
              </div>
            </div>

            {/* 2. THREE-WAY COMPARISON CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
              {/* Bar Chart: Approach Wait Times */}
              <div className="p-6 rounded-2xl bg-[#131820] border border-[#242C38] flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                      Approach Performance
                    </span>
                    <span className="text-xs font-mono text-[#8B94A3]">Seconds per Vehicle</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Average Wait Time by Approach
                  </h3>
                  <p className="text-xs text-[#8B94A3] mt-1">
                    Lower is better. Notice how the gap between EncroachAI and baseline widens as encroachment increases.
                  </p>
                </div>

                <ComparisonChart
                  id="chart-wait-time"
                  type="bar"
                  data={scenarioData.waitTime}
                  series={seriesConfig}
                  xKey="approach"
                  yLabel="Wait Time (s)"
                  unit="s"
                  height={360}
                />
              </div>

              {/* Line Chart: Throughput Over Time */}
              <div className="p-6 rounded-2xl bg-[#131820] border border-[#242C38] flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#2ECC71] uppercase tracking-wider">
                      Corridor Capacity
                    </span>
                    <span className="text-xs font-mono text-[#8B94A3]">Vehicles / 10-min interval</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Discharge Throughput Over Simulated Hour
                  </h3>
                  <p className="text-xs text-[#8B94A3] mt-1">
                    Higher is better. EncroachAI preserves high corridor discharge without premature gridlock failure.
                  </p>
                </div>

                <ComparisonChart
                  id="chart-throughput"
                  type="line"
                  data={scenarioData.throughputOverTime}
                  series={seriesConfig}
                  xKey="time"
                  yLabel="Throughput (Veh/10m)"
                  unit="veh"
                  height={360}
                />
              </div>
            </div>

            {/* 3. MACRO KPI COMPARISON CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16">
              <StatCard
                id="sim-kpi-delay"
                value={scenarioData.avgDelaySec.yourSystem}
                decimals={1}
                suffix="s"
                label="Average Vehicle Delay (EncroachAI)"
                sublabel={`vs ${scenarioData.avgDelaySec.static}s (Fixed) | ${scenarioData.avgDelaySec.adaptive}s (SCATS)`}
                trend="down"
                trendValue={`-${Math.round(((scenarioData.avgDelaySec.static - scenarioData.avgDelaySec.yourSystem) / scenarioData.avgDelaySec.static) * 100)}% Delay`}
                accentColor="green"
              />
              <StatCard
                id="sim-kpi-queue"
                value={scenarioData.queueLengthMeters.yourSystem}
                suffix="m"
                label="Max Upstream Queue Length"
                sublabel={`vs ${scenarioData.queueLengthMeters.static}m (Fixed) | ${scenarioData.queueLengthMeters.adaptive}m (SCATS)`}
                trend="down"
                trendValue={`-${Math.round(((scenarioData.queueLengthMeters.static - scenarioData.queueLengthMeters.yourSystem) / scenarioData.queueLengthMeters.static) * 100)}% Queue`}
                accentColor="amber"
              />
              <StatCard
                id="sim-kpi-co2"
                value={scenarioData.co2EmissionsKgHr.yourSystem}
                suffix=" kg/hr"
                label="Simulated Corridor CO2 Emissions"
                sublabel={`vs ${scenarioData.co2EmissionsKgHr.static} kg/hr (Fixed Baseline)`}
                trend="down"
                trendValue={`-${Math.round(((scenarioData.co2EmissionsKgHr.static - scenarioData.co2EmissionsKgHr.yourSystem) / scenarioData.co2EmissionsKgHr.static) * 100)}% Emissions`}
                accentColor="green"
              />
            </div>

            {/* 4. INTERACTIVE CORRIDOR MAP & INTERSECTION INSPECTOR */}
            <section className="p-6 md:p-10 rounded-2xl bg-[#131820] border border-[#242C38]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#242C38]">
                <div>
                  <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                    Corridor Topology Network
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    Anna Salai 6.8km Coordinated Arterial
                  </h2>
                  <p className="text-xs text-[#8B94A3] mt-1">
                    Click on any junction node to inspect live green-phase timing allocations and capacity degradation.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTrafficAnimActive(!trafficAnimActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                      trafficAnimActive 
                        ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40' 
                        : 'bg-[#1B222D] text-[#8B94A3] border-[#242C38]'
                    }`}
                  >
                    {trafficAnimActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {trafficAnimActive ? 'Simulation Active' : 'Paused'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Map Visualizer SVG */}
                <div className="lg:col-span-7 bg-[#0A0E14] border border-[#242C38] rounded-xl p-6 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
                  {/* Animated Traffic Path */}
                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 320" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="corridorLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#F5A623" />
                        <stop offset="100%" stopColor="#2ECC71" />
                      </linearGradient>
                    </defs>

                    {/* Arterial Road Path */}
                    <path
                      d="M 40,60 L 110,90 L 190,140 L 260,160 L 330,210 L 400,240 L 470,280"
                      stroke="#242C38"
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 40,60 L 110,90 L 190,140 L 260,160 L 330,210 L 400,240 L 470,280"
                      stroke="url(#corridorLineGrad)"
                      strokeWidth="4"
                      strokeDasharray={trafficAnimActive ? '8 6' : 'none'}
                      strokeLinecap="round"
                      fill="none"
                      className={trafficAnimActive ? 'animate-pulse' : ''}
                    />
                  </svg>

                  {/* Interactive Nodes Placed along Arterial */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {corridorMapData.intersections.map((intNode, idx) => {
                      const isSelected = selectedIntersection.id === intNode.id;
                      const isActiveScope = intNode.scope === 'active-experiment';
                      return (
                        <button
                          key={intNode.id}
                          id={`node-btn-${intNode.id}`}
                          onClick={() => setSelectedIntersection(intNode as IntersectionMarker)}
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1B222D] border-[#F5A623] shadow-lg shadow-[#F5A623]/20 scale-105'
                              : isActiveScope
                              ? 'bg-[#131820]/95 border-[#242C38] hover:border-[#8B94A3]'
                              : 'bg-[#131820]/60 border-dashed border-[#242C38]/80 hover:border-[#8B94A3]/60 opacity-80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-[#8B94A3]">
                              JN 0{idx + 1}
                            </span>
                            {isActiveScope ? (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-semibold bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/40">
                                Active
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono text-[#8B94A3] bg-[#242C38]/40 border border-[#242C38]">
                                Context
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-white line-clamp-1">
                            {intNode.name.split('/')[0]}
                          </div>
                          <div className="text-[10px] font-mono text-[#F5A623] mt-1 flex items-center justify-between">
                            <span>Cap: {intNode.effectiveCapacityPct}%</span>
                            <SeverityBadge level={intNode.currentSeverity as SeverityLevel} showIcon={false} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Live Green Wave Signal Status */}
                  <div className="relative z-10 pt-6 mt-6 border-t border-[#242C38] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8B94A3]">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#2ECC71] animate-ping" />
                      <span className="text-white font-medium">Green Wave Coordination: Active (ST-GNN)</span>
                    </div>
                    <span>Corridor Speed: ~28.4 km/h (vs 14.1 km/h Baseline)</span>
                  </div>
                </div>

                {/* Selected Intersection Deep Inspector */}
                <div className="lg:col-span-5 bg-[#0A0E14] border border-[#242C38] rounded-xl p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                          Live Node Inspector
                        </span>
                        {selectedIntersection.scope === 'active-experiment' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                            Active Experiment Site
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#8B94A3] bg-[#242C38] border border-[#242C38]">
                            Extended Network Context
                          </span>
                        )}
                      </div>
                      <SeverityBadge level={selectedIntersection.currentSeverity} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">
                      {selectedIntersection.name}
                    </h3>
                    <p className="text-xs font-mono text-[#8B94A3] mb-4">
                      Coordinates: {selectedIntersection.lat.toFixed(4)}° N, {selectedIntersection.lng.toFixed(4)}° E
                    </p>

                    {selectedIntersection.scope === 'extended-context' && (
                      <div className="p-2.5 rounded-lg bg-[#131820] border border-[#242C38] text-[11px] font-mono text-[#8B94A3] mb-4">
                        ℹ️ <strong className="text-white">Corridor Context:</strong> Evaluated for network-wide micro-simulation flow dynamics, extending beyond the primary experimental camera recording site.
                      </div>
                    )}

                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 rounded-lg bg-[#131820] border border-[#242C38] flex justify-between">
                        <span className="text-[#8B94A3]">Design Saturation Capacity:</span>
                        <span className="text-[#2ECC71] font-bold">{selectedIntersection.nominalCapacityPcu} PCU/hr</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#131820] border border-[#242C38] flex justify-between">
                        <span className="text-[#8B94A3]">Observed Functional Flow:</span>
                        <span className="text-[#E74C3C] font-bold">{selectedIntersection.observedCapacityPcu} PCU/hr</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#131820] border border-[#242C38] flex justify-between">
                        <span className="text-[#8B94A3]">EncroachAI Green Split:</span>
                        <span className="text-[#F5A623] font-bold">{selectedIntersection.activeGreenPhaseSec}s / Cycle</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#242C38]">
                    <div className="text-[11px] font-mono text-[#8B94A3] mb-3">
                      Coordinated with adjacent junctions: {selectedIntersection.coordinatedWith.join(', ')}
                    </div>
                    <button
                      onClick={() => onRouteChange('/results')}
                      className="w-full py-2.5 rounded-lg bg-[#1B222D] hover:bg-[#242C38] text-white text-xs font-mono font-semibold border border-[#242C38] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      View Full Corridor Ablation Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

