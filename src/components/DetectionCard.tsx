import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  Layers, 
  MapPin, 
  Clock, 
  Maximize2, 
  AlertOctagon, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  BarChart2 
} from 'lucide-react';
import { DetectionSample, EncroachmentClass } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { ProvenanceTag } from './ProvenanceTag';

interface DetectionCardProps {
  id?: string;
  sample: DetectionSample;
  interactive?: boolean;
  onSelect?: () => void;
  isExpanded?: boolean;
}

const CLASS_CONFIG: Record<EncroachmentClass, { label: string; color: string; bg: string; border: string }> = {
  vendor_cart: {
    label: 'Vendor Cart',
    color: '#F5A623',
    bg: 'bg-[#F5A623]/20',
    border: 'border-[#F5A623]',
  },
  double_parked_vehicle: {
    label: 'Double Parked',
    color: '#E74C3C',
    bg: 'bg-[#E74C3C]/20',
    border: 'border-[#E74C3C]',
  },
  illegal_stall: {
    label: 'Illegal Stall',
    color: '#FB923C',
    bg: 'bg-[#FB923C]/20',
    border: 'border-[#FB923C]',
  },
  pedestrian_spillover: {
    label: 'Pedestrian Spillover',
    color: '#38BDF8',
    bg: 'bg-[#38BDF8]/20',
    border: 'border-[#38BDF8]',
  },
};

