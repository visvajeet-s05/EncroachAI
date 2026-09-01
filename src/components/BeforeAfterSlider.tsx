import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SlidersHorizontal, AlertTriangle, ShieldCheck, Cpu, ArrowLeftRight } from 'lucide-react';
import { DetectionSample } from '../types';

interface BeforeAfterSliderProps {
  id?: string;
  beforeLabel?: string;
  afterLabel?: string;
  sample?: DetectionSample;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  id = 'before-after-slider',
  beforeLabel = 'Assumed Nominal Capacity (Design Spec)',
  afterLabel = 'Detected Functional Capacity (Real Road)',
  sample,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const capacityPct = sample ? sample.functionalCapacityPct : 62;
  const nominalLanes = sample ? sample.nominalLanes : 3;
  const effectiveLanes = sample ? sample.effectiveLanes : 1.8;
  const nominalWidthM = (nominalLanes * 3.5).toFixed(1);
  const effectiveWidthM = (effectiveLanes * 3.5).toFixed(1);
  const calculatedGreen = Math.round(28 * (100 / Math.max(capacityPct, 20)));

  // Color styles mapping for classes
  const getClassColor = (cls: string) => {
    switch (cls) {
      case 'vendor_cart':
        return { border: 'border-[#F5A623]', bg: 'bg-[#F5A623]/15', text: 'bg-[#F5A623] text-[#0A0E14]' };
      case 'double_parked_vehicle':
        return { border: 'border-[#E74C3C]', bg: 'bg-[#E74C3C]/15', text: 'bg-[#E74C3C] text-white' };
      case 'illegal_stall':
        return { border: 'border-[#E74C3C]', bg: 'bg-[#E74C3C]/20', text: 'bg-[#E74C3C] text-white' };
      case 'pedestrian_spillover':
      default:
        return { border: 'border-[#38BDF8]', bg: 'bg-[#38BDF8]/15', text: 'bg-[#38BDF8] text-[#0A0E14]' };
    }
  };

  return (
    <div id={id} className={`w-full select-none ${className}`}>
      {/* Interactive Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden bg-[#0A0E14] border border-[#242C38] shadow-2xl cursor-ew-resize group"
      >
        {/* Layer 1 (Full): AFTER - Detected Functional Capacity (Real World with Bounding Boxes & Friction) */}
        <div className="absolute inset-0 w-full h-full bg-[#10151E]">
          {/* Road Perspective SVG Illustration */}
          <svg className="w-full h-full object-cover" viewBox="0 0 800 480" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#171D27" />
                <stop offset="100%" stopColor="#0D1219" />
              </linearGradient>
              <linearGradient id="encroachHatch" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E74C3C" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F5A623" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Background Urban Geometry */}
            <rect width="800" height="480" fill="url(#roadGradient)" />
            <rect x="0" y="0" width="800" height="120" fill="#0A0E14" />
            {/* Skyline silhouettes */}
            <path d="M 0,120 L 40,85 L 90,85 L 110,120 L 180,65 L 240,65 L 260,120 L 350,90 L 410,40 L 470,40 L 510,120 L 620,70 L 690,70 L 730,120 L 800,100 L 800,120 Z" fill="#151C26" opacity="0.7" />

            {/* Road Carriageway Lines (Approach) */}
            <polygon points="120,480 280,120 520,120 680,480" fill="#141A23" />
            
            {/* Lane Dividers */}
            <line x1="307" y1="480" x2="360" y2="120" stroke="#364152" strokeWidth="2" strokeDasharray="14 10" />
            <line x1="493" y1="480" x2="440" y2="120" stroke="#364152" strokeWidth="2" strokeDasharray="14 10" />
            
            {/* Left Kerb Encroachment Zone (Red/Amber diagonal area) */}
            <polygon points="120,480 220,480 320,240 240,240" fill="url(#encroachHatch)" stroke="#E74C3C" strokeWidth="1.5" strokeDasharray="4 2" />
            
