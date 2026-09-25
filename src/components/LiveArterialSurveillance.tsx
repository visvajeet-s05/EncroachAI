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
  ChevronRight,
  Flame,
  Truck,
  Store,
  Users,
  RotateCcw,
  Zap,
  Terminal,
  Clock,
  Sparkles
} from 'lucide-react';
import corridorData from '../data/corridorMap.json';

export interface SimulatedObstacle {
  id: string;
  class: 'vendor_cart' | 'double_parked_vehicle' | 'illegal_stall' | 'pedestrian_spillover';
  label: string;
  x: number; // percentage
  y: number;
  w: number;
  h: number;
  confidence: number;
  laneImpactPct: number;
  widthLossM?: number;
  injected?: boolean;
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

export interface LiveArterialSurveillanceProps {
  initialJunctionId?: string;
  onJunctionSelect?: (junctionId: string) => void;
  onOpenTool?: () => void;
  onOpenSdlcDrawer?: () => void;
  scadaMode?: 'AUTONOMOUS' | 'MANUAL_OVERRIDE' | 'EMERGENCY_GREEN_WAVE';
  forceGreenHold?: boolean;
  onStateChange?: (state: { gamma: number; extensionSec: number; activeObstaclesCount: number; lostWidthM: number; junctionName: string }) => void;
  className?: string;
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
      { id: 'obs-1', class: 'pedestrian_spillover', label: 'Pedestrian Group (Kerb Overflow)', x: 4, y: 65, w: 12, h: 18, confidence: 0.89, laneImpactPct: 9, widthLossM: 1.0 }
    ]
  },
  'int-2': {
    name: 'Spencers Plaza / Thousand Lights',
    roadName: 'Anna Salai Mid-Commercial (KM 1.8)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 42,
    obstacles: [
      { id: 'obs-1', class: 'vendor_cart', label: 'Fruit & Juice Pushcart', x: 5, y: 62, w: 16, h: 22, confidence: 0.94, laneImpactPct: 18, widthLossM: 1.9 },
      { id: 'obs-2', class: 'double_parked_vehicle', label: 'Delivery Auto-Rickshaw', x: 23, y: 70, w: 14, h: 18, confidence: 0.91, laneImpactPct: 12, widthLossM: 1.3 }
    ]
  },
  'int-3': {
    name: 'Gemini Flyover / Cathedral Rd',
    roadName: 'Anna Salai Grade-Separated Ingress (KM 2.9)',
    nominalLanes: 4,
    nominalWidthM: 14.0,
    baseGreenSec: 45,
    obstacles: [
      { id: 'obs-1', class: 'illegal_stall', label: 'Tea Stall Canopy & Benches', x: 3, y: 55, w: 18, h: 26, confidence: 0.96, laneImpactPct: 22, widthLossM: 3.1 },
      { id: 'obs-2', class: 'vendor_cart', label: 'Snack Cart (Lane 1 Encroach)', x: 22, y: 66, w: 14, h: 20, confidence: 0.88, laneImpactPct: 16, widthLossM: 2.2 }
    ]
  },
  'int-4': {
    name: 'DMS / Teynampet Metro',
    roadName: 'Anna Salai Metro Corridor (KM 4.0)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 38,
    obstacles: [
      { id: 'obs-1', class: 'double_parked_vehicle', label: 'Passenger Drop-Off Car', x: 6, y: 60, w: 15, h: 20, confidence: 0.92, laneImpactPct: 10, widthLossM: 1.1 }
    ]
  },
  'int-5': {
    name: 'Nandanam / Chamiers Rd',
    roadName: 'Anna Salai - Usman Rd Link (KM 5.2)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 40,
    obstacles: [
      { id: 'obs-1', class: 'vendor_cart', label: 'Flower Vendor Pushcart', x: 5, y: 58, w: 15, h: 22, confidence: 0.95, laneImpactPct: 17, widthLossM: 1.8 },
      { id: 'obs-2', class: 'pedestrian_spillover', label: 'Bus Stop Crowd Spill', x: 21, y: 68, w: 16, h: 16, confidence: 0.85, laneImpactPct: 9, widthLossM: 0.9 }
    ]
  },
  'int-6': {
    name: 'Saidapet Bazaar / Maraimalai Adigal',
    roadName: 'Anna Salai Market Ingress (KM 6.1)',
    nominalLanes: 3,
    nominalWidthM: 10.5,
    baseGreenSec: 42,
    obstacles: [
      { id: 'obs-1', class: 'vendor_cart', label: 'Vegetable Cart #1 (Primary)', x: 4, y: 50, w: 16, h: 24, confidence: 0.96, laneImpactPct: 24, widthLossM: 2.5 },
      { id: 'obs-2', class: 'vendor_cart', label: 'Fruit Cart #2 (Lane 1)', x: 21, y: 62, w: 15, h: 22, confidence: 0.93, laneImpactPct: 18, widthLossM: 1.9 },
      { id: 'obs-3', class: 'double_parked_vehicle', label: 'Loading Van (Stopped)', x: 38, y: 72, w: 15, h: 19, confidence: 0.89, laneImpactPct: 12, widthLossM: 1.3 }
    ]
  },
  'int-7': {
    name: 'Guindy Kathipara Feeder',
    roadName: 'Anna Salai South Terminus (KM 6.8)',
    nominalLanes: 4,
    nominalWidthM: 14.0,
    baseGreenSec: 44,
    obstacles: [
      { id: 'obs-1', class: 'pedestrian_spillover', label: 'Metro Interchange Foot Traffic', x: 4, y: 65, w: 14, h: 18, confidence: 0.87, laneImpactPct: 8, widthLossM: 1.1 }
    ]
  }
};

