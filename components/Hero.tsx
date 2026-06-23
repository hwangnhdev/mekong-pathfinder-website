'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

const SCENES = [
  { title: 'Thành phố Cần Thơ 3D', huds: ['hud-city'] },
  { title: 'Mưa bắt đầu', huds: ['hud-city', 'hud-rain'] },
  { title: 'Flood Alert', huds: ['hud-city', 'hud-rain', 'hud-flood'] },
  { title: 'AI Analysis', huds: ['hud-city', 'hud-rain', 'hud-flood', 'hud-ai'] },
  { title: 'Vehicle Navigation', huds: ['hud-city', 'hud-rain', 'hud-flood', 'hud-ai'] },
];

const SCENE_DURATIONS = [4000, 7000, 7000, 8000, 18000];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [mounted, setMounted] = useState(false);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneStartTimeRef = useRef(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const rainGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const rainMatRef = useRef<THREE.PointsMaterial | null>(null);
  const routeLineRef = useRef<THREE.Mesh | null>(null);
  const vehicleMeshRef = useRef<THREE.Group | null>(null);
  const alertMarkersRef = useRef<{ dot: THREE.Mesh; ring: THREE.Mesh }[]>([]);
  const routeProgressRef = useRef(0);
  const floodPatchesRef = useRef<THREE.Mesh[]>([]);
  const currentSceneRef = useRef(0);
  const camTRef = useRef({ x: 0, y: 22, z: 18, lx: 0, ly: 0, lz: 0 });
  const camCRef = useRef({ x: 0, y: 22, z: 18, lx: 0, ly: 0, lz: 0 });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    currentSceneRef.current = currentScene;
    sceneStartTimeRef.current = performance.now();
  }, [currentScene]);

  const jumpToScene = useCallback((index: number) => {
    setCurrentScene(index);
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    resetAutoPlay();
  }, []);

  const resetAutoPlay = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    let sceneIdx = 0;
    function scheduleNext() {
      const dur = SCENE_DURATIONS[sceneIdx] || 8000;
      autoTimerRef.current = setTimeout(() => {
        sceneIdx = (sceneIdx + 1) % SCENES.length;
        setCurrentScene(sceneIdx);
        scheduleNext();
      }, dur);
    }
    scheduleNext();
  }, []);

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0xffffff, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 200);
    camera.position.set(0, 22, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0x4361ee, 1.2));
    const d1 = new THREE.DirectionalLight(0x4361ee, 1.0);
    d1.position.set(10, 20, 10);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x00b4d8, 0.5);
    d2.position.set(-10, 10, -10);
    scene.add(d2);

    const cityGroup = new THREE.Group();
    scene.add(cityGroup);
    cityGroupRef.current = cityGroup;

    cityGroup.add(new THREE.GridHelper(60, 32, 0x4361ee, 0xdbeafe));

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    for (let row = -3; row <= 3; row++) {
      for (let col = -6; col <= 6; col++) {
        const bx = col * 2.3, bz = row * 2.9;
        if (bx > -3 && bx < 3) continue;
        const h = rand(0.3, row === 0 ? 4 : 2.2);
        const w = rand(0.55, 1.05), d = rand(0.55, 1.05);
        const jx = rand(-0.25, 0.25), jz = rand(-0.25, 0.25);
        const bright = 0.3 + Math.random() * 0.3;
        const c = new THREE.Color(bright * 0.5, bright * 0.7, 1.0);
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshPhongMaterial({ color: c, emissive: c, emissiveIntensity: 0.2, transparent: true, opacity: 0.7 })
        );
        mesh.position.set(bx + jx, h / 2, bz + jz);
        cityGroup.add(mesh);
      }
    }

    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 60),
      new THREE.MeshPhongMaterial({ color: 0x4361ee, emissive: 0x2f4fd4, emissiveIntensity: 0.5, transparent: true, opacity: 0.6 })
    );
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0.02;
    cityGroup.add(river);

    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.12, 1.4),
      new THREE.MeshPhongMaterial({ color: 0x3a56d4, transparent: true, opacity: 0.8 })
    );
    bridge.position.set(0, 0.12, -2.5);
    cityGroup.add(bridge);

    const floodPositions = [[-5, 0.38, 3], [4, 0.38, -1], [-3, 0.38, -4], [7, 0.38, 5], [-7, 0.38, 1]];
    floodPositions.forEach(([x, y, z]) => {
      const p = new THREE.Mesh(
        new THREE.CircleGeometry(2.2, 24),
        new THREE.MeshPhongMaterial({ color: 0x4361ee, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      p.rotation.x = -Math.PI / 2;
      p.position.set(x, y, z);
      p.userData.isFloodPatch = true;
      scene.add(p);
      floodPatchesRef.current.push(p);
    });

    const count = 2000;
    const rainGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 65;
      pos[i * 3 + 1] = Math.random() * 32;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 65;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    rainGeoRef.current = rainGeo;

    const rainMat = new THREE.PointsMaterial({ color: 0x4361ee, size: 0.08, transparent: true, opacity: 0 });
    rainMatRef.current = rainMat;
    scene.add(new THREE.Points(rainGeo, rainMat));

    const alertPositions = [[-5, 0.6, 3], [4, 0.6, -1], [-3, 0.6, -4], [7, 0.6, 5], [-7, 0.6, 1]];
    alertPositions.forEach(([x, y, z]) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xef233c, transparent: true, opacity: 0 })
      );
      dot.position.set(x, y, z);
      scene.add(dot);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.35, 0.55, 20),
        new THREE.MeshBasicMaterial({ color: 0xef233c, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, y + 0.01, z);
      scene.add(ring);

      alertMarkersRef.current.push({ dot, ring });
    });

    const pts = [
      new THREE.Vector3(-13, 0.55, 7),
      new THREE.Vector3(-9, 0.55, 5),
      new THREE.Vector3(-6, 0.55, 2),
      new THREE.Vector3(-2, 0.55, 0.5),
      new THREE.Vector3(1.5, 0.55, -2.5),
      new THREE.Vector3(5, 0.55, -4),
      new THREE.Vector3(8, 0.55, -2.5),
      new THREE.Vector3(12, 0.55, -0.5),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);

    const routeLine = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 64, 0.12, 8, false),
      new THREE.MeshBasicMaterial({ color: 0x2dc653, transparent: true, opacity: 0 })
    );
    routeLine.userData.curve = curve;
    scene.add(routeLine);
    routeLineRef.current = routeLine;

    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.26, 0.4),
      new THREE.MeshPhongMaterial({ color: 0x4361ee, emissive: 0x2f4fd4, emissiveIntensity: 0.5 })
    );
    body.position.set(0, 0, 0);
    g.add(body);
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.22, 0.36),
      new THREE.MeshPhongMaterial({ color: 0x00b4d8, emissive: 0x006688, emissiveIntensity: 0.5 })
    );
    cab.position.set(0, 0.22, 0.2);
    g.add(cab);
    g.position.set(-13, 0.68, 7);
    g.visible = false;
    scene.add(g);
    vehicleMeshRef.current = g;

    function animate() {
      requestAnimationFrame(animate);
      const t = performance.now() / 1000;
      const sc = currentSceneRef.current;

      if (rainMatRef.current && rainGeoRef.current) {
        if (sc >= 1) {
          rainMatRef.current.opacity = lerp(rainMatRef.current.opacity, 0.6, 0.02);
          const p = rainGeoRef.current.attributes.position.array as Float32Array;
          for (let i = 0; i < p.length; i += 3) {
            p[i + 1] -= 0.2 + (i % 7) * 0.008;
            if (p[i + 1] < -2) p[i + 1] = 30;
          }
          rainGeoRef.current.attributes.position.needsUpdate = true;
        } else {
          rainMatRef.current.opacity = lerp(rainMatRef.current.opacity, 0, 0.03);
        }
      }

      floodPatchesRef.current.forEach((p) => {
        const mat = p.material as THREE.MeshPhongMaterial;
        mat.opacity = lerp(mat.opacity, sc >= 1 ? 0.45 : 0, 0.02);
      });

      alertMarkersRef.current.forEach((m, i) => {
        const at = sc >= 2 ? 1 : 0;
        const dotMat = m.dot.material as THREE.MeshBasicMaterial;
        const ringMat = m.ring.material as THREE.MeshBasicMaterial;
        dotMat.opacity = lerp(dotMat.opacity, at, 0.05);
        ringMat.opacity = lerp(ringMat.opacity, at * 0.5, 0.05);
        if (sc >= 2) {
          const p2 = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.3);
          m.dot.scale.setScalar(1 + p2 * 0.6);
          m.ring.scale.setScalar(1 + p2 * 0.8);
        }
      });

      if (routeLineRef.current) {
        const rt = sc >= 3 ? 1 : 0;
        const routeMat = routeLineRef.current.material as THREE.MeshBasicMaterial;
        routeMat.opacity = lerp(routeMat.opacity, rt, 0.03);
      }

      if (vehicleMeshRef.current && routeLineRef.current) {
        if (sc >= 4) {
          vehicleMeshRef.current.visible = true;
          routeProgressRef.current += 0.001;
          if (routeProgressRef.current > 1) routeProgressRef.current = 0;
          const curve = routeLineRef.current.userData.curve as THREE.CatmullRomCurve3;
          if (curve) {
            const pt = curve.getPoint(routeProgressRef.current);
            vehicleMeshRef.current.position.lerp(pt, 0.08);
            vehicleMeshRef.current.position.y = 0.68;
            const tangent = curve.getTangent(routeProgressRef.current);
            const angle = Math.atan2(tangent.x, tangent.z);
            vehicleMeshRef.current.rotation.y = angle;
          }
        } else {
          vehicleMeshRef.current.visible = false;
          routeProgressRef.current = 0;
        }
      }

      if (sc === 0) camTRef.current = { x: 0, y: 22, z: 18, lx: 0, ly: 0, lz: 0 };
      else if (sc === 1) camTRef.current = { x: 2, y: 17, z: 15, lx: 0, ly: 0, lz: 0 };
      else if (sc === 2) camTRef.current = { x: -1, y: 14, z: 13, lx: 0, ly: 0.5, lz: 0 };
      else if (sc === 3) camTRef.current = { x: 0, y: 11, z: 11, lx: 0, ly: 0.5, lz: 0 };
      else if (sc === 4 && vehicleMeshRef.current?.visible) {
        const vp = vehicleMeshRef.current.position;
        camTRef.current = { x: vp.x - 5, y: 5.5, z: vp.z + 6, lx: vp.x, ly: vp.y, lz: vp.z };
      }

      const ls = 0.018;
      camCRef.current.x = lerp(camCRef.current.x, camTRef.current.x, ls);
      camCRef.current.y = lerp(camCRef.current.y, camTRef.current.y, ls);
      camCRef.current.z = lerp(camCRef.current.z, camTRef.current.z, ls);
      camCRef.current.lx = lerp(camCRef.current.lx, camTRef.current.lx, ls);
      camCRef.current.ly = lerp(camCRef.current.ly, camTRef.current.ly, ls);
      camCRef.current.lz = lerp(camCRef.current.lz, camTRef.current.lz, ls);

      camera.position.set(camCRef.current.x, camCRef.current.y, camCRef.current.z);
      camera.lookAt(camCRef.current.lx, camCRef.current.ly, camCRef.current.lz);

      if (sc === 0 && cityGroupRef.current) {
        cityGroupRef.current.rotation.y = Math.sin(t * 0.07) * 0.05;
      }

      renderer.render(scene, camera);
    }

    animate();

    function onResize() {
      const canvasEl = canvasRef.current;
      if (!canvasEl || !cameraRef.current || !rendererRef.current) return;
      const w = canvasEl.clientWidth;
      const h = canvasEl.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (renderer) renderer.dispose();
    };
  }, []);

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [resetAutoPlay]);

  return (
    <section id="hero">
      {!mounted && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-sm text-muted-foreground">Đang tải 3D...</div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} id="hero-canvas" />

      <div className="status-hud">
        <div id="hud-city" className="hud-card" style={{ opacity: SCENES[currentScene].huds.includes('hud-city') ? 1 : 0 }}>
          <div className="hud-dot green" />
          <div>
            <div className="hud-text">Cần Thơ City</div>
            <div className="hud-sub">3D model loaded</div>
          </div>
        </div>
        <div id="hud-rain" className="hud-card" style={{ opacity: SCENES[currentScene].huds.includes('hud-rain') ? 1 : 0 }}>
          <div className="hud-dot blue" />
          <div>
            <div className="hud-text">Lượng mưa: 87mm/h</div>
            <div className="hud-sub">Cảnh báo mức 2</div>
          </div>
        </div>
        <div id="hud-flood" className="hud-card" style={{ opacity: SCENES[currentScene].huds.includes('hud-flood') ? 1 : 0 }}>
          <div className="hud-dot red" />
          <div>
            <div className="hud-text">5 điểm ngập phát hiện</div>
            <div className="hud-sub">Flood alert active</div>
          </div>
        </div>
        <div id="hud-ai" className="hud-card" style={{ opacity: SCENES[currentScene].huds.includes('hud-ai') ? 1 : 0 }}>
          <div className="hud-dot green" />
          <div>
            <div className="hud-text">AI route found</div>
            <div className="hud-sub">Độ tin cậy: 94%</div>
          </div>
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <div className="badge-dot" />
          Giải pháp đô thị bền vững · Cần Thơ
        </div>

        <h1 className="hero-title">
          Mekong Pathfinder<br />
          <span className="accent">bạn tìm đường,</span><br />
          chúng tôi lo lũ
        </h1>

        <p className="hero-sub">
          Phát hiện điểm ngập theo thời gian thực, cảnh báo sớm và tối ưu lộ trình bằng AI —
          giúp người dân Cần Thơ và toàn vùng Mekong di chuyển an toàn mùa mưa.
        </p>

        <div className="hero-actions">
          <Link href="#download" className="btn-primary">
            ⬇ Tải ứng dụng
          </Link>
          <Link href="#solution" className="btn-ghost">
            Xem tính năng →
          </Link>
        </div>

        <div className="scene-hud">
          <div className="scene-title-display" id="scene-title-display">
            {SCENES[currentScene].title}
          </div>
          <div className="scene-dots">
            {SCENES.map((_, idx) => (
              <button key={idx} onClick={() => jumpToScene(idx)} className={`scene-dot${idx === currentScene ? ' active' : ''}`} />
            ))}
          </div>
          <div className="scroll-hint">Cuộn xuống để khám phá</div>
        </div>
      </div>

      <div className="hero-waves">
        <svg viewBox="0 0 1440 200" className="wave-layer" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '200px', bottom: '0px' }}>
          <path fill="#4361ee" opacity="0.9">
            <animate attributeName="d" dur="5.5s" repeatCount="indefinite" values="M0,50 C360,120 720,20 1080,80 C1260,110 1380,50 1440,60 L1440,200 L0,200Z; M0,70 C280,20 560,90 840,50 C1080,20 1300,80 1440,40 L1440,200 L0,200Z; M0,50 C360,120 720,20 1080,80 C1260,110 1380,50 1440,60 L1440,200 L0,200Z" />
          </path>
        </svg>
        <svg viewBox="0 0 1440 200" className="wave-layer" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '200px', bottom: '0px' }}>
          <path fill="#3a56d4" opacity="0.85">
            <animate attributeName="d" dur="7s" repeatCount="indefinite" values="M0,80 C300,140 600,40 900,100 C1100,140 1280,70 1440,90 L1440,200 L0,200Z; M0,110 C250,60 500,130 750,80 C1000,40 1250,110 1440,70 L1440,200 L0,200Z; M0,80 C300,140 600,40 900,100 C1100,140 1280,70 1440,90 L1440,200 L0,200Z" />
          </path>
        </svg>
        <svg viewBox="0 0 1440 200" className="wave-layer" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '200px', bottom: '0px' }}>
          <path fill="#2f4fd4" opacity="0.9">
            <animate attributeName="d" dur="9s" repeatCount="indefinite" values="M0,120 C200,80 400,160 600,120 C800,80 1000,140 1200,100 C1320,80 1400,110 1440,100 L1440,200 L0,200Z; M0,100 C200,140 400,80 600,120 C800,160 1000,90 1200,130 C1320,150 1400,110 1440,120 L1440,200 L0,200Z; M0,120 C200,80 400,160 600,120 C800,80 1000,140 1200,100 C1320,80 1400,110 1440,100 L1440,200 L0,200Z" />
          </path>
        </svg>
      </div>
    </section>
  );
}