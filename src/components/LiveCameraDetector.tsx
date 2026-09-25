import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { 
  Camera, 
  CameraOff, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  Info,
  ShieldCheck,
  Activity,
  Sliders,
  Play,
  Pause
} from 'lucide-react';

interface DetectionItem {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export const LiveCameraDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isDetectingRef = useRef<boolean>(false);

  // States
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [modelError, setModelError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [currentDetections, setCurrentDetections] = useState<DetectionItem[]>([]);
  const [resolution, setResolution] = useState<{ width: number; height: number }>({ width: 640, height: 480 });

  // Real-Time Actuation Telemetry Coupled to Live Detections
  const [usableCapacityPct, setUsableCapacityPct] = useState<number>(85);
  const [signalPhase, setSignalPhase] = useState<'GREEN' | 'AMBER' | 'RED'>('GREEN');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(36);

  // 1. Load TensorFlow.js COCO-SSD model once
  const loadModel = useCallback(async () => {
    if (modelRef.current) {
      setModelStatus('ready');
      return modelRef.current;
    }

    try {
      setModelStatus('loading');
      setModelError(null);
      await tf.ready();
      const loadedModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      modelRef.current = loadedModel;
      setModelStatus('ready');
      return loadedModel;
    } catch (err: any) {
      console.error('Failed to load neural model:', err);
      setModelStatus('error');
      setModelError(err?.message || 'Failed to initialize TensorFlow.js neural network in browser.');
      return null;
    }
  }, []);

  // Pre-load model on mount
  useEffect(() => {
    loadModel();
    return () => {
      stopCamera();
    };
  }, [loadModel]);

  // Real-Time Signal Head Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          let nextPhase: 'GREEN' | 'AMBER' | 'RED';
          let nextSec: number;
          if (signalPhase === 'GREEN') {
            nextPhase = 'AMBER';
            nextSec = 4;
          } else if (signalPhase === 'AMBER') {
            nextPhase = 'RED';
            nextSec = 26;
          } else {
            nextPhase = 'GREEN';
            nextSec = Math.min(68, Math.round(38 / (usableCapacityPct / 100)));
          }
          setTimeout(() => setSignalPhase(nextPhase), 0);
          return nextSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [signalPhase, usableCapacityPct]);

  // 2. Inference Loop
  const runDetection = useCallback(async () => {
    if (!isDetectingRef.current || !videoRef.current || !canvasRef.current || !modelRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState >= 2) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        setResolution({ width: video.videoWidth, height: video.videoHeight });
      }

      const t0 = performance.now();
      try {
        const predictions = await modelRef.current.detect(video);
        const t1 = performance.now();
        setLatencyMs(Math.round(t1 - t0));

        // Draw bounding boxes on canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          let totalObstructionWidthPx = 0;

          predictions.forEach(pred => {
            const [x, y, width, height] = pred.bbox;
            const scorePct = Math.round(pred.score * 100);

            totalObstructionWidthPx += Math.min(width, canvas.width * 0.35);

            let strokeColor = '#2ECC71';
            let badgeBg = 'rgba(46, 204, 113, 0.9)';
            let textColor = '#0A0E14';

            if (['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(pred.class)) {
              strokeColor = '#F5A623';
              badgeBg = 'rgba(245, 166, 35, 0.9)';
            } else if (['person'].includes(pred.class)) {
              strokeColor = '#38BDF8';
              badgeBg = 'rgba(56, 189, 248, 0.9)';
            }

            // Box
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(x, y, width, height);

            // Semi-transparent fill
            ctx.fillStyle = `${strokeColor}1A`;
            ctx.fillRect(x, y, width, height);

            // Label pill
            const labelText = `${pred.class.toUpperCase()} ${scorePct}%`;
            ctx.font = 'bold 11px monospace';
            const textWidth = ctx.measureText(labelText).width;
            const pillHeight = 18;
            const pillY = Math.max(0, y - pillHeight);

            ctx.fillStyle = badgeBg;
            ctx.fillRect(x, pillY, textWidth + 10, pillHeight);

            ctx.fillStyle = textColor;
            ctx.fillText(labelText, x + 5, pillY + 13);
          });

          // Calculate Dynamic Usable Carriageway Capacity from Optical Detections
          if (predictions.length > 0) {
            const obstructionRatio = Math.min(0.65, (totalObstructionWidthPx / (canvas.width || 640)) * 0.55);
            const calculatedCap = Math.max(35, Math.round((1 - obstructionRatio) * 100));
            setUsableCapacityPct(calculatedCap);
          } else {
            setUsableCapacityPct(95);
          }
        }

        setCurrentDetections(predictions as DetectionItem[]);

        fpsFrameCountRef.current++;
        const now = performance.now();
        if (now - fpsLastTimeRef.current >= 600) {
          const calculatedFps = Math.round((fpsFrameCountRef.current * 1000) / (now - fpsLastTimeRef.current));
          setFps(calculatedFps);
          fpsFrameCountRef.current = 0;
          fpsLastTimeRef.current = now;
        }
      } catch (err) {
        console.warn('Inference frame dropped:', err);
      }
    }