export const LiveArterialSurveillance: React.FC<LiveArterialSurveillanceProps> = ({
  initialJunctionId = 'int-2',
  onJunctionSelect,
  onOpenTool,
  onOpenSdlcDrawer,
  scadaMode = 'AUTONOMOUS',
  forceGreenHold = false,
  onStateChange,
  className = ''
}) => {
  const [selectedJunctionId, setSelectedJunctionId] = useState<string>(initialJunctionId);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showLaneEnvelope, setShowLaneEnvelope] = useState<boolean>(true);
  const [actuationMode, setActuationMode] = useState<'adaptive' | 'fixed'>('adaptive');
  const [fps, setFps] = useState<number>(38);
  const [latencyMs, setLatencyMs] = useState<number>(24);

  // Active Obstacles State (Allows Chaos / Friction Injection)
  const [currentObstacles, setCurrentObstacles] = useState<SimulatedObstacle[]>(
    JUNCTION_CONFIGS[initialJunctionId]?.obstacles || JUNCTION_CONFIGS['int-2'].obstacles
  );
  const [activeChaosScenario, setActiveChaosScenario] = useState<string | null>(null);
  const [lastEventToast, setLastEventToast] = useState<string | null>(null);

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
  const totalObstructionPct = Math.min(65, currentObstacles.reduce((sum, o) => sum + o.laneImpactPct, 0));
  const effectiveCapacityPct = Math.max(35, 100 - totalObstructionPct);
  const gamma = Number((effectiveCapacityPct / 100).toFixed(2));
  const effectiveWidthM = Number(((junctionConfig.nominalWidthM * effectiveCapacityPct) / 100).toFixed(1));
  const lostWidthM = Number((junctionConfig.nominalWidthM - effectiveWidthM).toFixed(1));
  const effectiveSatFlow = Math.round(1800 * gamma);

  // Webster Dynamic Green Extension
  const nominalGreen = junctionConfig.baseGreenSec;
  const dynamicGreen = Math.min(75, Math.round(nominalGreen / gamma));
  const greenExtensionSec = dynamicGreen - nominalGreen;
  const currentAssignedGreen = actuationMode === 'adaptive' ? dynamicGreen : nominalGreen;

  // Sync external state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        gamma,
        extensionSec: greenExtensionSec,
        activeObstaclesCount: currentObstacles.length,
        lostWidthM,
        junctionName: junctionConfig.name
      });
    }
  }, [gamma, greenExtensionSec, currentObstacles.length, lostWidthM, junctionConfig.name, onStateChange]);

  // Sync when selected junction changes
  const handleSelectJunction = (id: string) => {
    setSelectedJunctionId(id);
    const newCfg = JUNCTION_CONFIGS[id] || JUNCTION_CONFIGS['int-2'];
    setCurrentObstacles(newCfg.obstacles);
    setActiveChaosScenario(null);
    if (onJunctionSelect) onJunctionSelect(id);
  };

  // ==========================================
  // CHAOS / FRICTION INJECTOR ACTIONS
  // ==========================================

  const injectDeliveryTruck = () => {
    const truckObstacle: SimulatedObstacle = {
      id: `chaos-truck-${Date.now()}`,
      class: 'double_parked_vehicle',
      label: 'HEAVY DELIVERY TRUCK (PARKED)',
      x: 8,
      y: 52,
      w: 22,
      h: 28,
      confidence: 0.98,
      laneImpactPct: 40, // 4.2m loss on 10.5m carriageway
      widthLossM: 4.2,
      injected: true
    };

    setCurrentObstacles([truckObstacle]);
    setActiveChaosScenario('TRUCK');
    setLastEventToast('🚨 DOUBLE-PARKED TRUCK INJECTED: -4.2m Lateral Loss (Phase 2 Green Extended)');

    // Dynamically extend active green if currently green
    if (signalPhase === 'GREEN') {
      setPhaseSecondsLeft(prev => Math.min(75, prev + 22));
    }
  };

  const injectPushcartCluster = () => {
    const pushcart1: SimulatedObstacle = {
      id: `chaos-cart1-${Date.now()}`,
      class: 'vendor_cart',
      label: 'FRUIT PUSHCART CLUSTER #1',
      x: 4,
      y: 48,
      w: 16,
      h: 24,
      confidence: 0.96,
      laneImpactPct: 12,
      widthLossM: 1.3,
      injected: true
    };
    const pushcart2: SimulatedObstacle = {
      id: `chaos-cart2-${Date.now()}`,
      class: 'vendor_cart',
      label: 'VEGETABLE PUSHCART CLUSTER #2',
      x: 18,
      y: 64,
      w: 15,
      h: 22,
      confidence: 0.93,
      laneImpactPct: 8,
      widthLossM: 0.8,
      injected: true
    };

    setCurrentObstacles([pushcart1, pushcart2]);
    setActiveChaosScenario('PUSHCART');
    setLastEventToast('⚠️ PUSHCART CLUSTER INJECTED: -2.1m Loss | Dynamic Green +14s');

    if (signalPhase === 'GREEN') {
      setPhaseSecondsLeft(prev => Math.min(75, prev + 14));
    }
  };

  const injectPedestrianSpillover = () => {
    const pedCluster: SimulatedObstacle = {
      id: `chaos-ped-${Date.now()}`,
      class: 'pedestrian_spillover',
      label: 'PEDESTRIAN SPILLOVER BOTTLENECK',
      x: 5,
      y: 56,
      w: 18,
      h: 22,
      confidence: 0.91,
      laneImpactPct: 15,
      widthLossM: 1.5,
      injected: true
    };

    setCurrentObstacles([pedCluster]);
    setActiveChaosScenario('PEDESTRIAN');
    setLastEventToast('🚶 PEDESTRIAN SPILLOVER INJECTED: -1.5m Loss | Clearance Adjusted');

    if (signalPhase === 'GREEN') {
      setPhaseSecondsLeft(prev => Math.min(75, prev + 10));
    }
  };

  const clearObstructions = () => {
    setCurrentObstacles([]);
    setActiveChaosScenario('CLEAR');
    setLastEventToast('✅ OBSTRUCTIONS CLEARED: Nominal 100% Carriageway Restored (Baseline Webster)');
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

  // 2. Real-Time Signal Light Cycle Tick (Respects SCADA Overrides)
  useEffect(() => {
    if (!isPlaying) return;

    // In Emergency Green Wave mode, lock directly to GREEN
    if (scadaMode === 'EMERGENCY_GREEN_WAVE') {
      setSignalPhase('GREEN');
      setPhaseSecondsLeft(88);
      return;
    }

    // In Manual Force Green Hold, keep on green
    if (forceGreenHold) {
      setSignalPhase('GREEN');
      setPhaseSecondsLeft(99);
      return;
    }

    const timer = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          if (signalPhase === 'GREEN') {
            setSignalPhase('AMBER');
            return 4; // 4s amber
          } else if (signalPhase === 'AMBER') {
            setSignalPhase('RED');
            return 26; // 26s red
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
  }, [isPlaying, signalPhase, currentAssignedGreen, scadaMode, forceGreenHold]);

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

      // A. Dark Asymmetrical Roadway Background
      ctx.fillStyle = '#080C11';
      ctx.fillRect(0, 0, W, H);

      // Asphalt Roadbed
      ctx.fillStyle = '#0F151F';
      ctx.fillRect(W * 0.08, 0, W * 0.84, H);

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

      // C. Moving Vehicles & Dynamic Collision Avoidance
      if (isPlaying) {
        vehiclesRef.current.forEach((veh) => {
          let actualSpeed = veh.speed * 60 * dt;
          if (signalPhase === 'RED' && veh.y > 60 && veh.y < 85) {
            actualSpeed *= 0.15;
          }
          veh.y = (veh.y + actualSpeed);
          if (veh.y > 105) {
            veh.y = -10;
            veh.lane = Math.floor(Math.random() * numLanes);
          }
        });
      }

      vehiclesRef.current.forEach((veh) => {
        // Enforce vehicle lane diversion away from curbside obstruction
        let targetLane = veh.lane;
        if (totalObstructionPct > 15 && targetLane === 0 && veh.y > 30 && veh.y < 85) {
          targetLane = Math.min(numLanes - 1, 1);
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

        // Bounding Box on Vehicle
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

      // D. Draw Curbside Encroachments & Obstacles (Including Injected Chaos)
      currentObstacles.forEach((obs) => {
        const ox = roadLeft + (obs.x / 100) * roadWidth;
        const oy = (obs.y / 100) * H;
        const ow = (obs.w / 100) * roadWidth;
        const oh = (obs.h / 100) * H;

        // Obstacle Shape Rendering
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
          // Delivery Box Truck / Van
          ctx.fillStyle = obs.injected ? '#DC2626' : '#EF4444';
          ctx.beginPath();
          ctx.roundRect(ox, oy, ow, oh, 5);
          ctx.fill();

          // Truck Cargo Box Lines
          ctx.strokeStyle = '#7F1D1D';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ox + 3, oy + 4, ow - 6, oh * 0.65);

          // Hazard Flashers
          const flasherOn = Math.floor(now / 350) % 2 === 0;
          ctx.fillStyle = flasherOn ? '#F59E0B' : '#78350F';
          ctx.fillRect(ox + 2, oy + 2, 4, 4);
          ctx.fillRect(ox + ow - 6, oy + 2, 4, 4);
          ctx.fillRect(ox + 2, oy + oh - 5, 4, 4);
          ctx.fillRect(ox + ow - 6, oy + oh - 5, 4, 4);
        } else if (obs.class === 'illegal_stall') {
          ctx.fillStyle = '#FB923C';
          ctx.fillRect(ox, oy, ow, oh);
          ctx.fillStyle = '#9A3412';
          ctx.fillRect(ox + 2, oy + 2, ow - 4, 6);
        } else {
          // Pedestrian Spillover Group
          ctx.fillStyle = '#38BDF8';
          for (let p = 0; p < 4; p++) {
            ctx.beginPath();
            ctx.arc(ox + 5 + p * 6, oy + 6 + (p % 2) * 8, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Bounding Box Overlay & Dynamic Impact Label
        if (showBoundingBoxes) {
          const strokeColor = obs.injected 
            ? '#EF4444' 
            : obs.class === 'double_parked_vehicle' 
            ? '#EF4444' 
            : '#F5A623';

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = obs.injected ? 2.5 : 1.8;
          ctx.strokeRect(ox - 3, oy - 3, ow + 6, oh + 6);

          // Header tag
          ctx.fillStyle = strokeColor;
          const tagW = Math.max(90, ow + 14);
          ctx.fillRect(ox - 3, oy - 16, tagW, 14);
          ctx.fillStyle = '#0A0E14';
          ctx.font = 'bold 9px monospace';
          const tagTitle = obs.injected ? `[CHAOS] ${obs.label.slice(0, 16)}` : `${obs.class.replace('_', ' ').toUpperCase()} ${(obs.confidence * 100).toFixed(0)}%`;
          ctx.fillText(tagTitle, ox, oy - 6);

          // Impact badge below
          ctx.fillStyle = 'rgba(10, 14, 20, 0.90)';
          ctx.fillRect(ox - 3, oy + oh + 4, 85, 13);
          ctx.fillStyle = '#F87171';
          ctx.font = 'bold 8px monospace';
          const lossTxt = obs.widthLossM ? `-${obs.widthLossM}m (${obs.laneImpactPct}%)` : `-${obs.laneImpactPct}% WIDTH`;
          ctx.fillText(lossTxt, ox, oy + oh + 13);
        }
      });

      // E. Dynamic Usable Carriageway Encroachment Boundary Line
      if (showLaneEnvelope && totalObstructionPct > 0) {
        const encroachmentBoundaryX = roadLeft + (totalObstructionPct / 100) * roadWidth * 0.9;

        // Blocked Lateral Zone Shading
        ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
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
        ctx.fillRect(encroachmentBoundaryX - 2, H * 0.35, 80, 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`W_obs: -${lostWidthM}m`, encroachmentBoundaryX + 3, H * 0.35 + 11);
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
        ctx.shadowBlur = 12;
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
  }, [
    selectedJunctionId, 
    isPlaying, 
    showBoundingBoxes, 
    showLaneEnvelope, 
    signalPhase, 
    totalObstructionPct, 
    junctionConfig, 
    lostWidthM,
    currentObstacles
  ]);

  return (
    <div className={`rounded-2xl bg-[#0B0F16] border border-[#1E2632] shadow-2xl overflow-hidden ${className}`}>
      
      {/* 1. TOP OPERATIONAL HUD BAR */}
      <div className="p-3.5 sm:p-4 bg-[#0E131C] border-b border-[#1E2632] flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2ECC71]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider uppercase">
                CAM-{selectedJunctionId.replace('int-', '0')}: {junctionConfig.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                LIVE RTSP STREAM
              </span>
              {scadaMode !== 'AUTONOMOUS' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 animate-pulse">
                  {scadaMode === 'EMERGENCY_GREEN_WAVE' ? 'CORRIDOR GREEN WAVE ACTIVE' : 'MANUAL SCADA OVERRIDE'}
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#8B94A3]">
              {junctionConfig.roadName} • Station Telemetry Direct Feed
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="px-2.5 py-1 rounded bg-[#070A0E] border border-[#1E2632] flex items-center gap-1.5">
            <span className="text-[#8B94A3]">FPS:</span>
            <span className="text-[#2ECC71] font-bold">{fps}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#070A0E] border border-[#1E2632] flex items-center gap-1.5">
            <span className="text-[#8B94A3]">Loop:</span>
            <span className="text-[#38BDF8] font-bold">{latencyMs}ms</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#070A0E] border border-[#1E2632] flex items-center gap-1.5">
            <span className="text-[#8B94A3]">Gamma:</span>
            <span className={`font-bold ${gamma < 0.7 ? 'text-[#EF4444]' : 'text-[#2ECC71]'}`}>
              {gamma.toFixed(2)}
            </span>
          </div>

          {onOpenSdlcDrawer && (
            <button
              onClick={onOpenSdlcDrawer}
              className="px-2.5 py-1 rounded bg-[#101722] hover:bg-[#182333] text-[#2ECC71] border border-[#2ECC71]/30 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
              title="Open NEMA TS2 Serial Bus Drawer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SDLC Bus</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification for Injected Friction */}
      {lastEventToast && (
        <div className="px-4 py-2 bg-[#121A26] border-b border-[#2B394A] flex items-center justify-between text-xs font-mono text-[#F5A623] animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5A623] shrink-0" />
            <span>{lastEventToast}</span>
          </div>
          <button 
            onClick={() => setLastEventToast(null)}
            className="text-[#8B94A3] hover:text-white ml-2 text-[10px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 2. MAIN SURVEILLANCE MONITOR VIEWPORT & TELEMETRY OVERLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        
        {/* Left / Center Viewport (7 Cols) */}
        <div className="lg:col-span-7 relative bg-[#070A0E] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#1E2632]">
          
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            className="w-full h-auto max-h-[480px] object-contain aspect-[4/3] block"
          />

          {/* Top Left OSD Timestamp & Sensor Tag */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 font-mono text-[10px] pointer-events-none select-none">
            <div className="px-2 py-0.5 rounded bg-black/85 text-[#2ECC71] border border-black/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
              <span>YOLOv10 TensorRT FP16 • REAL-TIME EDGE INFERENCE</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-black/85 text-[#94A3B8] border border-black/40">
              LOCATION: {junctionData.name} ({junctionData.lat.toFixed(4)}°N, {junctionData.lng.toFixed(4)}°E)
            </div>
          </div>

          {/* Top Right Live Signal Phase Countdown HUD */}
          <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none select-none">
            <div className="px-3 py-1.5 rounded-lg bg-black/90 border border-[#2B384A] font-mono text-center shadow-lg">
              <div className="text-[9px] text-[#8B94A3] uppercase">
                {scadaMode === 'EMERGENCY_GREEN_WAVE' ? 'EMERGENCY PREEMPT' : 'NEMA PHASE 2'}
              </div>
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

        {/* Right Telemetry & Chaos Injector Deck (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-[#0D121B] flex flex-col justify-between space-y-4 font-mono">
          
          <div className="space-y-4">
            
            {/* STEP 1: INTERACTIVE "CORRIDOR CHAOS / FRICTION INJECTOR" PANEL */}
            <div className="p-3.5 rounded-xl bg-[#090D14] border border-[#222E40] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2534]">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#F5A623]" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">
                    Corridor Chaos / Friction Injector
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                  LIVE SIMULATION
                </span>
              </div>

              <div className="text-[11px] text-[#8B94A3]">
                Inject physical obstacles into active approach to test real-time lateral constriction detection, gamma reduction, and Webster green extension:
              </div>

              {/* 4 Interactive Quick-Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                
                {/* 1. Double-Parked Delivery Truck */}
                <button
                  onClick={injectDeliveryTruck}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeChaosScenario === 'TRUCK'
                      ? 'bg-[#EF4444]/20 border-[#EF4444] shadow-lg shadow-[#EF4444]/20 scale-[1.01]'
                      : 'bg-[#121824] hover:bg-[#182130] border-[#222E40] text-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#EF4444]" />
                      <span>Delivery Truck</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#EF4444]">+4.2m loss</span>
                  </div>
                  <div className="text-[10px] text-[#8B94A3] mt-1">
                    Simulate double-parked commercial vehicle (Gamma → 0.60)
                  </div>
                </button>

                {/* 2. Fruit Pushcart Cluster */}
                <button
                  onClick={injectPushcartCluster}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeChaosScenario === 'PUSHCART'
                      ? 'bg-[#F5A623]/20 border-[#F5A623] shadow-lg shadow-[#F5A623]/20 scale-[1.01]'
                      : 'bg-[#121824] hover:bg-[#182130] border-[#222E40] text-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#F5A623]" />
                      <span>Pushcart Cluster</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#F5A623]">+2.1m loss</span>
                  </div>
                  <div className="text-[10px] text-[#8B94A3] mt-1">
                    Inject 2 curbside fruit/vegetable carts (Gamma → 0.80)
                  </div>
                </button>

                {/* 3. Pedestrian Spillover / Bottleneck */}
                <button
                  onClick={injectPedestrianSpillover}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeChaosScenario === 'PEDESTRIAN'
                      ? 'bg-[#38BDF8]/20 border-[#38BDF8] shadow-lg shadow-[#38BDF8]/20 scale-[1.01]'
                      : 'bg-[#121824] hover:bg-[#182130] border-[#222E40] text-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Pedestrian Spill</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#38BDF8]">+1.5m loss</span>
                  </div>
                  <div className="text-[10px] text-[#8B94A3] mt-1">
                    Kerb crowd overflow into travel lane (Gamma → 0.85)
                  </div>
                </button>

                {/* 4. Clear Obstructions (Nominal Width) */}
                <button
                  onClick={clearObstructions}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    activeChaosScenario === 'CLEAR'
                      ? 'bg-[#2ECC71]/20 border-[#2ECC71] shadow-lg shadow-[#2ECC71]/20 scale-[1.01]'
                      : 'bg-[#121824] hover:bg-[#182130] border-[#222E40] text-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-[#2ECC71]" />
                      <span>Clear Corridor</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#2ECC71]">100% Nominal</span>
                  </div>
                  <div className="text-[10px] text-[#8B94A3] mt-1">
                    Remove all friction, reset to full nominal capacity
                  </div>
                </button>

              </div>
            </div>

            {/* Geometric Carriageway Constriction Meter (Reactive to Injected Friction) */}
            <div className="p-3.5 rounded-xl bg-[#070A0E] border border-[#1E2632] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8B94A3] uppercase tracking-wider">
                  Usable Width (γ = W_eff / W_nom)
                </span>
                <span className={`font-bold ${gamma < 0.75 ? 'text-[#EF4444]' : 'text-[#F5A623]'}`}>
                  γ = {gamma.toFixed(2)} ({effectiveCapacityPct}%)
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white font-bold">{effectiveWidthM} m Usable</span>
                  <span className="text-[#EF4444] font-bold">-{lostWidthM} m Lateral Loss</span>
                </div>

                <div className="h-3 w-full rounded-md bg-[#141B24] border border-[#222F40] overflow-hidden flex">
                  <div 
                    style={{ width: `${effectiveCapacityPct}%` }}
                    className="bg-[#2ECC71] h-full transition-all duration-300"
                    title="Usable Traffic Flow"
                  />
                  <div 
                    style={{ width: `${100 - effectiveCapacityPct}%` }}
                    className="bg-[#EF4444] h-full transition-all duration-300"
                    title="Curbside Encroachment"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8B94A3] pt-1">
                <div>Nominal: <strong className="text-white">{junctionConfig.nominalWidthM}m ({junctionConfig.nominalLanes}L)</strong></div>
                <div>Mod Sat Flow: <strong className="text-[#F5A623]">{effectiveSatFlow} PCU/hr</strong></div>
              </div>
            </div>

            {/* Dynamic Green Split Comparison & Actuation Lock */}
            <div className="p-3.5 rounded-xl bg-[#070A0E] border border-[#1E2632] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8B94A3] uppercase tracking-wider">Actuation Split</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                  NEMA TS2 SDLC LINKED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-lg bg-[#0F1622] border border-[#1C2534]">
                  <div className="text-[10px] text-[#8B94A3]">Nominal Green</div>
                  <div className="text-lg font-bold text-[#94A3B8] mt-0.5">{nominalGreen}s</div>
                  <div className="text-[9px] text-[#64748B]">Static Baseline</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0F1622] border border-[#2ECC71]/30">
                  <div className="text-[10px] text-[#2ECC71]">Dynamic Green</div>
                  <div className="text-lg font-bold text-white mt-0.5">{dynamicGreen}s</div>
                  <div className="text-[9px] text-[#2ECC71] font-bold">+{greenExtensionSec}s Compensated</div>
                </div>
              </div>

              <div className="text-[11px] text-[#8B94A3] leading-relaxed pt-1 border-t border-[#1C2534]">
                Webster formula extension: <code>g_act = g_nom / γ</code> dynamically compensating for <strong>-{lostWidthM}m</strong> carriageway constriction.
              </div>
            </div>

          </div>

          {/* Action to Launch Full Operator SCADA Console */}
          {onOpenTool && (
            <div className="pt-2">
              <button
                onClick={onOpenTool}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
              >
                <span>Launch Operator SCADA Control Deck</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 3. MULTI-CAMERA CORRIDOR SELECTOR STRIP */}
      <div className="p-3 bg-[#080C12] border-t border-[#1E2632] flex items-center gap-2 overflow-x-auto font-mono">
        <span className="text-[11px] text-[#8B94A3] uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#F5A623]" />
          <span>Switch Node:</span>
        </span>

        {corridorData.intersections.map((intNode, idx) => {
          const isSelected = selectedJunctionId === intNode.id;
          return (
            <button
              key={intNode.id}
              onClick={() => handleSelectJunction(intNode.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
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
