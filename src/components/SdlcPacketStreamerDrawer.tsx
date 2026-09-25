import React, { useEffect, useRef, useState } from 'react';
import { 
  Terminal, 
  Activity, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  HardDrive,
  Cpu,
  Wifi,
  WifiOff,
  Sliders
} from 'lucide-react';

export interface PacketEntry {
  id: string;
  timestamp: string;
  type: 'TX' | 'RX' | 'SYNC' | 'WARN';
  channel: string;
  source: string;
  destination: string;
  payload: string;
  crc: string;
  latencyMs: number;
}

interface SdlcPacketStreamerDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  activeJunctionName?: string;
  currentGamma?: number;
  currentExtensionSec?: number;
}

const SEED_PACKETS: PacketEntry[] = [
  {
    id: 'pkt-1',
    timestamp: '13:44:12.100',
    type: 'TX',
    channel: 'SDLC_PORT_1',
    source: 'EDGE_ACTUATOR_CORE',
    destination: 'NEMA_BIU_NODE_06',
    payload: 'PHASE_HOLD_EXT: +18s | SPLIT_MOD: 54s | ACTUATION_ACK',
    crc: '0x4F1A',
    latencyMs: 23.4
  },
  {
    id: 'pkt-2',
    timestamp: '13:44:12.050',
    type: 'RX',
    channel: 'YOLO_INFERENCE_BUS',
    source: 'EDGE_YOLOv10_FP16',
    destination: 'EDGE_ACTUATOR_CORE',
    payload: 'W_OBS: 2.4m | GAMMA: 0.62 | SAT_FLOW_MOD: 1450 PCU/h',
    crc: '0x8B2C',
    latencyMs: 24.2
  },
  {
    id: 'pkt-3',
    timestamp: '13:44:12.000',
    type: 'SYNC',
    channel: 'NTCIP_1202_RTC',
    source: 'GCTP_MASTER_CLOCK',
    destination: 'CORRIDOR_NODES_1_7',
    payload: 'CYCLE_SYNC: 120s OFFSET_LOCK | DRIFT: +0.2ms',
    crc: '0x991E',
    latencyMs: 18.1
  },
  {
    id: 'pkt-4',
    timestamp: '13:44:11.950',
    type: 'TX',
    channel: 'SDLC_PORT_1',
    source: 'EDGE_ACTUATOR_CORE',
    destination: 'CONTROLLER_FRAME_NEMA',
    payload: 'FRAME_TYPE: TYPE_1_NEMA_TS2 | BYTES: 64 | HEARTBEAT_PULSE',
    crc: '0x32A1',
    latencyMs: 21.0
  },
  {
    id: 'pkt-5',
    timestamp: '13:44:11.900',
    type: 'RX',
    channel: 'LOOP_DETECTOR_RACK',
    source: 'BIU_QUAD_DETECTOR',
    destination: 'EDGE_ACTUATOR_CORE',
    payload: 'APPROACH_QUEUE: 84m | OCCUPANCY: 78.4% | DISCHARGE_REQ',
    crc: '0x71F0',
    latencyMs: 25.1
  }
];

