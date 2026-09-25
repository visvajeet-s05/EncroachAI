import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  Radio, 
  Play, 
  Pause, 
  Maximize2, 
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import corridorData from '../data/corridorMap.json';

interface LiveArterialSurveillanceProps {
  initialJunctionId?: string;
  onJunctionSelect?: (junctionId: string) => void;
  onOpenTool?: () => void;
  className?: string;
}

interface SimulatedVehicle {
  id: number;
  lane: number; // 0, 1, 2
  y: number; // 0 to 100%
  speed: number;
  type: 'car' | 'bus' | 'motorcycle' | 'auto';
  color: string;
  width: number;
  height: number;
}

interface SimulatedObstacle {
  id: string;
  class: 'vendor_cart' | 'double_parked_vehicle' | 'illegal_stall' | 'pedestrian_spillover';
  label: string;
  x: number; // percentage
  y: number;
  w: number;
  h: number;
  confidence: number;
  laneImpactPct: number;
}

const JUNCTION_CONFIGS: Record<string, {
  name: string;
  roadName: string;
  nominalLanes: number;
  nominalWidthM: number;
  baseGreenSec: number;
  obstacles: SimulatedObstacle[];
}> = {
  'int-1': {
    name: 'Simpsons / Mount Road',
    roadName: 'Anna Salai North Ingress (KM 0.0)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 40,
    obstacles: [
      { id: 'obs-1', class: 'pedestrian_spillover', label: 'Pedestrian Group (Kerb Overflow)', x: 4, y: 65, w: 12, h: 18, confidence: 0.89, laneImpactPct: 9 }
    ]
  },
  'int-2': {
    name: 'Spencers Plaza / Thousand Lights',
    roadName: 'Anna Salai Mid-Commercial (KM 1.8)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 42,
    obstacles: [
      { id: 'obs-1', class: 'vendor_cart', label: 'Fruit & Juice Pushcart', x: 5, y: 62, w: 16, h: 22, confidence: 0.94, laneImpactPct: 18 },
      { id: 'obs-2', class: 'double_parked_vehicle', label: 'Delivery Auto-Rickshaw', x: 23, y: 70, w: 14, h: 18, confidence: 0.91, laneImpactPct: 12 }
    ]
  },
  'int-3': {
    name: 'Gemini Flyover / Cathedral Rd',
    roadName: 'Anna Salai Grade-Separated Ingress (KM 2.9)',
    nominalLanes: 4,
    nominalWidthM: 14.0,
    baseGreenSec: 45,
    obstacles: [
      { id: 'obs-1', class: 'illegal_stall', label: 'Tea Stall Canopy & Benches', x: 3, y: 55, w: 18, h: 26, confidence: 0.96, laneImpactPct: 22 },
      { id: 'obs-2', class: 'vendor_cart', label: 'Snack Cart (Lane 1 Encroach)', x: 22, y: 66, w: 14, h: 20, confidence: 0.88, laneImpactPct: 16 }
    ]
  },
  'int-4': {
    name: 'DMS / Teynampet Metro',
    roadName: 'Anna Salai Metro Corridor (KM 4.0)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 38,
    obstacles: [
      { id: 'obs-1', class: 'double_parked_vehicle', label: 'Passenger Drop-Off Car', x: 6, y: 60, w: 15, h: 20, confidence: 0.92, laneImpactPct: 10 }
    ]
  },
  'int-5': {
    name: 'Nandanam / Chamiers Rd',
    roadName: 'Anna Salai - Usman Rd Link (KM 5.2)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 40,
    obstacles: [
      { id: 'obs-1', class: 'vendor_cart', label: 'Flower Vendor Pushcart', x: 5, y: 58, w: 15, h: 22, confidence: 0.95, laneImpactPct: 17 },
      { id: 'obs-2', class: 'pedestrian_spillover', label: 'Bus Stop Crowd Spill', x: 21, y: 68, w: 16, h: 16, confidence: 0.85, laneImpactPct: 9 }
    ]
  },
  'int-6': {
    name: 'Saidapet Bazaar / Maraimalai Adigal',
    roadName: 'Anna Salai Market Ingress (KM 6.1)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 42,
    obstacles: [
      { id: 'obs-1', class: 'vendor_cart', label: 'Vegetable Cart #1 (Primary)', x: 4, y: 50, w: 16, h: 24, confidence: 0.96, laneImpactPct: 24 },
      { id: 'obs-2', class: 'vendor_cart', label: 'Fruit Cart #2 (Lane 1)', x: 21, y: 62, w: 15, h: 22, confidence: 0.93, laneImpactPct: 18 },
      { id: 'obs-3', class: 'double_parked_vehicle', label: 'Loading Van (Stopped)', x: 38, y: 72, w: 15, h: 19, confidence: 0.89, laneImpactPct: 12 }
    ]
  },
  'int-7': {
    name: 'Guindy Kathipara Feeder',
    roadName: 'Anna Salai South Terminus (KM 6.8)',
    nominalLanes: 4,
    nominalWidthM: 14.0,
    baseGreenSec: 44,
    obstacles: [
      { id: 'obs-1', class: 'pedestrian_spillover', label: 'Metro Interchange Foot Traffic', x: 4, y: 65, w: 14, h: 18, confidence: 0.87, laneImpactPct: 8 }
    ]
  }
};

