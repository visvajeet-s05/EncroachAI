import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Cpu, 
  Sliders, 
  ArrowRight, 
  Layers, 
  Code2, 
  Network, 
  Activity, 
  Zap, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Workflow
} from 'lucide-react';
import { StGnnDiagram } from '../components/StGnnDiagram';

interface ArchitectureProps {
  onRouteChange: (route: string) => void;
}

export const Architecture: React.FC<ArchitectureProps> = ({ onRouteChange }) => {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      id: 1,
      name: 'Layer 1: Perception (Vision-Edge)',
      shortName: 'Perception',
      tech: 'YOLOv10-Nano / Small on NVIDIA Jetson',
      icon: Eye,
      color: '#F5A623',
      headline: 'Real-time Object Detection & Carriageway Friction Estimation',
      summary: 'Extracts real-time boundary polygon encroachments, assigns semantic classes (vendors, double-parking, stalls, pedestrians), and computes the instantaneous effective width $W_{\\text{eff}}$ and capacity degradation factor $\\beta(t)$.',
      details: [
        'Model: Pre-trained on COCO + fine-tuned on India Driving Dataset (IDD) and 4,800 annotated frames from Chennai arterial intersections.',
        'Inference Speed: 38 FPS on NVIDIA Jetson Orin Nano (15W power envelope).',
        'Output: Approach vector $\\mathbf{X}_i(t) = [q_i(t), v_i(t), W_{\\text{eff}, i}(t), \\beta_i(t)]$ containing vehicle queue, arrival speed, usable road width, and friction penalty.',
      ],
      codeSnippet: `# Layer 1: Edge Carriageway Width Extraction
def estimate_functional_capacity(frame, nominal_width_m=10.5):
    # YOLOv10-NMS Free Real-time Inference
    results = yolov10_model(frame, conf=0.45, iou=0.65)
    encroachments = results.boxes.filter_by_class([
        'vendor_cart', 'double_parked', 'illegal_stall', 'pedestrian'
    ])
    
    # Project bounding box polygons into road plane perspective
    projected_mask = homography_warp(encroachments.polygons)
    encroached_width_m = compute_lateral_lane_intrusion(projected_mask)
    
    effective_width = max(3.5, nominal_width_m - encroached_width_m)
    capacity_ratio = effective_width / nominal_width_m
    return {"effective_width_m": effective_width, "capacity_pct": capacity_ratio * 100}`
    },
    {
      id: 2,
      name: 'Layer 2: Reasoning (Spatial-Temporal GNN)',
      shortName: 'Reasoning',
      tech: 'PyTorch Geometric Spatial-Temporal Graph Neural Network',
      icon: Cpu,
      color: '#38BDF8',
      headline: 'Network-Level Bottleneck & Queue Propagation Modeling',
      summary: 'Models the road network as a directed graph $\\mathcal{G} = (\\mathcal{V}, \\mathcal{E})$, where nodes represent intersection approaches and edges represent physical arterial connectivity and turn ratios.',
      details: [
        'Architecture: Spatial Graph Convolution (ChebConv) interleaved with Gated Temporal Convolution (GLU/TCN) layers.',
        'Horizon: Predicts arrival rates, downstream queue spillbacks, and discharge bottlenecks 5 to 15 minutes into the future.',
        'Coordination: Ensures that extending a green phase at an encroached intersection does not flood an already congested downstream bottleneck.',
      ],
      codeSnippet: `# Layer 2: Spatial-Temporal GNN Forward Pass
class SpatialTemporalGNN(nn.Module):
    def __init__(self, in_channels=4, hidden_dim=64, num_nodes=7):
        super().__init__()
        self.spatial_gcn1 = ChebConv(in_channels, hidden_dim, K=3)
        self.temporal_conv1 = TemporalGatedConv(hidden_dim, hidden_dim, kernel_size=3)
        self.spatial_gcn2 = ChebConv(hidden_dim, hidden_dim, K=3)
        self.temporal_conv2 = TemporalGatedConv(hidden_dim, hidden_dim, kernel_size=3)
        self.fc_timing = nn.Linear(hidden_dim, 4) # Green phase duration outputs
        
    def forward(self, x, edge_index, edge_weight):
        # x shape: [Batch, Nodes, Features (Queue, Speed, EffWidth, EncroachPct)]
        h = F.relu(self.spatial_gcn1(x, edge_index, edge_weight))
        h = self.temporal_conv1(h)
        h = F.relu(self.spatial_gcn2(h, edge_index, edge_weight))
        h = self.temporal_conv2(h)
        return self.fc_timing(h)`
    },
    {
      id: 3,
      name: 'Layer 3: Control (Adaptive Signal Optimization)',
      shortName: 'Control',
      tech: 'SUMO Micro-simulation TraCI + Modified Webster Green-Wave',
      icon: Sliders,
      color: '#2ECC71',
      headline: 'Dynamic Cycle Split & Green-Wave Phase Synchronization',
      summary: 'Translates predicted functional saturation flow into optimal stage split times $g_i^*$, cycle lengths $C^*$, and inter-junction offsets $\\theta_{ij}$ across the arterial corridor.',
      details: [
        'Signal Logic: Modified Webster Formulation where saturation flow $S_i(t) = S_{0, i} \\cdot \\beta_i(t)$ updates dynamically every 30 seconds.',
        'Safety Bounds: Minimum pedestrian crossing time enforced (min 15s) and maximum cycle length capped at 140s to avoid excessive side-street starvation.',
        'Validation: Direct TraCI interface with Simulation of Urban MObility (SUMO 1.20) running heterogeneous Indian traffic compositions (buses, autos, two-wheelers, cars).',
      ],
      codeSnippet: `# Layer 3: Dynamic Signal Timing Adaptation
def compute_adaptive_phase_splits(st_gnn_outputs, min_green=15, max_cycle=130):
    y_ratios = []
    for approach in st_gnn_outputs.approaches:
        # Dynamic Saturation Flow calculation
        real_time_sat_flow = NOMINAL_SAT_FLOW * (approach.effective_width / 10.5)
        flow_ratio_y = approach.predicted_demand_pcu / real_time_sat_flow
        y_ratios.append(flow_ratio_y)
        
    total_Y = sum(y_ratios)
    optimum_cycle = (1.5 * LOST_TIME + 5) / (1.0 - min(0.92, total_Y))
    cycle_clamped = max(60, min(max_cycle, optimum_cycle))
    
    # Calculate coordinated green splits
    green_splits = {
        app_id: (y / total_Y) * (cycle_clamped - LOST_TIME)
        for app_id, y in zip(st_gnn_outputs.approach_ids, y_ratios)
    }
    return cycle_clamped, green_splits`
    }
  ];

  const techBadges = [
    { name: 'YOLOv10', category: 'Perception Model', role: 'Real-time NMS-free Vision' },
    { name: 'PyTorch Geometric', category: 'Graph ML', role: 'ST-GNN Architecture' },
    { name: 'SUMO 1.20', category: 'Micro-simulation', role: 'Traffic Flow Engine' },
    { name: 'TraCI Python', category: 'Control Interface', role: 'Live Signal Actuation' },
    { name: 'India Driving Dataset', category: 'Training Data', role: 'Heterogeneous Traffic' },
    { name: 'NVIDIA Jetson Orin', category: 'Target Edge Hardware', role: '15W Intersect Deploy' }
  ];

  return (
    <div id="architecture-page" className="w-full pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 text-xs font-mono text-[#F5A623] mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Real-Time Edge-to-Cloud Neural Topology</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F2F4F7] mb-6">
            Neural ST-GNN Architecture
          </h1>

          <p className="text-base md:text-lg text-[#8B94A3] leading-relaxed">
            Continuous edge vision inference synchronized across the 7-node Chennai arterial network. Spatial-Temporal Graph Neural Networks propagate constriction shockwaves and optimize signal splits in sub-50ms cycles.
          </p>
        </div>

        {/* 1. INTERACTIVE SPATIAL-TEMPORAL GNN DIAGRAM WITH MOTION HOVER STATES */}
        <section className="mb-20">
          <StGnnDiagram />
        </section>

        {/* 2. INTERACTIVE PIPELINE DIAGRAM */}
        <section className="mb-24">
          <div className="p-6 md:p-8 rounded-2xl bg-[#131820] border border-[#242C38]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#242C38]">
              <div>
                <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                  Interactive Pipeline Engine
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#F2F4F7] mt-0.5">
                  Click a layer to inspect deep architectural mechanics
                </h2>
              </div>
              <span className="text-xs font-mono text-[#8B94A3] hidden sm:inline-block">
                3 Synchronized Processing Stages
              </span>
            </div>

            {/* Pipeline Stage Buttons with motion hover */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {stages.map((stage) => {
                const Icon = stage.icon;
                const isSelected = activeStage === stage.id;
                return (
                  <motion.button
                    key={stage.id}
                    id={`pipeline-stage-btn-${stage.id}`}
                    onClick={() => setActiveStage(stage.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`relative p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-[#1B222D] border-[#F5A623] shadow-lg shadow-[#F5A623]/10'
                        : 'bg-[#0A0E14] border-[#242C38] hover:border-[#8B94A3]/50'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="archStageHighlight"
                        className="absolute inset-0 bg-[#F5A623]/5 border-2 border-[#F5A623] rounded-xl pointer-events-none"
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#131820] text-[#8B94A3] border border-[#242C38]">
                        STAGE 0{stage.id}
                      </span>
                      <Icon className="w-5 h-5" style={{ color: stage.color }} />
                    </div>
                    <h3 className="text-base font-bold text-[#F2F4F7] mb-1">
                      {stage.shortName}
                    </h3>
                    <p className="text-xs font-mono text-[#8B94A3] line-clamp-1">
                      {stage.tech}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Active Stage Expanded View (Framer Motion AnimatePresence) */}
            <AnimatePresence mode="wait">
              {stages
                .filter((s) => s.id === activeStage)
                .map((current) => (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#0A0E14] border border-[#242C38] rounded-xl p-6 md:p-8 space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#242C38]">
                      <div>
                        <div className="text-xs font-mono font-semibold text-[#F5A623] uppercase tracking-wider mb-1">
                          {current.name}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                          {current.headline}
                        </h3>
                      </div>
                      <span className="self-start md:self-auto text-xs font-mono px-3 py-1 rounded-full bg-[#1B222D] text-[#8B94A3] border border-[#242C38]">
                        {current.tech}
                      </span>
                    </div>

                    <p className="text-sm text-[#8B94A3] leading-relaxed">
                      {current.summary}
                    </p>

                    {/* Bullet Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {current.details.map((detail, idx) => (
                        <motion.div 
                          key={idx} 
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className="p-4 rounded-lg bg-[#131820] border border-[#242C38] hover:border-[#F5A623]/40 text-xs text-[#8B94A3] leading-relaxed transition-colors"
                        >
                          <span className="font-semibold text-white block mb-1">
                            • Specification {idx + 1}:
                          </span>
                          {detail}
                        </motion.div>
                      ))}
                    </div>

                    {/* Embedded Code Snippet */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-[#8B94A3]">
                        <span className="flex items-center gap-1.5 text-white">
                          <Code2 className="w-3.5 h-3.5 text-[#F5A623]" />
                          Python Source Implementation
                        </span>
                        <span>PyTorch / Python 3.11</span>
                      </div>
                      <pre className="p-4 rounded-lg bg-[#0D1219] border border-[#242C38] text-xs font-mono text-[#2ECC71] overflow-x-auto leading-relaxed">
                        <code>{current.codeSnippet}</code>
                      </pre>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </section>

        {/* 3. LAYER-BY-LAYER TECHNICAL DEEP DIVE */}
        <section className="mb-24 space-y-16">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
              Mathematical Formulation
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#F2F4F7] mt-1">
              Detailed Layer Breakdown
            </h2>
          </div>

          {/* Deep Dive 1: Perception */}
          <motion.div 
            whileHover={{ y: -3, borderColor: '#F5A62350' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#131820] border border-[#242C38] rounded-2xl p-6 sm:p-8 md:p-10 transition-colors"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F5A623]">
                <Eye className="w-4 h-4" />
                <span>Layer 1 • Edge Perception</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                YOLOv10 Encroachment & Lateral Width Degradation
              </h3>
              <p className="text-sm text-[#8B94A3] leading-relaxed">
                Standard vision models detect standard vehicular classes (cars, buses, motorcycles) to count density. EncroachAI augments this by introducing customized anchor-free heads trained on non-vehicular informal road intruders:
              </p>
              <ul className="text-xs text-[#8B94A3] space-y-2 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623]">▸</span>
                  <span><strong>Homography Warp:</strong> Translates 2D camera pixel coordinates into top-down metric coordinates on the road surface plane.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623]">▸</span>
                  <span><strong>Lateral Intrusion ΔW_i:</strong> Measures the widest encroachment distance into the active traffic lane from the curb.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623]">▸</span>
                  <span><strong>Capacity Multiplier β_i(t):</strong> Dynamic ratio of effective carriageway width to design width multiplied by pedestrian friction coefficient.</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-5 bg-[#0A0E14] border border-[#242C38] rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="text-white font-bold border-b border-[#242C38] pb-2 flex items-center justify-between">
                <span>Inference Metrics</span>
                <span className="text-[#2ECC71]">Jetson Orin Nano</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>mAP@50 (All Encroachments):</span>
                <span className="text-white font-bold">89.4%</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>mAP@50 (Vendor Carts):</span>
                <span className="text-white font-bold">92.1%</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Latency Per Frame:</span>
                <span className="text-[#F5A623] font-bold">26.3 ms</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Model Size (FP16 TensorRT):</span>
                <span className="text-white font-bold">14.8 MB</span>
              </div>
            </div>
          </motion.div>

          {/* Deep Dive 2: Reasoning ST-GNN */}
          <motion.div 
            whileHover={{ y: -3, borderColor: '#38BDF850' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#131820] border border-[#242C38] rounded-2xl p-6 sm:p-8 md:p-10 transition-colors"
          >
            <div className="lg:col-span-5 bg-[#0A0E14] border border-[#242C38] rounded-xl p-5 space-y-3 font-mono text-xs order-2 lg:order-1">
              <div className="text-white font-bold border-b border-[#242C38] pb-2 flex items-center justify-between">
                <span>ST-GNN Network Topology</span>
                <span className="text-[#38BDF8]">Anna Salai Corridor</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Number of Graph Nodes:</span>
                <span className="text-white font-bold">7 Intersections (28 Approaches)</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Graph Connectivity Matrix:</span>
                <span className="text-white font-bold">Physical Distance + Turning Ratios</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Prediction Window:</span>
                <span className="text-[#F5A623] font-bold">5 min, 10 min, 15 min</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>MAE on Queue Prediction:</span>
                <span className="text-[#2ECC71] font-bold">3.8 meters (vs 12.4m baselines)</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
                <Network className="w-4 h-4" />
                <span>Layer 2 • Spatial-Temporal Reasoning</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Spatio-Temporal Graph Neural Network (ST-GNN)
              </h3>
              <p className="text-sm text-[#8B94A3] leading-relaxed">
                Single-intersection adjustments fail because clearing an encroached approach faster can overwhelm an un-encroached downstream junction. The ST-GNN models the corridor holistically:
              </p>
              <ul className="text-xs text-[#8B94A3] space-y-2 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8]">▸</span>
                  <span><strong>Spatial Convolutions:</strong> Aggregate capacity constraints and queue buildups across adjacent upstream and downstream neighbors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8]">▸</span>
                  <span><strong>Temporal Gated Dilations:</strong> Capture the time-lag of vehicle platoons traveling between signalized junctions under bottleneck speeds.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Deep Dive 3: Control & Micro-simulation */}
          <motion.div 
            whileHover={{ y: -3, borderColor: '#2ECC7150' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#131820] border border-[#242C38] rounded-2xl p-6 sm:p-8 md:p-10 transition-colors"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#2ECC71]">
                <Sliders className="w-4 h-4" />
                <span>Layer 3 • Control & Micro-simulation</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Modified Webster Dynamic Optimization in SUMO
              </h3>
              <p className="text-sm text-[#8B94A3] leading-relaxed">
                The optimal cycle length $C_0$ and green split $g_i$ are recalculated as real-time feedback functions of functional saturation flow:
              </p>
              <div className="p-3.5 rounded-lg bg-[#0A0E14] border border-[#242C38] font-mono text-xs text-[#F2F4F7] space-y-1">
                <div>C_0* = (1.5 * L + 5) / (1 - Σ (q_i / (S_0 * β_i(t))))</div>
                <div className="text-[11px] text-[#8B94A3]">
                  Where L is total lost time, q_i is demand flow, and S_0 * β_i(t) is the detected functional saturation flow.
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 bg-[#0A0E14] border border-[#242C38] rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="text-white font-bold border-b border-[#242C38] pb-2 flex items-center justify-between">
                <span>SUMO Simulation Setup</span>
                <span className="text-[#2ECC71]">TraCI Actuated</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Corridor Length:</span>
                <span className="text-white font-bold">6.8 km (Anna Salai, Chennai)</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Traffic Mix:</span>
                <span className="text-white font-bold">45% 2W, 35% Car, 12% Auto, 8% Bus</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Simulation Time:</span>
                <span className="text-white font-bold">3,600 sec (1 hr peak evaluation)</span>
              </div>
              <div className="flex justify-between text-[#8B94A3]">
                <span>Actuation Frequency:</span>
                <span className="text-[#2ECC71] font-bold">Every Signal Cycle (30-120s)</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 4. TECH STACK BADGES */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#131820] border border-[#242C38]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
              Research & Engineering Toolchain
            </span>
            <h2 className="text-2xl font-bold text-[#F2F4F7] mt-1">
              Production Tech Stack & Frameworks
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {techBadges.map((badge) => (
              <motion.div
                key={badge.name}
                whileHover={{ scale: 1.05, y: -3 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="p-4 rounded-xl bg-[#0A0E14] border border-[#242C38] hover:border-[#F5A623]/50 text-center space-y-1 transition-colors cursor-default"
              >
                <div className="text-xs font-mono text-[#F5A623] font-semibold">
                  {badge.name}
                </div>
                <div className="text-[11px] text-[#F2F4F7] font-medium">
                  {badge.category}
                </div>
                <div className="text-[10px] text-[#8B94A3] font-mono">
                  {badge.role}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
