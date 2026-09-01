import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Filter, 
  Upload, 
  Sparkles, 
  X, 
  Cpu, 
  Activity, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  RefreshCw, 
  FileVideo,
  ScanLine
} from 'lucide-react';
import { DetectionCard } from '../components/DetectionCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { ResearchNoticeBanner } from '../components/ResearchNoticeBanner';
import { ProvenanceTag } from '../components/ProvenanceTag';
import { DetectionSample, EncroachmentClass } from '../types';
import detectionSamplesData from '../data/detectionSamples.json';

interface DemoProps {
  onRouteChange: (route: string) => void;
}

export const Demo: React.FC<DemoProps> = ({ onRouteChange }) => {
  const [samples] = useState<DetectionSample[]>(detectionSamplesData as DetectionSample[]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSample, setSelectedSample] = useState<DetectionSample | null>(null);

  // Live Simulator state
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
  const [liveInferenceResult, setLiveInferenceResult] = useState<DetectionSample | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const filteredSamples = samples.filter((sample) => {
    if (selectedClass === 'all') return true;
    if (selectedClass === 'heavy') return sample.severity === 'heavy';
    return sample.primaryEncroachment === selectedClass;
  });

  const runLiveSimulation = (sampleToRun?: DetectionSample) => {
    const target = sampleToRun || samples[Math.floor(Math.random() * samples.length)];
    setIsSimulatingLive(true);
    setSimulatedProgress(0);
    setLiveInferenceResult(null);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        clearInterval(interval);
        setSimulatedProgress(100);
        setIsSimulatingLive(false);
        setLiveInferenceResult(target);
      } else {
        setSimulatedProgress(current);
      }
    }, 160);
  };

  return (
    <div id="demo-page" className="w-full pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 text-xs font-mono text-[#F5A623] mb-4">
            <Eye className="w-3.5 h-3.5" />
            <span>YOLOv10 Edge Vision Telemetry Stream</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F2F4F7] mb-4">
            Edge Vision & Detection Feeds
          </h1>

          <p className="text-base md:text-lg text-[#8B94A3] leading-relaxed">
            Real-time multi-class camera feeds across Chennai arterial approaches. Inspect instantaneous bounding box coordinates, lateral carriageway intrusion polygons, and capacity degradation factors.
          </p>

          <div className="mt-6">
            <ResearchNoticeBanner />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[#242C38]">
          <span className="text-xs font-mono text-[#8B94A3] flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-[#F5A623]" /> Filter by Category:
          </span>

          {[
            { id: 'all', label: 'All Feeds (8)' },
            { id: 'vendor_cart', label: 'Vendor Pushcarts' },
            { id: 'double_parked_vehicle', label: 'Double-Parked' },
            { id: 'illegal_stall', label: 'Illegal Stalls' },
            { id: 'pedestrian_spillover', label: 'Pedestrian Incursion' },
            { id: 'heavy', label: 'Heavy Constriction (<60%)' },
          ].map((tab) => {
            const isSelected = selectedClass === tab.id;
            return (
              <button
                key={tab.id}
                id={`filter-btn-${tab.id}`}
                onClick={() => setSelectedClass(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer z-10 ${
                  isSelected
                    ? 'text-[#0A0E14] font-bold'
                    : 'text-[#8B94A3] hover:text-white border border-[#242C38] bg-[#131820]'
                }`}
              >
                {tab.label}
                {isSelected && (
                  <motion.div
                    layoutId="demoFilterTabIndicator"
                    className="absolute inset-0 bg-[#F5A623] rounded-lg -z-10 shadow-md shadow-[#F5A623]/25"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* DEMO GALLERY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16 md:mb-20">
          {filteredSamples.map((sample) => (
            <DetectionCard
              key={sample.id}
              sample={sample}
              interactive={true}
              onSelect={() => setSelectedSample(sample)}
            />
          ))}
        </div>

        {/* LIVE INFERENCE / EDGE SIMULATION DROPZONE */}
        <section className="p-6 sm:p-8 md:p-10 rounded-2xl bg-[#131820] border border-[#242C38] relative overflow-hidden">
          <div className="max-w-2xl mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F5A623] uppercase tracking-wider mb-1">
              <ScanLine className="w-4 h-4" />
              <span>Interactive Edge Inference Simulator</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Test Live Video Frame Inference (Beta)
            </h2>
            <p className="text-xs text-[#8B94A3] leading-relaxed">
              Trigger the YOLOv10-TensorRT pipeline to simulate real-time bounding box extraction, homography warping, and functional lane capacity calculation.
            </p>
          </div>

          <div
            id="live-upload-zone"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              runLiveSimulation();
            }}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
              dragOver
                ? 'border-[#F5A623] bg-[#F5A623]/10'
                : 'border-[#242C38] hover:border-[#F5A623]/40 bg-[#0A0E14]'
            }`}
          >
            {isSimulatingLive ? (
              <div className="py-8 space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm font-mono text-[#F5A623]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing YOLOv10 NMS-Free TensorRT Engine...</span>
                </div>
                
                <div className="w-full bg-[#1B222D] h-2.5 rounded-full overflow-hidden border border-[#242C38]">
                  <div 
                    className="bg-[#F5A623] h-full transition-all duration-150"
                    style={{ width: `${simulatedProgress}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono text-[#8B94A3] flex justify-between">
                  <span>Batch Homography Projection</span>
                  <span>{simulatedProgress}% Complete (26.3ms)</span>
                </div>
              </div>
            ) : liveInferenceResult ? (
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 text-xs font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Inference Completed Successfully (Latency: 24.8ms)</span>
                </div>

                <div className="max-w-xl mx-auto">
                  <DetectionCard
                    sample={liveInferenceResult}
                    interactive={true}
                    onSelect={() => setSelectedSample(liveInferenceResult)}
                    isExpanded={true}
                  />
                </div>

                <button
                  onClick={() => runLiveSimulation()}
                  className="px-5 py-2 rounded-lg bg-[#1B222D] hover:bg-[#242C38] text-white text-xs font-mono border border-[#242C38] cursor-pointer"
                >
                  Run Another Random Intersection Frame
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#1B222D] border border-[#242C38] mx-auto flex items-center justify-center text-[#F5A623]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drag & Drop any intersection frame or video clip
                  </p>
                  <p className="text-xs text-[#8B94A3] mt-1">
                    Accepts PNG, JPG, MP4 feeds (Simulates Jetson Orin Edge inference)
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => runLiveSimulation()}
                    className="px-6 py-2.5 rounded-lg bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] font-mono font-semibold text-xs transition-all shadow-lg shadow-[#F5A623]/20 cursor-pointer"
                  >
                    Simulate Live Detection on Sample Footage
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* DETAILED MODAL / DIALOG */}
        <AnimatePresence>
          {selectedSample && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-[#131820] border border-[#242C38] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative"
              >
                {/* Close Button */}
                <button
                  id="close-modal-btn"
                  onClick={() => setSelectedSample(null)}
                  className="absolute top-5 right-5 p-2 rounded-lg bg-[#1B222D] border border-[#242C38] text-[#8B94A3] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <SeverityBadge level={selectedSample.severity} />
                  <ProvenanceTag provenance={selectedSample.provenance || 'projected'} size="xs" />
                  <span className="text-xs font-mono text-[#8B94A3]">
                    Approach ID: {selectedSample.id} • {selectedSample.corridor}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedSample.title}
                </h2>
                <p className="text-sm text-[#8B94A3] mb-6">
                  {selectedSample.description}
                </p>

                {/* Render Expanded Detection Card */}
                <DetectionCard
                  sample={selectedSample}
                  interactive={false}
                  isExpanded={true}
                />

                {/* Bounding Box Detail Table */}
                <div className="mt-6 pt-6 border-t border-[#242C38]">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#F5A623] font-semibold mb-3">
                    Classified Encroachment Entities & Bounding Box Vectors
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0A0E14] text-[#8B94A3] border-b border-[#242C38]">
                        <tr>
                          <th className="p-3">Class</th>
                          <th className="p-3">Confidence</th>
                          <th className="p-3">Coordinates [x%, y%, w%, h%]</th>
                          <th className="p-3">Lateral Lane Intrusion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242C38]">
                        {selectedSample.detections.map((box, idx) => (
                          <tr key={idx} className="hover:bg-[#1B222D]/50">
                            <td className="p-3 font-bold text-white capitalize">
                              {box.class.replace('_', ' ')}
                            </td>
                            <td className="p-3 text-[#2ECC71]">
                              {(box.confidence * 100).toFixed(1)}%
                            </td>
                            <td className="p-3 text-[#8B94A3]">
                              [{box.bbox.join(', ')}]
                            </td>
                            <td className="p-3 text-[#F5A623]">
                              -{box.laneImpactPct || 18}% Effective Width
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#242C38] flex justify-between items-center">
                  <span className="text-xs font-mono text-[#8B94A3]">
                    Feeds downstream into SUMO Signal Actuation
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSample(null);
                      onRouteChange('/simulation');
                    }}
                    className="px-5 py-2.5 rounded-lg bg-[#F5A623] text-[#0A0E14] font-semibold font-mono text-xs hover:bg-[#e09419] cursor-pointer"
                  >
                    View in Simulation Dashboard →
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
