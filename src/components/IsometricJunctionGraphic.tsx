import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const IsometricJunctionGraphic: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = null; // transparent to blend with dark page background

    // 2. Camera: Isometric Perspective
    const aspect = width / height;
    const d = 14;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(24, 26, 24);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xF5A623, 1.2);
    dirLight.position.set(20, 35, 15);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38BDF8, 0.6);
    fillLight.position.set(-20, 20, -15);
    scene.add(fillLight);

    // 5. Road Ground Surface
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Main road slab (Asphalt dark slate)
    const roadGeo = new THREE.BoxGeometry(12, 0.4, 28);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x11161F, roughness: 0.8 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.y = -0.2;
    roadGroup.add(roadMesh);

    // Sidewalk kerbs
    const kerbMat = new THREE.MeshStandardMaterial({ color: 0x1E2632, roughness: 0.6 });
    const leftKerb = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 28), kerbMat);
    leftKerb.position.set(-7, -0.1, 0);
    roadGroup.add(leftKerb);

    const rightKerb = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 28), kerbMat);
    rightKerb.position.set(7, -0.1, 0);
    roadGroup.add(rightKerb);

    // Lane divider dashed markings
    const dashMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
    for (let z = -12; z <= 12; z += 3) {
      const dash1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 1.4), dashMat);
      dash1.position.set(-2, 0.02, z);
      roadGroup.add(dash1);

      const dash2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 1.4), dashMat);
      dash2.position.set(2, 0.02, z);
      roadGroup.add(dash2);
    }

    // Stop Line
    const stopLine = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.02, 0.5), new THREE.MeshBasicMaterial({ color: 0x94A3B8 }));
    stopLine.position.set(0, 0.02, 9);
    roadGroup.add(stopLine);

    // 6. Encroached Curb Zone (Left lane obstruction indicator)
    const encZoneGeo = new THREE.BoxGeometry(3.6, 0.1, 14);
    const encZoneMat = new THREE.MeshStandardMaterial({
      color: 0xF5A623,
      transparent: true,
      opacity: 0.25,
      roughness: 0.3
    });
    const encZone = new THREE.Mesh(encZoneGeo, encZoneMat);
    encZone.position.set(-4.1, 0.05, 0);
    roadGroup.add(encZone);

    // Stylized Vendor Pushcart obstacles on the curb
    const createVendorCart = (zPos: number) => {
      const cart = new THREE.Group();
      // Wooden cart base
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.6, 2),
        new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.7 })
      );
      baseMesh.position.y = 0.5;
      cart.add(baseMesh);

      // Canopy cover
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 0.7, 4),
        new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.5 })
      );
      canopy.position.y = 1.3;
      canopy.rotation.y = Math.PI / 4;
      cart.add(canopy);

      cart.position.set(-4.2, 0, zPos);
      return cart;
    };

    roadGroup.add(createVendorCart(-3));
    roadGroup.add(createVendorCart(3));

    // Stylized Double Parked Logistics Auto
    const autoGroup = new THREE.Group();
    const autoBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.9, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xEAB308, roughness: 0.4 })
    );
    autoBody.position.y = 0.6;
    autoGroup.add(autoBody);
    autoGroup.position.set(-2.6, 0, 1);
    roadGroup.add(autoGroup);

    // 7. Moving Traffic Vehicles in Open Lanes
    const vehicles: Array<{ mesh: THREE.Group; speed: number }> = [];
    const colors = [0x38BDF8, 0x2ECC71, 0xE2E8F0, 0x60A5FA];

    const createCar = (laneX: number, initZ: number, speed: number, colorHex: number) => {
      const car = new THREE.Group();
      // Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.6, 2.8),
        new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 })
      );
      body.position.y = 0.45;
      car.add(body);

      // Cabin
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.45, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.2 })
      );
      cabin.position.set(0, 0.85, -0.2);
      car.add(cabin);

      car.position.set(laneX, 0, initZ);
      scene.add(car);
      vehicles.push({ mesh: car, speed });
    };

    // Spawn 4 traffic cars in lanes 2 and 3
    createCar(1.9, -10, 0.08, colors[0]);
    createCar(4.8, -4, 0.07, colors[1]);
    createCar(1.9, 2, 0.08, colors[2]);
    createCar(4.8, 8, 0.065, colors[3]);

    // 8. Overhead Signal Gantry
    const gantryGroup = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    
    // Vertical post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5), poleMat);
    post.position.set(6.8, 2.5, 9.5);
    gantryGroup.add(post);

    // Horizontal arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 0.25), poleMat);
    arm.position.set(2, 4.8, 9.5);
    gantryGroup.add(arm);

    // Green Signal Head
    const signalBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x0F141C }));
    signalBox.position.set(2, 4.2, 9.5);
    gantryGroup.add(signalBox);

    const greenBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x2ECC71 })
    );
    greenBulb.position.set(2, 3.8, 9.7);
    gantryGroup.add(greenBulb);

    scene.add(gantryGroup);

    // Parallax mouse tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Move vehicles forward
      vehicles.forEach(v => {
        v.mesh.position.z += v.speed;
        if (v.mesh.position.z > 14) {
          v.mesh.position.z = -14;
        }
      });

      // Gentle parallax ease
      targetRotationY = mouseX * 0.25;
      targetRotationX = mouseY * 0.15;
      roadGroup.rotation.y += (targetRotationY - roadGroup.rotation.y) * 0.05;
      roadGroup.rotation.x += (targetRotationX - roadGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          const newAspect = w / h;
          camera.left = -d * newAspect;
          camera.right = d * newAspect;
          camera.top = d;
          camera.bottom = -d;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      ro.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl bg-gradient-to-b from-[#11161F] to-[#0A0E14] border border-[#222B38] overflow-hidden shadow-2xl flex flex-col justify-between p-4">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0E14]/80 border border-[#222B38] text-[11px] font-mono text-[#F5A623]">
          <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-ping" />
          <span>Curbside Encroachment Zone Identified (-38% Width)</span>
        </div>
        <div className="px-2.5 py-0.5 rounded bg-[#2ECC71]/20 border border-[#2ECC71]/30 text-[10px] font-mono text-[#2ECC71]">
          Green Wave Synchronized
        </div>
      </div>

      {/* Bottom Subtitle / Instruction */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#8B94A3] bg-[#0A0E14]/75 px-3 py-1.5 rounded-lg border border-[#1E2632] pointer-events-none">
        <span>Isometric Carriageway Approach • Anna Salai Model</span>
        <span className="hidden sm:inline text-[#64748B]">Hover / move mouse to inspect angle</span>
      </div>
    </div>
  );
};
