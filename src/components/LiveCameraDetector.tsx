import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { 
  Camera, 
  CameraOff, 
  AlertCircle, 
  Loader2, 
  Activity,
  Maximize2
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

  // Real-Time Signal Head Tick
  const [signalPhase, setSignalPhase] = useState<'GREEN' | 'AMBER' | 'RED'>('GREEN');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(36);

  // 1. Load TensorFlow.js COCO-SSD model
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
      stopLiveCamera();
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
            nextSec = 38;
          }
          setTimeout(() => setSignalPhase(nextPhase), 0);
          return nextSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [signalPhase]);

  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());

  // 2. Hardware Live Camera Inference Loop
  const runLiveDetection = useCallback(async () => {
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

          predictions.forEach(pred => {
            const [x, y, width, height] = pred.bbox;
            const scorePct = Math.round(pred.score * 100);

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
            ctx.font = 'bold 12px monospace';
            const textWidth = ctx.measureText(labelText).width;
            const pillHeight = 20;
            const pillY = Math.max(0, y - pillHeight);

            ctx.fillStyle = badgeBg;
            ctx.fillRect(x, pillY, textWidth + 12, pillHeight);

            ctx.fillStyle = textColor;
            ctx.fillText(labelText, x + 6, pillY + 14);
          });
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
      animFrameIdRef.current = requestAnimationFrame(runLiveDetection);
    }
  }, []);

  // 3. Start Live Camera
  const startLiveCamera = async () => {
    stopLiveCamera();
    setCameraError(null);

    let model = modelRef.current;
    if (!model) {
      model = await loadModel();
      if (!model) return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
          animFrameIdRef.current = requestAnimationFrame(runLiveDetection);
        };
      }
    } catch (err: any) {
      console.warn('Hardware camera access failed:', err);
      setIsCameraActive(false);
      isDetectingRef.current = false;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video camera device was found on this system.');
      } else {
        setCameraError(err?.message || 'Unable to access live video camera.');
      }
    }
  };

  // 4. Stop Live Camera
  const stopLiveCamera = () => {
    isDetectingRef.current = false;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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
  };

  return (
    <div id="live-camera-station" className="w-full flex-1 flex flex-col space-y-3 font-mono">
      {/* STREAM CONTROL HUD & REAL-TIME TELEMETRY BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[#090D15] border border-[#1E2632] shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {isCameraActive ? (
            <button
              onClick={stopLiveCamera}
              className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#EF4444]/20 cursor-pointer"
            >
              <CameraOff className="w-4 h-4" />
              <span>Disconnect Camera</span>
            </button>
          ) : (
            <button
              onClick={startLiveCamera}
              disabled={modelStatus === 'loading'}
              className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09419] disabled:opacity-50 text-[#0A0E14] text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#F5A623]/25 cursor-pointer"
            >
              {modelStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling Neural Shaders...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Start Live Camera</span>
                </>
              )}
            </button>
          )}

          {/* Model Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070A0E] border border-[#1E2632] text-xs">
            {modelStatus === 'ready' ? (
              <span className="text-[#2ECC71] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                WebGL GPU Ready
              </span>
            ) : modelStatus === 'loading' ? (
              <span className="text-[#F5A623] flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Compiling...
              </span>
            ) : (
              <span className="text-[#8B94A3]">Neural Engine Standby</span>
            )}
          </div>
        </div>

        {/* Live FPS / Latency / Entities Metrics */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070A0E] border border-[#1E2632]">
            <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-[#8B94A3]">FPS:</span>
            <span className="text-white font-bold">{isCameraActive ? fps : '--'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070A0E] border border-[#1E2632]">
            <span className="text-[#8B94A3]">Latency:</span>
            <span className="text-[#2ECC71] font-bold">{isCameraActive ? `${latencyMs}ms` : '--'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070A0E] border border-[#1E2632]">
            <span className="text-[#8B94A3]">Entities:</span>
            <span className="text-[#F5A623] font-bold">{currentDetections.length}</span>
          </div>
        </div>
      </div>

      {/* ERROR BANNER (IF ANY) */}
      {cameraError && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#FCA5A5] text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-white">Camera Notice</div>
            <p>{cameraError}</p>
          </div>
        </div>
      )}

      {/* FULL-SCREEN HIGH-IMPACT PRIMARY LIVE VIDEO PERCEPTION FEED */}
      <div className="relative w-full flex-1 min-h-[480px] sm:min-h-[580px] lg:min-h-[660px] rounded-2xl bg-[#070A0E] border border-[#1E2632] overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Raw Webcam Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-contain ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {/* Neural Bounding Box Overlay Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {/* Inactive Standby Screen */}
        {!isCameraActive && (
          <div className="flex flex-col items-center justify-center gap-4 text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-[#10151E] border border-[#1E2632] flex items-center justify-center text-[#8B94A3] shadow-lg">
              <Camera className="w-10 h-10 text-[#64748B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Live Camera Sensor Standby</h3>
              <p className="text-xs text-[#8B94A3] leading-relaxed">
                Click below to initialize your live optical camera. Real-time neural inference will detect vehicles, pedestrians, and obstacles directly on your video feed.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={startLiveCamera}
                disabled={modelStatus === 'loading'}
                className="px-6 py-3 rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#F5A623]/25"
              >
                <Camera className="w-4 h-4" />
                <span>Start Live Camera</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Streaming Indicator Overlay */}
        {isCameraActive && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0E14]/90 backdrop-blur-md border border-[#2ECC71]/40 text-[10px] text-[#2ECC71] shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
            <span className="font-bold tracking-wide">LIVE OPTICAL PERCEPTION</span>
          </div>
        )}

        {/* Signal Light Head Mini-HUD */}
        {isCameraActive && (
          <div className="absolute top-4 right-4 z-10 px-4 py-2 rounded-xl bg-[#0A0E14]/90 backdrop-blur-md border border-[#2B384A] text-center shadow-xl">
            <div className="text-[9px] text-[#8B94A3] uppercase tracking-wider font-bold">SIGNAL PHASE</div>
            <div className={`text-base font-extrabold ${
              signalPhase === 'GREEN' ? 'text-[#2ECC71]' : signalPhase === 'AMBER' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
            }`}>
              {signalPhase} {phaseSecondsLeft}s
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
