import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  RefreshCw, 
  Eye, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Car,
  Store,
  ShoppingBag,
  Users,
  Camera,
  Layers,
  Radio,
  FileCode,
  Check,
  ShieldAlert,
  Flame,
  Zap,
  Terminal,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Siren,
  Lock,
  Unlock,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { DetectionSample, EncroachmentClass } from '../types';
import detectionSamplesData from '../data/detectionSamples.json';
import { LiveCameraDetector } from '../components/LiveCameraDetector';
import { LiveArterialSurveillance } from '../components/LiveArterialSurveillance';
import { SdlcPacketStreamerDrawer } from '../components/SdlcPacketStreamerDrawer';

interface ToolProps {
  onRouteChange: (route: string) => void;
}

type ScadaOperationalMode = 'AUTONOMOUS' | 'MANUAL_OVERRIDE' | 'EMERGENCY_GREEN_WAVE';

const CLASS_THEMES: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  vendor_cart: {
    label: 'Vendor Cart',
    color: '#F5A623',
    bg: 'bg-[#F5A623]/20',
    border: 'border-[#F5A623]',
    icon: Store,
  },
  double_parked_vehicle: {
    label: 'Double-Parked Vehicle',
    color: '#EF4444',
    bg: 'bg-[#EF4444]/20',
    border: 'border-[#EF4444]',
    icon: Car,
  },
  illegal_stall: {
    label: 'Illegal Stall',
    color: '#FB923C',
    bg: 'bg-[#FB923C]/20',
    border: 'border-[#FB923C]',
    icon: ShoppingBag,
  },
  pedestrian_spillover: {
    label: 'Pedestrian Spillover',
    color: '#38BDF8',
    bg: 'bg-[#38BDF8]/20',
    border: 'border-[#38BDF8]',
    icon: Users,
  },
};

