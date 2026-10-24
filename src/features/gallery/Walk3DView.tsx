import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Painting, PotteryItem, Glaze, User } from '../../api/types';
import { formatINR } from '../../demo-data/store';
import { getPotteryPoints, GLAZE_COLORS } from '../../components/Pottery3DCanvas';
import { ItemDetailModal } from '../../components/ItemDetailModal';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Grid,
  RotateCcw,
  ZoomIn,
  MousePointer,
  Sparkles,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface Walk3DViewProps {
  paintings: Painting[];
  potteryItems: PotteryItem[];
  glazes: Glaze[];
  muralRate: number;
  user: User | null;
  onRefresh: () => void;
  onSwitchToBrowse: () => void;
}

export const Walk3DView: React.FC<Walk3DViewProps> = ({
  paintings,
  potteryItems,
  glazes,
  muralRate,
  user,
  onRefresh,
  onSwitchToBrowse
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<'paintings' | 'pottery'>('paintings');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeArtwork, setActiveArtwork] = useState<Painting | null>(null);
  useEffect(() => setActiveArtwork(null), [activeSection]);
  const [selectedModalPainting, setSelectedModalPainting] = useState<Painting | null>(null);
  const [selectedModalPottery, setSelectedModalPottery] = useState<PotteryItem | null>(null);
  const [modalType, setModalType] = useState<'painting' | 'pottery'>('painting');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // References for Three.js state
  const stateRef = useRef({
    cameraAngle: 0,
    cameraTargetAngle: 0,
    cameraRadius: 16,
    targetRadius: 16,
    isDragging: false,
    prevX: 0,
    prevY: 0,
    autoRotateSpeed: 0.002,
    lastInteraction: Date.now(),
    autoRotateEnabled: true
  });

  stateRef.current.autoRotateEnabled = autoRotate && !isModalOpen;

  // Open modal handler
  const handleOpenPainting = useCallback((p: Painting) => {
    setSelectedModalPainting(p);
    setModalType('painting');
    setIsModalOpen(true);
  }, []);

  const handleOpenPottery = useCallback((pot: PotteryItem) => {
    setSelectedModalPottery(pot);
    setModalType('pottery');
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. SCENE SETUP ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x28201c);
    scene.fog = new THREE.FogExp2(0x28201c, 0.025);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 3.0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. LIGHTING ──
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.35);
    scene.add(ambientLight);

    const centerPointLight = new THREE.PointLight(0xf4a900, 0.9, 25);
    centerPointLight.position.set(0, 4, 0);
    scene.add(centerPointLight);

    // ── 3. GLOSSY REFLECTIVE FLOOR ──
    // Glossy dark mirror-like ground fading to black
    const floorGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x28201c,
      roughness: 0.15,
      metalness: 0.85
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.05;
    scene.add(floorMesh);

    // Secondary subtle glossy mirror illusion ring
    const innerRingGeo = new THREE.RingGeometry(0.5, 18, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x273469,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.01;
    scene.add(innerRing);

    // ── 4. STARRY GALAXY AMBIANCE ──
    const starCount = 380;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 25 + Math.random() * 30;

      starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(rad * Math.cos(phi)) + 1; // Above ground
      starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);

      // Marigold / warm ivory / peacock stars
      const colorType = Math.random();
      if (colorType > 0.6) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.66; starColors[i * 3 + 2] = 0.0; // Marigold
      } else if (colorType > 0.3) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.93; starColors[i * 3 + 2] = 0.82; // Warm ivory
      } else {
        starColors[i * 3] = 0.03; starColors[i * 3 + 1] = 0.55; starColors[i * 3 + 2] = 0.61; // Peacock
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // ── 5. CONSTELLATIONS ──
    const paintingsGroup = new THREE.Group();
    const potteryGroup = new THREE.Group();
    scene.add(paintingsGroup);
    scene.add(potteryGroup);

    // Section 1: Paintings Ring (all 12 paintings with true aspect ratios)
    const textureLoader = new THREE.TextureLoader();
    const ringRadius = 8.5;
    const paintingMeshes: { mesh: THREE.Mesh; data: Painting; angle: number }[] = [];

    paintings.forEach((p, idx) => {
      const angle = (idx / paintings.length) * Math.PI * 2;
      const x = Math.sin(angle) * ringRadius;
      const z = Math.cos(angle) * ringRadius;

      // Realistic frame with exact aspect ratio
      const aspectMap: Record<string, number> = {
        'p-001': 1.47, 'p-002': 1.50, 'p-003': 0.68, 'p-004': 0.64,
        'p-005': 1.38, 'p-006': 1.32, 'p-007': 1.50, 'p-008': 1.42,
        'p-009': 1.48, 'p-010': 1.33, 'p-011': 0.66, 'p-012': 1.50
      };
      const ratio = aspectMap[p.id] || 1.4;

      const baseHeight = 2.4;
      const width = baseHeight * ratio;

      // Canvas Frame Mesh
      const frameGeo = new THREE.BoxGeometry(width, baseHeight, 0.08);

      // Texture
      const tex = textureLoader.load(p.imageUrl);
      tex.colorSpace = THREE.SRGBColorSpace;

      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x273469 }), // Right
        new THREE.MeshStandardMaterial({ color: 0x273469 }), // Left
        new THREE.MeshStandardMaterial({ color: 0x273469 }), // Top
        new THREE.MeshStandardMaterial({ color: 0x273469 }), // Bottom
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.3,
          color: p.status === 'sold' ? 0x999999 : 0xffffff
        }), // Front
        new THREE.MeshStandardMaterial({ color: 0x28201c })  // Back
      ];

      const mesh = new THREE.Mesh(frameGeo, materials);
      mesh.position.set(x, 2.2 + (idx % 2 === 0 ? 0.15 : -0.15), z);
      mesh.lookAt(0, 2.2, 0); // Face inward to center
      mesh.userData = { painting: p, type: 'painting' };

      // Glowing edge accent
      const edgeGeo = new THREE.EdgesGeometry(frameGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: p.status === 'sold' ? 0xff5c5c : 0xf4a900,
        transparent: true,
        opacity: p.status === 'sold' ? 0.3 : 0.6
      });
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
      mesh.add(edgeLines);

      // Dedicated spotlight on each artwork
      const spot = new THREE.SpotLight(0xfff5ea, 1.4, 8, Math.PI / 4, 0.4);
      spot.position.set(x * 0.7, 4.2, z * 0.7);
      spot.target = mesh;
      paintingsGroup.add(spot);

      // Reflection mirror mesh below the glossy floor for true reflection illusion
      const refMesh = new THREE.Mesh(frameGeo, materials);
      refMesh.position.set(x, -2.2, z);
      refMesh.scale.y = -1; // Invert
      refMesh.lookAt(0, -2.2, 0);
      materials[4].transparent = true;
      refMesh.material = materials.map(m => {
        const cloned = m.clone();
        cloned.transparent = true;
        cloned.opacity = 0.28;
        return cloned;
      });
      paintingsGroup.add(refMesh);

      paintingsGroup.add(mesh);
      paintingMeshes.push({ mesh, data: p, angle });
    });

    // Section 2: Pottery Constellation
    const potteryMeshes: THREE.Mesh[] = [];
    potteryItems.forEach((pot, pIdx) => {
      const angle = (pIdx / potteryItems.length) * Math.PI * 2;
      const rad = 6.0;
      const px = Math.sin(angle) * rad;
      const pz = Math.cos(angle) * rad;

      // Floating Pedestal
      const plinthGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.4, 32);
      const plinthMat = new THREE.MeshStandardMaterial({
        color: 0x273469,
        roughness: 0.2,
        metalness: 0.8
      });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.set(px, 0.7, pz);

      // Base glowing ring
      const ringGeo = new THREE.RingGeometry(0.85, 1.1, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf4a900,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(px, 0.02, pz);
      potteryGroup.add(ring);

      // Pottery item model
      const potGeo = new THREE.LatheGeometry(getPotteryPoints(pot.id), 48);
      const potMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(GLAZE_COLORS['g-01']),
        roughness: 0.35,
        clearcoat: 0.3
      });
      const potMesh = new THREE.Mesh(potGeo, potMat);
      const modelScales: Record<string, number> = { 'i-01': 1.15, 'i-02': 0.88, 'i-03': 1.0, 'i-04': 1.45, 'i-05': 1.05 };
      potMesh.scale.setScalar(modelScales[pot.id] ?? 1);
      potMesh.position.set(px, 1.4, pz);
      potMesh.userData = { pottery: pot, type: 'pottery' };

      // Floating billboard text canvas
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 384;
      textCanvas.height = 96;
      const tCtx = textCanvas.getContext('2d')!;
      tCtx.fillStyle = 'rgba(7, 6, 13, 0.85)';
      tCtx.roundRect(4, 4, 376, 88, 20);
      tCtx.fill();
      tCtx.strokeStyle = 'rgba(155, 231, 255, 0.4)';
      tCtx.lineWidth = 2;
      tCtx.stroke();
      tCtx.fillStyle = '#ffffff';
      tCtx.font = 'bold 24px Fraunces, serif';
      tCtx.textAlign = 'center';
      tCtx.fillText(pot.name, 192, 54);

      const textTex = new THREE.CanvasTexture(textCanvas);
      const labelMat = new THREE.SpriteMaterial({ map: textTex, transparent: true });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.position.set(px, 5.05, pz);
      labelSprite.scale.set(2.9, 0.72, 1);
      labelMat.depthTest = false;
      labelMat.depthWrite = false;
      labelSprite.renderOrder = 10;
      potteryGroup.add(labelSprite);

      potteryGroup.add(plinth);
      potteryGroup.add(potMesh);
      potteryMeshes.push(potMesh);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.lastInteraction = Date.now();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      stateRef.current.prevX = clientX;
      stateRef.current.prevY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (stateRef.current.isDragging) {
        stateRef.current.lastInteraction = Date.now();
        const deltaX = clientX - stateRef.current.prevX;
        stateRef.current.cameraTargetAngle -= deltaX * 0.005;
        stateRef.current.prevX = clientX;
        stateRef.current.prevY = clientY;
      }

      // Raycast for hover nameplate
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (activeSection === 'paintings') {
        const intersects = raycaster.intersectObjects(paintingMeshes.map(({ mesh }) => mesh), false);
        if (intersects.length > 0) setActiveArtwork(intersects[0].object.userData.painting as Painting);
      } else {
        setActiveArtwork(null);
      }
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.lastInteraction = Date.now();
      stateRef.current.targetRadius = Math.max(
        4.5,
        Math.min(22.0, stateRef.current.targetRadius + e.deltaY * 0.008)
      );
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (activeSection === 'paintings') {
        const hitPaintings = raycaster.intersectObjects(paintingMeshes.map(({ mesh }) => mesh), false);
        const p = hitPaintings[0]?.object.userData.painting as Painting | undefined;
        if (p) handleOpenPainting(p);
      } else if (activeSection === 'pottery') {
        const hitPottery = raycaster.intersectObjects(potteryMeshes, false);
        const pot = hitPottery[0]?.object.userData.pottery as PotteryItem | undefined;
        if (pot) handleOpenPottery(pot);
      }
    };

    // Keyboard support: Left/Right rotate, +/- zoom, Enter opens
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        stateRef.current.cameraTargetAngle += 0.15;
      } else if (e.key === 'ArrowRight') {
        stateRef.current.cameraTargetAngle -= 0.15;
      } else if (e.key === '+' || e.key === '=') {
        stateRef.current.targetRadius = Math.max(4.5, stateRef.current.targetRadius - 1);
      } else if (e.key === '-' || e.key === '_') {
        stateRef.current.targetRadius = Math.min(22, stateRef.current.targetRadius + 1);
      } else if (e.key === 'Enter' && activeArtwork) {
        handleOpenPainting(activeArtwork);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Resize handling
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── 7. ANIMATION LOOP ──
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Auto-rotation after idle
      const isIdle = Date.now() - stateRef.current.lastInteraction > 2500;
      if (stateRef.current.autoRotateEnabled && isIdle && !stateRef.current.isDragging) {
        stateRef.current.cameraTargetAngle -= stateRef.current.autoRotateSpeed;
      }

      // Smooth damping lerp for angle and zoom
      stateRef.current.cameraAngle +=
        (stateRef.current.cameraTargetAngle - stateRef.current.cameraAngle) * 0.08;
      stateRef.current.cameraRadius +=
        (stateRef.current.targetRadius - stateRef.current.cameraRadius) * 0.08;

      const angle = stateRef.current.cameraAngle;
      const radius = stateRef.current.cameraRadius;

      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = 1.9 + (radius - 8.5) * 0.15;
      camera.lookAt(0, 2.0, 0);

      // Star drift
      starPoints.rotation.y += 0.0003;

      // Rotate pottery plinths
      potteryGroup.rotation.y += 0.002;

      // Visibility toggles based on active section
      paintingsGroup.visible = activeSection === 'paintings';
      potteryGroup.visible = activeSection === 'pottery';

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      container.innerHTML = '';
    };
  }, [paintings, potteryItems, activeSection, muralRate, handleOpenPainting, handleOpenPottery]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#28201C] text-[#FFF5E6] select-none">
      {/* ── Three.js Canvas Container ── */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── Top-Right: 3D / Browse Switch Pill ── */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-2">
        <div className="flex items-center p-1 rounded-full bg-[#273469]/80 backdrop-blur-xl border border-white/10 shadow-xl">
          <button
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F4A900] text-[#28201C] shadow-sm flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Gallery</span>
          </button>
          <button
            onClick={onSwitchToBrowse}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[#E3D0BE] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Browse Grid</span>
          </button>
        </div>
      </div>

      {/* ── Bottom-Left: Target Controls Card (Exact match to galaxy-gallery-target.png) ── */}
      <div className="absolute bottom-6 left-6 z-40 hidden sm:flex flex-col gap-2 p-4 rounded-[22px] bg-[#273469]/75 backdrop-blur-2xl border border-white/10 text-xs shadow-2xl min-w-[190px]">
        <div className="flex items-center gap-1.5 font-mono-hud text-[11px] text-[#F4A900] uppercase tracking-wider font-semibold pb-1.5 border-b border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Controls</span>
        </div>
        <div className="space-y-2 pt-1 font-sans-ui text-[12px]">
          <div className="flex items-center gap-2 text-[#FFF5E6]">
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/10">
              <RotateCcw className="w-3.5 h-3.5 text-[#F4A900]" />
            </span>
            <div>
              <div className="font-medium">Rotate</div>
              <div className="text-[10px] text-[#E3D0BE]">Drag / Swipe</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#FFF5E6]">
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/10">
              <ZoomIn className="w-3.5 h-3.5 text-[#087E8B]" />
            </span>
            <div>
              <div className="font-medium">Zoom</div>
              <div className="text-[10px] text-[#E3D0BE]">Scroll / Pinch</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#FFF5E6]">
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/10">
              <MousePointer className="w-3.5 h-3.5 text-[#477A45]" />
            </span>
            <div>
              <div className="font-medium">Inspect</div>
              <div className="text-[10px] text-[#E3D0BE]">Click / Tap Art</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom-Center: Section Switcher & Focused Nameplate ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-full max-w-md px-4">
        {/* Focused Artwork Nameplate (when looking at paintings) */}
        {activeSection === 'paintings' && activeArtwork && (
          <div
            onClick={() => handleOpenPainting(activeArtwork)}
            className="w-full p-3.5 rounded-2xl bg-[#273469]/85 backdrop-blur-xl border border-white/15 shadow-2xl flex items-center justify-between gap-3 cursor-pointer group hover:border-[#F4A900] transition-all"
          >
            <div className="min-w-0">
              <h4 className="font-display font-light text-sm text-white truncate group-hover:text-[#F4A900] transition-colors">
                {activeArtwork.title}
              </h4>
              <p className="text-[11px] text-[#E3D0BE] truncate">
                {activeArtwork.artist} • <span className="font-mono-hud text-[#087E8B] font-semibold">{formatINR(activeArtwork.price)}</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#F4A900] text-[#28201C] text-[11px] font-bold tracking-wide flex items-center gap-1 flex-shrink-0 shadow-md">
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* Bottom Section Switcher: Paintings | Pottery */}
        <div className="flex items-center p-1 rounded-full bg-[#273469]/90 backdrop-blur-2xl border border-white/15 shadow-2xl">
          <button
            onClick={() => setActiveSection('paintings')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'paintings'
                ? 'bg-[#F4A900] text-[#28201C] shadow-md'
                : 'text-[#E3D0BE] hover:text-white'
            }`}
          >
            Paintings Ring
          </button>
          <button
            onClick={() => setActiveSection('pottery')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'pottery'
                ? 'bg-[#F4A900] text-[#28201C] shadow-md'
                : 'text-[#E3D0BE] hover:text-white'
            }`}
          >
            Pottery Atelier
          </button>
        </div>
      </div>

      {/* ── Bottom-Right: Target Auto-Rotate Toggle (Match to screenshot) ── */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-3">
        <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#273469]/75 backdrop-blur-2xl border border-white/10 text-xs text-[#FFF5E6] font-medium shadow-2xl cursor-pointer">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
            className="w-4 h-4 accent-[#F4A900] rounded cursor-pointer"
          />
          <span>Auto-Rotate</span>
        </label>
      </div>

      {/* ── Shared ItemDetailModal Pop-Up ── */}
      <ItemDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        painting={selectedModalPainting}
        pottery={selectedModalPottery}
        glazes={glazes}
        allPaintings={paintings}
        allPottery={potteryItems}
        onSelectPainting={setSelectedModalPainting}
        onSelectPottery={setSelectedModalPottery}
        user={user}
        onPaintingBought={onRefresh}
      />
    </div>
  );
};