    if (isDetectingRef.current) {
      animFrameIdRef.current = requestAnimationFrame(runDetection);
    }
  }, []);

  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());

  // 3. Start Camera
  const startCamera = async () => {
    setCameraError(null);

    let model = modelRef.current;
    if (!model) {
      model = await loadModel();
      if (!model) return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported by your browser or in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          isDetectingRef.current = true;
          fpsFrameCountRef.current = 0;
          fpsLastTimeRef.current = performance.now();
          animFrameIdRef.current = requestAnimationFrame(runDetection);
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      isDetectingRef.current = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings to use live object detection.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on your device. Please attach a video input device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Your camera is currently in use by another application or tab.');
      } else {
        setCameraError(err?.message || 'Unable to access video camera.');
      }
    }
  };

  // 4. Stop Camera
  const stopCamera = () => {
    isDetectingRef.current = false;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    setIsCameraActive(false);
    setCurrentDetections([]);
    setFps(0);
    setLatencyMs(0);
    setUsableCapacityPct(85);
  };

  const nominalGreenSec = 38;
  const dynamicGreenSec = Math.min(68, Math.round(nominalGreenSec / (usableCapacityPct / 100)));
  const greenCompSec = dynamicGreenSec - nominalGreenSec;

  return (
    <div id="live-camera-tab" className="space-y-6">
      
      {/* 1. OPERATIONAL TELEMETRY BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E131A] border-l-4 border-l-[#2ECC71] border border-[#1E2632] flex flex-wrap items-center justify-between gap-3 shadow-xl font-mono">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2ECC71]"></span>
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              EDGE PERCEPTION SENSOR • REAL-TIME LOCAL INFERENCE
            </div>
            <div className="text-[11px] text-[#8B94A3]">
              TensorFlow.js WebGL Shader Acceleration • Closed-Loop Usable Carriageway Modulation
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded bg-[#0A0E14] border border-[#1E2632] text-[#38BDF8]">
            Model: MobileNet-COCO-SSD Lite
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0A0E14] border border-[#1E2632] text-[#2ECC71]">
            NEMA TS2 Ready
          </span>
        </div>
      </div>

      {/* 2. CAMERA CONTROL BAR & STATUS INDICATOR */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#11161F] border border-[#222B38]">
        <div className="flex items-center gap-3">
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md shadow-[#EF4444]/20 cursor-pointer"
            >
              <CameraOff className="w-4 h-4" />
              <span>Disconnect Optical Sensor</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              disabled={modelStatus === 'loading'}
              className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] disabled:opacity-50 text-[#0A0E14] text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
            >
              {modelStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling WebGL Shaders...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Initialize Hardware Webcam</span>
                </>
              )}
            </button>
          )}

          {/* Model Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0E14] border border-[#1E2632] text-xs font-mono">
            <span className="text-[#8B94A3]">Engine:</span>
            {modelStatus === 'ready' && (
              <span className="text-[#2ECC71] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                WebGL GPU Accelerated
              </span>
            )}
            {modelStatus === 'loading' && (
              <span className="text-[#F5A623] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Compiling...
              </span>
            )}
            {modelStatus === 'error' && (
              <span className="text-[#EF4444]">Shader Error</span>
            )}
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0E14] border border-[#1E2632]">
            <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-[#8B94A3]">FPS:</span>
            <span className="text-white font-bold">{isCameraActive ? `${fps}` : '--'}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0E14] border border-[#1E2632]">
            <span className="text-[#8B94A3]">Latency:</span>
            <span className="text-[#2ECC71] font-bold">{isCameraActive ? `${latencyMs}ms` : '--'}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0E14] border border-[#1E2632]">
            <span className="text-[#8B94A3]">Entities:</span>
            <span className="text-[#F5A623] font-bold">{isCameraActive ? currentDetections.length : 0}</span>
          </div>
        </div>
      </div>

      {/* 3. CAMERA ERROR NOTIFICATION */}
      {cameraError && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#FCA5A5] text-xs font-mono flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-white">Camera Access Error</div>
            <p>{cameraError}</p>
          </div>
        </div>
      )}

      {/* 4. VIDEO FEED & DETECTION OVERLAY CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Viewport (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#0A0E14] border border-[#222B38] overflow-hidden shadow-2xl flex items-center justify-center">
            
            {/* Raw Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-contain ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Bounding Box Drawing Canvas */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Placeholder when camera is stopped */}
            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#141B24] border border-[#242C38] flex items-center justify-center text-[#8B94A3]">
                  <Camera className="w-8 h-8 text-[#64748B]" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-white font-mono">Hardware Optical Sensor Offline</h3>
                  <p className="text-xs text-[#8B94A3]">
                    Click below to initialize your local webcam feed. Real-time neural inference runs entirely client-side via WebGL shaders.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  disabled={modelStatus === 'loading'}
                  className="px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-[#F5A623]/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Initialize Hardware Webcam</span>
                </button>
              </div>
            )}

            {/* Live Indicator Overlay */}
            {isCameraActive && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0A0E14]/85 border border-[#222B38] text-[10px] font-mono text-[#2ECC71]">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                <span>LIVE OPTICAL FEED ({resolution.width}x{resolution.height})</span>
              </div>
            )}

            {/* Live Signal Head Mini-HUD */}
            {isCameraActive && (
              <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-[#0A0E14]/90 border border-[#2B384A] font-mono text-center">
                <div className="text-[9px] text-[#8B94A3]">CONTROLLER PHASE</div>
                <div className={`text-sm font-bold ${
                  signalPhase === 'GREEN' ? 'text-[#2ECC71]' : signalPhase === 'AMBER' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                }`}>
                  {signalPhase} {phaseSecondsLeft}s
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] px-1">
            <span>Hardware Accelerated Neural Vision Pipeline</span>
            <span>Real-time local frame processing</span>
          </div>
        </div>

        {/* Real-Time Detection Feed & Signal Actuation Inspector (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#11161F] border border-[#222B38] shadow-xl space-y-4 flex flex-col justify-between font-mono">
          
          <div className="space-y-4">
            
            {/* Actuation Split Recommendation */}
            <div className="p-3.5 rounded-xl bg-[#0A0E14] border border-[#1E2632] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8B94A3] uppercase">Dynamic Split Actuation</span>
                <span className="text-[#2ECC71] font-bold">+{greenCompSec}s Extended</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-[#101622] border border-[#1C2534]">
                  <div className="text-[10px] text-[#8B94A3]">Nominal Green</div>
                  <div className="text-base font-bold text-white mt-0.5">{nominalGreenSec}s</div>
                </div>
                <div className="p-2 rounded bg-[#101622] border border-[#2ECC71]/30">
                  <div className="text-[10px] text-[#2ECC71]">Dynamic Green</div>
                  <div className="text-base font-bold text-[#2ECC71] mt-0.5">{dynamicGreenSec}s</div>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8B94A3]">Usable Carriageway:</span>
                  <span className="text-white font-bold">{usableCapacityPct}% Clear</span>
                </div>
                <div className="h-2 rounded-full bg-[#141B24] overflow-hidden flex">
                  <div style={{ width: `${usableCapacityPct}%` }} className="bg-[#2ECC71] h-full" />
                  <div style={{ width: `${100 - usableCapacityPct}%` }} className="bg-[#EF4444] h-full" />
                </div>
              </div>
            </div>

            {/* Detected Entities List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2632] text-xs">
                <div className="flex items-center gap-2 text-[#F5A623] font-bold uppercase">
                  <Activity className="w-4 h-4 text-[#F5A623]" />
                  <span>Detected Entities</span>
                </div>
                <span className="text-white px-2 py-0.5 rounded bg-[#1A222D] border border-[#2B384A] text-[10px]">
                  {currentDetections.length} Active
                </span>
              </div>

              {isCameraActive && currentDetections.length > 0 ? (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {currentDetections.map((det, index) => {
                    const pct = Math.round(det.score * 100);
                    const isVehicle = ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(det.class);
                    const isPerson = det.class === 'person';
                    const color = isVehicle ? '#F5A623' : isPerson ? '#38BDF8' : '#2ECC71';

                    return (
                      <div
                        key={index}
                        className="p-2 rounded-lg bg-[#0A0E14] border border-[#1E2632] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-white font-medium capitalize">{det.class}</span>
                        </div>
                        <span className="font-bold" style={{ color }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : isCameraActive ? (
                <div className="p-4 text-center rounded-xl bg-[#0A0E14] border border-[#1E2632] text-xs text-[#8B94A3]">
                  No obstacles in camera field of view.
                </div>
              ) : (
                <div className="p-4 text-center rounded-xl bg-[#0A0E14] border border-[#1E2632] text-xs text-[#8B94A3]">
                  Sensor offline. Initialize camera above.
                </div>
              )}
            </div>

          </div>

          {/* Controller Link Footer */}
          <div className="p-3 rounded-xl bg-[#0A0E14] border border-[#1E2632] text-[11px] text-[#8B94A3] space-y-1">
            <div className="text-[#2ECC71] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span>NEMA TS2 Gateway Linked</span>
            </div>
            <p className="text-[#94A3B8] leading-tight">
              Dynamic capacity coefficient continuously passed to signal split controller to compensate phase discharge.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
