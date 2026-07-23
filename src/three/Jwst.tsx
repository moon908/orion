"use client";

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';
import { getPlanetPosition } from '../utils/physics';

// Keplerian elements for Earth to calculate L2 orbit position dynamically
const EARTH_ELEMENTS = {
  semiMajorAxis: 11.5,
  eccentricity: 0.0167,
  inclination: 0.0,
  orbitalPeriod: 365.25,
  rotationPeriod: 24,
  obliquity: 23.44
};

export function Jwst() {
  const groupRef = useRef<THREE.Group>(null);
  const simDate = useSolarStore((state) => state.simDate);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const setSelectedBodyId = useSolarStore((state) => state.setSelectedBodyId);
  const hoveredBodyId = useSolarStore((state) => state.hoveredBodyId);
  const setHoveredBodyId = useSolarStore((state) => state.setHoveredBodyId);
  const setShowJwstDashboard = useSolarStore((state) => state.setShowJwstDashboard);

  const [isHovered, setIsHovered] = useState(false);
  const tempPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    // 1. Calculate Earth's current position in the coordinate space
    const [ex, ey, kz] = getPlanetPosition(EARTH_ELEMENTS, simDate, scaleMode);
    const earthPos = tempPos.set(ex, ey, kz);

    // 2. Locate L2 point (1.5 million km directly away from the Sun, on the Sun-Earth vector)
    const directionToEarth = earthPos.clone().normalize();
    
    // Scale visual offset so it floats nicely beyond Earth sphere
    const offsetDistance = scaleMode === 'realistic' ? 0.9 : 1.4;
    const jwstPos = earthPos.clone().add(directionToEarth.clone().multiplyScalar(offsetDistance));

    if (groupRef.current) {
      groupRef.current.position.copy(jwstPos);
    }
  });

  const isSelected = selectedBodyId === 'jwst';
  const isTargeted = hoveredBodyId === 'jwst' || isHovered;

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    setHoveredBodyId('jwst');
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
    setSelectedBodyId('jwst');
    setShowJwstDashboard(true);
  };

  return (
    <group ref={groupRef}>
      {/* 3D Visual Mesh Representation */}
      <JwstVisualModel
        isSelected={isSelected}
        isHovered={isTargeted}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
    </group>
  );
}

interface JwstVisualProps {
  isSelected: boolean;
  isHovered: boolean;
  onPointerOver: (e: any) => void;
  onPointerOut: (e: any) => void;
  onClick: (e: any) => void;
}

function JwstVisualModel({ isSelected, isHovered, onPointerOver, onPointerOut, onClick }: JwstVisualProps) {
  const rotateRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (rotateRef.current) {
      rotateRef.current.rotation.y += delta * 0.15;
    }
  });

  // Visual size scaled to fit nicely in R3F viewport (~0.2 units)
  return (
    <group
      ref={rotateRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      scale={0.22}
    >
      {/* 1. Multi-layered Sunshield (Silver & Gold back side) */}
      <mesh position={[0, -0.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.1, 0.015, 0.65]} />
        <meshStandardMaterial color="#B0B3B8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.07, 0]} rotation={[0, Math.PI / 4, 0]} scale={0.96}>
        <boxGeometry args={[1.1, 0.015, 0.65]} />
        <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.15} />
      </mesh>

      {/* 2. Spacecraft Bus (silver octagonal cylinder underneath) */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 8]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* 3. Gold Hexagonal Primary Mirror */}
      <group position={[0.1, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 6]} />
          <meshStandardMaterial color="#FFC72C" metalness={0.96} roughness={0.03} />
        </mesh>
        <mesh scale={0.92}>
          <cylinderGeometry args={[0.3, 0.3, 0.045, 6]} />
          <meshStandardMaterial color="#B58F28" metalness={0.9} roughness={0.1} wireframe />
        </mesh>
      </group>

      {/* 4. Secondary Mirror struts & Gold mirror */}
      <group position={[0.42, 0.2, 0]}>
        <mesh position={[-0.18, 0.14, 0.09]} rotation={[0.4, 0.4, -0.5]}>
          <cylinderGeometry args={[0.008, 0.008, 0.38]} />
          <meshStandardMaterial color="#4B5563" />
        </mesh>
        <mesh position={[-0.18, 0.14, -0.09]} rotation={[-0.4, -0.4, -0.5]}>
          <cylinderGeometry args={[0.008, 0.008, 0.38]} />
          <meshStandardMaterial color="#4B5563" />
        </mesh>
        <mesh position={[-0.18, -0.16, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.008, 0.008, 0.38]} />
          <meshStandardMaterial color="#4B5563" />
        </mesh>
        {/* Small gold mirror */}
        <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.015, 6]} />
          <meshStandardMaterial color="#FFC72C" metalness={0.96} roughness={0.03} />
        </mesh>
      </group>

      {/* 5. Solar Panels array */}
      <mesh position={[-0.28, -0.22, 0]} rotation={[0.3, 0, -0.5]}>
        <boxGeometry args={[0.38, 0.012, 0.12]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.6} roughness={0.1} />
      </mesh>

      {/* 6. Active Telemetry Focus Ring */}
      {(isSelected || isHovered) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.66, 32]} />
          <meshBasicMaterial color={isSelected ? '#007AFF' : '#5856D6'} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

export default Jwst;
