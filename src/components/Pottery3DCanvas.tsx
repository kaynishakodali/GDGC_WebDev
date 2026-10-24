import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Pottery3DCanvasProps {
  itemId: string; // 'i-01' to 'i-05'
  glazeId?: string; // 'g-01' to 'g-06'
  size?: number;
  interactive?: boolean;
}

// Earthy glaze color mapping according to prompt specifications
export const GLAZE_COLORS: Record<string, string> = {
  'g-01': '#9C4A32', // Kumkum Red -> muted brick / burnt sienna
  'g-02': '#C9962E', // Haldi Yellow -> ochre
  'g-03': '#6B7A3A', // Mehendi Green -> olive
  'g-04': '#3F4F73', // Indigo Blue -> muted slate indigo
  'g-05': '#CBB08A', // Sandalwood Beige -> warm sand
  'g-06': '#2E2B28'  // Charcoal Black -> warm charcoal
};

// Procedural carving texture generator
function createCarvingTexture(itemId: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080'; // Neutral 50% gray
  ctx.fillRect(0, 0, 512, 512);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff'; // High relief
  ctx.fillStyle = '#ffffff';

  if (itemId === 'i-01') {
    // Kulhad: zigzag and dotted bands
    for (let y = 100; y <= 400; y += 75) {
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 32) {
        ctx.lineTo(x, y + ((x / 32) % 2 === 0 ? -14 : 14));
      }
      ctx.stroke();

      // Dotted band
      for (let x = 16; x < 512; x += 32) {
        ctx.beginPath();
        ctx.arc(x, y + 36, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (itemId === 'i-02') {
    // Surahi: fine neck rings and paisley motifs
    // Neck rings
    for (let y = 40; y <= 160; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    // Paisley/mango motifs on belly
    for (let x = 40; x < 512; x += 90) {
      ctx.beginPath();
      ctx.arc(x, 320, 26, 0, Math.PI);
      ctx.bezierCurveTo(x + 30, 260, x, 230, x - 10, 220);
      ctx.stroke();
    }
  } else if (itemId === 'i-03') {
    // Matka: diamond lattice with petal band
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 180);
      ctx.lineTo(x + 64, 380);
      ctx.moveTo(x + 64, 180);
      ctx.lineTo(x, 380);
      ctx.stroke();
    }
  } else if (itemId === 'i-04') {
    // Diya: radiating petals and dotted rim
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 200);
      ctx.lineTo(x + 16, 260);
      ctx.lineTo(x + 32, 200);
      ctx.stroke();
    }
  } else {
    // Gamla: vertical fluting with medallions
    for (let x = 0; x < 512; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x, 420);
      ctx.stroke();

      // Lotus medallion
      if (x % 80 === 0) {
        ctx.beginPath();
        ctx.arc(x, 250, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

// Distinct wheel-thrown profiles shared by the configurator and galaxy gallery.
export function getPotteryPoints(itemId: string): THREE.Vector2[] {
  const profiles: Record<string, number[][]> = {
    // Tapered tea cup with a broad mouth.
    'i-01': [[0,0.08],[0.42,0.08],[0.52,0.16],[0.78,1.48],[0.83,1.62],[0.76,1.67],[0.68,1.58],[0.45,0.30],[0,0.30]],
    // Tall surahi with a full belly and long, narrow neck.
    'i-02': [[0,0.08],[0.42,0.08],[0.58,0.18],[0.95,0.68],[1.16,1.24],[1.10,1.68],[0.85,2.02],[0.46,2.26],[0.38,2.80],[0.49,2.86],[0.48,2.98],[0.32,2.98],[0.30,2.78],[0.36,2.20],[0.72,1.92],[0.94,1.62],[0.96,1.25],[0.78,0.80],[0.40,0.26],[0,0.22]],
    // Round storage matka with a short mouth and defined shoulder.
    'i-03': [[0,0.08],[0.55,0.08],[0.85,0.26],[1.18,0.72],[1.34,1.28],[1.26,1.78],[0.96,2.14],[0.58,2.34],[0.48,2.32],[0.47,2.46],[0.60,2.48],[0.60,2.60],[0.40,2.60],[0.39,2.30],[0.82,2.02],[1.12,1.70],[1.20,1.30],[1.04,0.78],[0.72,0.34],[0.40,0.25],[0,0.25]],
    // Shallow diya bowl with a gently flared lip; flame is added separately.
    'i-04': [[0,0.06],[0.42,0.06],[0.84,0.12],[1.20,0.32],[1.42,0.55],[1.38,0.62],[1.24,0.58],[1.08,0.40],[0.78,0.25],[0.40,0.20],[0,0.20]],
    // Wide-mouthed planter with a tapered foot and thick rolled rim.
    'i-05': [[0,0.08],[0.62,0.08],[0.76,0.18],[0.94,1.02],[1.16,1.95],[1.23,2.12],[1.40,2.12],[1.42,2.28],[1.12,2.28],[1.07,2.12],[0.94,1.96],[0.74,1.04],[0.58,0.28],[0,0.28]]
  };
  return (profiles[itemId] || profiles['i-01']).map(([radius, height]) => new THREE.Vector2(radius, height));
}

export const Pottery3DCanvas: React.FC<Pottery3DCanvasProps> = ({
  itemId,
  glazeId = 'g-01',
  size = 320,
  interactive = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 2.4, 6.2);
    camera.lookAt(0, 1.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.6);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    warmKeyLight.position.set(4, 6, 4);
    warmKeyLight.castShadow = true;
    scene.add(warmKeyLight);

    const rimLight = new THREE.DirectionalLight(0x9be7ff, 1.0);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Group
    const potteryGroup = new THREE.Group();
    scene.add(potteryGroup);

    // Carved Pottery Mesh
    const points = getPotteryPoints(itemId);
    const geometry = new THREE.LatheGeometry(points, 72);
    geometry.computeVertexNormals();

    const bumpTexture = createCarvingTexture(itemId);
    const glazeColorHex = GLAZE_COLORS[glazeId] || '#9C4A32';

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(glazeColorHex),
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.25,
      clearcoatRoughness: 0.3,
      bumpMap: bumpTexture,
      bumpScale: 0.06
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    potteryGroup.add(mesh);

    // Flame for Diya
    let flameLight: THREE.PointLight | null = null;
    if (itemId === 'i-04') {
      const flameGeo = new THREE.ConeGeometry(0.14, 0.4, 16);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMesh.position.set(0, 0.8, 0);
      potteryGroup.add(flameMesh);

      flameLight = new THREE.PointLight(0xffaa44, 1.2, 4);
      flameLight.position.set(0, 0.9, 0);
      scene.add(flameLight);
    }

    // Shadow catcher / ground ring
    const groundGeo = new THREE.RingGeometry(0.1, 2.2, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x080a17,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // Drag rotation
    let isMouseDown = false;
    let prevMouseX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isMouseDown = true;
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseX = clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isMouseDown || !interactive) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      potteryGroup.rotation.y += deltaX * 0.01;
      prevMouseX = clientX;
    };

    const onPointerUp = () => {
      isMouseDown = false;
      setIsDragging(false);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isMouseDown) {
        potteryGroup.rotation.y += 0.008; // Gentle turn
      }
      if (flameLight) {
        flameLight.intensity = 1.0 + Math.sin(Date.now() * 0.01) * 0.2;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      geometry.dispose();
      bumpTexture.dispose();
      material.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [itemId, glazeId, size, interactive]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`relative mx-auto flex items-center justify-center ${
        interactive ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    />
  );
};