            {/* Right Shoulder Obstruction Zone */}
            <polygon points="590,480 680,480 500,280 470,280" fill="#F5A623" fillOpacity="0.2" stroke="#F5A623" strokeWidth="1" strokeDasharray="4 2" />

            {/* Vehicle Queue Lines trapped behind bottleneck */}
            <circle cx="390" cy="400" r="18" fill="#3B82F6" opacity="0.8" />
            <circle cx="410" cy="340" r="15" fill="#3B82F6" opacity="0.8" />
            <circle cx="400" cy="280" r="13" fill="#3B82F6" opacity="0.8" />
            <circle cx="410" cy="220" r="11" fill="#3B82F6" opacity="0.8" />
            <circle cx="405" cy="170" r="9" fill="#3B82F6" opacity="0.8" />
          </svg>

          {/* Dynamic or Fallback Bounding Box Detections Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {sample?.detections && sample.detections.length > 0 ? (
              sample.detections.map((det, idx) => {
                const color = getClassColor(det.class);
                return (
                  <div
                    key={idx}
                    className={`absolute border-2 ${color.border} ${color.bg} rounded flex flex-col justify-between p-1 shadow-lg`}
                    style={{
                      left: `${det.bbox[0]}%`,
                      top: `${det.bbox[1]}%`,
                      width: `${det.bbox[2]}%`,
                      height: `${det.bbox[3]}%`,
                    }}
                  >
                    <span className={`${color.text} text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs self-start`}>
                      {det.label || det.class.replace('_', ' ')} {Math.round(det.confidence * 100)}%
                    </span>
                    {det.laneImpactPct && (
                      <span className="text-[10px] font-mono text-white bg-black/80 px-1 py-0.5 rounded self-start">
                        Lane Imp: -{det.laneImpactPct}%
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                {/* Fallback Bounding Box 1 */}
                <div 
                  className="absolute border-2 border-[#F5A623] bg-[#F5A623]/15 rounded flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(245,166,35,0.4)]"
                  style={{ left: '16%', top: '52%', width: '22%', height: '32%' }}
                >
                  <span className="bg-[#F5A623] text-[#0A0E14] text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs self-start flex items-center gap-1">
                    vendor_cart 94%
                  </span>
                  <span className="text-[10px] font-mono text-white bg-black/80 px-1 py-0.5 rounded self-start">
                    Lane Imp: -26%
                  </span>
                </div>

                {/* Fallback Bounding Box 2 */}
                <div 
                  className="absolute border-2 border-[#E74C3C] bg-[#E74C3C]/15 rounded flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(231,76,60,0.4)]"
                  style={{ left: '62%', top: '48%', width: '20%', height: '28%' }}
                >
                  <span className="bg-[#E74C3C] text-white text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs self-start">
                    double_parked 89%
                  </span>
                  <span className="text-[10px] font-mono text-white bg-black/80 px-1 py-0.5 rounded self-start">
                    Lane Imp: -18%
                  </span>
                </div>

