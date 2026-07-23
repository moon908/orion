"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { X, Calendar, AlertTriangle, ShieldCheck, Target, Radio, Compass, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

import { useSolarStore } from '../store/useSolarStore';
import { useHorizons } from '../hooks/useHorizons';
import { ProceduralTextures } from '../utils/textures';

interface Asteroid {
  id: string;
  name: string;
  diameter: number;
  speed: number;
  missDistance: number;
  missDistanceKm: number;
  hazardous: boolean;
  jplUrl: string;
  position: THREE.Vector3;
  displaySize: number;
}

// 1. Rotating Earth Model with Cloud Overlay
function EarthModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const textures = useMemo(() => {
    if (typeof window !== 'undefined') {
      return {
        surface: ProceduralTextures.createEarthTexture(),
        clouds: ProceduralTextures.createEarthCloudsTexture(),
      };
    }
    return { surface: null, clouds: null };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.06;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.085;
      cloudsRef.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <group>
      {/* Surface Globe */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          map={textures.surface || undefined}
          color={textures.surface ? '#FFFFFF' : '#007AFF'}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Moving Atmosphere Clouds */}
      {textures.clouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.5 * 1.015, 32, 32]} />
          <meshStandardMaterial
            alphaMap={textures.clouds}
            transparent
            depthWrite={false}
            color="#FFFFFF"
            blending={THREE.AdditiveBlending}
            opacity={0.85}
          />
        </mesh>
      )}
    </group>
  );
}

