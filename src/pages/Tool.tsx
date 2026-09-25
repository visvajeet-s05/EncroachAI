import React, { useState, useRef } from 'react';
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
  Check
} from 'lucide-react';
import { DetectionSample, EncroachmentClass } from '../types';
import detectionSamplesData from '../data/detectionSamples.json';
import { LiveCameraDetector } from '../components/LiveCameraDetector';
import { LiveArterialSurveillance } from '../components/LiveArterialSurveillance';

interface ToolProps {
  onRouteChange: (route: string) => void;
}

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

export const Tool: React.FC<ToolProps> = () => {
  const [activeMode, setActiveMode] = useState<'corridor' | 'camera' | 'forensic'>('corridor');
  const samples = detectionSamplesData as DetectionSample[];
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0]?.id || 'sample-1');
  const [activeSample, setActiveSample] = useState<DetectionSample>(samples[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hoveredBoxIndex, setHoveredBoxIndex] = useState<number | null>(null);
  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);
  const [showPacketView, setShowPacketView] = useState<boolean>(false);
  const [copiedPacket, setCopiedPacket] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Create realistic dynamic sample from uploaded frame
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

  // Calculations derived directly from sample data
  const nominalWidthM = (activeSample.nominalLanes || 3) * 3.5;
  const capacityPct = activeSample.functionalCapacityPct || 65;
  const effectiveWidthM = Number(((nominalWidthM * capacityPct) / 100).toFixed(1));
  const lostWidthM = Number((nominalWidthM - effectiveWidthM).toFixed(1));
  const nominalGreenSec = 42;
  // Scaled dynamic green allocation: Webster green extended proportionally to lost saturation flow
  const dynamicGreenSec = Math.min(68, Math.round(nominalGreenSec / (capacityPct / 100)));
  const greenDiffSec = dynamicGreenSec - nominalGreenSec;
  const nominalSatFlow = 1800; // PCU per lane-hour
  const effectiveSatFlow = Math.round(nominalSatFlow * (capacityPct / 100));

  // Simulated NEMA TS2 Frame Output
  const nemaPacket = `<?xml version="1.0" encoding="UTF-8"?>
<nemaTs2Actuation timestamp="${new Date().toISOString()}" protocol="NTCIP-1202">
  <controller stationId="${activeSample.id}" approach="${activeSample.location}">
    <carriagewayGeometry nominalWidthM="${nominalWidthM}" effectiveWidthM="${effectiveWidthM}" lossM="${lostWidthM}"/>
    <saturationFlow basePCU="${nominalSatFlow}" effectivePCU="${effectiveSatFlow}" usableCapacityFactor="${(capacityPct / 100).toFixed(2)}"/>
    <splitOptimization phase="2" ring="1">
      <baselineGreenSec>${nominalGreenSec}</baselineGreenSec>
      <actuatedGreenSec>${dynamicGreenSec}</actuatedGreenSec>
      <extensionSec>+${greenDiffSec}</extensionSec>
      <queueDissipationConfidence>0.96</queueDissipationConfidence>
    </splitOptimization>
    <sdlcSignalState status="HOLD_PHASE_2" watchdogMs="50"/>
  </controller>
</nemaTs2Actuation>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(nemaPacket);
    setCopiedPacket(true);
    setTimeout(() => setCopiedPacket(false), 2000);
  };

  return (
    <div id="tool-page" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-10 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2632]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#F5A623]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              Signal Actuation & Telemetry Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8B94A3] mt-0.5">
            Real-time vision-edge perception measuring carriageway constriction and computing Webster-compensated arterial green splits.
          </p>
        </div>

        {/* Operational Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E131C] border border-[#1E2632] text-[11px] font-mono text-[#2ECC71] shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
          <span>NEMA TS2 SDLC: ACTUATION READY</span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2632] pb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveMode('corridor')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'corridor'
                ? 'bg-[#F5A623] text-[#0A0E14] shadow-md shadow-[#F5A623]/25'
                : 'bg-[#11161F] text-[#8B94A3] hover:text-white border border-[#222B38]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Corridor Live Surveillance (7 Nodes)</span>
          </button>

          <button
            onClick={() => setActiveMode('camera')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-[#38BDF8] text-[#0A0E14] shadow-md shadow-[#38BDF8]/25'
                : 'bg-[#11161F] text-[#8B94A3] hover:text-white border border-[#222B38]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Hardware Optical Sensor (Webcam)</span>
          </button>

          <button
            onClick={() => setActiveMode('forensic')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'forensic'
                ? 'bg-[#2ECC71] text-[#0A0E14] shadow-md shadow-[#2ECC71]/25'
                : 'bg-[#11161F] text-[#8B94A3] hover:text-white border border-[#222B38]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Forensic Diagnostic & Frame Upload</span>
          </button>
        </div>

        {activeMode === 'forensic' && (
          <button
            onClick={() => setShowPacketView(!showPacketView)}
            className="px-3.5 py-1.5 rounded-lg bg-[#141B24] hover:bg-[#1E2632] text-[#38BDF8] text-xs font-mono border border-[#242C38] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showPacketView ? 'Hide SDLC Packet' : 'Inspect SDLC Packet'}</span>
          </button>
        )}
      </div>

      {/* MODE 1: CORRIDOR LIVE SURVEILLANCE */}
      {activeMode === 'corridor' && (
        <div className="space-y-6">
          <LiveArterialSurveillance />
        </div>
      )}

      {/* MODE 2: HARDWARE OPTICAL WEBCAM */}
      {activeMode === 'camera' && (
        <div className="space-y-6">
          <LiveCameraDetector />
        </div>
      )}

      {/* MODE 3: FORENSIC DIAGNOSTIC & CUSTOM FRAME UPLOAD */}
      {activeMode === 'forensic' && (
        <>
          {/* Optional NEMA TS2 XML Packet Modal/Panel */}
          {showPacketView && (
            <div className="p-4 rounded-xl bg-[#070A0E] border border-[#1E2632] space-y-2 font-mono text-xs">
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
              <span className="text-xs font-mono text-[#8B94A3] uppercase tracking-wider shrink-0 mr-1">
                Survey Station:
              </span>
              {samples.slice(0, 5).map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
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
                className="px-3.5 py-1.5 rounded-lg bg-[#19222E] hover:bg-[#222E3E] text-white text-xs font-mono border border-[#2B384A] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Upload Custom Frame</span>
              </button>
              <button
                onClick={triggerInference}
                className="px-3 py-1.5 rounded-lg bg-[#151B24] hover:bg-[#1E2632] text-[#8B94A3] hover:text-white text-xs font-mono border border-[#242C38] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Re-run inference scan"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#F5A623]' : ''}`} />
                <span>Scan</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Interactive Tool Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Visual Frame & Bounding Boxes (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#222B38] bg-[#070A0E] shadow-2xl">
                
                {/* 1. Backdrop */}
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

                    {/* Perspective Road Surface */}
                    <polygon points="50,360 210,80 390,80 550,360" fill="#101620" stroke="#222B38" />
                    
                    {/* Lane Separator Markings */}
                    <line x1="216" y1="360" x2="270" y2="80" stroke="#334155" strokeWidth="2" strokeDasharray="8 8" />
                    <line x1="383" y1="360" x2="330" y2="80" stroke="#334155" strokeWidth="2" strokeDasharray="8 8" />

                    {/* Kerb borders */}
                    <polygon points="0,360 50,360 210,80 150,80" fill="#18202C" />
                    <polygon points="550,360 600,360 450,80 390,80" fill="#18202C" />

                    {/* Encroachment Obstacle Silhouettes */}
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

                {/* 2. Real-Time Scanline Animation */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1.5 bg-[#F5A623] shadow-[0_0_15px_#F5A623] animate-[scan_0.45s_ease-in-out_infinite]" />
                  </div>
                )}

                {/* 3. Bounding Boxes Overlay */}
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
                        {/* Class Tag Header */}
                        <div 
                          className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap text-black shadow"
                          style={{ backgroundColor: theme.color }}
                        >
                          {theme.label} • {Math.round(det.confidence * 100)}%
                        </div>

                        {/* Lane Impact Indicator Badge */}
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-[#F2F4F7]">
                          -{det.laneImpactPct}% width
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Camera Overlay HUD Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/75 border border-[#222B38] text-[10px] font-mono text-[#2ECC71] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                    <span>YOLOv10 TensorRT</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/75 border border-[#222B38] text-[10px] font-mono text-[#94A3B8]">
                    24.2ms • 38 FPS
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#8B94A3] bg-black/70 px-2.5 py-1 rounded border border-[#222B38] pointer-events-none">
                  Location: {activeSample.location}
                </div>
              </div>

              {/* Detections Legend Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {Object.entries(CLASS_THEMES).map(([key, item]) => {
                  const count = activeSample.detections.filter(d => d.class === key).length;
                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-lg bg-[#0E131A] border border-[#1E2632] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[#C8D1DC] text-[11px]">{item.label}</span>
                      </div>
                      <span className="font-bold text-white text-[11px]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Computed Usable Capacity & Signal Timing (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              
              {/* Section 1: Computed Usable-Capacity Result */}
              <div className="p-5 rounded-2xl bg-[#11161F] border border-[#222B38] space-y-4 shadow-lg font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2632]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#F5A623]" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Computed Usable Capacity
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#F5A623]/15 text-[#F5A623] text-xs font-bold">
                    {capacityPct}% Capacity
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1E2632]">
                    <div className="text-[#8B94A3] text-[10px]">Nominal Carriageway</div>
                    <div className="text-white font-bold text-base mt-0.5">{nominalWidthM} m</div>
                    <div className="text-[#64748B] text-[10px]">{activeSample.nominalLanes} Design Lanes</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1E2632]">
                    <div className="text-[#8B94A3] text-[10px]">Effective Usable Width</div>
                    <div className="text-[#2ECC71] font-bold text-base mt-0.5">{effectiveWidthM} m</div>
                    <div className="text-[#EF4444] text-[10px]">-{lostWidthM} m Obstruction</div>
                  </div>
                </div>

                {/* Visual Lane Cross-Section Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8B94A3]">Cross-Section Usability:</span>
                    <span className="text-white font-bold">
                      {capacityPct}% Open • {100 - capacityPct}% Encroached
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-md bg-[#0A0E14] border border-[#222B38] overflow-hidden flex">
                    <div 
                      style={{ width: `${capacityPct}%` }}
                      className="bg-[#2ECC71] h-full flex items-center justify-center text-[9px] text-[#0A0E14] font-bold"
                      title="Usable transit flow"
                    >
                      Clear ({effectiveWidthM}m)
                    </div>
                    <div 
                      style={{ width: `${100 - capacityPct}%` }}
                      className="bg-[#EF4444]/80 h-full flex items-center justify-center text-[9px] text-white font-bold"
                      title="Constricted by curb encroachments"
                    >
                      Blocked
                    </div>
                  </div>
                </div>

                {/* Capacity Multiplier Readout */}
                <div className="p-2.5 rounded-lg bg-[#0E131A] border border-[#1E2632] flex items-center justify-between text-xs">
                  <span className="text-[#8B94A3]">Functional Capacity Multiplier (C_mult):</span>
                  <span className="text-[#F5A623] font-bold text-sm">
                    {(capacityPct / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Section 2: Resulting Signal-Timing Adjustment */}
              <div className="p-5 rounded-2xl bg-[#11161F] border border-[#222B38] space-y-4 shadow-lg font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2632]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#2ECC71]" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Resulting Signal-Timing Adjustment
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] text-xs font-bold">
                    +{greenDiffSec}s Green Wave
                  </span>
                </div>

                {/* Side-by-side timing comparison */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1E2632]">
                    <div className="text-[#8B94A3] text-[10px]">Static Webster Green</div>
                    <div className="text-[#94A3B8] font-bold text-lg mt-0.5">{nominalGreenSec}s</div>
                    <div className="text-[#EF4444] text-[10px]">Ignores curb loss</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#2ECC71]/30">
                    <div className="text-[#2ECC71] text-[10px] font-semibold">EncroachAI Dynamic Green</div>
                    <div className="text-white font-bold text-lg mt-0.5">{dynamicGreenSec}s</div>
                    <div className="text-[#2ECC71] text-[10px]">+{greenDiffSec}s compensated</div>
                  </div>
                </div>

                {/* Dynamic Saturation Flow Adjustment */}
                <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1E2632] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8B94A3]">Base Saturation Flow (s_0):</span>
                    <span className="text-white">{nominalSatFlow} PCU/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A3]">Adjusted Flow (s_eff = s_0 × C_mult):</span>
                    <span className="text-[#F5A623] font-bold">{effectiveSatFlow} PCU/hr</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#1E2632]">
                    <span className="text-[#8B94A3]">Predicted Delay Reduction:</span>
                    <span className="text-[#2ECC71] font-bold">-38.4%</span>
                  </div>
                </div>

                {/* Status Summary Banner */}
                <div className="p-3 rounded-lg bg-[#2ECC71]/10 border border-[#2ECC71]/25 flex items-start gap-2.5 text-xs text-[#C8D1DC]">
                  <CheckCircle2 className="w-4 h-4 text-[#2ECC71] shrink-0 mt-0.5" />
                  <span>
                    Extended green phase by <strong>+{greenDiffSec}s</strong> discharges constricted vehicle queue without triggering upstream shockwave propagation.
                  </span>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};
