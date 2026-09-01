import React from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Store, 
  Car, 
  ShoppingBag, 
  Users, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  BookOpen, 
  Scale 
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';

interface ProblemProps {
  onRouteChange: (route: string) => void;
}

export const Problem: React.FC<ProblemProps> = ({ onRouteChange }) => {
  const taxonomy = [
    {
      id: 'vendor_cart',
      name: 'Vendor Pushcart',
      tamilName: 'தள்ளுவண்டி (Pushcart)',
      color: '#F5A623',
      borderClass: 'border-t-[#F5A623]',
      icon: Store,
      description: 'Mobile fruit, tea, tender coconut, and snack pushcarts parked continuously along curbsides and intersection approach radii.',
      laneImpact: '-22% to -35% Width',
      frictionCoefficient: '1.45 PCU equivalent',
      behaviorPattern: 'Semi-static during peak hours (07:00-11:00 & 16:30-21:30); customer clusters create lateral pedestrian friction.'
    },
    {
      id: 'double_parked_vehicle',
      name: 'Double-Parked Vehicle',
      tamilName: 'இரட்டை நிறுத்தம்',
      color: '#E74C3C',
      borderClass: 'border-t-[#E74C3C]',
      icon: Car,
      description: 'Courier vans, app-based auto-rickshaws, and private cars parked in the active transit lane outside commercial establishments.',
      laneImpact: '-30% to -45% Width',
      frictionCoefficient: '1.80 PCU equivalent',
      behaviorPattern: 'Transient to sustained stop-and-go turbulence; causes abrupt lane merges and shockwave propagation.'
    },
    {
      id: 'illegal_stall',
      name: 'Illegal Semi-Permanent Stall',
      tamilName: 'ஆக்கிரமிப்பு கடை',
      color: '#FB923C',
      borderClass: 'border-t-[#FB923C]',
      icon: ShoppingBag,
      description: 'Extended tarpaulin canopies, vegetable crates, flower baskets, and iron fixtures extending 1.5m–3.0m onto the designated carriageway.',
      laneImpact: '-35% to -58% Width',
      frictionCoefficient: '2.10 PCU equivalent',
      behaviorPattern: 'Permanent throughout daylight hours; renders curb lanes completely unusable for vehicular traffic.'
    },
    {
      id: 'pedestrian_spillover',
      name: 'Pedestrian Spillover',
      tamilName: 'நடப்பாதை ஆக்கிரமிப்பு',
      color: '#38BDF8',
      borderClass: 'border-t-[#38BDF8]',
      icon: Users,
      description: 'Shoppers and transit commuters forced onto the active carriageway due to obstructed, broken, or non-existent footpaths.',
      laneImpact: '-15% to -28% Width',
      frictionCoefficient: '1.30 PCU equivalent',
      behaviorPattern: 'Fluctuates rapidly with signal phase and bus arrivals; induces severe driver deceleration and cautious crawls.'
    }
  ];

  return (
    <div id="problem-page" className="w-full pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E74C3C]/10 border border-[#E74C3C]/30 text-xs font-mono text-[#E74C3C] mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Real-Time Arterial Friction & Bottleneck Diagnostics</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F2F4F7] mb-6 leading-tight">
            Urban Bottlenecks & Capacity Friction
          </h1>

          <p className="text-base md:text-lg text-[#8B94A3] leading-relaxed">
            Intelligent Traffic Management Systems (ITMS) deployed across Indian metros routinely underperform because classical timing algorithms assume static geometric road design. In real arterial corridors, informal road encroachment reduces usable carriageway widths by up to 58%, requiring active vision-edge compensation.
          </p>
        </div>

        {/* 1. THE ASSUMPTION GAP DIAGRAM */}
        <section className="mb-24">
          <div className="p-8 md:p-10 rounded-2xl bg-[#131820] border border-[#242C38]">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
                Visualizing the Mismatch
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#F2F4F7] mt-1">
                The Carriageway Assumption Gap
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
              {/* Left Box: Assumed Nominal Capacity */}
              <div className="lg:col-span-5 bg-[#0A0E14] border border-[#2ECC71]/30 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                    What Traffic Controllers Assume
                  </span>
                  <span className="text-xs font-mono text-[#2ECC71] font-bold">100% Flow</span>
                </div>

                <h3 className="text-lg font-bold text-[#F2F4F7] mb-2">
                  Nominal Geometric Specification
                </h3>
                <p className="text-xs text-[#8B94A3] mb-6 leading-relaxed">
                  Design carriageway width = 10.5 meters (3 standard 3.5m lanes). Saturation flow rate is calculated as ~1,900 PCU / lane / hour.
                </p>

                {/* SVG Visual: Clean 3 Lanes */}
                <div className="relative h-44 rounded-lg bg-[#141A23] border border-[#242C38] overflow-hidden flex items-center justify-around px-4">
                  <div className="text-center">
                    <div className="text-[11px] font-mono text-[#2ECC71] mb-1">Lane 1 (Kerb)</div>
                    <div className="w-16 h-24 rounded bg-[#2ECC71]/10 border border-[#2ECC71]/40 flex items-center justify-center text-xs font-mono text-[#2ECC71]">
                      1900 PCU
                    </div>
                  </div>
                  <div className="h-full w-[2px] bg-dashed border-r border-dashed border-[#364152]" />
                  <div className="text-center">
                    <div className="text-[11px] font-mono text-[#2ECC71] mb-1">Lane 2 (Mid)</div>
                    <div className="w-16 h-24 rounded bg-[#2ECC71]/10 border border-[#2ECC71]/40 flex items-center justify-center text-xs font-mono text-[#2ECC71]">
                      1900 PCU
                    </div>
                  </div>
                  <div className="h-full w-[2px] bg-dashed border-r border-dashed border-[#364152]" />
                  <div className="text-center">
                    <div className="text-[11px] font-mono text-[#2ECC71] mb-1">Lane 3 (Median)</div>
                    <div className="w-16 h-24 rounded bg-[#2ECC71]/10 border border-[#2ECC71]/40 flex items-center justify-center text-xs font-mono text-[#2ECC71]">
                      1900 PCU
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#242C38] flex items-center justify-between text-xs font-mono text-[#8B94A3]">
                  <span>Total Theoretical Saturation:</span>
                  <span className="text-[#2ECC71] font-bold">5,700 PCU / hr</span>
                </div>
              </div>

              {/* Middle Arrow / Discrepancy Indicator */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#F5A623]/20 border border-[#F5A623]/50 flex items-center justify-center text-[#F5A623] shadow-lg shadow-[#F5A623]/20">
                  <ArrowRight className="w-6 h-6 hidden lg:block" />
                  <ArrowDown className="w-6 h-6 lg:hidden" />
                </div>
                <span className="text-[11px] font-mono text-[#E74C3C] font-bold mt-2">
                  -38% to -54%
                </span>
                <span className="text-[10px] font-mono text-[#8B94A3]">
                  Friction Gap
                </span>
              </div>

              {/* Right Box: Real Functional Capacity */}
              <div className="lg:col-span-5 bg-[#0A0E14] border border-[#E74C3C]/40 rounded-xl p-6 relative overflow-hidden shadow-lg shadow-[#E74C3C]/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30">
                    What Actually Exists (Chennai Ground Truth)
                  </span>
                  <span className="text-xs font-mono text-[#E74C3C] font-bold">46%–62% Flow</span>
                </div>

                <h3 className="text-lg font-bold text-[#F2F4F7] mb-2">
                  Real Functional Carriageway Capacity
                </h3>
                <p className="text-xs text-[#8B94A3] mb-6 leading-relaxed">
                  Active carriageway width = 6.2 meters. Pushcarts, double parking, and pedestrian spillover throttle saturation flow to ~1,100 PCU / hr.
                </p>

                {/* SVG Visual: Obstructed Lanes */}
                <div className="relative h-44 rounded-lg bg-[#141A23] border border-[#242C38] overflow-hidden flex items-center justify-around px-4">
                  <div className="text-center">
                    <div className="text-[11px] font-mono text-[#E74C3C] mb-1">Obstructed Kerb</div>
                    <div className="w-16 h-24 rounded bg-[#E74C3C]/20 border border-[#E74C3C] flex flex-col items-center justify-center text-[10px] font-mono text-[#E74C3C] font-bold gap-1">
                      <Store className="w-4 h-4" />
                      Blocked
                    </div>
                  </div>
                  <div className="h-full w-[2px] bg-dashed border-r border-dashed border-[#E74C3C]/40" />
                  <div className="text-center">
                    <div className="text-[11px] font-mono text-[#F5A623] mb-1">Turbulent Lane</div>
                    <div className="w-16 h-24 rounded bg-[#F5A623]/15 border border-[#F5A623]/40 flex flex-col items-center justify-center text-[10px] font-mono text-[#F5A623] font-bold gap-1">
                      <Car className="w-4 h-4" />
                      1120 PCU
                    </div>
                  </div>
                  <div className="h-full w-[2px] bg-dashed border-r border-dashed border-[#364152]" />
                  <div className="text-center">
                    <div className="text-[11px] font-mono text-[#2ECC71] mb-1">Clean Lane</div>
                    <div className="w-16 h-24 rounded bg-[#2ECC71]/10 border border-[#2ECC71]/40 flex items-center justify-center text-xs font-mono text-[#2ECC71]">
                      1680 PCU
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#242C38] flex items-center justify-between text-xs font-mono text-[#8B94A3]">
                  <span>Actual Measured Discharge:</span>
                  <span className="text-[#E74C3C] font-bold">2,800 PCU / hr</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ENCROACHMENT TAXONOMY SHOWCASE */}
        <section className="mb-24">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
              Computer Vision Classification Taxonomy
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#F2F4F7] mt-1">
              4 Distinct Encroachment Classes in Dense Urban Arterials
            </h2>
            <p className="text-sm text-[#8B94A3] mt-2">
              Our edge vision model (YOLOv10) is custom-trained to detect and localize these 4 informal obstruction categories across intersection approaches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {taxonomy.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  id={`taxonomy-card-${item.id}`}
                  className={`bg-[#131820] border border-[#242C38] border-t-4 ${item.borderClass} rounded-xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-black/50 transition-all duration-200`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#0A0E14] text-[#8B94A3] border border-[#242C38]">
                        {item.laneImpact}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F2F4F7] mb-0.5">
                      {item.name}
                    </h3>
                    <p className="text-xs font-mono text-[#8B94A3] mb-3">
                      {item.tamilName}
                    </p>

                    <p className="text-xs text-[#8B94A3] leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#242C38] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#8B94A3]">Friction Equivalent:</span>
                      <span className="text-white font-semibold">{item.frictionCoefficient}</span>
                    </div>
                    <div className="text-[11px] text-[#8B94A3]/80 leading-snug">
                      <span className="text-[#F5A623]">Behavior:</span> {item.behaviorPattern}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. LITERATURE CONTEXT & RESEARCH GAP */}
        <section className="p-8 md:p-10 rounded-2xl bg-[#131820] border border-[#242C38] space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#F5A623]" />
            <h2 className="text-2xl font-bold text-[#F2F4F7]">
              Literature Context & The Contextual Gap
            </h2>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-[#8B94A3] space-y-4 leading-relaxed">
            <p>
              Traditional traffic signal design methodologies — rooted in Webster's classical formulation (1958) and the Highway Capacity Manual (HCM 2010) — calculate optimum cycle lengths and green splits as direct functions of lane count, lane width, and design saturation flow rate (s ≈ 1800–2000 PCU/hr/lane). In these formulations, road capacity is treated as a static geometric invariant.
            </p>
            <p>
              Contemporary adaptive traffic management systems (such as SCATS, SCOOT, and standard reinforcement learning controllers) adjust green durations based on induction loop or camera-measured vehicle counts. However, they continue to calculate degree of saturation ($X = v/c$) using nominal design capacity ($c$). When roadside vendors, delivery halts, or customer clusters usurp 30% to 50% of the approach cross-section, the controller severely underestimates queue clearance time. This causes incomplete green-phase discharge, cycle failure, and rapid upstream gridlock.
            </p>
            <p>
              <strong className="text-[#F2F4F7]">The EncroachAI Contribution:</strong> Our thesis addresses this fundamental gap by treating road capacity as a <span className="text-[#F5A623] font-semibold">time-varying, vision-informed observable</span>. By pairing real-time YOLOv10 object detection with a Spatial-Temporal Graph Neural Network (ST-GNN), our framework dynamically adjusts green-phase allocations to match true ground-truth clearance speeds before shockwave queues propagate across adjacent intersections.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#242C38]">
            <div className="text-xs font-mono text-[#8B94A3]">
              Next: Explore how our 3-Layer Edge Pipeline computes and optimizes signal timings.
            </div>
            <button
              onClick={() => onRouteChange('/architecture')}
              className="px-6 py-2.5 rounded-lg bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] font-semibold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Explore Architecture <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
