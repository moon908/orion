import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { CelestialBodyData } from '../types/solar';
import { useSolarStore } from '../store/useSolarStore';
import { getPlanetPosition, getOrbitPath } from '../utils/physics';
import { ProceduralTextures } from '../utils/textures';

interface PlanetProps {
  data: CelestialBodyData;
}

export function Planet({ data }: PlanetProps) {
  const planetRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const { camera } = useThree();

  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const hoveredBodyId = useSolarStore((state) => state.hoveredBodyId);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const simDate = useSolarStore((state) => state.simDate);
  const orbitLinesVisible = useSolarStore((state) => state.orbitLinesVisible);

  // Horizons Live State
  const planetVectors = useSolarStore((state) => state.planetVectors);
  const useHorizonsTelemetry = useSolarStore((state) => state.useHorizonsTelemetry);

  const setSelectedBodyId = useSolarStore((state) => state.setSelectedBodyId);
  const setHoveredBodyId = useSolarStore((state) => state.setHoveredBodyId);

  const [isHovered, setIsHovered] = useState(false);

  // Generate procedural textures once during initialization
  const textures = useMemo(() => {
    let surface: THREE.CanvasTexture | null = null;
    let clouds: THREE.CanvasTexture | null = null;
    let rings: THREE.CanvasTexture | null = null;

    if (typeof window !== 'undefined') {
      switch (data.id) {
        case 'mercury': surface = ProceduralTextures.createMercuryTexture(); break;
        case 'venus': surface = ProceduralTextures.createVenusTexture(); break;
        case 'earth':
          surface = ProceduralTextures.createEarthTexture();
          clouds = ProceduralTextures.createEarthCloudsTexture();
          break;
        case 'mars': surface = ProceduralTextures.createMarsTexture(); break;
        case 'jupiter': surface = ProceduralTextures.createJupiterTexture(); break;
        case 'saturn':
          surface = ProceduralTextures.createSaturnTexture();
          rings = ProceduralTextures.createRingsTexture(data.ring?.color || '#E0C89F');
          break;
        case 'uranus':
          surface = ProceduralTextures.createUranusTexture();
          rings = ProceduralTextures.createRingsTexture(data.ring?.color || '#A5F3FC');
          break;
        case 'neptune': surface = ProceduralTextures.createNeptuneTexture(); break;
        case 'pluto': surface = ProceduralTextures.createPlutoTexture(); break;
      }
    }
    return { surface, clouds, rings };
  }, [data.id, data.ring?.color]);

  // Visual size logic
  const visualRadius = useMemo(() => {
    if (scaleMode === 'realistic') {
      const earthRadius = 0.5;
      switch (data.id) {
        case 'mercury': return 0.38 * earthRadius;
        case 'venus': return 0.95 * earthRadius;
        case 'earth': return 1.0 * earthRadius;
        case 'mars': return 0.53 * earthRadius;
        case 'jupiter': return 11.2 * earthRadius * 0.45;
        case 'saturn': return 9.45 * earthRadius * 0.45;
        case 'uranus': return 4.01 * earthRadius * 0.5;
        case 'neptune': return 3.88 * earthRadius * 0.5;
        case 'pluto': return 0.18 * earthRadius;
        default: return 1.0;
      }
    } else {
      switch (data.id) {
        case 'mercury': return 0.35;
        case 'venus': return 0.65;
        case 'earth': return 0.7;
        case 'mars': return 0.45;
        case 'jupiter': return 1.5;
        case 'saturn': return 1.25;
        case 'uranus': return 0.95;
        case 'neptune': return 0.9;
        case 'pluto': return 0.22;
        default: return 0.7;
      }
    }
  }, [data.id, scaleMode]);

  // Orbit path points calculation
  const orbitPoints = useMemo(() => {
    return getOrbitPath(data.orbitalElements, scaleMode, 180);
  }, [data.orbitalElements, scaleMode]);

  // Temporary vector helper to prevent gc overhead in loop
  const tempTargetPos = useMemo(() => new THREE.Vector3(), []);

  // Framerate independent orbit animation loop
  useFrame((state, delta) => {
    // 1. Calculate Target Position (NASA Telemetry vs Kepler Fallback)
    const hasLiveVector = useHorizonsTelemetry && planetVectors && planetVectors[data.id];

    if (hasLiveVector) {
      const vec = planetVectors![data.id];
      if (scaleMode === 'realistic') {
        // Coordinates: Heliocentric vectors in AU relative to Sun center.
        // Scale by auScale = 11.5. Map JPL coordinate axes to R3F (Ecliptic XY -> XZ, Z -> Y)
        const auScale = 11.5;
        tempTargetPos.set(vec.x * auScale, vec.z * auScale, vec.y * auScale);
      } else {
        // Visual spacing mode:
        // Normalize the vector direction to get exact angular placement (conjunctions, orbits)
        // and multiply by visual orbit radius.
        const rawDist = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
        const orbitRadius = data.orbitalElements.semiMajorAxis;
        
        if (rawDist > 0) {
          const dx = vec.x / rawDist;
          const dy = vec.z / rawDist; // vertical height component
          const dz = vec.y / rawDist;
          tempTargetPos.set(dx * orbitRadius, dy * orbitRadius, dz * orbitRadius);
        } else {
          tempTargetPos.set(0, 0, 0);
        }
      }
    } else {
      // Offline Keplerian Fallback coordinate
      const [kx, ky, kz] = getPlanetPosition(data.orbitalElements, simDate, scaleMode);
      tempTargetPos.set(kx, ky, kz);
    }

    // 2. Smoothly LERP position to target (never teleport)
    if (planetRef.current) {
      planetRef.current.position.lerp(tempTargetPos, 0.1);
    }

    // 3. Axial Rotation
    const rotationSpeed = (2 * Math.PI) / (Math.abs(data.rotationPeriod) || 24); // rad/hr
    const sign = data.rotationPeriod < 0 ? -1 : 1;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed * sign * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * (rotationSpeed * 1.15) * 0.1;
      cloudsRef.current.rotation.x += delta * 0.005;
    }
  });

  const isSelected = selectedBodyId === data.id;
  const isTargeted = hoveredBodyId === data.id || isHovered;

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    setHoveredBodyId(data.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setIsHovered(false);
    setHoveredBodyId(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedBodyId(data.id);
  };

  // Ring geometry variables
  const ringMesh = useMemo(() => {
    if (!data.ring) return null;
    
    const inner = visualRadius * data.ring.innerRadius;
    const outer = visualRadius * data.ring.outerRadius;
    
    return (
      <mesh
        ref={ringsRef}
        rotation={[Math.PI / 2.2, 0, 0]}
        castShadow
        receiveShadow
      >
        <ringGeometry args={[inner, outer, 64]} />
        <meshStandardMaterial
          map={textures.rings}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }, [data.ring, visualRadius, textures.rings]);

  // Moons representation
  const moonMeshes = useMemo(() => {
    if (!data.moons || data.moons.length === 0) return null;
    
    return data.moons.map((moon) => {
      const orbitRad = visualRadius * (2.0 + moon.distanceFromPlanet * 4);
      const moonRad = Math.max(0.04, visualRadius * (moon.radius / data.radius) * 1.5);
      
      return (
        <group key={moon.id}>
          {/* Moon Orbit line */}
          <Line
            points={getOrbitPath({
              semiMajorAxis: orbitRad,
              eccentricity: 0,
              inclination: 0,
              orbitalPeriod: moon.orbitalPeriod,
              rotationPeriod: 24,
              obliquity: 0
            }, scaleMode, 64).map(p => new THREE.Vector3(...p))}
            color="#5856D6"
            lineWidth={0.3}
            opacity={0.15}
            transparent
          />
          {/* Animated Moon position */}
          <MoonSphere
            moon={moon}
            orbitRad={orbitRad}
            moonRad={moonRad}
            scaleMode={scaleMode}
            simDate={simDate}
          />
        </group>
      );
    });
  }, [data.moons, visualRadius, scaleMode, data.radius, simDate]);

  return (
    <group>
      {/* 1. Keplerian Orbit Line */}
      {orbitLinesVisible && (
        <Line
          points={orbitPoints.map((p) => new THREE.Vector3(...p))}
          color={isSelected ? '#007AFF' : isTargeted ? '#5856D6' : '#2A2D3A'}
          lineWidth={isSelected ? 1.5 : isTargeted ? 1.0 : 0.6}
          opacity={isSelected ? 0.8 : isTargeted ? 0.5 : 0.25}
          transparent
        />
      )}

      {/* 2. Planet Position Group */}
      <group ref={planetRef}>
        {/* Core Sphere */}
        <mesh
          ref={meshRef}
          castShadow
          receiveShadow
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[visualRadius, 32, 32]} />
          <meshStandardMaterial
            map={textures.surface || undefined}
            color={textures.surface ? '#FFFFFF' : data.color}
            roughness={0.7}
            metalness={0.1}
            emissive={new THREE.Color(data.color)}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Earth Clouds Overlay */}
        {data.id === 'earth' && textures.clouds && (
          <mesh ref={cloudsRef} raycast={() => null}>
            <sphereGeometry args={[visualRadius * 1.015, 32, 32]} />
            <meshStandardMaterial
              transparent
              alphaMap={textures.clouds}
              opacity={0.65}
              color="#FFFFFF"
            />
          </mesh>
        )}

        {/* Rings System */}
        {ringMesh}

        {/* Moons System */}
        {moonMeshes}

        {/* Atmospheric Glow Layer */}
        {(data.id === 'earth' || data.id === 'venus' || data.id === 'jupiter' || data.id === 'saturn' || data.id === 'neptune') && (
          <mesh scale={1.06} raycast={() => null}>
            <sphereGeometry args={[visualRadius, 32, 32]} />
            <meshBasicMaterial
              color={data.id === 'earth' ? '#60A5FA' : data.id === 'venus' ? '#F59E0B' : '#3B82F6'}
              transparent
              opacity={0.25}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Hover / Active Telemetry Focus Circle */}
        {(isSelected || isTargeted) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[visualRadius * 1.25, visualRadius * 1.3, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#007AFF' : '#5856D6'}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

// Separate component for Moons to optimize render updates
interface MoonSphereProps {
  moon: any;
  orbitRad: number;
  moonRad: number;
  scaleMode: 'visual' | 'realistic';
  simDate: Date;
}

function MoonSphere({ moon, orbitRad, moonRad, simDate }: MoonSphereProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  
  const planetVectors = useSolarStore((state) => state.planetVectors);
  const useHorizonsTelemetry = useSolarStore((state) => state.useHorizonsTelemetry);
  const scaleMode = useSolarStore((state) => state.scaleMode);

  const tempMoonTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const hasLiveMoonVector = useHorizonsTelemetry && planetVectors && planetVectors['moon'];

    if (hasLiveMoonVector) {
      const vec = planetVectors!['moon']; // geocentric vector relative to Earth center
      if (scaleMode === 'realistic') {
        const auScale = 11.5;
        // Geocentric position directly scaled to visual coordinates
        tempMoonTarget.set(vec.x * auScale, vec.z * auScale, vec.y * auScale);
      } else {
        // Normalize direction and multiply by local moon orbit radius
        const rawDist = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
        if (rawDist > 0) {
          const dx = vec.x / rawDist;
          const dy = vec.z / rawDist;
          const dz = vec.y / rawDist;
          tempMoonTarget.set(dx * orbitRad, dy * orbitRad, dz * orbitRad);
        } else {
          tempMoonTarget.set(0, 0, 0);
        }
      }
    } else {
      // Keplerian fallback
      const speed = (2 * Math.PI) / moon.orbitalPeriod;
      const elapsedDays = simDate.getTime() / (24 * 60 * 60 * 1000);
      const angle = (speed * elapsedDays) % (2 * Math.PI);
      tempMoonTarget.set(Math.cos(angle) * orbitRad, 0, Math.sin(angle) * orbitRad);
    }

    if (moonRef.current) {
      moonRef.current.position.lerp(tempMoonTarget, 0.12);
    }
  });

  return (
    <mesh ref={moonRef} castShadow receiveShadow>
      <sphereGeometry args={[moonRad, 16, 16]} />
      <meshStandardMaterial
        color={moon.color}
        roughness={0.8}
        emissive={new THREE.Color(moon.color)}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
