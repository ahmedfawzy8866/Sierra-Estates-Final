'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const NetworkGraph = () => {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = 80;
  
  // Generate random points in a sphere-like distribution
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < particleCount; i++) {
      // Use spherical coordinates for better distribution
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * 12; // radius 12
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  // Generate lines between close points
  const lines = useMemo(() => {
    const lns = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < 4.0) { // Connect nodes closer than 4 units
          lns.push([points[i], points[j]]);
        }
      }
    }
    return lns;
  }, [points]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
      groupRef.current.rotation.z += delta * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((pos, i) => (
        <Sphere key={`node-${i}`} position={pos} args={[0.06, 16, 16]}>
          <meshBasicMaterial color="#C9A84C" transparent opacity={0.6} />
        </Sphere>
      ))}
      {lines.map((line, i) => (
        <Line 
          key={`line-${i}`}
          points={line as [THREE.Vector3, THREE.Vector3]} 
          color="#C9A84C" 
          lineWidth={1} 
          transparent 
          opacity={0.15} 
        />
      ))}
    </group>
  );
};

export default function ObsidianNetworkBg() {
  return (
    <div className="absolute inset-0 z-0 bg-[#02050A] overflow-hidden pointer-events-none">
      {/* Background radial gradient to give it an "Obsidian" depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0A1520]/40 via-[#02050A] to-[#02050A]" />
      <Canvas camera={{ position: [0, 0, 16], fov: 60 }}>
        {/* Fog perfectly matches the background color to fade out distant nodes */}
        <fog attach="fog" args={['#02050A', 8, 25]} />
        <ambientLight intensity={0.5} />
        <NetworkGraph />
      </Canvas>
    </div>
  );
}