                {/* Fallback Bounding Box 3 */}
                <div 
                  className="absolute border-2 border-[#38BDF8] bg-[#38BDF8]/15 rounded flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                  style={{ left: '8%', top: '40%', width: '14%', height: '24%' }}
                >
                  <span className="bg-[#38BDF8] text-[#0A0E14] text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs self-start">
                    ped_spillover 86%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Layer 2 (Clipped): BEFORE - Nominal Assumed Road (Empty, Clean, Full Lanes) */}
        <div
          className="absolute inset-0 w-full h-full bg-[#0D1219] overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          {/* Ideal Road Perspective SVG */}
          <svg className="w-full h-full object-cover" viewBox="0 0 800 480" preserveAspectRatio="none">
            <rect width="800" height="480" fill="#111620" />
            <rect x="0" y="0" width="800" height="120" fill="#0A0E14" />
            {/* Clean skyline */}
            <path d="M 0,120 L 40,85 L 90,85 L 110,120 L 180,65 L 240,65 L 260,120 L 350,90 L 410,40 L 470,40 L 510,120 L 620,70 L 690,70 L 730,120 L 800,100 L 800,120 Z" fill="#18202C" opacity="0.8" />

            {/* Clean Unobstructed Carriageway */}
            <polygon points="120,480 280,120 520,120 680,480" fill="#1A222E" />
            
            {/* Lane Dividers */}
            <line x1="307" y1="480" x2="360" y2="120" stroke="#4B5563" strokeWidth="2.5" strokeDasharray="14 10" />
            <line x1="493" y1="480" x2="440" y2="120" stroke="#4B5563" strokeWidth="2.5" strokeDasharray="14 10" />

            {/* Clean 3-lane vehicle flow vectors (Green) */}
            <path d="M 213,440 L 320,140" stroke="#2ECC71" strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />
            <path d="M 400,440 L 400,140" stroke="#2ECC71" strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />
            <path d="M 587,440 L 480,140" stroke="#2ECC71" strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />

            {/* Ideal Capacity Grid annotation */}
            <text x="210" y="460" fill="#2ECC71" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Lane 1: 1900 PCU/h</text>
            <text x="400" y="460" fill="#2ECC71" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">Lane 2: 1900 PCU/h</text>
            <text x="590" y="460" fill="#2ECC71" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="end">Lane 3: 1900 PCU/h</text>
          </svg>

          {/* Assumed Capacity Overlay stamp */}
          <div className="absolute top-16 left-6 pointer-events-none">
            <div className="p-3 rounded-lg bg-[#0A0E14]/85 border border-[#2ECC71]/40 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#2ECC71] font-semibold">
                <ShieldCheck className="w-4 h-4" /> Fixed Webster / SCATS Model
              </div>
              <p className="text-xs text-[#8B94A3]">
                Assumes 100% geometric saturation flow ({nominalLanes * 1900} PCU/hr).
              </p>
            </div>
          </div>
        </div>

        {/* Divider Slider Handle Line */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-[#F5A623] shadow-[0_0_12px_#F5A623] cursor-ew-resize z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#131820] border-2 border-[#F5A623] flex items-center justify-center text-[#F5A623] shadow-xl">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* Pinned Top Badges */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#131820]/90 text-[#F2F4F7] border border-[#242C38] backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
            {beforeLabel}
          </span>
        </div>

        <div className="absolute top-4 right-4 z-30 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#131820]/90 text-[#F5A623] border border-[#F5A623]/40 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-pulse" />
            {afterLabel}
          </span>
        </div>

        {/* Bottom Helper Instruction */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono text-[#8B94A3] bg-[#0A0E14]/80 border border-[#242C38] backdrop-blur-sm flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#F5A623]" />
            Drag handle left / right to compare models
          </span>
        </div>
      </div>

      {/* Metric Breakdown Bar Below Slider */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#131820] border border-[#242C38] rounded-xl p-4">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[#8B94A3]">Nominal Width vs Functional</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-[#2ECC71]">
              {nominalLanes} Lanes ({nominalWidthM}m)
            </span>
            <span className="text-sm font-mono text-[#8B94A3]">→</span>
            <span className="text-lg font-bold font-mono text-[#E74C3C]">
              {effectiveLanes} Lanes ({effectiveWidthM}m)
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono text-[#8B94A3]">Effective Saturation Capacity</span>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#0A0E14] h-2.5 rounded-full overflow-hidden border border-[#242C38]">
              <div 
                className="h-full bg-gradient-to-r from-[#E74C3C] to-[#F5A623] rounded-full transition-all duration-500"
                style={{ width: `${capacityPct}%` }}
              />
            </div>
            <span className="text-sm font-mono font-bold text-[#F5A623]">
              {capacityPct}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono text-[#8B94A3]">Signal Green Allocation Drift</span>
          <div className="text-xs font-mono text-[#F2F4F7]">
            Fixed assumes <span className="text-[#2ECC71]">28s</span> enough; Real needs <span className="text-[#F5A623] font-bold">{calculatedGreen}s</span> to clear queue
          </div>
        </div>
      </div>
    </div>
  );
};