export const DetectionCard: React.FC<DetectionCardProps> = ({
  id,
  sample,
  interactive = true,
  onSelect,
  isExpanded = false,
}) => {
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);

  // SVG representation themed per sample
  const renderSyntheticUrbanScene = () => {
    return (
      <svg className="w-full h-full object-cover" viewBox="0 0 600 360" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${sample.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A222D" />
            <stop offset="100%" stopColor="#0F141C" />
          </linearGradient>
          <pattern id={`grid-${sample.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#242C38" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="600" height="360" fill={`url(#grad-${sample.id})`} />
        <rect width="600" height="360" fill={`url(#grid-${sample.id})`} opacity="0.4" />

        {/* Perspective Road Carriageway */}
        <polygon points="60,360 220,90 380,90 540,360" fill="#131923" stroke="#242C38" />
        
        {/* Lane Markings */}
        <line x1="220" y1="360" x2="273" y2="90" stroke="#364152" strokeWidth="2" strokeDasharray="8 6" />
        <line x1="380" y1="360" x2="327" y2="90" stroke="#364152" strokeWidth="2" strokeDasharray="8 6" />

        {/* Kerb sidewalk blocks */}
        <polygon points="0,360 60,360 220,90 160,90" fill="#1A2330" />
        <polygon points="540,360 600,360 440,90 380,90" fill="#1A2330" />

        {/* Scene specific silhouettes */}
        {sample.primaryEncroachment === 'vendor_cart' && (
          <g transform="translate(110, 210) scale(0.9)">
            <rect x="0" y="20" width="70" height="40" rx="3" fill="#D97706" opacity="0.8" />
            <circle cx="15" cy="65" r="12" fill="#78350F" />
            <circle cx="55" cy="65" r="12" fill="#78350F" />
            <line x1="35" y1="20" x2="35" y2="0" stroke="#FDE68A" strokeWidth="3" />
            <path d="M 10 0 Q 35 -15 60 0 Z" fill="#EF4444" />
          </g>
        )}

        {sample.primaryEncroachment === 'double_parked_vehicle' && (
          <g transform="translate(340, 200) scale(0.95)">
            <rect x="0" y="20" width="110" height="45" rx="8" fill="#DC2626" opacity="0.75" />
            <rect x="25" y="0" width="60" height="25" rx="5" fill="#1E293B" opacity="0.9" />
            <circle cx="25" cy="65" r="14" fill="#0F172A" />
            <circle cx="85" cy="65" r="14" fill="#0F172A" />
          </g>
        )}

        {sample.primaryEncroachment === 'illegal_stall' && (
          <g transform="translate(70, 180) scale(1)">
            <polygon points="0,30 110,30 95,0 15,0" fill="#EA580C" opacity="0.85" />
            <rect x="10" y="30" width="90" height="60" fill="#7C2D12" opacity="0.9" />
            <line x1="25" y1="90" x2="25" y2="30" stroke="#9A3412" strokeWidth="4" />
            <line x1="85" y1="90" x2="85" y2="30" stroke="#9A3412" strokeWidth="4" />
          </g>
        )}

        {sample.primaryEncroachment === 'pedestrian_spillover' && (
          <g transform="translate(90, 170) scale(0.8)">
            <circle cx="20" cy="20" r="10" fill="#38BDF8" />
            <rect x="10" y="30" width="20" height="40" rx="4" fill="#0284C7" />
            <circle cx="50" cy="25" r="10" fill="#38BDF8" />
            <rect x="40" y="35" width="20" height="40" rx="4" fill="#0284C7" />
            <circle cx="80" cy="22" r="10" fill="#38BDF8" />
            <rect x="70" y="32" width="20" height="40" rx="4" fill="#0284C7" />
          </g>
        )}

        {/* Traffic flow vehicle */}
        <g transform="translate(250, 190) scale(0.85)">
          <rect x="0" y="15" width="80" height="40" rx="6" fill="#2563EB" opacity="0.8" />
          <rect x="15" y="0" width="45" height="20" rx="4" fill="#0F172A" />
        </g>
      </svg>
    );
  };

  return (
    <div
      id={id || `detection-card-${sample.id}`}
      className={`bg-[#131820] border border-[#242C38] rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${
        interactive ? 'hover:border-[#F5A623]/50 hover:shadow-xl hover:shadow-black/50 cursor-pointer' : ''
      }`}
      onClick={interactive && onSelect ? onSelect : undefined}
    >
      {/* Visual Canvas with Overlays */}
      <div className="relative aspect-[16/10] w-full bg-[#0A0E14] overflow-hidden group">
        {/* Frame: User-uploaded image or Synthetic Canvas Scene */}
        {sample.imageUrl ? (
          <img
            src={sample.imageUrl}
            alt={sample.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          renderSyntheticUrbanScene()
        )}

        {/* YOLOv10 Dynamic Overlays */}
        {showOverlays && (
          <div className="absolute inset-0 pointer-events-none">
            {sample.detections.map((box, idx) => {
              const cfg = CLASS_CONFIG[box.class] || CLASS_CONFIG.vendor_cart;
              const isHovered = hoveredBox === idx;
              const [x, y, w, h] = box.bbox;

              return (
                <div
                  key={idx}
                  className={`absolute border-2 rounded transition-all duration-150 flex flex-col justify-between p-1 ${cfg.border} ${cfg.bg} ${
                    isHovered ? 'scale-105 shadow-[0_0_20px_rgba(245,166,35,0.8)] z-20' : 'z-10'
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${w}%`,
                    height: `${h}%`,
                  }}
                  onMouseEnter={() => setHoveredBox(idx)}
                  onMouseLeave={() => setHoveredBox(null)}
                >
                  {/* Class Badge */}
                  <div className="flex items-center gap-1 self-start">
                    <span 
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow text-[#0A0E14]"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {box.class.replace('_', ' ')} {(box.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Lane Impact Indicator */}
                  {box.laneImpactPct && (
                    <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-black/80 text-white self-start">
                      -{box.laneImpactPct}% width
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Top Header Pills inside Image */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <SeverityBadge level={sample.severity} />

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <ProvenanceTag provenance={sample.provenance || 'projected'} size="xs" />
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0A0E14]/80 text-[#8B94A3] border border-[#242C38] backdrop-blur-sm">
              YOLOv10 Edge
            </span>
            {interactive && (
              <span className="p-1 rounded bg-[#0A0E14]/80 text-[#F2F4F7] border border-[#242C38] backdrop-blur-sm group-hover:text-[#F5A623] transition-colors">
                <Maximize2 className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Bottom Location Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-[#F2F4F7] bg-[#0A0E14]/80 px-2.5 py-1.5 rounded-lg border border-[#242C38]/80 backdrop-blur-sm">
          <span className="flex items-center gap-1 text-white truncate max-w-[70%]">
            <MapPin className="w-3 h-3 text-[#F5A623] shrink-0" />
            {sample.location}
          </span>
          <span className="text-[#8B94A3] shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {sample.timestamp.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-base font-semibold text-[#F2F4F7] hover:text-[#F5A623] transition-colors line-clamp-1 mb-1">
            {sample.title}
          </h4>
          <p className="text-xs text-[#8B94A3] line-clamp-2 leading-relaxed">
            {sample.description}
          </p>
        </div>

        {/* Capacity Bar & Metrics */}
        <div className="pt-3 border-t border-[#242C38] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8B94A3] flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-[#F5A623]" />
              Functional Capacity
            </span>
            <span className="font-bold text-white">
              {sample.functionalCapacityPct}% <span className="text-[#8B94A3] font-normal">/ 100%</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#0A0E14] border border-[#242C38] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sample.functionalCapacityPct > 80 
                  ? 'bg-[#2ECC71]' 
                  : sample.functionalCapacityPct > 55 
                  ? 'bg-[#F5A623]' 
                  : 'bg-[#E74C3C]'
              }`}
              style={{ width: `${sample.functionalCapacityPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8B94A3] pt-1">
            <span>Nominal: {sample.nominalLanes} Lanes</span>
            <span className="text-[#F5A623]">Effective: {sample.effectiveLanes} Lanes</span>
          </div>
        </div>

        {/* If expanded in modal: show deep technical telemetry */}
        {isExpanded && (
          <div className="pt-4 mt-2 border-t border-[#242C38] space-y-3 bg-[#1B222D]/60 p-4 rounded-lg">
            <div className="text-xs font-mono font-semibold text-[#F2F4F7] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#F5A623]" />
              ST-GNN Downstream Dispatch Telemetry
            </div>
            
            <p className="text-xs text-[#8B94A3] leading-relaxed">
              <span className="text-white font-medium">Inferred Bottleneck:</span> {sample.inferredBottleneck}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-[#0A0E14] border border-[#242C38]">
                <div className="text-[#8B94A3]">Obstruction Density</div>
                <div className="text-white font-bold">
                  {sample.detections.length} Classified Entities
                </div>
              </div>
              <div className="p-2 rounded bg-[#0A0E14] border border-[#242C38]">
                <div className="text-[#8B94A3]">Green Phase Offset</div>
                <div className="text-[#F5A623] font-bold">
                  +{Math.round((100 - sample.functionalCapacityPct) * 0.45)}s Adjusted
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
