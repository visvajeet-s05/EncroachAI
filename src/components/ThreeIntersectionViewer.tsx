import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Sliders, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { ProvenanceTag } from './ProvenanceTag';

interface ThreeIntersectionViewerProps {
  initialEncroachment?: 'none' | 'light' | 'moderate' | 'heavy';
  onEncroachmentChange?: (level: 'none' | 'light' | 'moderate' | 'heavy') => void;
}

export const ThreeIntersectionViewer: React.FC<ThreeIntersectionViewerProps> = ({
  initialEncroachment = 'moderate',
  onEncroachmentChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [encroachmentLevel, setEncroachmentLevel] = useState<'none' | 'light' | 'moderate' | 'heavy'>(initialEncroachment);
  const [signalMode, setSignalMode] = useState<'encroachai' | 'static'>('encroachai');
  const [trafficDensity, setTrafficDensity] = useState<number>(75); // 0-100%
  const [cameraView, setCameraView] = useState<'iso' | 'top' | 'approach' | 'curb'>('iso');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [stats, setStats] = useState({
    effectiveWidthPct: 62,
    currentQueue: 48,
    greenDurationSec: 54,
    flowThroughputPcu: 3480
  });

  // Scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);
  const vehiclesRef = useRef<Array<{
    mesh: THREE.Group;
    lane: number;
    speed: number;
    posZ: number;
    type: 'car' | 'auto' | 'bus';
    targetLane: number;
  }>>([]);
  const obstaclesGroupRef = useRef<THREE.Group | null>(null);
  const trafficLightBulbsRef = useRef<{ [key: string]: THREE.MeshBasicMaterial }>({});

  // Sync prop changes
  useEffect(() => {
    setEncroachmentLevel(initialEncroachment);
  }, [initialEncroachment]);

  // Update dynamic stats
  useEffect(() => {
    let effPct = 100;
    let queue = 18;
    let greenSec = signalMode === 'encroachai' ? 42 : 40;
    let flow = 4800;

    if (encroachmentLevel === 'light') {
      effPct = 82;
      queue = signalMode === 'encroachai' ? 26 : 42;
      greenSec = signalMode === 'encroachai' ? 48 : 40;
      flow = signalMode === 'encroachai' ? 4200 : 3600;
    } else if (encroachmentLevel === 'moderate') {
      effPct = 64;
      queue = signalMode === 'encroachai' ? 38 : 74;
      greenSec = signalMode === 'encroachai' ? 56 : 40;
      flow = signalMode === 'encroachai' ? 3680 : 2800;
    } else if (encroachmentLevel === 'heavy') {
      effPct = 42;
      queue = signalMode === 'encroachai' ? 54 : 118;
      greenSec = signalMode === 'encroachai' ? 68 : 40;
      flow = signalMode === 'encroachai' ? 2950 : 1850;
    }

    setStats({
      effectiveWidthPct: effPct,
      currentQueue: queue,
      greenDurationSec: greenSec,
      flowThroughputPcu: flow
    });

    if (onEncroachmentChange) {
      onEncroachmentChange(encroachmentLevel);
    }
  }, [encroachmentLevel, signalMode]);

  // Three.js Initialization & Render Loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f16);
    scene.fog = new THREE.FogExp2(0x0a0f16, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(45, 38, 55);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdde8ff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.4);
    dirLight.position.set(30, 60, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    scene.add(dirLight);

    // Subtle blue accent rim light
    const rimLight = new THREE.PointLight(0x38bdf8, 2, 80);
    rimLight.position.set(-30, 20, -30);
    scene.add(rimLight);

    // 5. Environment Geometry (Road & Crossings)
    buildRoadEnvironment(scene);

    // 6. Traffic Lights
    buildTrafficSignalGantries(scene, trafficLightBulbsRef);

    // 7. Encroachment Obstacles Group
    const obstaclesGroup = new THREE.Group();
    scene.add(obstaclesGroup);
    obstaclesGroupRef.current = obstaclesGroup;

    // 8. Vehicle pool
    vehiclesRef.current = [];

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let spawnTimer = 0;
    let lightCycleTimer = 0;

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlaying) {
        // Traffic light cycling
        lightCycleTimer += delta;
        const currentGreen = signalMode === 'encroachai' ? stats.greenDurationSec : 40;
        const totalCycle = currentGreen + 25; // green + amber/red
        const phase = (lightCycleTimer % totalCycle) < currentGreen ? 'green' : 'red';

        if (trafficLightBulbsRef.current.green && trafficLightBulbsRef.current.red) {
          trafficLightBulbsRef.current.green.color.setHex(phase === 'green' ? 0x22c55e : 0x064e3b);
          trafficLightBulbsRef.current.red.color.setHex(phase === 'red' ? 0xef4444 : 0x450a0a);
        }

        // Spawn vehicles
        spawnTimer += delta;
        const spawnInterval = 1.2 - (trafficDensity / 100) * 0.7; // 0.5s - 1.2s
        if (spawnTimer > spawnInterval) {
          spawnTimer = 0;
          spawnVehicle(scene, vehiclesRef.current, encroachmentLevel);
        }

        // Update Vehicles
        updateVehicles(vehiclesRef.current, delta, phase, encroachmentLevel);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update 3D Encroachments when level changes
  useEffect(() => {
    if (!obstaclesGroupRef.current) return;
    const group = obstaclesGroupRef.current;
    
    // Clear old obstacles
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    if (encroachmentLevel === 'none') return;

    // Build 3D models based on level
    if (encroachmentLevel === 'light' || encroachmentLevel === 'moderate' || encroachmentLevel === 'heavy') {
      // 1. Vendor Pushcart (Wooden Cart + Canopy + Wheels)
      const cart1 = createVendorPushcart(0xf59e0b, 0xef4444);
      cart1.position.set(7.5, 0, -5);
      cart1.rotation.y = 0.2;
      group.add(cart1);

      // 2. Double-parked Auto Rickshaw (Yellow/Black)
      const auto = createAutoRickshaw();
      auto.position.set(6.8, 0, 8);
      auto.rotation.y = -0.15;
      group.add(auto);
    }

    if (encroachmentLevel === 'moderate' || encroachmentLevel === 'heavy') {
      // 3. Roadside Market Stall with Crates & Tarpaulin
      const stall = createMarketStall();
      stall.position.set(8.2, 0, -18);
      group.add(stall);

      // 4. Pedestrian Spillover Cluster
      const pedCluster = createPedestrianCluster();
      pedCluster.position.set(5.8, 0, 18);
      group.add(pedCluster);
    }

    if (encroachmentLevel === 'heavy') {
      // 5. Additional Second Cart + Double-parked Car intrusive into 2nd lane
      const cart2 = createVendorPushcart(0x10b981, 0x3b82f6);
      cart2.position.set(5.2, 0, -10);
      group.add(cart2);

      const parkedCar = createPassengerCar(0xffffff);
      parkedCar.position.set(4.6, 0, -2);
      group.add(parkedCar);

      const bannerStall = createMarketStall();
      bannerStall.position.set(6.2, 0, 26);
      group.add(bannerStall);
    }
  }, [encroachmentLevel]);

  // Update Camera View Presets
  const setCameraPreset = (preset: 'iso' | 'top' | 'approach' | 'curb') => {
    setCameraView(preset);
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    switch (preset) {
      case 'iso':
        camera.position.set(42, 36, 52);
        camera.lookAt(0, 0, 0);
        break;
      case 'top':
        camera.position.set(0, 75, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'approach':
        camera.position.set(0, 6, 42);
        camera.lookAt(0, 2, -30);
        break;
      case 'curb':
        camera.position.set(16, 8, -4);
        camera.lookAt(6, 1, 5);
        break;
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-[#0A0E14] border border-[#242C38] shadow-2xl transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 flex flex-col h-[calc(100vh-2rem)]' : 'h-[620px]'
    }`}>
      {/* 3D Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="w-full flex-1 relative cursor-grab active:cursor-grabbing bg-gradient-to-b from-[#0A0E14] to-[#121820]"
      />

      {/* Top Header HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: Title & Status */}
        <div className="bg-[#131820]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#242C38] pointer-events-auto flex items-center gap-3 shadow-lg">
          <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                3D Arterial Corridor Digital Twin
              </span>
              <ProvenanceTag provenance="projected" size="sm" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30">
                Calibrated Physics Simulation
              </span>
            </div>
            <p className="text-[11px] text-[#8B94A3] font-mono">
              Anna Salai Corridor • Approach Model • 4 Nominal Lanes
            </p>
          </div>
        </div>

        {/* Right: Camera Presets & Fullscreen */}
        <div className="bg-[#131820]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#242C38] pointer-events-auto flex items-center gap-1.5 shadow-lg">
          <button
            onClick={() => setCameraPreset('iso')}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              cameraView === 'iso' ? 'bg-[#F5A623] text-[#0A0E14] font-bold' : 'text-[#8B94A3] hover:text-white'
            }`}
          >
            Isometric
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              cameraView === 'top' ? 'bg-[#F5A623] text-[#0A0E14] font-bold' : 'text-[#8B94A3] hover:text-white'
            }`}
          >
            Top-Down
          </button>
          <button
            onClick={() => setCameraPreset('approach')}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              cameraView === 'approach' ? 'bg-[#F5A623] text-[#0A0E14] font-bold' : 'text-[#8B94A3] hover:text-white'
            }`}
          >
            Driver POV
          </button>
          <button
            onClick={() => setCameraPreset('curb')}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              cameraView === 'curb' ? 'bg-[#F5A623] text-[#0A0E14] font-bold' : 'text-[#8B94A3] hover:text-white'
            }`}
          >
            Curb Cam
          </button>
          <div className="w-[1px] h-4 bg-[#242C38] mx-1" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-[#8B94A3] hover:text-white rounded-lg hover:bg-[#1A222E] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Live HUD Metric Badges (Floating on Left) */}
      <div className="absolute top-20 left-4 pointer-events-none flex flex-col gap-2 z-10">
        <div className="bg-[#131820]/90 backdrop-blur-md p-3 rounded-xl border border-[#242C38] w-64 shadow-xl">
          <div className="text-[11px] font-mono text-[#8B94A3] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Live Dynamics</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              stats.effectiveWidthPct < 50 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              stats.effectiveWidthPct < 75 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {encroachmentLevel.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#8B94A3]">Effective Road Width:</span>
                <span className="text-white font-bold">{stats.effectiveWidthPct}% ({(4 * (stats.effectiveWidthPct / 100)).toFixed(1)} / 4 Lanes)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1A222E] overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.effectiveWidthPct < 50 ? 'bg-red-500' :
                    stats.effectiveWidthPct < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${stats.effectiveWidthPct}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono pt-1 border-t border-[#1F2733]">
              <span className="text-[#8B94A3]">Webster Green Phase:</span>
              <span className="text-[#F5A623] font-bold">{stats.greenDurationSec}s {signalMode === 'encroachai' ? '(Dynamic)' : '(Fixed)'}</span>
            </div>

            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8B94A3]">Shockwave Queue:</span>
              <span className="text-white font-bold">{stats.currentQueue} meters</span>
            </div>

            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8B94A3]">Discharge Flow:</span>
              <span className="text-[#38BDF8] font-bold">{stats.flowThroughputPcu} PCU/hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Controls Panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-[#131820]/95 backdrop-blur-md p-4 rounded-xl border border-[#242C38] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Play/Pause & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-lg bg-[#F5A623] text-[#0A0E14] font-bold hover:bg-[#e09419] transition-all shadow-md shadow-[#F5A623]/20 cursor-pointer"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-1 bg-[#1A222E] p-1 rounded-lg border border-[#2B3545]">
            <button
              onClick={() => setSignalMode('encroachai')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                signalMode === 'encroachai' 
                  ? 'bg-[#10B981] text-[#0A0E14] font-bold shadow' 
                  : 'text-[#8B94A3] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              EncroachAI Dynamic Split
            </button>
            <button
              onClick={() => setSignalMode('static')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all cursor-pointer ${
                signalMode === 'static' 
                  ? 'bg-[#E11D48] text-white font-bold shadow' 
                  : 'text-[#8B94A3] hover:text-white'
              }`}
            >
              Static Webster Split
            </button>
          </div>
        </div>

        {/* Encroachment Level Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8B94A3] hidden sm:inline">Encroachment Severity:</span>
          <div className="flex items-center gap-1 bg-[#1A222E] p-1 rounded-lg border border-[#2B3545]">
            {(['none', 'light', 'moderate', 'heavy'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEncroachmentLevel(lvl)}
                className={`px-2.5 py-1 text-xs font-mono rounded capitalize transition-all cursor-pointer ${
                  encroachmentLevel === lvl
                    ? lvl === 'none' ? 'bg-[#38BDF8] text-[#0A0E14] font-bold'
                    : lvl === 'light' ? 'bg-[#10B981] text-[#0A0E14] font-bold'
                    : lvl === 'moderate' ? 'bg-[#F5A623] text-[#0A0E14] font-bold'
                    : 'bg-[#EF4444] text-white font-bold'
                    : 'text-[#8B94A3] hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Traffic Density Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8B94A3]">Traffic Density:</span>
          <input
            type="range"
            min="20"
            max="100"
            value={trafficDensity}
            onChange={(e) => setTrafficDensity(Number(e.target.value))}
            className="w-28 accent-[#F5A623] cursor-pointer"
          />
          <span className="text-xs font-mono text-white font-bold w-8">{trafficDensity}%</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Three.js Procedural Asset Construction
// ==========================================

function buildRoadEnvironment(scene: THREE.Scene) {
  // 1. Asphalt Road Ground
  const roadGeo = new THREE.PlaneGeometry(24, 160);
  const roadMat = new THREE.MeshStandardMaterial({ 
    color: 0x181c24, 
    roughness: 0.85, 
    metalness: 0.1 
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  scene.add(road);

  // 2. Concrete Sidewalks / Footpaths (Left & Right)
  const walkGeo = new THREE.BoxGeometry(4, 0.3, 160);
  const walkMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.9 });
  
  const leftWalk = new THREE.Mesh(walkGeo, walkMat);
  leftWalk.position.set(-14, 0.15, 0);
  leftWalk.receiveShadow = true;
  scene.add(leftWalk);

  const rightWalk = new THREE.Mesh(walkGeo, walkMat);
  rightWalk.position.set(14, 0.15, 0);
  rightWalk.receiveShadow = true;
  scene.add(rightWalk);

  // 3. Lane Markings (4 Lanes: x = -6, -2, +2, +6)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  // Center double yellow divider
  const centerDividerGeo = new THREE.PlaneGeometry(0.2, 150);
  const centerLine1 = new THREE.Mesh(centerDividerGeo, yellowLineMat);
  centerLine1.rotation.x = -Math.PI / 2;
  centerLine1.position.set(-0.2, 0.01, 0);
  scene.add(centerLine1);

  const centerLine2 = new THREE.Mesh(centerDividerGeo, yellowLineMat);
  centerLine2.rotation.x = -Math.PI / 2;
  centerLine2.position.set(0.2, 0.01, 0);
  scene.add(centerLine2);

  // Dashed Lane dividers at x = -6 and x = +6
  for (let z = -70; z <= 70; z += 6) {
    const dashGeo = new THREE.PlaneGeometry(0.15, 3);
    
    const dashLeft = new THREE.Mesh(dashGeo, lineMat);
    dashLeft.rotation.x = -Math.PI / 2;
    dashLeft.position.set(-6, 0.01, z);
    scene.add(dashLeft);

    const dashRight = new THREE.Mesh(dashGeo, lineMat);
    dashRight.rotation.x = -Math.PI / 2;
    dashRight.position.set(6, 0.01, z);
    scene.add(dashRight);
  }

  // Zebra Crossing at z = -40
  for (let x = -10; x <= 10; x += 2) {
    const zebraGeo = new THREE.PlaneGeometry(1.2, 4);
    const zebra = new THREE.Mesh(zebraGeo, lineMat);
    zebra.rotation.x = -Math.PI / 2;
    zebra.position.set(x, 0.012, -40);
    scene.add(zebra);
  }

  // Stop line at z = -35
  const stopGeo = new THREE.PlaneGeometry(20, 0.6);
  const stopLine = new THREE.Mesh(stopGeo, lineMat);
  stopLine.rotation.x = -Math.PI / 2;
  stopLine.position.set(0, 0.012, -35);
  scene.add(stopLine);
}

function buildTrafficSignalGantries(scene: THREE.Scene, bulbsRef: React.MutableRefObject<any>) {
  const gantryGroup = new THREE.Group();

  // Vertical pole
  const poleGeo = new THREE.CylinderGeometry(0.2, 0.25, 10, 16);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(12.5, 5, -42);
  gantryGroup.add(pole);

  // Horizontal cantilever arm across road
  const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 18, 16);
  const arm = new THREE.Mesh(armGeo, poleMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(3.5, 9.5, -42);
  gantryGroup.add(arm);

  // Signal Housing Box
  const boxGeo = new THREE.BoxGeometry(1.2, 3.2, 0.8);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const signalBox = new THREE.Mesh(boxGeo, boxMat);
  signalBox.position.set(3.5, 8.2, -42);
  gantryGroup.add(signalBox);

  // Signal Light Bulbs (Red, Yellow, Green)
  const bulbGeo = new THREE.SphereGeometry(0.35, 16, 16);
  
  const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const redBulb = new THREE.Mesh(bulbGeo, redMat);
  redBulb.position.set(3.5, 9.2, -41.5);
  gantryGroup.add(redBulb);
  bulbsRef.current.red = redMat;

  const yellowMat = new THREE.MeshBasicMaterial({ color: 0x713f12 });
  const yellowBulb = new THREE.Mesh(bulbGeo, yellowMat);
  yellowBulb.position.set(3.5, 8.2, -41.5);
  gantryGroup.add(yellowBulb);

  const greenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const greenBulb = new THREE.Mesh(bulbGeo, greenMat);
  greenBulb.position.set(3.5, 7.2, -41.5);
  gantryGroup.add(greenBulb);
  bulbsRef.current.green = greenMat;

  scene.add(gantryGroup);
}

// 3D Procedural Pushcart
function createVendorPushcart(cartColor = 0xf59e0b, roofColor = 0xef4444) {
  const group = new THREE.Group();

  // Wooden Body Base
  const baseGeo = new THREE.BoxGeometry(2.4, 0.6, 3.2);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 1.0;
  base.castShadow = true;
  group.add(base);

  // Wheels (4 cylinders)
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  
  const w1 = new THREE.Mesh(wheelGeo, wheelMat);
  w1.rotation.z = Math.PI / 2;
  w1.position.set(1.25, 0.4, 1.1);
  group.add(w1);

  const w2 = new THREE.Mesh(wheelGeo, wheelMat);
  w2.rotation.z = Math.PI / 2;
  w2.position.set(-1.25, 0.4, 1.1);
  group.add(w2);

  const w3 = new THREE.Mesh(wheelGeo, wheelMat);
  w3.rotation.z = Math.PI / 2;
  w3.position.set(1.25, 0.4, -1.1);
  group.add(w3);

  const w4 = new THREE.Mesh(wheelGeo, wheelMat);
  w4.rotation.z = Math.PI / 2;
  w4.position.set(-1.25, 0.4, -1.1);
  group.add(w4);

  // Metal Poles supporting canopy
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
  
  [-1.0, 1.0].forEach(px => {
    [-1.3, 1.3].forEach(pz => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, 1.9, pz);
      group.add(p);
    });
  });

  // Canopy Roof
  const roofGeo = new THREE.BoxGeometry(2.6, 0.1, 3.4);
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.5 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.7;
  roof.castShadow = true;
  group.add(roof);

  // Fruit/Item Boxes on cart
  const crateGeo = new THREE.BoxGeometry(0.6, 0.3, 0.8);
  const fruitMat = new THREE.MeshStandardMaterial({ color: cartColor });
  const crate1 = new THREE.Mesh(crateGeo, fruitMat);
  crate1.position.set(-0.5, 1.4, 0.5);
  group.add(crate1);

  const crate2 = new THREE.Mesh(crateGeo, fruitMat);
  crate2.position.set(0.4, 1.4, -0.4);
  group.add(crate2);

  return group;
}

// 3D Auto Rickshaw
function createAutoRickshaw() {
  const group = new THREE.Group();

  // Yellow Body
  const bodyGeo = new THREE.BoxGeometry(2.0, 1.4, 3.2);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  // Black Roof Hood
  const hoodGeo = new THREE.BoxGeometry(2.1, 0.6, 2.6);
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  const hood = new THREE.Mesh(hoodGeo, hoodMat);
  hood.position.set(0, 1.9, -0.3);
  group.add(hood);

  // Windshield Glass
  const glassGeo = new THREE.PlaneGeometry(1.8, 0.8);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.6 });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 1.4, -1.61);
  group.add(glass);

  // Hazard light blinker
  const lightGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const blinkerL = new THREE.Mesh(lightGeo, lightMat);
  blinkerL.position.set(-0.9, 0.7, 1.62);
  group.add(blinkerL);
  const blinkerR = new THREE.Mesh(lightGeo, lightMat);
  blinkerR.position.set(0.9, 0.7, 1.62);
  group.add(blinkerR);

  return group;
}

// 3D Market Stall (Tarpaulin Canopy + Vegetables/Clothes)
function createMarketStall() {
  const group = new THREE.Group();

  // Table base
  const tableGeo = new THREE.BoxGeometry(3.2, 0.7, 4.0);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.y = 0.5;
  table.castShadow = true;
  group.add(table);

  // Slanted Tarpaulin Canopy
  const tarpGeo = new THREE.BoxGeometry(3.6, 0.08, 4.4);
  const tarpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const tarp = new THREE.Mesh(tarpGeo, tarpMat);
  tarp.rotation.x = -0.15;
  tarp.position.set(0, 2.4, 0);
  tarp.castShadow = true;
  group.add(tarp);

  return group;
}

// 3D Pedestrian Cluster
function createPedestrianCluster() {
  const group = new THREE.Group();
  const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];

  for (let i = 0; i < 4; i++) {
    const ped = new THREE.Group();
    // Torso
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.9, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    ped.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.5;
    ped.add(head);

    ped.position.set((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.8);
    group.add(ped);
  }

  return group;
}

// 3D Passenger Car
function createPassengerCar(color = 0xffffff) {
  const group = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(2.2, 0.8, 4.4);
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.4);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.position.set(0, 1.2, -0.3);
  cabin.castShadow = true;
  group.add(cabin);

  return group;
}

// Vehicle Spawning & Dynamics
function spawnVehicle(scene: THREE.Scene, pool: any[], level: string) {
  // Lane positions: Lane 0 (Right kerb, x = 8.5), Lane 1 (x = 3.5), Lane 2 (x = -3.5), Lane 3 (x = -8.5)
  const lanes = [8.5, 3.5, -3.5, -8.5];
  
  // If encroachment is heavy, rightmost lane is blocked, spawn in other lanes or force lane merge
  let startLane = Math.floor(Math.random() * 4);
  let targetLane = startLane;

  if (startLane === 0 && level !== 'none') {
    // Intend to merge left into Lane 1
    targetLane = 1;
  }

  const types: ('car' | 'auto' | 'bus')[] = ['car', 'car', 'auto', 'car'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let mesh: THREE.Group;
  if (type === 'car') {
    const colors = [0x38bdf8, 0xffffff, 0xef4444, 0x94a3b8, 0x10b981];
    mesh = createPassengerCar(colors[Math.floor(Math.random() * colors.length)]);
  } else {
    mesh = createAutoRickshaw();
  }

  mesh.position.set(lanes[startLane], 0, 75);
  scene.add(mesh);

  pool.push({
    mesh,
    lane: startLane,
    speed: 18 + Math.random() * 10,
    posZ: 75,
    type,
    targetLane
  });
}

function updateVehicles(pool: any[], delta: number, lightPhase: string, level: string) {
  const lanes = [8.5, 3.5, -3.5, -8.5];

  for (let i = pool.length - 1; i >= 0; i--) {
    const v = pool[i];

    // Check stop line deceleration if red
    const isApproachingRed = lightPhase === 'red' && v.posZ > -35 && v.posZ < -15;

    // Lateral merging maneuver if right lane is encroached
    if (v.lane === 0 && v.targetLane === 1 && level !== 'none') {
      const currentX = v.mesh.position.x;
      const targetX = lanes[1];
      v.mesh.position.x += (targetX - currentX) * delta * 1.5;
      v.mesh.rotation.y = -0.15; // steering angle
    } else {
      v.mesh.rotation.y = 0;
    }

    // Forward motion
    let currentSpeed = v.speed;
    if (isApproachingRed) {
      currentSpeed = Math.max(0, currentSpeed - delta * 35);
    }

    v.posZ -= currentSpeed * delta;
    v.mesh.position.z = v.posZ;

    // Despawn off-screen
    if (v.posZ < -80) {
      v.mesh.parent?.remove(v.mesh);
      pool.splice(i, 1);
    }
  }
}