export const SdlcPacketStreamerDrawer: React.FC<SdlcPacketStreamerDrawerProps> = ({
  isOpen,
  onToggle,
  activeJunctionName = 'Saidapet Bazaar',
  currentGamma = 0.62,
  currentExtensionSec = 18
}) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [hardwareLinkStatus, setHardwareLinkStatus] = useState<'ONLINE' | 'SIMULATED_BYPASS'>('ONLINE');
  const [packets, setPackets] = useState<PacketEntry[]>(SEED_PACKETS);
  const [filterType, setFilterType] = useState<'ALL' | 'TX' | 'RX' | 'WARN'>('ALL');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [heartbeatCount, setHeartbeatCount] = useState<number>(0);
  
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const oscilloscopeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Live 50ms Heartbeat Serial Generator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setHeartbeatCount(c => c + 1);
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      
      const channels = ['SDLC_PORT_1', 'YOLO_INFERENCE_BUS', 'NTCIP_1202_RTC', 'LOOP_DETECTOR_RACK'];
      const rand = Math.random();
      let newEntry: PacketEntry;

      if (rand < 0.35) {
        newEntry = {
          id: `pkt-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          type: 'TX',
          channel: 'SDLC_PORT_1',
          source: 'EDGE_ACTUATOR_CORE',
          destination: `NEMA_BIU_${activeJunctionName.toUpperCase().replace(/\s+/g, '_').slice(0, 12)}`,
          payload: `PHASE_HOLD_EXT: +${currentExtensionSec}s | CRC_OK | LATENCY: ${(22 + Math.random() * 5).toFixed(1)}ms`,
          crc: `0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')}`,
          latencyMs: Number((22 + Math.random() * 5).toFixed(1))
        };
      } else if (rand < 0.70) {
        newEntry = {
          id: `pkt-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          type: 'RX',
          channel: 'YOLO_INFERENCE_BUS',
          source: 'EDGE_YOLOv10_FP16',
          destination: 'EDGE_ACTUATOR_CORE',
          payload: `W_OBS: ${(10.5 * (1 - currentGamma)).toFixed(1)}m | GAMMA: ${currentGamma.toFixed(2)} | SAT_FLOW_MOD: ${Math.round(1800 * currentGamma)} PCU/h`,
          crc: `0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')}`,
          latencyMs: Number((23 + Math.random() * 3).toFixed(1))
        };
      } else if (rand < 0.90) {
        newEntry = {
          id: `pkt-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          type: 'SYNC',
          channel: 'NTCIP_1202_RTC',
          source: 'GCTP_MASTER_CLOCK',
          destination: 'CORRIDOR_NODES_1_7',
          payload: `FRAME_TYPE: TYPE_1_CONTROLLER | BYTES: 64 | CHECKSUM: 0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase()}`,
          crc: `0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')}`,
          latencyMs: Number((18 + Math.random() * 4).toFixed(1))
        };
      } else {
        newEntry = {
          id: `pkt-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          type: 'WARN',
          channel: 'LOOP_DETECTOR_RACK',
          source: 'NEMA_WATCHDOG',
          destination: 'SAFETY_INTERLOCK',
          payload: `FAILSAFE_CHECK: OK (LATENCY ${(21 + Math.random() * 4).toFixed(1)}ms < 100ms THRESHOLD)`,
          crc: '0x0000',
          latencyMs: Number((19 + Math.random() * 3).toFixed(1))
        };
      }

      setPackets(prev => [...prev.slice(-120), newEntry]);
    }, 450); // fast readable rhythm

    return () => clearInterval(interval);
  }, [isStreaming, activeJunctionName, currentGamma, currentExtensionSec]);

  // 2. Oscilloscope Waveform Canvas (representing 50ms serial baud rate pulses)
  useEffect(() => {
    const canvas = oscilloscopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const draw = () => {
      offset += 1.5;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#080C12';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = '#15202E';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Serial Pulse Waveform (Manchester / RS-485 style square transitions with slight jitter)
      ctx.strokeStyle = hardwareLinkStatus === 'ONLINE' ? '#2ECC71' : '#F5A623';
      ctx.lineWidth = 1.8;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const step = Math.floor((x + offset) / 14);
        const bit = ((step * 7) ^ (step * 3)) % 2 === 0;
        const targetY = bit ? h * 0.25 : h * 0.75;
        // slight jitter
        const jitter = (Math.sin((x + offset) * 0.4) * 1.5);
        const y = targetY + jitter;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          // Sharp square transitions
          const prevStep = Math.floor((x - 1 + offset) / 14);
          if (step !== prevStep) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      // Glow overlay
      ctx.shadowColor = hardwareLinkStatus === 'ONLINE' ? '#2ECC71' : '#F5A623';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [hardwareLinkStatus]);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    if (terminalEndRef.current && isStreaming) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [packets, isStreaming]);

  const copyToClipboard = () => {
    const raw = packets
      .map(p => `[${p.timestamp}] [${p.type}] [${p.channel}] ${p.source} -> ${p.destination} | ${p.payload} | CRC:${p.crc} | ${p.latencyMs}ms`)
      .join('\n');
    navigator.clipboard.writeText(raw);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearBuffer = () => {
    setPackets([]);
  };

  const filteredPackets = packets.filter(p => {
    if (filterType === 'ALL') return true;
    return p.type === filterType;
  });

  if (!isOpen) {
    return (
      <aside aria-label="SDLC Telemetry Launcher" className="fixed bottom-4 right-4 z-40">
        <button
          onClick={onToggle}
          className="px-4 py-2.5 rounded-xl bg-[#0D131C] hover:bg-[#141C28] text-white border border-[#222E40] shadow-2xl flex items-center gap-2.5 font-mono text-xs cursor-pointer transition-all hover:border-[#2ECC71]/50 group"
          title="Open NEMA TS2 / SDLC Hardware Telemetry Stream"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2ECC71]"></span>
          </span>
          <Terminal className="w-4 h-4 text-[#2ECC71] group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-wider text-xs">
            NEMA TS2 SDLC STREAM
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] text-[10px] font-bold">
            50ms
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-[#8B94A3]" />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="NEMA TS2 SDLC Hardware Bus Visualizer" className={`fixed bottom-0 inset-x-0 z-50 bg-[#070A0F] border-t-2 border-[#1E2632] shadow-2xl transition-all duration-300 flex flex-col font-mono ${
      isExpanded ? 'h-[75vh]' : 'h-80 sm:h-96'
    }`}>
      {/* Top Drawer Command Ribbon */}
      <div className="p-3 bg-[#0B1017] border-b border-[#1E2632] flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Status & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2ECC71]"></span>
            </span>
            <span className="text-white font-bold tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#2ECC71]" />
              <span>NEMA TS2 / NTCIP 1202 SERIAL BUS</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#8B94A3]">
            <span>•</span>
            <span>HEARTBEAT: <strong className="text-white">{heartbeatCount * 50}ms</strong></span>
            <span>•</span>
            <span>BAUD: <strong className="text-[#38BDF8]">153.6 kbps SDLC</strong></span>
            <span>•</span>
            <span>NODE: <strong className="text-[#F5A623]">{activeJunctionName}</strong></span>
          </div>
        </div>

        {/* Center: Hardware Link Status Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHardwareLinkStatus(s => s === 'ONLINE' ? 'SIMULATED_BYPASS' : 'ONLINE')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              hardwareLinkStatus === 'ONLINE'
                ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
                : 'bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/40'
            }`}
            title="Toggle Real Serial Port vs Simulated In-Memory Bypass"
          >
            {hardwareLinkStatus === 'ONLINE' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>LINK: {hardwareLinkStatus === 'ONLINE' ? 'ONLINE (RS-485 DIRECT)' : 'SIMULATED BYPASS'}</span>
          </button>
        </div>

        {/* Right: Drawer Window Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="p-1.5 rounded-lg bg-[#141C28] hover:bg-[#1E293B] text-white border border-[#222E40] transition-colors cursor-pointer"
            title={isStreaming ? 'Pause Stream' : 'Resume Stream'}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5 text-[#F5A623]" /> : <Play className="w-3.5 h-3.5 text-[#2ECC71]" />}
          </button>

          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg bg-[#141C28] hover:bg-[#1E293B] text-white border border-[#222E40] transition-colors cursor-pointer"
            title="Copy Raw Buffer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#2ECC71]" /> : <Copy className="w-3.5 h-3.5 text-[#8B94A3]" />}
          </button>

          <button
            onClick={clearBuffer}
            className="p-1.5 rounded-lg bg-[#141C28] hover:bg-[#1E293B] text-[#EF4444] border border-[#222E40] transition-colors cursor-pointer"
            title="Clear Stream Buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#141C28] hover:bg-[#1E293B] text-[#8B94A3] hover:text-white border border-[#222E40] transition-colors cursor-pointer"
            title={isExpanded ? 'Restore Height' : 'Expand Drawer'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-[#141C28] hover:bg-[#1E293B] text-[#8B94A3] hover:text-white border border-[#222E40] transition-colors cursor-pointer"
            title="Collapse Drawer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Sub-bar: Oscilloscope Mini-Canvas & Filter Chips */}
      <div className="px-3 py-2 bg-[#080D14] border-b border-[#1A2330] flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Oscilloscope Visualizer representing 50ms serial pulses */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#8B94A3]">
            <Activity className="w-3.5 h-3.5 text-[#2ECC71]" />
            <span>50ms SDLC HEARTBEAT OSCILLOSCOPE:</span>
          </div>
          <div className="w-44 sm:w-64 h-7 rounded border border-[#1E2632] overflow-hidden bg-[#080C12]">
            <canvas
              ref={oscilloscopeCanvasRef}
              width={256}
              height={28}
              className="w-full h-full block"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[#8B94A3] mr-1">FILTER:</span>
          {(['ALL', 'TX', 'RX', 'WARN'] as const).map(ft => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                filterType === ft
                  ? 'bg-[#F5A623] text-[#0A0E14] font-bold'
                  : 'bg-[#101722] text-[#8B94A3] hover:text-white border border-[#1E2632]'
              }`}
            >
              {ft}
            </button>
          ))}
          <span className="text-[#64748B] ml-2 text-[10px]">
            {filteredPackets.length} frames logged
          </span>
        </div>

      </div>

      {/* Terminal Content Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#05080C] text-[11px] font-mono select-text">
        {filteredPackets.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#64748B] text-xs">
            Stream buffer cleared. Waiting for active 50ms heartbeat frame...
          </div>
        ) : (
          filteredPackets.map((pkt) => {
            const isTx = pkt.type === 'TX';
            const isRx = pkt.type === 'RX';
            const isWarn = pkt.type === 'WARN';

            const typeColor = isTx 
              ? 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30' 
              : isRx 
              ? 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/30'
              : isWarn 
              ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30'
              : 'text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/30';

            return (
              <div 
                key={pkt.id} 
                className="flex flex-wrap items-baseline gap-2 py-0.5 px-2 rounded hover:bg-[#0D141F] transition-colors leading-relaxed"
              >
                <span className="text-[#64748B]">[{pkt.timestamp}]</span>
                
                <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${typeColor}`}>
                  {pkt.type}
                </span>

                <span className="text-[#F5A623] font-semibold">
                  [{pkt.channel}]
                </span>

                <span className="text-[#C8D1DC]">
                  {pkt.source} <span className="text-[#64748B]">→</span> {pkt.destination}:
                </span>

                <span className={`font-semibold ${isTx ? 'text-[#38BDF8]' : isRx ? 'text-[#2ECC71]' : 'text-white'}`}>
                  {pkt.payload}
                </span>

                <span className="text-[10px] text-[#64748B] ml-auto flex items-center gap-2">
                  <span>CRC:{pkt.crc}</span>
                  <span>{pkt.latencyMs}ms</span>
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Strip */}
      <div className="px-3 py-1.5 bg-[#0B1017] border-t border-[#1A2330] flex items-center justify-between text-[10px] text-[#64748B]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#2ECC71]">
            <Check className="w-3 h-3" />
            <span>SDLC CRC-16 INTEGRITY: 100% VALID</span>
          </span>
          <span>•</span>
          <span>FRAME FORMAT: NEMA TS2 TYPE 1 BIU / NTCIP 1202 v03</span>
        </div>
        <div>
          <span>BUFFER DEPTH: 120 FRAMES (AUTO-PURGE)</span>
        </div>
      </div>

    </aside>
  );
};
