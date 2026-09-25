import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Eye, 
  Network, 
  Sliders, 
  MapPin, 
  Layers, 
  Compass,
  Car,
  Store,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Activity,
  CheckCircle2,
  Radio,
  Clock,
  Zap,
  TrendingDown,
  Camera,
  Server,
  Terminal,
  Flame,
  Siren,
  Wifi
} from 'lucide-react';
import { LiveArterialSurveillance } from '../components/LiveArterialSurveillance';
import { CssIsometricJunction } from '../components/CssIsometricJunction';
import { SdlcPacketStreamerDrawer } from '../components/SdlcPacketStreamerDrawer';
import corridorData from '../data/corridorMap.json';

interface HomeProps {
  onRouteChange: (route: string) => void;
}

interface IncidentEvent {
  id: string;
  time: string;
  junctionId: string;
  junctionName: string;
  class: string;
  obstacleDesc: string;
  widthImpactM: number;
  usableCapPct: number;
  actionTaken: string;
}

const LIVE_INCIDENTS_SEED: IncidentEvent[] = [
  {
    id: 'inc-1',
    time: '13:44:12',
    junctionId: 'int-6',
    junctionName: 'Saidapet Bazaar',
    class: 'vendor_cart',
    obstacleDesc: 'Wooden Pushcart cluster (Fruit & Vegetables)',
    widthImpactM: 2.4,
    usableCapPct: 46,
    actionTaken: 'NEMA TS2 Phase 2 Hold: +18s Green Extension Actuated'
  },
  {
    id: 'inc-2',
    time: '13:43:40',
    junctionId: 'int-2',
    junctionName: 'Spencers / Thousand Lights',
    class: 'double_parked_vehicle',
    obstacleDesc: 'Delivery Three-Wheeler idling on carriageway',
    widthImpactM: 1.6,
    usableCapPct: 74,
    actionTaken: 'Cycle length modulated (112s → 124s); Split compensated +8s'
  },
  {
    id: 'inc-3',
    time: '13:42:55',
    junctionId: 'int-3',
    junctionName: 'Gemini Flyover Ingress',
    class: 'illegal_stall',
    obstacleDesc: 'Temporary snack canopy extended 2.2m into curb lane',
    widthImpactM: 2.2,
    usableCapPct: 62,
    actionTaken: 'ST-GNN coordination: Upstream metering hold activated'
  },
  {
    id: 'inc-4',
    time: '13:41:20',
    junctionId: 'int-5',
    junctionName: 'Nandanam / Chamiers',
    class: 'vendor_cart',
    obstacleDesc: 'Flower Pushcart roadside setup',
    widthImpactM: 1.8,
    usableCapPct: 74,
    actionTaken: 'Green wave split increased to 52s (+12s vs nominal)'
  },
  {
    id: 'inc-5',
    time: '13:39:50',
    junctionId: 'int-4',
    junctionName: 'DMS / Teynampet Metro',
    class: 'pedestrian_spillover',
    obstacleDesc: 'Peak hour metro pedestrian spill onto curbside lane',
    widthImpactM: 1.1,
    usableCapPct: 90,
    actionTaken: 'Pedestrian clearance interval maintained at 24s'
  }
];

