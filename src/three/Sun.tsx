import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SunProps {
  radius: number;
}

export function Sun({ radius }: SunProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = elapsed * 0.012;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y = -elapsed * 0.004;
      coronaRef.current.rotation.z = elapsed * 0.002;
    }
  });

  return (
    <group>
      {/* Sun Corona Glow (Hardware compatible glowing envelope) */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sun Inner Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#FFE680" />
      </mesh>

      {/* Solar System Primary Light Source */}
      <pointLight
        position={[0, 0, 0]}
        intensity={6.0}
        distance={300}
        decay={0.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={150}
        shadow-bias={-0.0005}
      />
    </group>
  );
}
export default Sun;