export const LiveArterialSurveillance: React.FC<LiveArterialSurveillanceProps> = ({
  initialJunctionId = 'int-2',
  onJunctionSelect,
  onOpenTool,
  className = ''
}) => {
  const [selectedJunctionId, setSelectedJunctionId] = useState<string>(initialJunctionId);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showLaneEnvelope, setShowLaneEnvelope] = useState<boolean>(true);
  const [actuationMode, setActuationMode] = useState<'adaptive' | 'fixed'>('adaptive');
  const [fps, setFps] = useState<number>(38);
  const [latencyMs, setLatencyMs] = useState<number>(24);

  // Real-time Traffic Signal Cycle Simulation State
  const [signalPhase, setSignalPhase] = useState<'GREEN' | 'AMBER' | 'RED'>('GREEN');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(32);
  const [totalCycleElapsed, setTotalCycleElapsed] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const vehiclesRef = useRef<SimulatedVehicle[]>([]);
  const lastTickTimeRef = useRef<number>(performance.now());
  const fpsCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());

  const junctionConfig = JUNCTION_CONFIGS[selectedJunctionId] || JUNCTION_CONFIGS['int-2'];
  const junctionData = corridorData.intersections.find(j => j.id === selectedJunctionId) || corridorData.intersections[1];

  // Derived Real-Time Telemetry Calculations
  const totalObstructionPct = junctionConfig.obstacles.reduce((sum, o) => sum + o.laneImpactPct, 0);
  const effectiveCapacityPct = Math.max(35, 100 - totalObstructionPct);
  const effectiveWidthM = Number(((junctionConfig.nominalWidthM * effectiveCapacityPct) / 100).toFixed(1));
  const lostWidthM = Number((junctionConfig.nominalWidthM - effectiveWidthM).toFixed(1));

  // Webster Dynamic Green Extension
  const nominalGreen = junctionConfig.baseGreenSec;
  const dynamicGreen = Math.min(75, Math.round(nominalGreen / (effectiveCapacityPct / 100)));
  const greenExtensionSec = dynamicGreen - nominalGreen;
  const currentAssignedGreen = actuationMode === 'adaptive' ? dynamicGreen : nominalGreen;

  // Change junction
  const handleSelectJunction = (id: string) => {
    setSelectedJunctionId(id);
    if (onJunctionSelect) onJunctionSelect(id);
  };

  // 1. Initialize simulated vehicle traffic
  useEffect(() => {
    const vehicles: SimulatedVehicle[] = [];
    const colors = ['#F5A623', '#38BDF8', '#E2E8F0', '#94A3B8', '#EF4444', '#10B981'];
    const types: ('car' | 'bus' | 'motorcycle' | 'auto')[] = ['car', 'auto', 'motorcycle', 'car', 'bus', 'auto'];

    for (let i = 0; i < 7; i++) {
      vehicles.push({
        id: i + 1,
        lane: i % 3,
        y: (i * 15) + Math.random() * 8,
        speed: 0.12 + Math.random() * 0.14,
        type: types[i % types.length],
        color: colors[i % colors.length],
        width: types[i % types.length] === 'bus' ? 26 : types[i % types.length] === 'motorcycle' ? 12 : 20,
        height: types[i % types.length] === 'bus' ? 48 : types[i % types.length] === 'motorcycle' ? 20 : 34
      });
    }
    vehiclesRef.current = vehicles;
  }, [selectedJunctionId]);

  // 2. Real-Time Signal Light Cycle Tick
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Advance phase
          if (signalPhase === 'GREEN') {
            setSignalPhase('AMBER');
            return 4; // 4s yellow
          } else if (signalPhase === 'AMBER') {
            setSignalPhase('RED');
            return 28; // 28s red
          } else {
            setSignalPhase('GREEN');
            return currentAssignedGreen;
          }
        }
        return prev - 1;
      });

      setTotalCycleElapsed(c => (c + 1) % 120);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, signalPhase, currentAssignedGreen]);

  // 3. High-Performance Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const now = performance.now();
      const dt = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      // FPS tracking
      fpsCountRef.current++;
      if (now - fpsTimerRef.current >= 800) {
        setFps(Math.round((fpsCountRef.current * 1000) / (now - fpsTimerRef.current)));
        setLatencyMs(Math.round(22 + Math.random() * 4));
        fpsCountRef.current = 0;
        fpsTimerRef.current = now;
      }

      const W = canvas.width;
      const H = canvas.height;

      // A. Clear & Dark Asymmetrical Roadway Background
      ctx.fillStyle = '#080C11';
      ctx.fillRect(0, 0, W, H);

      // Subtle asphalt texture
      ctx.fillStyle = '#0F151F';
      ctx.fillRect(W * 0.08, 0, W * 0.84, H);

      // Perspective Road Boundaries
      const roadLeft = W * 0.08;
      const roadRight = W * 0.92;
      const roadWidth = roadRight - roadLeft;
      const numLanes = junctionConfig.nominalLanes;
      const laneWidth = roadWidth / numLanes;

      // B. Lane Markings
      ctx.strokeStyle = '#222F40';
      ctx.lineWidth = 2;
      for (let i = 1; i < numLanes; i++) {
        const lx = roadLeft + i * laneWidth;
        ctx.beginPath();
        ctx.setLineDash([12, 12]);
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Road Edges / Kerbs
      ctx.strokeStyle = '#38495E';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadLeft, 0);
      ctx.lineTo(roadLeft, H);
      ctx.moveTo(roadRight, 0);
      ctx.lineTo(roadRight, H);
      ctx.stroke();

      // C. Update & Draw Moving Vehicles
      if (isPlaying) {
        vehiclesRef.current.forEach((veh) => {
          // Flow speed modified if signal is red and approaching stopline at bottom
          let actualSpeed = veh.speed * 60 * dt;
          if (signalPhase === 'RED' && veh.y > 60 && veh.y < 85) {
            actualSpeed *= 0.15; // Queuing vehicle
          }
          veh.y = (veh.y + actualSpeed);
          if (veh.y > 105) {
            veh.y = -10;
            veh.lane = Math.floor(Math.random() * numLanes);
          }
        });
      }

      vehiclesRef.current.forEach((veh) => {
        // Enforce lane shift if obstacle blocks lane 0
        let targetLane = veh.lane;
        if (totalObstructionPct > 20 && targetLane === 0 && veh.y > 35 && veh.y < 90) {
          targetLane = 1; // Divert away from curbside obstruction
        }

        const vx = roadLeft + targetLane * laneWidth + (laneWidth - veh.width) / 2;
        const vy = (veh.y / 100) * H;

        // Vehicle Body
        ctx.fillStyle = veh.color;
        ctx.beginPath();
        ctx.roundRect(vx, vy, veh.width, veh.height, 4);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0A0E14';
        ctx.fillRect(vx + 3, vy + 4, veh.width - 6, veh.height * 0.25);

        // Headlights
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(vx + 2, vy + veh.height - 4, 4, 3);
        ctx.fillRect(vx + veh.width - 6, vy + veh.height - 4, 4, 3);

        // Bounding Box on Vehicle if enabled
        if (showBoundingBoxes) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(vx - 2, vy - 2, veh.width + 4, veh.height + 4);

          ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
          ctx.fillRect(vx - 2, vy - 12, 38, 10);
          ctx.fillStyle = '#0A0E14';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(veh.type.toUpperCase(), vx, vy - 4);
        }
      });

      // D. Draw Curbside Encroachments & Obstacles
      junctionConfig.obstacles.forEach((obs) => {
        const ox = roadLeft + (obs.x / 100) * roadWidth;
        const oy = (obs.y / 100) * H;
        const ow = (obs.w / 100) * roadWidth;
        const oh = (obs.h / 100) * H;

        // Physical Obstacle Shape
        if (obs.class === 'vendor_cart') {
          // Pushcart Body
          ctx.fillStyle = '#B45309';
          ctx.fillRect(ox, oy, ow, oh);
          // Canopy
          ctx.fillStyle = '#F5A623';
          ctx.fillRect(ox - 2, oy - 4, ow + 4, 8);
          // Wheels
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.arc(ox + 4, oy + oh, 4, 0, Math.PI * 2);
          ctx.arc(ox + ow - 4, oy + oh, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.class === 'double_parked_vehicle') {
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.roundRect(ox, oy, ow, oh, 4);
          ctx.fill();
          // Hazard Flashers
          ctx.fillStyle = Math.floor(now / 400) % 2 === 0 ? '#F59E0B' : '#78350F';
          ctx.fillRect(ox + 2, oy + 2, 3, 3);
          ctx.fillRect(ox + ow - 5, oy + 2, 3, 3);
        } else if (obs.class === 'illegal_stall') {
          ctx.fillStyle = '#FB923C';
          ctx.fillRect(ox, oy, ow, oh);
          ctx.fillStyle = '#9A3412';
          ctx.fillRect(ox + 2, oy + 2, ow - 4, 6);
        } else {
          // Pedestrian spillover cluster
          ctx.fillStyle = '#38BDF8';
          for (let p = 0; p < 3; p++) {
            ctx.beginPath();
            ctx.arc(ox + 6 + p * 8, oy + 8 + (p % 2) * 6, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Bounding Box Overlay & Dynamic Impact Label
        if (showBoundingBoxes) {
          const strokeColor = obs.class === 'double_parked_vehicle' ? '#EF4444' : '#F5A623';
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.8;
          ctx.strokeRect(ox - 3, oy - 3, ow + 6, oh + 6);

          // Header tag
          ctx.fillStyle = strokeColor;
          const tagW = Math.max(75, ow + 10);
          ctx.fillRect(ox - 3, oy - 16, tagW, 13);
          ctx.fillStyle = '#0A0E14';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`${obs.class.replace('_', ' ').toUpperCase()} ${(obs.confidence * 100).toFixed(0)}%`, ox, oy - 6);

          // Impact badge
          ctx.fillStyle = 'rgba(10, 14, 20, 0.85)';
          ctx.fillRect(ox - 3, oy + oh + 4, 65, 12);
          ctx.fillStyle = '#F87171';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(`-${obs.laneImpactPct}% WIDTH`, ox, oy + oh + 13);
        }
      });

      // E. Dynamic Usable Carriageway Encroachment Boundary Line
      if (showLaneEnvelope && totalObstructionPct > 0) {
        const encroachmentBoundaryX = roadLeft + (totalObstructionPct / 100) * roadWidth * 0.9;

        // Blocked Lateral Zone Shading
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.fillRect(roadLeft, 0, encroachmentBoundaryX - roadLeft, H);

        // Usable Zone Shading
        ctx.fillStyle = 'rgba(46, 204, 113, 0.05)';
        ctx.fillRect(encroachmentBoundaryX, 0, roadRight - encroachmentBoundaryX, H);

        // Red Dashed Encroachment Envelope
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(encroachmentBoundaryX, 0);
        ctx.lineTo(encroachmentBoundaryX, H);
        ctx.stroke();
        ctx.setLineDash([]);

        // Boundary Tag
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(encroachmentBoundaryX - 2, H * 0.35, 75, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`W_obs: -${lostWidthM}m`, encroachmentBoundaryX + 3, H * 0.35 + 10);
      }

      // F. Stopline & Active Signal Head Indicator
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(roadLeft, H - 24, roadWidth, 4);

      // Signal Light Bar at Bottom Right
      const sigX = W - 42;
      const sigY = H - 85;
      ctx.fillStyle = 'rgba(10, 14, 20, 0.92)';
      ctx.strokeStyle = '#2B384A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(sigX, sigY, 32, 75, 6);
      ctx.fill();
      ctx.stroke();

      // Red bulb
      ctx.fillStyle = signalPhase === 'RED' ? '#EF4444' : '#451A1A';
      ctx.beginPath();
      ctx.arc(sigX + 16, sigY + 16, 7, 0, Math.PI * 2);
      ctx.fill();
      if (signalPhase === 'RED') {
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Amber bulb
      ctx.fillStyle = signalPhase === 'AMBER' ? '#F59E0B' : '#452A0A';
      ctx.beginPath();
      ctx.arc(sigX + 16, sigY + 37, 7, 0, Math.PI * 2);
      ctx.fill();
      if (signalPhase === 'AMBER') {
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Green bulb
      ctx.fillStyle = signalPhase === 'GREEN' ? '#10B981' : '#06301A';
      ctx.beginPath();
      ctx.arc(sigX + 16, sigY + 58, 7, 0, Math.PI * 2);
      ctx.fill();
      if (signalPhase === 'GREEN') {
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedJunctionId, isPlaying, showBoundingBoxes, showLaneEnvelope, signalPhase, totalObstructionPct, junctionConfig, lostWidthM]);

  return (
    <div className={`rounded-2xl bg-[#0B0F16] border border-[#1E2632] shadow-2xl overflow-hidden ${className}`}>
      
      {/* 1. TOP OPERATIONAL HUD BAR */}
      <div className="p-3.5 sm:p-4 bg-[#0E131C] border-b border-[#1E2632] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2ECC71]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                CAM-{selectedJunctionId.replace('int-', '0')}: {junctionConfig.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                LIVE RTSP STREAM
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#8B94A3]">
              {junctionConfig.roadName} • Station Telemetry Direct Feed
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
          <div className="px-2.5 py-1 rounded bg-[#070A0E] border border-[#1E2632] flex items-center gap-1.5">
            <span className="text-[#8B94A3]">FPS:</span>
            <span className="text-[#2ECC71] font-bold">{fps}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#070A0E] border border-[#1E2632] flex items-center gap-1.5">
            <span className="text-[#8B94A3]">Inference:</span>
            <span className="text-[#38BDF8] font-bold">{latencyMs}ms</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#070A0E] border border-[#1E2632] flex items-center gap-1.5">
            <span className="text-[#8B94A3]">Objects:</span>
            <span className="text-[#F5A623] font-bold">{junctionConfig.obstacles.length + 4}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN SURVEILLANCE MONITOR VIEWPORT & TELEMETRY OVERLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        
        {/* Left / Center Viewport (8 Cols) */}
        <div className="lg:col-span-8 relative bg-[#070A0E] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#1E2632]">
          
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            className="w-full h-auto max-h-[460px] object-contain aspect-[4/3] block"
          />

          {/* Top Left OSD Timestamp & Sensor Tag */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 font-mono text-[10px] pointer-events-none select-none">
            <div className="px-2 py-0.5 rounded bg-black/80 text-[#2ECC71] border border-black/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
              <span>YOLOv10-Nano TensorRT • INT8 ACCELERATED</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-black/80 text-[#94A3B8] border border-black/40">
              LOCATION: {junctionData.name} ({junctionData.lat.toFixed(4)}°N, {junctionData.lng.toFixed(4)}°E)
            </div>
          </div>

          {/* Top Right Live Signal Phase Countdown HUD */}
          <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none select-none">
            <div className="px-3 py-1.5 rounded-lg bg-black/90 border border-[#2B384A] font-mono text-center shadow-lg">
              <div className="text-[9px] text-[#8B94A3] uppercase">Current Phase</div>
              <div className={`text-base font-extrabold ${
                signalPhase === 'GREEN' ? 'text-[#10B981]' : signalPhase === 'AMBER' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
              }`}>
                {signalPhase} {phaseSecondsLeft}s
              </div>
            </div>
          </div>

          {/* Bottom Stream Controls Bar Overlay */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#0A0E14]/90 backdrop-blur-sm border border-[#222F40] text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-[#141B24] hover:bg-[#1E2632] text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-[#F5A623]" /> : <Play className="w-4 h-4 text-[#2ECC71]" />}
              </button>

              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
                  showBoundingBoxes
                    ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8]'
                    : 'bg-[#141B24] border-[#222F40] text-[#8B94A3]'
                }`}
              >
                {showBoundingBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Bounding Boxes</span>
              </button>

              <button
                onClick={() => setShowLaneEnvelope(!showLaneEnvelope)}
                className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
                  showLaneEnvelope
                    ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                    : 'bg-[#141B24] border-[#222F40] text-[#8B94A3]'
                }`}
              >
                <span>Curbside Constriction Zone</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#8B94A3] text-[11px]">Control Mode:</span>
              <button
                onClick={() => setActuationMode(actuationMode === 'adaptive' ? 'fixed' : 'adaptive')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                  actuationMode === 'adaptive'
                    ? 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/40'
                    : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                }`}
              >
                {actuationMode === 'adaptive' ? 'EncroachAI Adaptive' : 'Fixed Baseline'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Telemetry & Actuation Control Panel (4 Cols) */}
        <div className="lg:col-span-4 p-5 bg-[#0D121B] flex flex-col justify-between space-y-4 font-mono">
          
          <div className="space-y-4">
            
            {/* Actuation Status Card */}
            <div className="p-3.5 rounded-xl bg-[#070A0E] border border-[#1E2632] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8B94A3] uppercase tracking-wider">Actuation Loop</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                  NEMA TS2 SDLC LINKED
                </span>
              </div>

              {/* Dynamic Green Split Comparison */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-lg bg-[#0F1622] border border-[#1C2534]">
                  <div className="text-[10px] text-[#8B94A3]">Nominal Green</div>
                  <div className="text-lg font-bold text-[#94A3B8] mt-0.5">{nominalGreen}s</div>
                  <div className="text-[9px] text-[#64748B]">Static Split</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0F1622] border border-[#2ECC71]/30">
                  <div className="text-[10px] text-[#2ECC71]">Dynamic Green</div>
                  <div className="text-lg font-bold text-white mt-0.5">{dynamicGreen}s</div>
                  <div className="text-[9px] text-[#2ECC71] font-bold">+{greenExtensionSec}s Compensated</div>
                </div>
              </div>

              <div className="text-[11px] text-[#8B94A3] leading-relaxed pt-1 border-t border-[#1C2534]">
                Phase extension dynamically calculated to clear queue discharge under <strong>{100 - effectiveCapacityPct}%</strong> lateral constriction.
              </div>
            </div>

            {/* Geometric Carriageway Constriction Meter */}
            <div className="p-3.5 rounded-xl bg-[#070A0E] border border-[#1E2632] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8B94A3] uppercase tracking-wider">Usable Width (W_eff)</span>
                <span className="text-[#F5A623] font-bold">{effectiveCapacityPct}% Capacity</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white font-bold">{effectiveWidthM} m Usable</span>
                  <span className="text-[#EF4444] font-bold">-{lostWidthM} m Encroached</span>
                </div>

                <div className="h-3 w-full rounded-md bg-[#141B24] border border-[#222F40] overflow-hidden flex">
                  <div 
                    style={{ width: `${effectiveCapacityPct}%` }}
                    className="bg-[#2ECC71] h-full"
                    title="Usable Traffic Flow"
                  />
                  <div 
                    style={{ width: `${100 - effectiveCapacityPct}%` }}
                    className="bg-[#EF4444] h-full"
                    title="Curb Encroachment"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8B94A3] pt-1">
                <div>Nominal: <strong className="text-white">{junctionConfig.nominalWidthM}m ({junctionConfig.nominalLanes}L)</strong></div>
                <div>Saturation: <strong className="text-[#F5A623]">{junctionData.observedCapacityPcu} PCU/hr</strong></div>
              </div>
            </div>

            {/* Active Encroachments Detected On Screen */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8B94A3] uppercase tracking-wider">Detected Obstacles ({junctionConfig.obstacles.length})</span>
                <span className="text-[10px] text-[#38BDF8]">YOLOv10 High Conf</span>
              </div>

              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                {junctionConfig.obstacles.map((obs) => (
                  <div 
                    key={obs.id}
                    className="p-2 rounded-lg bg-[#070A0E] border border-[#1C2534] flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        obs.class === 'double_parked_vehicle' ? 'bg-[#EF4444]' : 'bg-[#F5A623]'
                      }`} />
                      <span className="text-white font-medium truncate">{obs.label}</span>
                    </div>
                    <span className="text-[#EF4444] font-bold shrink-0 ml-2">-{obs.laneImpactPct}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action to Launch Full Interactive Actuation Console */}
          {onOpenTool && (
            <div className="pt-2">
              <button
                onClick={onOpenTool}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
              >
                <span>Open Full Actuation Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 3. MULTI-CAMERA CORRIDOR SELECTOR STRIP */}
      <div className="p-3 bg-[#080C12] border-t border-[#1E2632] flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-mono text-[#8B94A3] uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#F5A623]" />
          <span>Switch Feed:</span>
        </span>

        {corridorData.intersections.map((intNode, idx) => {
          const isSelected = selectedJunctionId === intNode.id;
          return (
            <button
              key={intNode.id}
              onClick={() => handleSelectJunction(intNode.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#F5A623] text-[#0A0E14] font-bold shadow-md shadow-[#F5A623]/25'
                  : 'bg-[#101622] text-[#94A3B8] hover:text-white border border-[#1E2632]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#0A0E14]' : 'bg-[#2ECC71]'}`} />
              <span>CAM-{idx + 1}: {intNode.name.split('/')[0].trim()}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
