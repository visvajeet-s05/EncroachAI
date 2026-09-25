import React, { useState } from 'react';
import { Layers, Eye, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export const CssIsometricJunction: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'encroach' | 'detection'>('all');

  return (
    <div className="w-full rounded-2xl bg-surface-elevated border border-muted p-6 sm:p-8 shadow-2xl shadow-black/50 overflow-hidden relative">
      {/* Top Bar with digital twin telemetry badge and layer toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-muted">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F5A623] font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Digital Twin Telemetry • Dynamic 3D Carriageway Mesh</span>
          </div>
          <p className="text-xs text-[#8B94A3] mt-1">
            Real-time edge perception visualizing lateral curbside constriction on a 3-lane arterial approach (Anna Salai corridor).
          </p>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-muted text-xs font-mono">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeLayer === 'all'
                ? 'bg-[#F5A623] text-[#0A0E14] font-bold'
                : 'text-[#8B94A3] hover:text-white'
            }`}
          >
            Composite
          </button>
          <button
            onClick={() => setActiveLayer('encroach')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeLayer === 'encroach'
                ? 'bg-[#F5A623] text-[#0A0E14] font-bold'
                : 'text-[#8B94A3] hover:text-white'
            }`}
          >
            Encroachment
          </button>
          <button
            onClick={() => setActiveLayer('detection')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeLayer === 'detection'
                ? 'bg-[#38BDF8] text-[#0A0E14] font-bold'
                : 'text-[#8B94A3] hover:text-white'
            }`}
          >
            Edge Vision
          </button>
        </div>
      </div>

      {/* 3D Scene Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center overflow-hidden [perspective:1200px] my-2 select-none">
        
        {/* Subtle background grid lines */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38BDF8 1px, transparent 1px), radial-gradient(#F5A623 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px'
          }}
        />

        {/* 3D Isometric Container */}
        <div 
          className="relative transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(56deg) rotateZ(-34deg)'
          }}
        >
          {/* Ground Plane Shadow */}
          <div 
            className="absolute -inset-6 rounded-3xl bg-black/60 blur-xl"
            style={{ transform: 'translateZ(-16px)' }}
          />

          {/* Road Slab Structure (Asphalt Surface) */}
          <div 
            className="relative w-[340px] sm:w-[440px] h-[220px] sm:h-[260px] rounded-xl bg-[#0D1219] border-2 border-[#222D3B] shadow-2xl overflow-hidden"
            style={{ transform: 'translateZ(0px)' }}
          >
            {/* Kerb Border: Left Kerb */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-[#18212D] border-r border-[#2C3849]" />
            {/* Kerb Border: Right Kerb */}
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-[#18212D] border-l border-[#2C3849]" />

            {/* Lane Dividing Dashed Lines */}
            <div className="absolute top-0 bottom-0 left-[35%] w-0 border-r-2 border-dashed border-[#334155]/60" />
            <div className="absolute top-0 bottom-0 left-[67%] w-0 border-r-2 border-dashed border-[#334155]/60" />

            {/* Stop Line (Transverse approach) */}
            <div className="absolute bottom-10 left-8 right-8 h-2 bg-[#64748B]/80" />
            <div className="absolute bottom-6 left-8 right-8 flex justify-around text-[9px] font-mono text-[#475569] uppercase tracking-wider">
              <span>Lane 1 (Curb)</span>
              <span>Lane 2 (Mid)</span>
              <span>Lane 3 (Median)</span>
            </div>

            {/* Moving Vehicle Glyphs (Traffic stream in free lanes) */}
            <div className="absolute top-12 left-[46%] w-6 h-11 rounded-md bg-[#38BDF8]/20 border border-[#38BDF8]/70 flex items-center justify-center text-[9px] font-mono text-[#38BDF8] animate-pulse">
              CAR
            </div>
            <div className="absolute top-28 left-[78%] w-7 h-14 rounded-md bg-[#2ECC71]/20 border border-[#2ECC71]/70 flex items-center justify-center text-[9px] font-mono text-[#2ECC71]">
              BUS
            </div>
            <div className="absolute top-4 left-[80%] w-5 h-8 rounded-sm bg-[#94A3B8]/20 border border-[#94A3B8]/70 flex items-center justify-center text-[8px] font-mono text-[#94A3B8]">
              AUTO
            </div>

            {/* LATERAL ENCROACHMENT ZONE (Left Curb Blockage) */}
            {(activeLayer === 'all' || activeLayer === 'encroach') && (
              <div 
                className="absolute top-4 bottom-14 left-8 w-[28%] rounded-lg border-2 border-dashed border-[#F5A623] bg-[#F5A623]/15 flex flex-col justify-between p-2 backdrop-blur-[1px] transition-all"
              >
                <div className="flex items-center gap-1 text-[9px] font-mono text-[#F5A623] font-bold uppercase">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  <span>Curb Obstruction</span>
                </div>

                {/* 3D Stylized Vendor Cart Boxes */}
                <div className="space-y-2">
                  <div className="h-7 rounded bg-[#D97706]/60 border border-[#F5A623] flex items-center justify-center text-[8px] font-mono text-white font-bold shadow-sm">
                    PUSH CART
                  </div>
                  <div className="h-6 rounded bg-[#B45309]/60 border border-[#F5A623]/80 flex items-center justify-center text-[8px] font-mono text-white font-bold shadow-sm">
                    STALL
                  </div>
                </div>

                <div className="text-[8px] font-mono text-[#F5A623] font-semibold text-center bg-[#0A0E14]/80 py-0.5 rounded border border-[#F5A623]/30">
                  -35.2% Capacity
                </div>
              </div>
            )}

            {/* VISION DETECTION CONE & BOUNDING PLANES */}
            {(activeLayer === 'all' || activeLayer === 'detection') && (
              <div 
                className="absolute top-2 left-6 w-32 h-44 rounded-xl border border-[#38BDF8]/60 bg-gradient-to-b from-[#38BDF8]/10 via-[#38BDF8]/5 to-transparent pointer-events-none flex flex-col justify-start p-1.5"
                style={{ transform: 'translateZ(18px)' }}
              >
                <div className="flex items-center justify-between text-[8px] font-mono text-[#38BDF8]">
                  <span>YOLOv10 BOUNDING ROI</span>
                  <Eye className="w-2.5 h-2.5" />
                </div>
                <div className="mt-6 border border-[#F5A623] bg-[#F5A623]/20 w-16 h-12 rounded flex items-center justify-center text-[8px] font-mono text-[#F5A623] font-bold">
                  94.2% CONF
                </div>
              </div>
            )}
          </div>

          {/* Elevated Floating Metadata Cards in 3D Space */}
          <div 
            className="absolute -top-10 -right-8 p-3 rounded-xl bg-[#0A0E14]/95 border border-[#38BDF8]/50 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 w-44"
            style={{ transform: 'translateZ(48px)' }}
          >
            <div className="flex items-center gap-1.5 text-[#38BDF8] text-[10px] font-bold uppercase">
              <Cpu className="w-3 h-3" />
              <span>Edge Vision Sensor</span>
            </div>
            <div className="text-[11px] text-white font-bold">YOLOv10 Perception</div>
            <div className="text-[10px] text-[#8B94A3]">FOV: Curbside Approach</div>
            <div className="pt-1 border-t border-[#1E2632] flex justify-between text-[10px]">
              <span className="text-[#8B94A3]">Latency:</span>
              <span className="text-[#2ECC71] font-bold">26.3 ms</span>
            </div>
          </div>

          <div 
            className="absolute -bottom-8 -left-8 p-3 rounded-xl bg-[#0A0E14]/95 border border-[#F5A623]/50 shadow-xl backdrop-blur-md text-xs font-mono space-y-1 w-44"
            style={{ transform: 'translateZ(36px)' }}
          >
            <div className="flex items-center gap-1.5 text-[#F5A623] text-[10px] font-bold uppercase">
              <ShieldAlert className="w-3 h-3" />
              <span>Usable Road Width</span>
            </div>
            <div className="text-[11px] text-white font-bold">6.8m / 10.5m Nominal</div>
            <div className="text-[10px] text-[#8B94A3]">Effective Lanes: 1.95 / 3.0</div>
            <div className="pt-1 border-t border-[#1E2632] flex justify-between text-[10px]">
              <span className="text-[#8B94A3]">Capacity Factor:</span>
              <span className="text-[#F5A623] font-bold">γ = 0.648</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Callout */}
      <div className="pt-4 border-t border-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#8B94A3]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
          <span>Continuous geometric feedback modulates saturation flow: s_eff = s_0 × γ</span>
        </div>
        <span className="text-[#38BDF8] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
          <span>Digital Twin Telemetry • Synchronized with Sensor Nodes</span>
        </span>
      </div>
    </div>
  );
};