// 2. Interactive Telemetry Target Reticle & Outline
function RadarReticle({ asteroid }: { asteroid: Asteroid }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.015;
      ringRef.current.lookAt(state.camera.position);
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= 0.008;
      outerRingRef.current.lookAt(state.camera.position);
    }
  });

  const size = asteroid.displaySize * 1.8;

  return (
    <group position={asteroid.position}>
      {/* Holographic Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[size * 1.25, 8, 8]} />
        <meshBasicMaterial color="#FF3B30" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Rotating Inner Segmented Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[size * 0.95, size * 1.05, 16]} />
        <meshBasicMaterial color="#FF3B30" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      {/* Rotating Outer Target Crosshair */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[size * 1.25, size * 1.35, 4]} />
        <meshBasicMaterial color="#FF3B30" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      {/* Vector path line back to Earth origin */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), asteroid.position]}
        color="#FF3B30"
        lineWidth={1.5}
        dashed
        dashScale={5}
        gapSize={0.25}
      />

      {/* Telemetry data billboard floating in 3D */}
      <Html distanceFactor={3.0} position={[0, size * 2.8, 0]} center>
        <div className="flex flex-col gap-3 px-6 py-5 rounded-[24px] bg-black/95 border border-[#FF3B30] text-white shadow-[0_20px_60px_rgba(255,59,48,0.35)] backdrop-blur-md w-80 text-base font-sans font-medium pointer-events-none select-none animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center border-b border-white/15 pb-2.5 mb-2.5">
            <span className="font-extrabold text-[#FF3B30] text-lg truncate max-w-[190px]">{asteroid.name}</span>
            {asteroid.hazardous && (
              <span className="px-2.5 py-1 rounded text-xs font-black bg-[#FF3B30] text-white animate-pulse">HAZARD</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Diameter:</span>
            <span className="text-white font-bold">{Math.round(asteroid.diameter)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Velocity:</span>
            <span className="text-white font-bold">{asteroid.speed.toFixed(1)} km/s</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2.5 mt-2.5">
            <span className="text-white/60">Miss Dist:</span>
            <span className="text-[#FF9500] font-black">{asteroid.missDistance.toFixed(1)} LD</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// 3. Render individual Asteroid meshes for 100% reliable raycasting, hover, and selection
function AsteroidsModel({
  asteroids,
  hoveredIndex,
  setHoveredIndex,
  setSelectedIndex
}: {
  asteroids: Asteroid[];
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  setSelectedIndex: (idx: number | null) => void;
}) {
  return (
    <group>
      {asteroids.map((a, i) => {
        const isHovered = hoveredIndex === i;
        return (
          <mesh
            key={a.id}
            position={a.position}
            scale={a.displaySize}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIndex(i);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHoveredIndex(null);
              document.body.style.cursor = 'default';
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(i);
            }}
          >
            <dodecahedronGeometry args={[1.0, 0]} />
            <meshStandardMaterial
              color={a.hazardous ? '#FF3B30' : isHovered ? '#007AFF' : '#8E9AA6'}
              roughness={0.9}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// 4. Main Overlay Component
export function AsteroidTracker() {
  const simDate = useSolarStore((state) => state.simDate);
  const setSimDate = useSolarStore((state) => state.setSimDate);
  const setShowAsteroidTracker = useSolarStore((state) => state.setShowAsteroidTracker);
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const setTimeSpeed = useSolarStore((state) => state.setTimeSpeed);
  const { fetchNearEarthAsteroids } = useHorizons();

  const [rawAsteroids, setRawAsteroids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Pause simulation clock on mount, restore on unmount to prevent frame-by-frame fetch storms
  useEffect(() => {
    const originalSpeed = timeSpeed;
    if (timeSpeed !== 0) {
      setTimeSpeed(0);
    }
    return () => {
      if (originalSpeed !== 0) {
        setTimeSpeed(originalSpeed);
      }
    };
  }, [setTimeSpeed]);

  // Load telemetry data from NeoWs API
  useEffect(() => {
    let active = true;
    const loadAsteroids = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNearEarthAsteroids(simDate);
        if (!active) return;
        if (!data) throw new Error("NASA telemetry request failed.");

        const dateKey = simDate.toISOString().split('T')[0];
        const rawList = data.near_earth_objects?.[dateKey] || [];

        const parsed: any[] = rawList.map((item: any) => ({
          id: item.id,
          name: item.name.replace(/[()]/g, ''),
          diameter: (item.estimated_diameter.meters.estimated_diameter_min + item.estimated_diameter.meters.estimated_diameter_max) / 2,
          speed: parseFloat(item.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || '0'),
          missDistance: parseFloat(item.close_approach_data?.[0]?.miss_distance?.lunar || '0'),
          missDistanceKm: parseFloat(item.close_approach_data?.[0]?.miss_distance?.kilometers || '0'),
          hazardous: item.is_potentially_hazardous_asteroid,
          jplUrl: item.nasa_jpl_url
        }));

        // Sort by closest approach miss distance
        parsed.sort((a, b) => a.missDistance - b.missDistance);

        setRawAsteroids(parsed);
        setSelectedIndex(parsed.length > 0 ? 0 : null);
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load Near-Earth Asteroid feed.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAsteroids();
    return () => {
      active = false;
    };
  }, [simDate]);

  // Position processing
  const asteroids: Asteroid[] = useMemo(() => {
    if (!rawAsteroids.length) return [];

    const missDistances = rawAsteroids.map((a) => a.missDistance);
    const maxMiss = Math.max(...missDistances, 1);
    const minMiss = Math.min(...missDistances, 0);

    return rawAsteroids.map((a, i) => {
      // Angular spacing around Earth
      const theta = (i / rawAsteroids.length) * Math.PI * 2;
      // Slight vertical dispersion
      const phi = Math.sin(i * 1.7) * 0.22;

      // Map missDistance to radius [2.6 to 8.0]
      let r = 3.5;
      if (maxMiss !== minMiss) {
        r = 2.6 + ((a.missDistance - minMiss) / (maxMiss - minMiss)) * 5.4;
      }

      const x = Math.cos(theta) * Math.cos(phi) * r;
      const y = Math.sin(phi) * r;
      const z = Math.sin(theta) * Math.cos(phi) * r;

      return {
        ...a,
        position: new THREE.Vector3(x, y, z),
        displaySize: 0.07 + Math.min(a.diameter / 1200, 1.0) * 0.16, // scale visually
      };
    });
  }, [rawAsteroids]);

  const stats = useMemo(() => {
    const total = asteroids.length;
    const hazardous = asteroids.filter((a) => a.hazardous).length;
    return { total, hazardous };
  }, [asteroids]);

  const selectedAsteroid = selectedIndex !== null ? asteroids[selectedIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 pointer-events-auto">
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-[92vw] lg:w-[85vw] h-[85vh] rounded-[24px] bg-[#09090C]/90 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.85)] flex flex-col md:flex-row overflow-hidden text-white font-sans"
      >
        {/* Left Side: Telemetry Database Sidebar */}
        <div className="w-full md:w-80 lg:w-[360px] flex flex-col border-r border-white/10 bg-black/35 backdrop-blur-xl h-full p-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#007AFF] text-white">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-wider text-white">NEOWS RADAR</h2>
                <p className="text-[10px] text-white/55 font-bold uppercase">Live Asteroid Feeds</p>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAsteroidTracker(false);
                document.body.style.cursor = 'default';
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[9px] font-extrabold tracking-widest text-[#007AFF] uppercase">Telemetry Date Epoch</label>
            <div className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#007AFF] focus-within:ring-1 focus-within:ring-[#007AFF] transition-all">
              <Calendar className="w-4 h-4 text-white/60" />
              <input
                type="date"
                value={simDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    setSimDate(new Date(e.target.value));
                  }
                }}
                className="w-full bg-transparent text-xs font-bold text-white outline-none border-none cursor-pointer"
              />
            </div>
          </div>

          {/* Summary Threat Indicators */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-white/50 uppercase leading-none">Detected</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl font-black">{loading ? '...' : stats.total}</span>
                <span className="text-[9px] text-white/40">NEOs</span>
              </div>
            </div>
            <div className={`p-3 rounded-2xl bg-white/[0.03] border flex flex-col justify-between transition-colors ${
              stats.hazardous > 0 ? 'border-[#D75800]/30 bg-[#D75800]/5' : 'border-white/5'
            }`}>
              <span className="text-[9px] font-bold text-white/50 uppercase leading-none">Hazard Threats</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className={`text-xl font-black ${stats.hazardous > 0 ? 'text-[#FF3B30]' : 'text-white'}`}>
                  {loading ? '...' : stats.hazardous}
                </span>
                <span className="text-[9px] text-white/40">Alerts</span>
              </div>
            </div>
          </div>

          {/* Asteroid Threat List Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2.5">
            <h3 className="text-[9px] font-extrabold tracking-widest text-white/45 uppercase border-b border-white/5 pb-1">
              Active Orbit Matrix
            </h3>

            {loading ? (
              // Loader skeletons
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-2xl bg-white/[0.04] border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-white/60">
                <AlertTriangle className="w-6 h-6 text-[#FF9500] mb-2 animate-bounce" />
                <p className="font-bold">{error}</p>
                <button
                  onClick={() => setSimDate(new Date())}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[10px] font-bold transition-all"
                >
                  Reset to Current
                </button>
              </div>
            ) : asteroids.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-white/50">
                <ShieldCheck className="w-8 h-8 text-[#34C759] mb-2" />
                <p className="font-bold">Zone Secure</p>
                <p className="text-[10px] text-white/40 mt-0.5">No close-approach asteroids logged for this epoch.</p>
              </div>
            ) : (
              asteroids.map((item, i) => {
                const isHovered = hoveredIndex === i;
                const isSelected = selectedIndex === i;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedIndex(i)}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'bg-[#007AFF]/10 border-[#007AFF] shadow-[0_0_12px_rgba(0,122,255,0.15)]'
                        : isHovered
                        ? 'bg-white/[0.07] border-white/20'
                        : 'bg-white/[0.03] border-white/5'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-bold truncate pr-1">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-white/50">
                        Miss Dist: <span className="font-semibold text-white/80">{item.missDistance.toFixed(1)} LD</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.hazardous ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] shadow-[0_0_8px_#FF3B30] animate-pulse" title="Potentially Hazardous Threat" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#34C759]/60" title="Safe Telemetry Log" />
                      )}
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-[#007AFF]' : 'text-white/20'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Lower Selected Telemetry Panel */}
          {!loading && !error && selectedAsteroid && (
            <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-xs font-black truncate max-w-[170px]">{selectedAsteroid.name}</span>
                {selectedAsteroid.hazardous ? (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-[#FF3B30] text-white">HAZARDOUS</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-[#34C759] text-white">SECURE</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex flex-col">
                  <span className="text-white/45 font-bold uppercase">Estimated size</span>
                  <span className="text-white font-bold text-xs mt-0.5">{Math.round(selectedAsteroid.diameter)} meters</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/45 font-bold uppercase">Approach speed</span>
                  <span className="text-white font-bold text-xs mt-0.5">{selectedAsteroid.speed.toFixed(2)} km/s</span>
                </div>
                <div className="flex flex-col col-span-2 mt-1">
                  <span className="text-white/45 font-bold uppercase">Close Approach Miss Distance</span>
                  <span className="text-white font-black text-xs mt-0.5">
                    {selectedAsteroid.missDistanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km ({selectedAsteroid.missDistance.toFixed(1)} Lunar Distances)
                  </span>
                </div>
              </div>
              
              <a
                href={selectedAsteroid.jplUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/95 font-bold text-[10px] text-white tracking-wider uppercase transition-all shadow-md shadow-[#007AFF]/15 cursor-pointer text-center"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>JPL Orbit Profile</span>
              </a>
            </div>
          )}
        </div>

        {/* Right Side: 3D Visualization Viewport */}
        <div className="flex-1 relative h-[45vh] md:h-full">
          {/* Overlay HUD Display */}
          <div className="absolute inset-x-0 top-0 p-5 flex justify-between items-start z-10 pointer-events-none font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
              <span className="text-[9px] font-bold tracking-widest text-[#FF3B30]">3D ORBIT TELEMETRY ACTIVE</span>
            </div>
            
            <div className="hidden sm:flex flex-col items-end gap-0.5 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-right text-[10px] leading-tight">
              <span className="text-white/50">Origin Center: <span className="text-white font-bold">Earth (0,0,0)</span></span>
              <span className="text-white/50">Distance Scale: <span className="text-[#FF9500] font-bold">Logarithmic Lunar</span></span>
            </div>
          </div>

          <div className="absolute left-5 bottom-5 z-10 pointer-events-none font-mono text-[9px] text-white/40 flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
            <span>DRAG TO ROTATE • SCROLL TO ZOOM</span>
          </div>

          {/* 3D WebGL Canvas */}
          <Canvas
            camera={{ position: [0, 4, 7], fov: 40, near: 0.1, far: 100 }}
            shadows
            gl={{ antialias: true }}
            className="w-full h-full bg-transparent"
          >
            {/* Soft general scene lighting */}
            <ambientLight intensity={0.4} />
            
            {/* Sunlight source casting phases */}
            <directionalLight position={[8, 4, 5]} intensity={2.0} castShadow />
            <pointLight position={[-8, -4, -5]} intensity={0.2} />

            {/* Earth model in the center */}
            <EarthModel />

            {/* Asteroid instances */}
            {asteroids.length > 0 && (
              <AsteroidsModel
                asteroids={asteroids}
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
                setSelectedIndex={setSelectedIndex}
              />
            )}

            {/* Active hover radar lock */}
            {hoveredIndex !== null && asteroids[hoveredIndex] && (
              <RadarReticle asteroid={asteroids[hoveredIndex]} />
            )}

            {/* Active select lock (fallback display or keep synced with hover) */}
            {selectedIndex !== null && selectedIndex !== hoveredIndex && asteroids[selectedIndex] && (
              <group position={asteroids[selectedIndex].position}>
                {/* Dotted lock vector to Earth */}
                <Line
                  points={[new THREE.Vector3(0, 0, 0), asteroids[selectedIndex].position]}
                  color="#007AFF"
                  lineWidth={1.0}
                  opacity={0.4}
                  transparent
                  dashed
                  dashScale={4}
                  gapSize={0.2}
                />
                
                {/* Static indicator circle */}
                <mesh>
                  <ringGeometry args={[asteroids[selectedIndex].displaySize * 1.0, asteroids[selectedIndex].displaySize * 1.15, 32]} />
                  <meshBasicMaterial color="#007AFF" side={THREE.DoubleSide} transparent opacity={0.65} />
                </mesh>
              </group>
            )}

            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={2.5}
              maxDistance={18.0}
            />
          </Canvas>
        </div>
      </motion.div>
    </div>
  );
}

export default AsteroidTracker;