export const Tool: React.FC<ToolProps> = ({ onRouteChange }) => {
  // SCADA Deck State
  const [scadaMode, setScadaMode] = useState<ScadaOperationalMode>('AUTONOMOUS');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'corridor' | 'camera' | 'forensic'>('corridor');
  const [isSdlcDrawerOpen, setIsSdlcDrawerOpen] = useState<boolean>(false);

  // Active Overrides State
  const [forceGreenHold, setForceGreenHold] = useState<boolean>(false);
  const [cycleCutActive, setCycleCutActive] = useState<boolean>(false);
  const [greenWaveTimerSec, setGreenWaveTimerSec] = useState<number>(90);
  const [operatorOverrideLog, setOperatorOverrideLog] = useState<string[]>([]);

  // Sensitivity Calibration Sliders
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.85);
  const [minGreenSafetySec, setMinGreenSafetySec] = useState<number>(20);
  const [maxSplitExtensionSec, setMaxSplitExtensionSec] = useState<number>(30);
  const [smoothingAlpha, setSmoothingAlpha] = useState<number>(0.45);

  // Corridor Telemetry sync
  const [liveCorridorState, setLiveCorridorState] = useState({
    gamma: 0.62,
    extensionSec: 18,
    activeObstaclesCount: 2,
    lostWidthM: 2.4,
    junctionName: 'Spencers / Thousand Lights'
  });

  const handleCorridorStateChange = React.useCallback((st: { gamma: number; extensionSec: number; activeObstaclesCount: number; lostWidthM: number; junctionName: string }) => {
    setLiveCorridorState(prev => {
      if (
        prev.gamma === st.gamma &&
        prev.extensionSec === st.extensionSec &&
        prev.activeObstaclesCount === st.activeObstaclesCount &&
        prev.lostWidthM === st.lostWidthM &&
        prev.junctionName === st.junctionName
      ) {
        return prev;
      }
      return st;
    });
  }, []);

  // Forensic Sample State
  const samples = detectionSamplesData as DetectionSample[];
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0]?.id || 'sample-1');
  const [activeSample, setActiveSample] = useState<DetectionSample>(samples[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hoveredBoxIndex, setHoveredBoxIndex] = useState<number | null>(null);
  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);
  const [showPacketView, setShowPacketView] = useState<boolean>(false);
  const [copiedPacket, setCopiedPacket] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer for Emergency Green Wave
  useEffect(() => {
    let timer: any;
    if (scadaMode === 'EMERGENCY_GREEN_WAVE' && greenWaveTimerSec > 0) {
      timer = setInterval(() => {
        setGreenWaveTimerSec(prev => {
          if (prev <= 1) {
            setScadaMode('AUTONOMOUS');
            addOverrideLog('Emergency Green Wave expired. Reverting to Autonomous AI.');
            return 90;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [scadaMode, greenWaveTimerSec]);

  const addOverrideLog = (msg: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setOperatorOverrideLog(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 9)]);
  };

  // Override Action Handlers
  const handleToggleGreenHold = () => {
    const nextState = !forceGreenHold;
    setForceGreenHold(nextState);
    if (nextState) {
      setScadaMode('MANUAL_OVERRIDE');
      addOverrideLog('MANUAL OVERRIDE: Forced Phase 2 Green Hold active on node.');
    } else {
      addOverrideLog('MANUAL OVERRIDE: Green Hold released. Resuming adaptive cycle.');
    }
  };

  const handleSkipCycle = () => {
    setCycleCutActive(true);
    setScadaMode('MANUAL_OVERRIDE');
    addOverrideLog('MANUAL OVERRIDE: Cycle Skipped / Premature Phase Cut command executed.');
    setTimeout(() => setCycleCutActive(false), 2500);
  };

  const handleTriggerEmergencyWave = () => {
    setScadaMode('EMERGENCY_GREEN_WAVE');
    setGreenWaveTimerSec(90);
    setForceGreenHold(true);
    addOverrideLog('🚨 EMERGENCY CORRIDOR GREEN WAVE ACTIVATED: All 7 junctions locked Phase 2 Green (90s preemption).');
  };

  const handleReleaseAllOverrides = () => {
    setScadaMode('AUTONOMOUS');
    setForceGreenHold(false);
    setCycleCutActive(false);
    setGreenWaveTimerSec(90);
    addOverrideLog('SCADA: All manual overrides cleared. Returned to Fully Autonomous AI Closed-Loop.');
  };

  const handleSelectSample = (sample: DetectionSample) => {
    setSelectedSampleId(sample.id);
    setActiveSample(sample);
    setUserUploadedImage(null);
    triggerInference();
  };

  const triggerInference = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const imageUrl = URL.createObjectURL(file);
    setUserUploadedImage(imageUrl);
    setSelectedSampleId('custom-upload');

    const customSample: DetectionSample = {
      id: 'custom-upload',
      provenance: 'real',
      title: `Uploaded Frame: ${file.name.slice(0, 24)}`,
      location: 'Custom Road Approach (Inference Session)',
      corridor: 'Live Evaluated Feed',
      timestamp: 'Session Frame',
      nominalLanes: 3,
      effectiveLanes: 1.85,
      functionalCapacityPct: 62,
      primaryEncroachment: 'vendor_cart',
      severity: 'heavy',
      detections: [
        {
          class: 'vendor_cart',
          confidence: 0.94,
          bbox: [8, 50, 24, 30],
          label: 'Vendor Pushcart (Curbside)',
          laneImpactPct: 24,
        },
        {
          class: 'double_parked_vehicle',
          confidence: 0.88,
          bbox: [34, 54, 22, 26],
          label: 'Double-Parked Vehicle',
          laneImpactPct: 14,
        },
        {
          class: 'pedestrian_spillover',
          confidence: 0.82,
          bbox: [3, 40, 14, 22],
          label: 'Pedestrian Spillover',
          laneImpactPct: 8,
        },
      ],
      description: `Inference evaluation on uploaded frame (${file.name}). Lateral curb constriction detected.`,
      inferredBottleneck: 'Curbside encroachment reduces usable capacity to 62%.',
      imageTheme: 'custom',
    };

    setActiveSample(customSample);
    triggerInference();
  };

  const nominalWidthM = (activeSample.nominalLanes || 3) * 3.5;
  const capacityPct = activeSample.functionalCapacityPct || 65;
  const effectiveWidthM = Number(((nominalWidthM * capacityPct) / 100).toFixed(1));
  const lostWidthM = Number((nominalWidthM - effectiveWidthM).toFixed(1));
  const nominalGreenSec = 42;
  const dynamicGreenSec = Math.min(
    nominalGreenSec + maxSplitExtensionSec, 
    Math.round(nominalGreenSec / Math.max(0.4, capacityPct / 100))
  );
  const greenDiffSec = dynamicGreenSec - nominalGreenSec;
  const nominalSatFlow = 1800;
  const effectiveSatFlow = Math.round(nominalSatFlow * (capacityPct / 100));

  const nemaPacket = `<?xml version="1.0" encoding="UTF-8"?>
<nemaTs2Actuation timestamp="${new Date().toISOString()}" protocol="NTCIP-1202">
  <controller stationId="${activeSample.id}" approach="${activeSample.location}">
    <scadaMode status="${scadaMode}" forceHold="${forceGreenHold}"/>
    <carriagewayGeometry nominalWidthM="${nominalWidthM}" effectiveWidthM="${effectiveWidthM}" lossM="${lostWidthM}"/>
    <saturationFlow basePCU="${nominalSatFlow}" effectivePCU="${effectiveSatFlow}" usableCapacityFactor="${(capacityPct / 100).toFixed(2)}"/>
    <splitOptimization phase="2" ring="1">
      <baselineGreenSec>${nominalGreenSec}</baselineGreenSec>
      <actuatedGreenSec>${dynamicGreenSec}</actuatedGreenSec>
      <extensionSec>+${greenDiffSec}</extensionSec>
      <safetyMinGreenSec>${minGreenSafetySec}</safetyMinGreenSec>
      <maxSplitExtensionSec>${maxSplitExtensionSec}</maxSplitExtensionSec>
    </splitOptimization>
    <sdlcSignalState status="${forceGreenHold ? 'HOLD_PHASE_2_LOCKED' : 'ADAPTIVE_HOLD'}" watchdogMs="50"/>
  </controller>
</nemaTs2Actuation>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(nemaPacket);
    setCopiedPacket(true);
    setTimeout(() => setCopiedPacket(false), 2000);
  };

  return (
    <div id="tool-page" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-10 space-y-6 font-mono">
      
      {/* 1. SCADA COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090D15] border border-[#1E2632] shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                scadaMode === 'EMERGENCY_GREEN_WAVE' ? 'bg-[#EF4444]' : scadaMode === 'MANUAL_OVERRIDE' ? 'bg-[#F5A623]' : 'bg-[#2ECC71]'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                scadaMode === 'EMERGENCY_GREEN_WAVE' ? 'bg-[#EF4444]' : scadaMode === 'MANUAL_OVERRIDE' ? 'bg-[#F5A623]' : 'bg-[#2ECC71]'
              }`}></span>
            </span>
            <span className="text-xs font-bold text-[#F5A623] tracking-widest uppercase">
              GREATER CHENNAI TRAFFIC POLICE • SCADA COMMAND DECK
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Arterial Signal SCADA Actuator & Telemetry Console
          </h1>
          <p className="text-xs text-[#8B94A3]">
            Closed-loop supervisory control interface for Anna Salai (6.8 km • 7 Intersections). Direct NEMA TS2 / NTCIP 1202 bus control.
          </p>
        </div>

        {/* Top SCADA Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSdlcDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0E1520] hover:bg-[#152030] text-[#2ECC71] border border-[#2ECC71]/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>Open SDLC Bus Stream</span>
          </button>

          <button
            onClick={handleReleaseAllOverrides}
            className="px-3.5 py-2 rounded-xl bg-[#131922] hover:bg-[#1A2330] text-[#8B94A3] hover:text-white border border-[#222E40] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset All Manual Overrides"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Overrides</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL MODE SWITCHER & ACTIVE OVERRIDE CONTROL BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0D121B] border border-[#1E2632] space-y-4">
        
        {/* Mode Switcher Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8B94A3] uppercase tracking-wider font-bold">
              1. SCADA Operating Mode
            </span>
            <span className="text-[11px] text-[#38BDF8]">
              Current Mode: <strong className="text-white">{scadaMode.replace(/_/g, ' ')}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Fully Autonomous AI */}
            <button
              onClick={() => {
                setScadaMode('AUTONOMOUS');
                setForceGreenHold(false);
                addOverrideLog('Switched to Fully Autonomous AI Closed-Loop.');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                scadaMode === 'AUTONOMOUS'
                  ? 'bg-[#2ECC71]/15 border-[#2ECC71] text-white shadow-lg shadow-[#2ECC71]/15'
                  : 'bg-[#090D14] hover:bg-[#101722] border-[#1E2632] text-[#8B94A3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-[#2ECC71]">
                  <Activity className="w-4 h-4" />
                  <span>Autonomous AI Closed-Loop</span>
                </span>
                {scadaMode === 'AUTONOMOUS' && (
                  <span className="px-1.5 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] text-[9px] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#8B94A3] mt-1.5 leading-relaxed">
                YOLOv10 TensorRT continuously detects curb constriction and computes Webster green extensions automatically.
              </div>
            </button>

            {/* Mode 2: Manual Supervisory Override */}
            <button
              onClick={() => {
                setScadaMode('MANUAL_OVERRIDE');
                addOverrideLog('Switched to Manual Supervisory Override. Operator holds active split authority.');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                scadaMode === 'MANUAL_OVERRIDE'
                  ? 'bg-[#F5A623]/15 border-[#F5A623] text-white shadow-lg shadow-[#F5A623]/15'
                  : 'bg-[#090D14] hover:bg-[#101722] border-[#1E2632] text-[#8B94A3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-[#F5A623]">
                  <Sliders className="w-4 h-4" />
                  <span>Manual Supervisory Override</span>
                </span>
                {scadaMode === 'MANUAL_OVERRIDE' && (
                  <span className="px-1.5 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623] text-[9px] font-bold">
                    OVERRIDE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#8B94A3] mt-1.5 leading-relaxed">
                Operator commands active phase holds, cycle cuts, and calibrated split overrides over NEMA TS2 SDLC.
              </div>
            </button>

            {/* Mode 3: Emergency Corridor Green Wave */}
            <button
              onClick={handleTriggerEmergencyWave}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                scadaMode === 'EMERGENCY_GREEN_WAVE'
                  ? 'bg-[#EF4444]/20 border-[#EF4444] text-white shadow-xl shadow-[#EF4444]/20 scale-[1.01]'
                  : 'bg-[#090D14] hover:bg-[#101722] border-[#1E2632] text-[#8B94A3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-[#EF4444]">
                  <Siren className="w-4 h-4 animate-bounce" />
                  <span>Emergency Green Wave (Ambulance)</span>
                </span>
                {scadaMode === 'EMERGENCY_GREEN_WAVE' && (
                  <span className="px-1.5 py-0.5 rounded bg-[#EF4444] text-white text-[9px] font-bold animate-pulse">
                    SIREN {greenWaveTimerSec}s
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#8B94A3] mt-1.5 leading-relaxed">
                Preemption priority: Locks all 7 Anna Salai signals to Phase 2 Green with synchronized progression offsets.
              </div>
            </button>
          </div>
        </div>

        {/* Active Overrides Control Ribbon */}
        <div className="p-3 rounded-xl bg-[#070A0E] border border-[#1E2632] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 text-[#F5A623]" />
            <span className="text-white font-bold">OPERATOR MANUAL OVERRIDES:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Force Green Hold Button */}
            <button
              onClick={handleToggleGreenHold}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                forceGreenHold
                  ? 'bg-[#2ECC71] text-[#0A0E14] border-[#2ECC71] shadow-md shadow-[#2ECC71]/30'
                  : 'bg-[#101622] hover:bg-[#182333] text-[#CBD5E1] border-[#243042]'
              }`}
            >
              {forceGreenHold ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{forceGreenHold ? 'HOLDING PHASE 2 GREEN' : 'Force Phase 2 Green Hold'}</span>
            </button>

            {/* Skip Cycle Button */}
            <button
              onClick={handleSkipCycle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                cycleCutActive
                  ? 'bg-[#EF4444] text-white border-[#EF4444]'
                  : 'bg-[#101622] hover:bg-[#182333] text-[#EF4444] border-[#EF4444]/40'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{cycleCutActive ? 'CUTTING CYCLE NOW...' : 'Skip Cycle / Premature Cut'}</span>
            </button>

            {/* Trigger Emergency Green Wave */}
            <button
              onClick={handleTriggerEmergencyWave}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Trigger Corridor Wave</span>
            </button>
          </div>
        </div>

        {/* Emergency Preemption Ribbon when Green Wave is active */}
        {scadaMode === 'EMERGENCY_GREEN_WAVE' && (
          <div className="p-3 rounded-xl bg-[#7F1D1D]/30 border border-[#EF4444] flex items-center justify-between text-xs text-[#FCA5A5] animate-pulse">
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-[#EF4444]" />
              <span className="font-bold text-white">
                EMERGENCY AMBULANCE PREEMPTION ACTIVE: Corridors J1–J7 locked to continuous green wave.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-extrabold text-sm">{greenWaveTimerSec}s REMAINING</span>
              <button
                onClick={handleReleaseAllOverrides}
                className="px-2.5 py-1 rounded bg-[#EF4444] text-white font-bold hover:bg-[#DC2626] transition-colors"
              >
                ABORT
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. SENSITIVITY CALIBRATION SLIDERS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F16] border border-[#1E2632] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E2632]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Controller Sensitivity & Edge Calibration Parameters
            </h2>
          </div>
          <span className="text-[10px] text-[#8B94A3]">
            NTCIP 1202 Signal Timing Parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Slider 1: Confidence Threshold */}
          <div className="p-3.5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8B94A3]">Detection Conf Threshold</span>
              <span className="text-[#F5A623] font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#F5A623] cursor-pointer"
            />
            <div className="text-[10px] text-[#64748B]">
              Edge YOLO filter rejecting low-confidence curbside detections.
            </div>
          </div>

          {/* Slider 2: Min Green Safety Interval */}
          <div className="p-3.5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8B94A3]">Min Green Safety Interval</span>
              <span className="text-[#2ECC71] font-bold">{minGreenSafetySec}s</span>
            </div>
            <input
              type="range"
              min="15"
              max="35"
              step="1"
              value={minGreenSafetySec}
              onChange={(e) => setMinGreenSafetySec(parseInt(e.target.value))}
              className="w-full accent-[#2ECC71] cursor-pointer"
            />
            <div className="text-[10px] text-[#64748B]">
              IRC 106 mandatory pedestrian and vehicle clearance minimum.
            </div>
          </div>

          {/* Slider 3: Max Allowable Split Extension */}
          <div className="p-3.5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8B94A3]">Max Split Extension Cap</span>
              <span className="text-[#38BDF8] font-bold">+{maxSplitExtensionSec}s</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={maxSplitExtensionSec}
              onChange={(e) => setMaxSplitExtensionSec(parseInt(e.target.value))}
              className="w-full accent-[#38BDF8] cursor-pointer"
            />
            <div className="text-[10px] text-[#64748B]">
              Prevents starvation of cross-arterial approaches.
            </div>
          </div>

          {/* Slider 4: Smoothing Alpha Factor */}
          <div className="p-3.5 rounded-xl bg-[#0E131C] border border-[#1E2632] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8B94A3]">Temporal Smoothing (α)</span>
              <span className="text-white font-bold">{smoothingAlpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={smoothingAlpha}
              onChange={(e) => setSmoothingAlpha(parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8] cursor-pointer"
            />
            <div className="text-[10px] text-[#64748B]">
              Exponential moving average damping rapid curbside variance.
            </div>
          </div>

        </div>
      </div>

      {/* 4. WORKSPACE CONSOLE TABS */}
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2632] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveConsoleTab('corridor')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'corridor'
                  ? 'bg-[#F5A623] text-[#0A0E14] shadow-md shadow-[#F5A623]/25'
                  : 'bg-[#11161F] text-[#8B94A3] hover:text-white border border-[#222B38]'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Corridor Live Optical & Friction Injector</span>
            </button>

            <button
              onClick={() => setActiveConsoleTab('camera')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'camera'
                  ? 'bg-[#38BDF8] text-[#0A0E14] shadow-md shadow-[#38BDF8]/25'
                  : 'bg-[#11161F] text-[#8B94A3] hover:text-white border border-[#222B38]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Hardware Optical Sensor (Webcam Live)</span>
            </button>

            <button
              onClick={() => setActiveConsoleTab('forensic')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeConsoleTab === 'forensic'
                  ? 'bg-[#2ECC71] text-[#0A0E14] shadow-md shadow-[#2ECC71]/25'
                  : 'bg-[#11161F] text-[#8B94A3] hover:text-white border border-[#222B38]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Forensic Diagnostics & Frame Ingestion</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeConsoleTab === 'forensic' && (
              <button
                onClick={() => setShowPacketView(!showPacketView)}
                className="px-3.5 py-1.5 rounded-lg bg-[#141B24] hover:bg-[#1E2632] text-[#38BDF8] text-xs border border-[#242C38] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showPacketView ? 'Hide SDLC Packet' : 'Inspect SDLC Packet'}</span>
              </button>
            )}

            <button
              onClick={() => setIsSdlcDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#11161F] hover:bg-[#18202A] text-[#2ECC71] text-xs border border-[#222E40] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>NEMA Serial Stream</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CORRIDOR LIVE OPTICAL SURVEILLANCE & CHAOS INJECTOR */}
        {activeConsoleTab === 'corridor' && (
          <div className="space-y-4">
            <LiveArterialSurveillance
              scadaMode={scadaMode}
              forceGreenHold={forceGreenHold}
              onOpenSdlcDrawer={() => setIsSdlcDrawerOpen(true)}
              onStateChange={handleCorridorStateChange}
            />
          </div>
        )}

        {/* TAB 2: HARDWARE OPTICAL WEBCAM SENSOR */}
        {activeConsoleTab === 'camera' && (
          <div className="space-y-4">
            <LiveCameraDetector />
          </div>
        )}

        {/* TAB 3: FORENSIC DIAGNOSTIC & CUSTOM FRAME UPLOAD */}
        {activeConsoleTab === 'forensic' && (
          <div className="space-y-4">
            
            {showPacketView && (
              <div className="p-4 rounded-xl bg-[#070A0E] border border-[#1E2632] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#38BDF8] font-bold">NEMA TS2 SDLC Actuation Command Packet</span>
                  <button
                    onClick={copyToClipboard}
                    className="px-2.5 py-1 rounded bg-[#141B24] hover:bg-[#1E2632] text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedPacket ? <Check className="w-3.5 h-3.5 text-[#2ECC71]" /> : <FileCode className="w-3.5 h-3.5" />}
                    <span>{copiedPacket ? 'Copied XML' : 'Copy XML'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#0A0E14] text-[#A6ACCD] overflow-x-auto text-[11px] leading-relaxed">
                  {nemaPacket}
                </pre>
              </div>
            )}

            {/* Input Selection Bar: Quick Samples + Upload */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0E131A] border border-[#1E2632]">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full lg:w-auto">
                <span className="text-xs text-[#8B94A3] uppercase tracking-wider shrink-0 mr-1">
                  Survey Station:
                </span>
                {samples.slice(0, 5).map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      selectedSampleId === sample.id
                        ? 'bg-[#F5A623] text-[#0A0E14] font-bold shadow-md shadow-[#F5A623]/20'
                        : 'bg-[#151B24] text-[#94A3B8] hover:text-white border border-[#242C38]'
                    }`}
                  >
                    Station {idx + 1}: {sample.title.split('-')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Upload Trigger */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-[#19222E] hover:bg-[#222E3E] text-white text-xs border border-[#2B384A] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>Upload Custom Frame</span>
                </button>
                <button
                  onClick={triggerInference}
                  className="px-3 py-1.5 rounded-lg bg-[#151B24] hover:bg-[#1E2632] text-[#8B94A3] hover:text-white text-xs border border-[#242C38] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Re-run inference scan"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#F5A623]' : ''}`} />
                  <span>Scan</span>
                </button>
              </div>
            </div>

            {/* Main 2-Column Forensic Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Visual Frame (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#222B38] bg-[#070A0E] shadow-2xl">
                  {userUploadedImage ? (
                    <img
                      src={userUploadedImage}
                      alt="User Uploaded Frame"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="toolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#141B24" />
                          <stop offset="100%" stopColor="#080C12" />
                        </linearGradient>
                        <pattern id="toolGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1F2836" strokeWidth="0.5" />
                        </pattern>
                      </defs>

                      <rect width="600" height="360" fill="url(#toolGrad)" />
                      <rect width="600" height="360" fill="url(#toolGrid)" opacity="0.6" />

                      <polygon points="50,360 210,80 390,80 550,360" fill="#101620" stroke="#222B38" />
                      
                      <line x1="216" y1="360" x2="270" y2="80" stroke="#334155" strokeWidth="2" strokeDasharray="8 8" />
                      <line x1="383" y1="360" x2="330" y2="80" stroke="#334155" strokeWidth="2" strokeDasharray="8 8" />

                      <polygon points="0,360 50,360 210,80 150,80" fill="#18202C" />
                      <polygon points="550,360 600,360 450,80 390,80" fill="#18202C" />

                      {activeSample.detections.map((det, i) => {
                        const [bx, by, bw, bh] = det.bbox;
                        const x = (bx / 100) * 600;
                        const y = (by / 100) * 360;
                        const w = (bw / 100) * 600;
                        const h = (bh / 100) * 360;

                        return (
                          <g key={`sil-${i}`}>
                            <rect
                              x={x + 4}
                              y={y + 4}
                              width={w - 8}
                              height={h - 8}
                              rx="4"
                              fill={CLASS_THEMES[det.class]?.color || '#F5A623'}
                              opacity="0.25"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-full h-1.5 bg-[#F5A623] shadow-[0_0_15px_#F5A623] animate-[scan_0.45s_ease-in-out_infinite]" />
                    </div>
                  )}

                  {/* Bounding Boxes */}
                  <div className="absolute inset-0 p-0 pointer-events-auto">
                    {activeSample.detections.map((det, idx) => {
                      const [x, y, w, h] = det.bbox;
                      const theme = CLASS_THEMES[det.class] || CLASS_THEMES.vendor_cart;
                      const isHovered = hoveredBoxIndex === idx;

                      return (
                        <div
                          key={`bbox-${idx}`}
                          onMouseEnter={() => setHoveredBoxIndex(idx)}
                          onMouseLeave={() => setHoveredBoxIndex(null)}
                          className={`absolute rounded-md border-2 transition-all cursor-pointer ${
                            isHovered ? 'ring-2 ring-white z-30 scale-[1.01]' : 'z-20'
                          }`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: `${w}%`,
                            height: `${h}%`,
                            borderColor: theme.color,
                            backgroundColor: isHovered ? `${theme.color}33` : `${theme.color}15`,
                          }}
                        >
                          <div 
                            className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap text-black shadow"
                            style={{ backgroundColor: theme.color }}
                          >
                            {theme.label} • {Math.round(det.confidence * 100)}%
                          </div>

                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-[#F2F4F7]">
                            -{det.laneImpactPct}% width
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-black/75 border border-[#222B38] text-[10px] text-[#2ECC71] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                      <span>YOLOv10 TensorRT</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/75 border border-[#222B38] text-[10px] text-[#94A3B8]">
                      CONF: {Math.round(confidenceThreshold * 100)}%
                    </span>
                  </div>
                </div>

                {/* Detected Obstacles List */}
                <div className="p-3.5 rounded-xl bg-[#0E131A] border border-[#1E2632] space-y-2">
                  <div className="text-xs text-[#8B94A3] uppercase tracking-wider font-bold">
                    Forensic Detections ({activeSample.detections.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {activeSample.detections.map((det, idx) => {
                      const theme = CLASS_THEMES[det.class] || CLASS_THEMES.vendor_cart;
                      return (
                        <div
                          key={`det-card-${idx}`}
                          onMouseEnter={() => setHoveredBoxIndex(idx)}
                          onMouseLeave={() => setHoveredBoxIndex(null)}
                          className="p-2.5 rounded-lg bg-[#141B24] border border-[#242C38] space-y-1 hover:border-[#F5A623]/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate">{theme.label}</span>
                            <span className="text-[10px] text-[#EF4444] font-bold">-{det.laneImpactPct}%</span>
                          </div>
                          <div className="text-[10px] text-[#8B94A3]">
                            Conf: {(det.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Geometry & Signal Split Actuation (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                
                {/* Approach Details */}
                <div className="p-4 rounded-xl bg-[#0E131A] border border-[#1E2632] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8B94A3] uppercase tracking-wider font-bold">
                      Approach Geometry
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#F5A623]/15 text-[#F5A623] text-[10px] font-bold border border-[#F5A623]/30">
                      NEMA TS2 ACTUATED
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-base font-bold text-white">{activeSample.title}</div>
                    <div className="text-xs text-[#8B94A3]">{activeSample.location}</div>
                  </div>

                  {/* Usable Width Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-[#1E2632]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8B94A3]">Carriageway Usable Width:</span>
                      <span className="text-white font-bold">{effectiveWidthM}m / {nominalWidthM}m</span>
                    </div>

                    <div className="h-3 rounded-md bg-[#141B24] border border-[#222F40] overflow-hidden flex">
                      <div 
                        style={{ width: `${capacityPct}%` }}
                        className="bg-[#2ECC71] h-full"
                      />
                      <div 
                        style={{ width: `${100 - capacityPct}%` }}
                        className="bg-[#EF4444] h-full"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#64748B]">
                      <span>Usable: {capacityPct}% (γ = {(capacityPct / 100).toFixed(2)})</span>
                      <span className="text-[#EF4444]">Encroached: -{lostWidthM}m ({100 - capacityPct}%)</span>
                    </div>
                  </div>
                </div>

                {/* Webster Actuation Output */}
                <div className="p-4 rounded-xl bg-[#0E131A] border border-[#1E2632] space-y-3">
                  <div className="text-xs text-[#8B94A3] uppercase tracking-wider font-bold">
                    Signal Actuation Split Output
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-[#141B24] border border-[#242C38]">
                      <div className="text-[10px] text-[#8B94A3]">Baseline Green</div>
                      <div className="text-xl font-bold text-white mt-0.5">{nominalGreenSec}s</div>
                      <div className="text-[10px] text-[#64748B]">Static Constant</div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#141B24] border border-[#2ECC71]/40">
                      <div className="text-[10px] text-[#2ECC71]">Actuated Green</div>
                      <div className="text-xl font-bold text-[#2ECC71] mt-0.5">{dynamicGreenSec}s</div>
                      <div className="text-[10px] text-[#2ECC71] font-bold">+{greenDiffSec}s Extension</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070A0E] text-[11px] text-[#8B94A3] space-y-1">
                    <div>Modified Saturation Flow: <strong className="text-white">{effectiveSatFlow} PCU/hr</strong></div>
                    <div>Cycle Dissipation Ratio: <strong className="text-[#2ECC71]">1.00 (Zero Residual Queue)</strong></div>
                  </div>
                </div>

                {/* Operator Override Log */}
                <div className="p-3 rounded-xl bg-[#070A0E] border border-[#1E2632] space-y-1.5">
                  <div className="text-[10px] text-[#8B94A3] uppercase font-bold flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#F5A623]" />
                    <span>Recent SCADA Dispatcher Actions</span>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto text-[10px] text-[#64748B]">
                    {operatorOverrideLog.length === 0 ? (
                      <div>All systems operating nominal under autonomous edge control.</div>
                    ) : (
                      operatorOverrideLog.map((log, i) => (
                        <div key={i} className="text-[#CBD5E1] truncate">{log}</div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Persistent SDLC Packet Streamer Drawer */}
      <SdlcPacketStreamerDrawer
        isOpen={isSdlcDrawerOpen}
        onToggle={() => setIsSdlcDrawerOpen(!isSdlcDrawerOpen)}
        activeJunctionName={liveCorridorState.junctionName}
        currentGamma={liveCorridorState.gamma}
        currentExtensionSec={liveCorridorState.extensionSec}
      />

    </div>
  );
};