export const Home: React.FC<HomeProps> = ({ onRouteChange }) => {
  const [selectedJunctionId, setSelectedJunctionId] = useState<string>('int-2');
  const [incidentLogs, setIncidentLogs] = useState<IncidentEvent[]>(LIVE_INCIDENTS_SEED);
  const [activeTab, setActiveTab] = useState<'surveillance' | 'digital-twin'>('surveillance');
  const [isSdlcDrawerOpen, setIsSdlcDrawerOpen] = useState<boolean>(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  const [liveStreamState, setLiveStreamState] = useState({
    gamma: 0.62,
    extensionSec: 18,
    activeObstaclesCount: 2,
    lostWidthM: 2.4,
    junctionName: 'Spencers / Thousand Lights'
  });

  const selectedJunction = corridorData.intersections.find(j => j.id === selectedJunctionId) || corridorData.intersections[1];

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-ticking incident log simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const jIdx = Math.floor(Math.random() * corridorData.intersections.length);
      const junc = corridorData.intersections[jIdx];

      const classes = ['vendor_cart', 'double_parked_vehicle', 'illegal_stall', 'pedestrian_spillover'];
      const pickedClass = classes[Math.floor(Math.random() * classes.length)];
      const widthImpact = Number((1.2 + Math.random() * 1.5).toFixed(1));
      const capPct = Math.round(100 - (widthImpact / 10.5) * 100);

      const newEvent: IncidentEvent = {
        id: `inc-${Date.now()}`,
        time: timeStr,
        junctionId: junc.id,
        junctionName: junc.name.split('/')[0].trim(),
        class: pickedClass,
        obstacleDesc: pickedClass === 'vendor_cart' 
          ? 'Mobile vendor pushcart encroachment detected' 
          : pickedClass === 'double_parked_vehicle' 
          ? 'Commercial delivery vehicle stopped in lane' 
          : pickedClass === 'illegal_stall'
          ? 'Informal curbside stall setup on roadway'
          : 'Pedestrian spillover into active lane',
        widthImpactM: widthImpact,
        usableCapPct: capPct,
        actionTaken: `NEMA TS2 Split Adjusted: +${Math.round((widthImpact / 10.5) * 36)}s Dynamic Green`
      };

      setIncidentLogs(prev => [newEvent, ...prev.slice(0, 7)]);
    }, 11000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="home-page" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8 space-y-8 font-mono">
      
      {/* 1. REAL-TIME OPERATIONAL ITS COMMAND HEADER */}
      <section className="space-y-4">
        
        {/* Top Authority & Telemetry Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090D15] border border-[#1E2632] text-xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2ECC71]"></span>
            </span>
            <span className="text-white font-bold tracking-wider">
              GCTP ARTERIAL OPERATIONS: <span className="text-[#2ECC71]">AUTONOMOUS CLOSED-LOOP ONLINE</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#8B94A3] text-[11px]">
            <span className="hidden sm:inline">
              BUS: <strong className="text-[#38BDF8]">NEMA TS2 (50ms HEARTBEAT)</strong>
            </span>
            <span>•</span>
            <span>
              CLOCK: <strong className="text-white">{currentTimeStr || '13:45:00'} IST</strong>
            </span>
            <span>•</span>
            <span>
              CORRIDOR: <strong className="text-[#F5A623]">ANNA SALAI (6.8 KM • 7 NODES)</strong>
            </span>
          </div>
        </div>

        {/* Mission Control Deck Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0B0F16] border border-[#1E2632] shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 text-[11px] text-[#F5A623]">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE MUNICIPAL TRAFFIC COMMAND SYSTEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Arterial Operations Center & <span className="text-[#F5A623]">Curbside Perception</span> Deck
            </h1>
            <p className="text-xs text-[#8B94A3]">
              Autonomous edge perception measuring carriageway constriction, calculating usable capacity ratio (γ), and actuating NEMA TS2 controllers.
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onRouteChange('/tool')}
              className="px-4 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#F5A623]/25 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Operator SCADA Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsSdlcDrawerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-[#11161F] hover:bg-[#1A222D] text-[#2ECC71] text-xs border border-[#2ECC71]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>SDLC Serial Bus</span>
            </button>

            <button
              onClick={() => onRouteChange('/about')}
              className="px-3.5 py-2.5 rounded-xl bg-[#11161F] hover:bg-[#1A222D] text-[#8B94A3] hover:text-white text-xs border border-[#222B38] transition-colors cursor-pointer"
            >
              <span>Architecture Spec</span>
            </button>
          </div>
        </div>

        {/* Real-Time Operational Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632]">
            <div className="text-[10px] text-[#8B94A3] uppercase">Arterial Span</div>
            <div className="text-base font-bold text-white mt-0.5">6.8 km Corridor</div>
            <div className="text-[10px] text-[#38BDF8]">7 Coordinated Nodes</div>
          </div>

          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632]">
            <div className="text-[10px] text-[#8B94A3] uppercase">Edge Loop Latency</div>
            <div className="text-base font-bold text-[#2ECC71] mt-0.5">24.2 ms / cycle</div>
            <div className="text-[10px] text-[#8B94A3]">YOLOv10 TensorRT FP16</div>
          </div>

          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632]">
            <div className="text-[10px] text-[#8B94A3] uppercase">Corridor Delay Cut</div>
            <div className="text-base font-bold text-[#F5A623] mt-0.5">-45.7% Delay</div>
            <div className="text-[10px] text-[#8B94A3]">70.4s → 38.2s / veh</div>
          </div>

          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632]">
            <div className="text-[10px] text-[#8B94A3] uppercase">Controller Interface</div>
            <div className="text-base font-bold text-white mt-0.5">NEMA TS2 SDLC</div>
            <div className="text-[10px] text-[#2ECC71]">Direct TraCI / RS-485</div>
          </div>
        </div>

      </section>

      {/* 2. LIVE ARTERIAL SURVEILLANCE & CHAOS INJECTOR VIEWPORT */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1E2632]">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#F5A623]" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight uppercase">
              Live Edge Perception Stream & Signal Actuation Monitor
            </h2>
          </div>

          {/* Toggle between Live Surveillance and 3D Isometric Digital Twin */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090D15] border border-[#1E2632] text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('surveillance')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] ${
                activeTab === 'surveillance'
                  ? 'bg-[#F5A623] text-[#0A0E14] font-bold'
                  : 'text-[#8B94A3] hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('digital-twin')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] ${
                activeTab === 'digital-twin'
                  ? 'bg-[#38BDF8] text-[#0A0E14] font-bold'
                  : 'text-[#8B94A3] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Digital Twin Mesh</span>
            </button>
          </div>
        </div>

        {activeTab === 'surveillance' ? (
          <LiveArterialSurveillance
            initialJunctionId={selectedJunctionId}
            onJunctionSelect={(id) => setSelectedJunctionId(id)}
            onOpenTool={() => onRouteChange('/tool')}
            onOpenSdlcDrawer={() => setIsSdlcDrawerOpen(true)}
            onStateChange={(st) => setLiveStreamState(st)}
          />
        ) : (
          <CssIsometricJunction />
        )}
      </section>

      {/* 3. INTERACTIVE CORRIDOR TOPOLOGY & SATURATION FLOW MATRIX */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0B0F16] border border-[#1E2632] shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#1E2632]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#F5A623] font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#F5A623]" />
              <span>Anna Salai Arterial Alignment (6.8 km • 7 Coordinated Nodes)</span>
            </div>
            <p className="text-xs text-[#8B94A3]">
              Click any station below to switch live camera perception, saturation flow matrix, and signal controller telemetry:
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#0E131C] border border-[#1E2632] text-[#38BDF8]">
              Mean Speed: 24.8 km/h (+38%)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0E131C] border border-[#1E2632] text-[#2ECC71]">
              7 Nodes Sync
            </span>
          </div>
        </div>

        {/* Schematic Alignment Track */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#090D15] border border-[#1E2632] space-y-5 overflow-x-auto">
          <div className="min-w-[700px] relative py-5">
            <div className="h-2.5 rounded-full bg-[#1A222D] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#38BDF8]/40 via-[#F5A623]/50 to-[#2ECC71]/40 rounded-full" />
            </div>

            {/* Junction Nodes Along Spine */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-4 pointer-events-none">
              {corridorData.intersections.map((intNode, idx) => {
                const isSelected = selectedJunctionId === intNode.id;
                const dotColor = isSelected ? '#F5A623' : '#38BDF8';

                return (
                  <div 
                    key={intNode.id}
                    className="flex flex-col items-center pointer-events-auto cursor-pointer group"
                    onClick={() => setSelectedJunctionId(intNode.id)}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'ring-4 ring-[#F5A623]/40 scale-125' 
                          : 'hover:scale-110'
                      }`}
                      style={{ 
                        backgroundColor: '#070A0E', 
                        border: `2px solid ${isSelected ? '#F5A623' : dotColor}` 
                      }}
                    >
                      <span 
                        className="text-[10px] font-bold"
                        style={{ color: isSelected ? '#F5A623' : dotColor }}
                      >
                        J{idx + 1}
                      </span>
                    </div>

                    <div className="mt-3 text-center w-24">
                      <div className={`text-[11px] font-semibold transition-colors truncate ${
                        isSelected ? 'text-[#F5A623]' : 'text-[#CBD5E1] group-hover:text-white'
                      }`}>
                        {intNode.name.split('/')[0]}
                      </div>
                      <div className="text-[9px] text-[#64748B]">
                        {intNode.effectiveCapacityPct}% Capacity
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Station Telemetry Strip */}
          <div className="p-3.5 rounded-xl bg-[#070A0E] border border-[#1E2632] grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
            <div className="md:col-span-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                  STATION {selectedJunction.id.toUpperCase()}
                </span>
                <span className="text-xs text-[#8B94A3]">
                  GPS: {selectedJunction.lat.toFixed(4)}°N, {selectedJunction.lng.toFixed(4)}°E
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                {selectedJunction.name}
              </div>
              <div className="text-[11px] text-[#64748B]">
                Coordinated with: {selectedJunction.coordinatedWith.join(', ')} • NEMA Phase 2 Actuation
              </div>
            </div>

            <div className="md:col-span-6 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#0F1622] border border-[#1C2534]">
                <div className="text-[9px] text-[#8B94A3] uppercase">Nominal Flow</div>
                <div className="text-xs font-bold text-white mt-0.5">{selectedJunction.nominalCapacityPcu} PCU</div>
              </div>

              <div className="p-2 rounded-lg bg-[#0F1622] border border-[#1C2534]">
                <div className="text-[9px] text-[#8B94A3] uppercase">Ingress Flow</div>
                <div className="text-xs font-bold text-[#F5A623] mt-0.5">{selectedJunction.observedCapacityPcu} PCU</div>
              </div>

              <div className="p-2 rounded-lg bg-[#0F1622] border border-[#1C2534]">
                <div className="text-[9px] text-[#8B94A3] uppercase">Usable Width</div>
                <div className="text-xs font-bold text-[#2ECC71] mt-0.5">{selectedJunction.effectiveCapacityPct}%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME INCIDENT LOG & CONTROLLER ACTION STREAM */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-Time Encroachment Incident Stream (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0B0F16] border border-[#1E2632] shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2632]">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#F5A623]" />
                <span>Live Encroachment Incident Stream & Controller Actions</span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-[#2ECC71]">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
                STREAMING
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {incidentLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632] space-y-1.5 hover:border-[#F5A623]/30 transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5A623] font-bold">[{log.time}]</span>
                      <span className="text-white font-semibold">{log.junctionName}</span>
                    </div>
                    <span className="text-[10px] text-[#EF4444] font-bold">
                      -{log.widthImpactM}m Loss ({log.usableCapPct}% Usable)
                    </span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8]">
                    {log.obstacleDesc}
                  </div>

                  <div className="text-[10px] text-[#2ECC71] flex items-center gap-1.5 pt-1 border-t border-[#1C2534]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{log.actionTaken}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-[#1E2632]">
            <span>NEMA TS2 SDLC Serial Controller Responses Active</span>
            <span>Zero Manual Intervention</span>
          </div>
        </div>

        {/* Real-Time Arterial Performance & Delay Reduction (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0B0F16] border border-[#1E2632] shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2632]">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <TrendingDown className="w-4 h-4 text-[#2ECC71]" />
                <span>Corridor Performance vs Static Fixed-Time</span>
              </div>
              <span className="text-[10px] text-[#38BDF8]">SUMO Validated</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B94A3]">Mean Approach Delay:</span>
                  <span className="text-[#2ECC71] font-bold">-45.7% (38.2s vs 70.4s)</span>
                </div>
                <div className="h-2 rounded-full bg-[#141B24] overflow-hidden flex">
                  <div style={{ width: '54%' }} className="bg-[#2ECC71] h-full" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B94A3]">Bottleneck Queue Length:</span>
                  <span className="text-[#2ECC71] font-bold">-52.3% (78m vs 164m)</span>
                </div>
                <div className="h-2 rounded-full bg-[#141B24] overflow-hidden flex">
                  <div style={{ width: '48%' }} className="bg-[#2ECC71] h-full" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B94A3]">Corridor Mean Speed:</span>
                  <span className="text-[#38BDF8] font-bold">+38.0% (24.8 vs 18.0 km/h)</span>
                </div>
                <div className="h-2 rounded-full bg-[#141B24] overflow-hidden flex">
                  <div style={{ width: '72%' }} className="bg-[#38BDF8] h-full" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2632] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B94A3]">Idling CO₂ Emissions:</span>
                  <span className="text-[#F5A623] font-bold">-31.8% Fuel Waste Cut</span>
                </div>
                <div className="h-2 rounded-full bg-[#141B24] overflow-hidden flex">
                  <div style={{ width: '68%' }} className="bg-[#F5A623] h-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E2632]">
            <button
              onClick={() => onRouteChange('/tool')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#151B24] hover:bg-[#1E2632] text-white text-xs font-bold border border-[#2B384A] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#F5A623]" />
              <span>Launch Operator SCADA Deck</span>
            </button>
          </div>
        </div>

      </section>

      {/* Persistent SDLC Packet Streamer Drawer */}
      <SdlcPacketStreamerDrawer
        isOpen={isSdlcDrawerOpen}
        onToggle={() => setIsSdlcDrawerOpen(!isSdlcDrawerOpen)}
        activeJunctionName={liveStreamState.junctionName}
        currentGamma={liveStreamState.gamma}
        currentExtensionSec={liveStreamState.extensionSec}
      />

    </div>
  );
};
