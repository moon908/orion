import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';

export function AsteroidBelt() {
  const asteroidBeltRef = useRef<THREE.Group>(null);
  const kuiperBeltRef = useRef<THREE.Group>(null);

  const scaleMode = useSolarStore((state) => state.scaleMode);
  const simDate = useSolarStore((state) => state.simDate);
  const showAsteroids = useSolarStore((state) => state.showAsteroids);

  // Constants for belt radii
  // Visual Mode: Mars = 15, Jupiter = 21. Asteroids = 17.2 to 19.8
  // Realistic Mode: Mars = 1.52 AU (17.5), Jupiter = 5.2 AU (59.8). Asteroids = 25 to 40
  const beltRanges = useMemo(() => {
    if (scaleMode === 'realistic') {
      const au = 11.5;
      return {
        innerAsteroid: 2.1 * au,
        outerAsteroid: 3.3 * au,
        innerKuiper: 30.1 * au,
        outerKuiper: 48.0 * au
      };
    } else {
      return {
        innerAsteroid: 16.8,
        outerAsteroid: 19.5,
        innerKuiper: 42.5,
        outerKuiper: 45.8
      };
    }
  }, [scaleMode]);

  const asteroidCount = 1200;
  const kuiperCount = 800;

  // Create random rock geometries (low-poly Dodecahedron for performance)
  const rockGeometry = useMemo(() => {
    return new THREE.DodecahedronGeometry(0.06, 0);
  }, []);

  // Instanced matrices setup for Asteroid Belt
  const asteroidMeshArgs = useMemo(() => {
    const tempObject = new THREE.Object3D();
    const instancedMesh = new THREE.InstancedMesh(
      rockGeometry,
      new THREE.MeshStandardMaterial({ color: '#88827B', roughness: 0.9 }),
      asteroidCount
    );

    for (let i = 0; i < asteroidCount; i++) {
      // Semi-random radius within belt bounds
      const radius = beltRanges.innerAsteroid + Math.random() * (beltRanges.outerAsteroid - beltRanges.innerAsteroid);
      const angle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * radius;
      // Flat disc with minor vertical dispersion
      const y = (Math.random() - 0.5) * (scaleMode === 'realistic' ? 1.5 : 0.4);
      const z = Math.sin(angle) * radius;

      tempObject.position.set(x, y, z);
      tempObject.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      // Random scale for size variety
      const s = 0.5 + Math.random() * 1.5;
      tempObject.scale.set(s, s, s);
      tempObject.updateMatrix();

      instancedMesh.setMatrixAt(i, tempObject.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }, [rockGeometry, beltRanges.innerAsteroid, beltRanges.outerAsteroid, scaleMode]);

  // Instanced matrices setup for Kuiper Belt
  const kuiperMeshArgs = useMemo(() => {
    const tempObject = new THREE.Object3D();
    const instancedMesh = new THREE.InstancedMesh(
      rockGeometry,
      new THREE.MeshStandardMaterial({ color: '#576075', roughness: 0.95 }),
      kuiperCount
    );

    for (let i = 0; i < kuiperCount; i++) {
      const radius = beltRanges.innerKuiper + Math.random() * (beltRanges.outerKuiper - beltRanges.innerKuiper);
      const angle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * (scaleMode === 'realistic' ? 3.0 : 0.8);
      const z = Math.sin(angle) * radius;

      tempObject.position.set(x, y, z);
      tempObject.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      // Kuiper belt objects (dirty ice rocks, slightly larger on average)
      const s = 0.7 + Math.random() * 2.0;
      tempObject.scale.set(s, s, s);
      tempObject.updateMatrix();

      instancedMesh.setMatrixAt(i, tempObject.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }, [rockGeometry, beltRanges.innerKuiper, beltRanges.outerKuiper, scaleMode]);

  // Rotate the belts at Keplerian speeds (average)
  useFrame(() => {
    if (!showAsteroids) return;

    // Elapsed days representation
    const elapsedDays = simDate.getTime() / (24 * 60 * 60 * 1000);

    // Orbit speeds:
    // Asteroid belt average orbit = 4.5 Earth years (1642 days)
    // Kuiper belt average orbit = 248 Earth years (90560 days)
    const asteroidAngle = (elapsedDays / 1642) * Math.PI * 2;
    const kuiperAngle = (elapsedDays / 90560) * Math.PI * 2;

    if (asteroidBeltRef.current) {
      asteroidBeltRef.current.rotation.y = asteroidAngle * 0.05;
    }
    if (kuiperBeltRef.current) {
      kuiperBeltRef.current.rotation.y = kuiperAngle * 0.05;
    }
  });

  if (!showAsteroids) return null;

  return (
    <group>
      {/* Asteroid Belt */}
      <group ref={asteroidBeltRef}>
        <primitive object={asteroidMeshArgs} castShadow receiveShadow />
      </group>

      {/* Kuiper Belt */}
      <group ref={kuiperBeltRef}>
        <primitive object={kuiperMeshArgs} castShadow receiveShadow />
      </group>
    </group>
  );
}
