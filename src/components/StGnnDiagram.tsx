import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Cpu, 
  Activity, 
  Sliders, 
  Layers, 
  Zap, 
  Clock, 
  ArrowDown, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Eye,
  GitBranch,
  Radio,
  Workflow
} from 'lucide-react';

export interface GnnLayerInfo {
  id: string;
  name: string;
  shortName: string;
  category: 'input' | 'spatial' | 'temporal' | 'fusion' | 'output';
  tag: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  tensorShape: string;
  paramCount: string;
  latencyMs: string;
  equation: string;
  equationDesc: string;
  functionSummary: string;
  mechanics: string[];
  nodesRepresented: string[];
}

const GNN_LAYERS: GnnLayerInfo[] = [
  {
    id: 'layer-input',
    name: '1. Input Tensor & Corridor Topology Graph',
    shortName: 'Input Tensor',
    category: 'input',
    tag: 'Feature Extraction',
    icon: Database,
    accentColor: '#F5A623',
    badgeBg: 'rgba(245, 166, 35, 0.15)',
    tensorShape: 'B × N × T × F [32, 7, 12, 4]',
    paramCount: '0 (Raw Input)',
    latencyMs: '1.2 ms',
    equation: 'X(t) = [q_i(t), v_i(t), W_{eff, i}(t), β_i(t)] \\in \\mathbb{R}^{7 \\times 12 \\times 4}',
    equationDesc: 'Extracts 4 empirical features per approach: queue length (q), approach velocity (v), effective road width (W_eff), and obstruction friction index (β) across 12 historical time-slices (10-min window).',
    functionSummary: 'Gathers multi-camera edge vision data from all 7 Anna Salai arterial intersections, encoding both static road geometry (adjacency matrix A) and dynamic friction.',
    mechanics: [
      'Encodes physical distances (d_ij) and turn split probabilities into weighted graph adjacency matrix A_ij.',
      'Normalizes continuous approach speeds and queue counts via z-score scaling.',
      'Aggregates lateral lane intrusion masks from Jetson Orin Nano edge cameras.'
    ],
    nodesRepresented: ['JN-01 Simpsons', 'JN-02 LIC', 'JN-03 Gemini', 'JN-04 Thousand Lights', 'JN-05 Nandanam', 'JN-06 Saidapet', 'JN-07 Guindy']
  },
  {
    id: 'layer-spatial-1',
    name: '2. Spatial Graph Convolution (ChebConv Block 1)',
    shortName: 'Spatial ChebConv 1',
    category: 'spatial',
    tag: 'Graph Convolution',
    icon: Network,
    accentColor: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    tensorShape: 'B × N × T × D_1 [32, 7, 12, 64]',
    paramCount: '12.8K params',
    latencyMs: '4.8 ms',
    equation: 'Z^{(1)} = \\sum_{k=0}^{K-1} \\theta_k T_k(\\tilde{L}) X, \\quad K=3 \\text{ Chebyshev Order}',
    equationDesc: 'Computes truncated Chebyshev polynomial graph filtering over normalized Graph Laplacian L̃ to capture multi-hop topological dependencies without expensive matrix inversions.',
    functionSummary: 'Propagates immediate localized bottleneck pressures to 1-hop and 2-hop neighbor junctions, computing how a curb blockage at Gemini Flyover constrains arrival rates at LIC and Thousand Lights.',
    mechanics: [
      'K=3 polynomial recursion captures up to 3rd-order spatial neighbors along the 6.8 km corridor.',
      'Learns distinct edge transformation kernels for upstream vs downstream arterial directions.',
      'Applies Swish activation and LayerNorm to stabilize graph gradient propagation.'
    ],
    nodesRepresented: ['Spatial Neighbor Convolutions (K=3)', 'Corridor Adjacency Matrix A', 'Turning Movement Matrices']
  },
  {
    id: 'layer-temporal-1',
    name: '3. Temporal Gated Dilated Convolution (TCN / GLU)',
    shortName: 'Temporal GCN 1',
    category: 'temporal',
    tag: 'Gated 1D Dilations',
    icon: Clock,
    accentColor: '#A78BFA',
    badgeBg: 'rgba(167, 139, 250, 0.15)',
    tensorShape: 'B × N × (T-4) × D_1 [32, 7, 8, 64]',
    paramCount: '18.4K params',
    latencyMs: '3.9 ms',
    equation: 'H^{(1)} = (X * \\Theta_1 + b_1) \\odot \\sigma(X * \\Theta_2 + b_2)',
    equationDesc: 'Gated Linear Unit (GLU) where 1D causal dilated convolutions over the time dimension extract vehicle platoon travel waves and signal cycle periodicity with exponential receptive fields.',
    functionSummary: 'Models how traffic density shockwaves travel along Anna Salai over time, calculating exact platoon arrival times under degraded speeds.',
    mechanics: [
      'Causal dilated kernels prevent temporal leakage from future time-steps.',
      'Gating operator σ acts as a dynamic informational filter, discarding transient noise.',
      'Captures cyclic red-green signal wave patterns across 30s to 120s time windows.'
    ],
    nodesRepresented: ['T-0 (Now)', 'T-1 (-30s)', 'T-2 (-60s)', 'T-3 (-90s)', 'T-4 (-120s)', 'T-5 (-5m)', 'T-6 (-10m)']
  },
  {
    id: 'layer-spatial-temporal-2',
    name: '4. Spatial-Temporal Fusion & Residual Block',
    shortName: 'ST-Fusion Block',
    category: 'fusion',
    tag: 'Residual Cross-Attention',
    icon: Cpu,
    accentColor: '#EC4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    tensorShape: 'B × N × T_final × D_2 [32, 7, 4, 128]',
    paramCount: '34.6K params',
    latencyMs: '6.4 ms',
    equation: 'H^{(2)} = \\text{LayerNorm}\\left(H^{(1)} + \\text{ChebConv}(\\text{GLU}(H^{(1)}))\\right)',
    equationDesc: 'Cascaded high-order Spatial-Temporal convolution with identity skip connections to prevent gradient attenuation in deep graph networks.',
    functionSummary: 'Synthesizes long-range corridor interactions, resolving whether downstream queues will spill back into upstream intersections before signal changes occur.',
    mechanics: [
      'Residual skip connections maintain low-level lane width features throughout deeper layers.',
      'Cross-layer dropout (0.15) prevents overfitting on atypical weather/rush-hour outliers.',
      'Compresses temporal history into highly predictive hidden bottleneck representations.'
    ],
    nodesRepresented: ['Corridor Shockwave Engine', 'Spillback Risk Matrix', 'Platoon Dispersion Coefficients']
  },
  {
    id: 'layer-output',
    name: '5. Multi-Head Signal Actuation & Phase Decoder',
    shortName: 'Actuation Heads',
    category: 'output',
    tag: 'Dynamic Webster Optimization',
    icon: Sliders,
    accentColor: '#2ECC71',
    badgeBg: 'rgba(46, 204, 113, 0.15)',
    tensorShape: 'B × N × Outputs [32, 7, 10]',
    paramCount: '8.2K params',
    latencyMs: '2.1 ms',
    equation: 'g_i^* = \\frac{y_i(t)}{\\sum y_j(t)} (C_0^* - L), \\quad C_0^* = \\frac{1.5L + 5}{1 - \\sum \\frac{q_i}{S_0 \\beta_i(t)}}',
    equationDesc: 'Decodes learned graph representations into optimal phase splits (g_i*), optimum cycle time (C_0*), coordinated progression offsets (θ_ij), and queue clearance times.',
    functionSummary: 'Dispatches validated signal timing actuation packets directly to local intersection controllers via TraCI and NTCIP protocols.',
    mechanics: [
      'Dynamic Webster Optimization: Saturation flow dynamically scaled by lateral friction β_i(t).',
      'Safety Clamping: Strict pedestrian minimums (≥15s) and maximum cycle constraints (≤140s).',
      'Green Wave Offset Engine: Phase offsets tuned to current platoon speed (26-38 km/h).'
    ],
    nodesRepresented: ['Split: Phase 1 (N-S Main)', 'Split: Phase 2 (E-W Cross)', 'Cycle: 60s-140s', 'Offset: 12s-34s', 'Spillback Alert']
  }
];

