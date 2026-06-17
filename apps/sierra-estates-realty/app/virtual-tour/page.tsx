'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/I18nContext';
import Link from 'next/link';

declare const THREE: any;

const ROOMS = [
  {name:'Living Area', icon:'🛋️', img:'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=3200&q=85'},
  {name:'Master Suite', icon:'🛏️', img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=3200&q=85'},
  {name:'Private Garden', icon:'🌿', img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3200&q=85'},
  {name:'Pool Deck', icon:'🏊', img:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=3200&q=85'},
  {name:'Sky Terrace', icon:'🌅', img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3200&q=85'},
  {name:'Villa Exterior', icon:'🏡', img:'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=3200&q=85'}
];

export default function VirtualTourPage() {
  const { locale: _locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [activeRoom, setActiveRoom] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeState = useRef<any>({});

  useEffect(() => {
    setMounted(true);
    
    // Load Three.js
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    script.onload = initThree;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
      if (threeState.current.reqId) cancelAnimationFrame(threeState.current.reqId);
      if (threeState.current.renderer) {
        threeState.current.renderer.dispose();
      }
    };
  }, []);

  const initThree = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const scene = new THREE.Scene();
    const fov = 75;
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, 1, 2000);
    camera.position.set(0, 0, 0.001);
    
    const geo = new THREE.SphereGeometry(500, 72, 48);
    geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({map:null, side:THREE.FrontSide});
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);
    
    threeState.current = {
      renderer, scene, camera, mat,
      lon: 0, lat: 0, tLon: 0, tLat: 0,
      isDown: false, sx: 0, sy: 0, pLon: 0, pLat: 0,
      fov, texCache: {}, currentRoom: 0
    };

    const animate = () => {
      const ts = threeState.current;
      ts.reqId = requestAnimationFrame(animate);
      ts.lon += (ts.tLon - ts.lon) * 0.085;
      ts.lat += (ts.tLat - ts.lat) * 0.085;
      ts.lat = Math.max(-85, Math.min(85, ts.lat));
      const phi = THREE.MathUtils.degToRad(90 - ts.lat);
      const theta = THREE.MathUtils.degToRad(ts.lon);
      ts.camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      ts.renderer.render(ts.scene, ts.camera);
    };

    const handleResize = () => {
      const ts = threeState.current;
      ts.camera.aspect = window.innerWidth / window.innerHeight;
      ts.camera.updateProjectionMatrix();
      ts.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // Pointer Events on canvas
    canvas.addEventListener('pointerdown', (e) => {
      const ts = threeState.current;
      ts.isDown = true; ts.sx = e.clientX; ts.sy = e.clientY; ts.pLon = ts.tLon; ts.pLat = ts.tLat;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      const ts = threeState.current;
      if (!ts.isDown) return;
      ts.tLon = ts.pLon - (e.clientX - ts.sx) * 0.22;
      ts.tLat = Math.max(-85, Math.min(85, ts.pLat + (e.clientY - ts.sy) * 0.22));
    });
    canvas.addEventListener('pointerup', () => { threeState.current.isDown = false; canvas.style.cursor = 'grab'; });
    canvas.addEventListener('pointerleave', () => { threeState.current.isDown = false; canvas.style.cursor = 'grab'; });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const ts = threeState.current;
      ts.fov = Math.max(35, Math.min(105, ts.fov + e.deltaY * 0.045));
      ts.camera.fov = ts.fov; ts.camera.updateProjectionMatrix();
    }, {passive:false});

    loadRoomTex(0);
    animate();
    
    // Preload rest
    setTimeout(() => {
      const preload = new THREE.TextureLoader();
      preload.crossOrigin = 'anonymous';
      ROOMS.forEach((r, i) => {
        if (i > 0) preload.load(r.img, (tex: any) => { tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; threeState.current.texCache[i] = tex; });
      });
    }, 2000);
  };

  const loadRoomTex = (idx: number) => {
    const ts = threeState.current;
    if (!ts.mat) return;
    
    setLoading(true);
    setProgress(0);
    
    if (ts.texCache[idx]) {
      ts.mat.map = ts.texCache[idx];
      ts.mat.needsUpdate = true;
      setLoading(false);
      return;
    }

    let p = 0;
    const iv = setInterval(() => { p = Math.min(p + Math.random() * 12 + 3, 88); setProgress(p); }, 120);
    
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(ROOMS[idx].img, (tex: any) => {
      clearInterval(iv);
      setProgress(100);
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      ts.texCache[idx] = tex;
      ts.mat.map = tex;
      ts.mat.needsUpdate = true;
      setTimeout(() => setLoading(false), 350);
    });
  };

  const switchRoom = (idx: number) => {
    if (idx === activeRoom) return;
    setActiveRoom(idx);
    if (threeState.current) {
      threeState.current.tLon = 0;
      threeState.current.tLat = 0;
    }
    loadRoomTex(idx);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-[#07111E] overflow-hidden">
      
      {/* Loading Overlay */}
      <div className={`fixed inset-0 z-50 bg-[#07111E] flex flex-col items-center justify-center transition-all duration-700 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="font-se-display text-[36px] text-[var(--gold-lt)] mb-1.5">Sierra Estates</div>
        <div className="font-mono text-[9px] tracking-[0.22em] text-[rgba(233,193,118,0.45)] uppercase mb-8">Full Virtual Tour</div>
        <div className="w-[200px] h-[2px] bg-[rgba(200,150,26,0.15)] rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-lt)] transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full cursor-grab outline-none touch-none" />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 h-14 flex items-center px-5 bg-gradient-to-b from-[rgba(7,17,30,0.92)] to-transparent pointer-events-none">
        <Link href="/" className="flex items-center gap-2.5 pointer-events-auto">
          <div className="w-7 h-7 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-lt)] rounded-lg flex items-center justify-center font-se-display text-[17px] font-bold text-[var(--navy)]">S</div>
          <div className="font-mono text-[10px] font-bold tracking-[0.18em] text-[var(--gold-lt)] uppercase">Sierra Estates</div>
        </Link>
        <div className="ml-3 font-se-display text-[22px] text-white/90">
          {ROOMS[activeRoom].name}
        </div>
        <div className="ml-auto pointer-events-auto">
          <Link href="/" className="px-3.5 py-1.5 bg-white/10 border border-white/15 text-white/80 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all hover:bg-[rgba(200,150,26,0.2)] hover:border-[rgba(200,150,26,0.4)] hover:text-[var(--gold-lt)]">
            ✕ Exit
          </Link>
        </div>
      </div>

      {/* Room Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 items-center bg-[rgba(7,17,30,0.88)] backdrop-blur-md border border-[rgba(200,150,26,0.18)] rounded-full p-2 overflow-x-auto max-w-[95vw]">
        {ROOMS.map((room, i) => (
          <button
            key={i}
            onClick={() => switchRoom(i)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[11px] font-semibold transition-all whitespace-nowrap ${activeRoom === i ? 'bg-gradient-to-br from-[var(--gold)] to-[var(--gold-lt)] text-[var(--navy)]' : 'bg-transparent text-white/50 hover:bg-[rgba(200,150,26,0.1)] hover:text-[var(--gold-lt)]'}`}
          >
            <span className="text-[14px]">{room.icon}</span>
            <span className="hidden md:inline">{room.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
