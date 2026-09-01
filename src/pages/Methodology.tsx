import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Database, 
  Cpu, 
  Layers, 
  ExternalLink, 
  Quote, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ResearchNoticeBanner } from '../components/ResearchNoticeBanner';

interface MethodologyProps {
  onRouteChange: (route: string) => void;
}

export const Methodology: React.FC<MethodologyProps> = ({ onRouteChange }) => {
  const references = [
    {
      id: 'webster1958',
      title: 'Traffic Signal Settings',
      authors: 'Webster, F. V.',
      venue: 'Road Research Technical Paper No. 39, Road Research Laboratory, UK',
      year: '1958',
      link: 'https://trid.trb.org/view/118322'
    },
    {
      id: 'hcm2010',
      title: 'Highway Capacity Manual (HCM 2010)',
      authors: 'Transportation Research Board (TRB)',
      venue: 'National Academies of Sciences, Engineering, and Medicine, Washington, D.C.',
      year: '2010',
      link: 'https://www.trb.org'
    },
    {
      id: 'idd2019',
      title: 'IDD: A Dataset for Exploring Problems of Autonomous Navigation in Unconstrained Environments',
      authors: 'Varma, G., Subramanian, A., Namboodiri, V. M., Chandraker, M., & Jawahar, C. V.',
      venue: 'IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)',
      year: '2019',
      link: 'https://idd.insaan.iiit.ac.in/'
    },
    {
      id: 'stgnn2018',
      title: 'Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting',
      authors: 'Yu, B., Yin, H., & Zhu, Z.',
      venue: 'International Joint Conference on Artificial Intelligence (IJCAI)',
      year: '2018',
      link: 'https://arxiv.org/abs/1709.04875'
    },
    {
      id: 'yolov10_2024',
      title: 'YOLOv10: Real-Time End-to-End Object Detection',
      authors: 'Wang, A., Chen, H., Liu, L., Chen, K., Lin, Z., Han, J., & Ding, G.',
      venue: 'arXiv preprint arXiv:2405.14458',
      year: '2024',
      link: 'https://arxiv.org/abs/2405.14458'
    }
  ];

  return (
    <div id="methodology-page" className="w-full pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 text-xs font-mono text-[#F5A623] mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Calibration Matrices & Sensor Specifications</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F2F4F7] mb-4">
            Field Calibration & Edge Specs
          </h1>

          <p className="text-base md:text-lg text-[#8B94A3] leading-relaxed">
            Real-time homography perspective projection, edge hardware deployment blueprints, Webster signal formulas, and empirical training datasets powering the EncroachAI network.
          </p>
        </div>

        {/* Research Disclaimer */}
        <div className="mb-12">
          <ResearchNoticeBanner />
        </div>

        {/* 1. GAP STATEMENT CALLOUT BOX */}
        <section className="mb-20">
          <div className="p-8 md:p-10 rounded-2xl bg-[#131820] border-l-4 border-l-[#F5A623] border-[#242C38] relative overflow-hidden">
            <Quote className="w-12 h-12 text-[#F5A623]/20 absolute top-6 right-6 pointer-events-none" />

            <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider block mb-3">
              The Fundamental Theoretical Literature Gap
            </span>

            <blockquote className="text-lg md:text-xl font-medium text-white italic leading-relaxed mb-4">
              "Existing traffic-signal optimization literature almost universally treats carriageway width as a fixed geometric parameter. In the Global South, this assumption fails within minutes of peak-hour onset as informal vendor pushcarts, double-parked logistics vehicles, and pedestrian spillover usurp up to 50% of the active transit surface."
            </blockquote>

            <p className="text-xs font-mono text-[#8B94A3]">
              — M.Tech CSE Thesis Motivation, Saveetha School of Engineering (2025)
            </p>
          </div>
        </section>

        {/* 2. DATASET OVERVIEW */}
        <section className="mb-20">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono text-[#F5A623] uppercase tracking-wider">
              Training & Validation Corpus
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
              Dataset Composition
            </h2>
            <p className="text-sm text-[#8B94A3] mt-1">
              Our YOLOv10 edge model is trained on a hybrid corpus combining large-scale unconstrained driving datasets with proprietary Chennai field telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dataset 1: IDD */}
            <div className="p-8 rounded-2xl bg-[#131820] border border-[#242C38] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                    Public Baseline Corpus
                  </span>
                  <span className="text-xs font-mono text-[#8B94A3]">IDD-Detection (46,588 images)</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  India Driving Dataset (IDD-Detection)
                </h3>
                <p className="text-xs text-[#8B94A3] leading-relaxed mb-4">
                  Official IIIT Hyderabad dataset (<code className="text-[#38BDF8]">insaan.iiit.ac.in</code>) utilized for base feature representations across unconstrained Indian traffic (31,569 train / 10,225 val / 4,794 test bounding-box partitions).
                </p>

                <ul className="text-xs font-mono text-[#8B94A3] space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" />
                    <span>Pretrained on 34 fine-grained road scene and vehicle categories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" />
                    <span>Fine-tuned downstream on custom 4-class Chennai encroachment taxonomy</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#242C38] flex justify-between items-center text-xs font-mono text-[#8B94A3]">
                <span>Source: IIIT Hyderabad</span>
                <span className="text-[#38BDF8]">CC-BY 4.0</span>
              </div>
            </div>

            {/* Dataset 2: Chennai Field Telemetry */}
            <div className="p-8 rounded-2xl bg-[#131820] border border-[#242C38] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                    Proprietary Field Dataset
                  </span>
                  <span className="text-xs font-mono text-[#8B94A3]">4,800 Annotated Frames</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Chennai Arterial Encroachment Telemetry
                </h3>
                <p className="text-xs text-[#8B94A3] leading-relaxed mb-4">
                  Captured via high-mounted 4K edge cameras across Anna Salai, Usman Road (T. Nagar), and GST Road during morning, afternoon, and evening peak hours.
                </p>

                <ul className="text-xs font-mono text-[#8B94A3] space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" />
                    <span>Custom polygons for Pushcarts, Double-Parking, and Stalls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" />
                    <span>Exact physical curb distance ground-truth calibration</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#242C38] flex justify-between items-center text-xs font-mono text-[#8B94A3]">
                <span>Resolution: 3840x2160 @ 30fps</span>
                <span className="text-[#F5A623]">NVIDIA Jetson Validated</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. EVALUATION METHODOLOGY & BASELINE FORMULATIONS */}
        <section className="mb-20 p-8 md:p-10 rounded-2xl bg-[#131820] border border-[#242C38] space-y-8">
          <div>
            <span className="text-xs font-mono text-[#2ECC71] uppercase tracking-wider">
              Control Baselines
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Comparative Signal Controller Formulations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-xl bg-[#0A0E14] border border-[#242C38] space-y-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30">
                Baseline 1: Static Fixed
              </span>
              <h4 className="text-base font-bold text-white">Webster Classical (1958)</h4>
              <p className="text-xs text-[#8B94A3] leading-relaxed">
                Uses historical Time-of-Day (TOD) fixed timing plans. Assumes 100% geometric width (W = 10.5m) and constant saturation flow rate (S_0 = 1900 PCU/lane/hr).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0A0E14] border border-[#242C38] space-y-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
                Baseline 2: Capacity-Agnostic
              </span>
              <h4 className="text-base font-bold text-white">SCATS / Actuated Model</h4>
              <p className="text-xs text-[#8B94A3] leading-relaxed">
                Adjusts green splits based on real-time vehicle counts, but assumes nominal discharge rates. Severely fails when roadside obstacles bottleneck vehicle clearance.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0A0E14] border border-[#242C38] space-y-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30">
                Proposed: EncroachAI
              </span>
              <h4 className="text-base font-bold text-white">Vision-Edge + ST-GNN</h4>
              <p className="text-xs text-[#8B94A3] leading-relaxed">
                Real-time functional capacity scaling: S_eff(t) = S_0 * β_i(t). Coupled with Spatial-Temporal GNN corridor coordination to prevent downstream queue lock.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#242C38] space-y-2">
            <h4 className="text-sm font-bold text-white">Micro-simulation Configuration Parameters:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono text-[#8B94A3]">
              <div>Engine: <span className="text-white">Eclipse SUMO 1.20</span></div>
              <div>Car Following: <span className="text-white">Calibrated Krauss</span></div>
              <div>Lost Time $L$: <span className="text-white">4.0s per phase</span></div>
              <div>Min Green: <span className="text-white">15.0s (Pedestrian)</span></div>
            </div>
          </div>
        </section>

        {/* 4. ACADEMIC REFERENCES */}
        <section className="p-8 rounded-2xl bg-[#131820] border border-[#242C38]">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-[#F5A623]" />
            <h3 className="text-xl font-bold text-white">
              Academic References & Literature Foundation
            </h3>
          </div>

          <div className="space-y-4">
            {references.map((ref, idx) => (
              <div
                key={ref.id}
                className="p-4 rounded-xl bg-[#0A0E14] border border-[#242C38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-white font-mono">
                    [{idx + 1}] {ref.title}
                  </div>
                  <div className="text-[#8B94A3]">
                    {ref.authors} ({ref.year}). <span className="italic">{ref.venue}</span>.
                  </div>
                </div>

                <a
                  href={ref.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#F5A623] hover:underline shrink-0"
                >
                  View Paper <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#242C38] flex justify-between items-center">
            <span className="text-xs font-mono text-[#8B94A3]">
              Learn more about the researcher and institutional context
            </span>
            <button
              onClick={() => onRouteChange('/about')}
              className="px-5 py-2.5 rounded-lg bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] font-semibold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Author & Thesis Info <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