export const StGnnDiagram: React.FC = () => {
  const [hoveredLayerId, setHoveredLayerId] = useState<string>('layer-spatial-1');
  const [pinnedLayerId, setPinnedLayerId] = useState<string | null>(null);
  const [isSimulatingDataFlow, setIsSimulatingDataFlow] = useState<boolean>(true);

  const activeId = pinnedLayerId || hoveredLayerId;
  const activeLayer = GNN_LAYERS.find((l) => l.id === activeId) || GNN_LAYERS[1];

  return (
    <div id="st-gnn-interactive-diagram" className="w-full bg-[#101620] border border-[#242C38] rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-2xl overflow-hidden relative">
      {/* Background ambient mesh */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20 transition-colors duration-500"
        style={{ backgroundColor: activeLayer.accentColor }}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#242C38]/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 flex items-center gap-1.5 font-bold">
              <Workflow className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" style={{ animationDuration: '6s' }} />
              Interactive ST-GNN Architecture
            </span>
            <span className="text-xs font-mono text-[#8B94A3] hidden sm:inline-block">
              PyTorch Geometric Pipeline
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Spatial-Temporal Graph Neural Network Topology
          </h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => setIsSimulatingDataFlow(!isSimulatingDataFlow)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSimulatingDataFlow
                ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/30 font-semibold'
                : 'bg-[#141B24] text-[#8B94A3] border-[#242C38] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isSimulatingDataFlow ? 'Pulse: Active' : 'Pulse: Paused'}</span>
          </button>

          {pinnedLayerId && (
            <button
              onClick={() => setPinnedLayerId(null)}
              className="px-2.5 py-1.5 rounded-lg bg-[#242C38] text-white hover:bg-[#2F3A4B] transition-colors cursor-pointer text-[11px]"
            >
              Reset Pin
            </button>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#8B94A3] font-mono leading-relaxed">
        Hover over any layer in the network stack below to inspect tensor transformations, receptive fields, Chebyshev graph convolutions, and dynamic Webster actuation formulas.
      </p>

      {/* Main interactive grid: Left Layers Pipeline + Right Detailed Layer Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Layer Stack Diagram with Motion hover states */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B94A3] px-1 pb-1">
            <span>FORWARD PASS TENSOR FLOW</span>
            <span>TOTAL LATENCY: 18.4ms</span>
          </div>

          <div className="space-y-2.5">
            {GNN_LAYERS.map((layer, index) => {
              const Icon = layer.icon;
              const isHovered = hoveredLayerId === layer.id;
              const isPinned = pinnedLayerId === layer.id;
              const isActive = activeLayer.id === layer.id;

              return (
                <div key={layer.id} className="relative group">
                  {/* Visual connector pulse line */}
                  {index < GNN_LAYERS.length - 1 && (
                    <div className="absolute left-7 top-full h-2.5 w-0.5 bg-[#242C38] z-0">
                      {isSimulatingDataFlow && (
                        <motion.div
                          className="w-full h-2 bg-gradient-to-b from-[#F5A623] to-[#2ECC71] rounded-full"
                          animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.6, delay: index * 0.25 }}
                        />
                      )}
                    </div>
                  )}

                  {/* Interactive Layer Card with motion/react */}
                  <motion.div
                    id={`gnn-layer-${layer.id}`}
                    onMouseEnter={() => {
                      if (!pinnedLayerId) setHoveredLayerId(layer.id);
                    }}
                    onClick={() => {
                      setPinnedLayerId(pinnedLayerId === layer.id ? null : layer.id);
                    }}
                    whileHover={{ scale: 1.015, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`relative z-10 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-[#17202C] border-2 shadow-xl'
                        : 'bg-[#0E131A] border-[#242C38] hover:bg-[#141B24] hover:border-[#8B94A3]/50'
                    }`}
                    style={{
                      borderColor: isActive ? layer.accentColor : undefined,
                      boxShadow: isActive ? `0 0 24px ${layer.accentColor}25` : undefined
                    }}
                  >
                    {/* Active highlight glow overlay */}
                    {isActive && (
                      <motion.div
                        layoutId="gnnLayerActiveHighlight"
                        className="absolute inset-0 rounded-xl pointer-events-none -z-10"
                        style={{
                          background: `radial-gradient(circle at 15% 50%, ${layer.accentColor}18 0%, transparent 80%)`
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}

                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Layer icon + Index */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-all"
                          style={{ 
                            backgroundColor: isActive ? layer.badgeBg : '#141B24',
                            borderColor: isActive ? layer.accentColor : '#2A3545',
                            color: layer.accentColor
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate font-mono">
                              {layer.shortName}
                            </h4>
                            <span 
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0"
                              style={{ 
                                backgroundColor: layer.badgeBg, 
                                color: layer.accentColor 
                              }}
                            >
                              {layer.tag}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-[#8B94A3] truncate mt-0.5">
                            {layer.tensorShape}
                          </p>
                        </div>
                      </div>

                      {/* Right: Latency & Selection indicator */}
                      <div className="flex items-center gap-2 shrink-0 font-mono text-right">
                        <div className="hidden sm:block">
                          <span className="text-[11px] font-semibold text-white block">
                            {layer.latencyMs}
                          </span>
                          <span className="text-[9px] text-[#8B94A3] block">
                            {layer.paramCount}
                          </span>
                        </div>

                        <div 
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            isActive ? 'ring-4' : 'opacity-30'
                          }`}
                          style={{
                            backgroundColor: layer.accentColor,
                            boxShadow: isActive ? `0 0 10px ${layer.accentColor}` : undefined
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Quick instructions */}
          <div className="p-3 rounded-lg bg-[#0E131A] border border-[#242C38] flex items-center justify-between text-[11px] font-mono text-[#8B94A3]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Click layer to lock inspector</span>
            </span>
            <span className="text-[#2ECC71] font-semibold">
              {pinnedLayerId ? '📌 Locked' : '✨ Live Hover Mode'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Layer Deep Inspector (Dynamic reactive motion view) */}
        <div className="lg:col-span-6 xl:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLayer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="bg-[#0A0E14] border-2 rounded-2xl p-5 sm:p-6 lg:p-7 space-y-6 shadow-xl relative overflow-hidden"
              style={{ borderColor: `${activeLayer.accentColor}50` }}
            >
              {/* Top layer header badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#242C38]">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2.5 rounded-xl border"
                    style={{ 
                      backgroundColor: activeLayer.badgeBg,
                      borderColor: activeLayer.accentColor,
                      color: activeLayer.accentColor 
                    }}
                  >
                    <activeLayer.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span 
                      className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: activeLayer.accentColor }}
                    >
                      {activeLayer.tag} • SPECS
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
                      {activeLayer.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded-lg bg-[#141B24] border border-[#242C38] text-[11px] font-mono text-[#F2F4F7]">
                    Latency: <strong className="text-white">{activeLayer.latencyMs}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#141B24] border border-[#242C38] text-[11px] font-mono text-[#F2F4F7]">
                    Params: <strong className="text-white">{activeLayer.paramCount}</strong>
                  </span>
                </div>
              </div>

              {/* Mathematical Equation Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#8B94A3]">
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" style={{ color: activeLayer.accentColor }} />
                    Mathematical Operator Formulation
                  </span>
                  <span className="text-[10px] text-[#8B94A3]">LaTeX / Tensor Operator</span>
                </div>

                <div 
                  className="p-3.5 sm:p-4 rounded-xl bg-[#131820] border font-mono text-xs sm:text-sm text-white overflow-x-auto shadow-inner"
                  style={{ borderColor: `${activeLayer.accentColor}35` }}
                >
                  <code className="text-[#38BDF8] font-bold tracking-wide">
                    {activeLayer.equation}
                  </code>
                </div>
                <p className="text-[11px] font-mono text-[#8B94A3] leading-relaxed">
                  {activeLayer.equationDesc}
                </p>
              </div>

              {/* Function Summary & Mechanics */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-white font-semibold">
                  Network Architectural Function:
                </div>
                <p className="text-xs text-[#CBD5E1] font-mono leading-relaxed bg-[#131820] p-3.5 rounded-xl border border-[#242C38]">
                  {activeLayer.functionSummary}
                </p>

                <div className="space-y-2 pt-1">
                  <div className="text-xs font-mono text-[#8B94A3]">Core Computational Mechanics:</div>
                  <div className="space-y-1.5">
                    {activeLayer.mechanics.map((mech, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono text-[#8B94A3]">
                        <span style={{ color: activeLayer.accentColor }} className="font-bold">▸</span>
                        <span className="text-[#E2E8F0]">{mech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Represented Nodes / Temporal Grid */}
              <div className="pt-3 border-t border-[#242C38] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8B94A3]">
                  <span>REPRESENTED GRAPH ELEMENTS & RECEPTIVE CHANNELS:</span>
                  <span style={{ color: activeLayer.accentColor }}>
                    Tensor: {activeLayer.tensorShape.split(' ')[0]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeLayer.nodesRepresented.map((node, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="px-2.5 py-1 rounded-lg bg-[#141B24] border border-[#2A374A] text-[11px] font-mono text-white flex items-center gap-1.5"
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full animate-pulse" 
                        style={{ backgroundColor: activeLayer.accentColor }} 
                      />
                      <span>{node}</span>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Footer tensor status */}
              <div className="p-3 rounded-xl bg-[#0D1219] border border-[#242C38] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#8B94A3]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
                  <span className="text-white">Active Forward Pass Receptive Field</span>
                </div>
                <span className="text-[#F5A623]">GPU Memory: ~14.2 MB TensorRT</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
