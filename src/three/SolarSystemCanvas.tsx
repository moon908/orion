import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';
import { CELESTIAL_BODIES } from '../constants/celestialData';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { AsteroidBelt } from './AsteroidBelt';
import { getPlanetPosition } from '../utils/physics';
import { Jwst } from './Jwst';

const EARTH_ELEMENTS = {
  semiMajorAxis: 11.5,
  eccentricity: 0.0167,
  inclination: 0.0,
  orbitalPeriod: 365.25,
  rotationPeriod: 24,
  obliquity: 23.44
};

// Twinkling stars GPU shader component
function TwinklingStars() {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<any>(null);
  const count = 4000;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const phs = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution on a massive shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 120 + Math.random() * 60; // Far space

      pos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = dist * Math.cos(phi);

      phs[i] = Math.random() * Math.PI * 2;
    }
    return [pos, phs];
  }, []);

  const starShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute float aPhase;
        varying float vPhase;
        void main() {
          vPhase = aPhase;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Calculate point size based on depth and phase
          gl_PointSize = (1.8 + 0.5 * sin(aPhase)) * (280.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying float vPhase;
        void main() {
          // Circular particle shape
          vec2 coord = gl_PointCoord - vec2(0.5);
          if (length(coord) > 0.5) discard;

          // Twinkle frequency
          float alpha = 0.35 + 0.65 * sin(uTime * 2.8 + vPhase);
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `
    };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          args={[phases, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        args={[starShader]}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Camera transition and Orbit target controller
function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const cameraMode = useSolarStore((state) => state.cameraMode);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const simDate = useSolarStore((state) => state.simDate);
  const setCameraMode = useSolarStore((state) => state.setCameraMode);

  // Transition helper states
  const transitionActive = useRef(false);
  const lerpTargetPos = useRef(new THREE.Vector3());
  const lerpCameraPos = useRef(new THREE.Vector3());

  // Listen to select change and trigger smooth camera fly-to animation
  useEffect(() => {
    if (selectedBodyId) {
      if (selectedBodyId === 'jwst') {
        const [ex, ey, ez] = getPlanetPosition(EARTH_ELEMENTS, simDate, scaleMode);
        const earthPos = new THREE.Vector3(ex, ey, ez);
        const directionToEarth = earthPos.clone().normalize();
        const offsetDistance = scaleMode === 'realistic' ? 0.9 : 1.4;
        const jwstPos = earthPos.clone().add(directionToEarth.multiplyScalar(offsetDistance));

        lerpTargetPos.current.copy(jwstPos);
        // Place camera very close since JWST is small
        lerpCameraPos.current.copy(jwstPos).add(new THREE.Vector3(0.5, 0.4, 0.8));
        transitionActive.current = true;
        return;
      }

      const body = CELESTIAL_BODIES.find((b) => b.id === selectedBodyId);
      if (body) {
        const [px, py, pz] = getPlanetPosition(body.orbitalElements, simDate, scaleMode);
        const planetPos = new THREE.Vector3(px, py, pz);

        // Adjust offsets depending on physical sizes
        let offsetScalar = 3.5;
        if (body.id === 'sun') offsetScalar = 14;
        else if (body.id === 'jupiter' || body.id === 'saturn') offsetScalar = 6.5;

        // Set target positions
        lerpTargetPos.current.copy(planetPos);
        
        // Position camera to float diagonally looking down
        lerpCameraPos.current.copy(planetPos).add(new THREE.Vector3(offsetScalar, offsetScalar * 0.7, offsetScalar * 1.5));
        
        transitionActive.current = true;
      }
    } else {
      // Focus Sun / Reset
      lerpTargetPos.current.set(0, 0, 0);
      lerpCameraPos.current.set(0, 16, 28);
      transitionActive.current = true;
    }
  }, [selectedBodyId, scaleMode]);

  useFrame(() => {
    // 1. If camera transition active, smoothly pan camera and orbit controls target
    if (transitionActive.current) {
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lerpTargetPos.current, 0.08);
      }
      camera.position.lerp(lerpCameraPos.current, 0.08);

      // End transition if close enough
      const distCam = camera.position.distanceTo(lerpCameraPos.current);
      const distTarget = controlsRef.current ? controlsRef.current.target.distanceTo(lerpTargetPos.current) : 0;
      
      if (distCam < 0.05 && distTarget < 0.05) {
        transitionActive.current = false;
      }
    } 
    // 2. If in follow mode (and not in transitional flight), lock orbit control target onto moving planet/satellite
    else if (selectedBodyId && cameraMode === 'follow') {
      if (selectedBodyId === 'jwst') {
        const [ex, ey, ez] = getPlanetPosition(EARTH_ELEMENTS, simDate, scaleMode);
        const earthPos = new THREE.Vector3(ex, ey, ez);
        const directionToEarth = earthPos.clone().normalize();
        const offsetDistance = scaleMode === 'realistic' ? 0.9 : 1.4;
        const jwstPos = earthPos.clone().add(directionToEarth.multiplyScalar(offsetDistance));
        if (controlsRef.current) {
          controlsRef.current.target.copy(jwstPos);
        }
        return;
      }

      const body = CELESTIAL_BODIES.find((b) => b.id === selectedBodyId);
      if (body) {
        const [px, py, pz] = getPlanetPosition(body.orbitalElements, simDate, scaleMode);
        if (controlsRef.current) {
          // Snap orbit targets instantly to lock onto moving orbital body
          controlsRef.current.target.set(px, py, pz);
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxDistance={120}
      minDistance={1.2}
      // On manual rotation, drop follow lock so user can look around freely
      onStart={() => {
        if (selectedBodyId && cameraMode === 'follow' && !transitionActive.current) {
          setCameraMode('free');
        }
      }}
    />
  );
}

export function SolarSystemCanvas() {
  const setIsLoaded = useSolarStore((state) => state.setIsLoaded);
  const fetchHorizonsForDate = useSolarStore((state) => state.fetchHorizonsForDate);
  const simDate = useSolarStore((state) => state.simDate);
  const useHorizonsTelemetry = useSolarStore((state) => state.useHorizonsTelemetry);

  // Toggle loader off on mount
  useEffect(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  // Load initial vectors for the current date on startup
  useEffect(() => {
    if (useHorizonsTelemetry) {
      fetchHorizonsForDate(simDate);
    }
  }, [fetchHorizonsForDate, useHorizonsTelemetry]);

  return (
    <div className="w-full h-full relative outline-none select-none">
      <Canvas
        camera={{ position: [0, 16, 28], fov: 45, near: 0.1, far: 500 }}
        shadows
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
      >
        {/* Deep Space Starfield background */}
        <TwinklingStars />

        {/* Lighting system */}
        <ambientLight intensity={0.8} />
        {/* Soft fill light */}
        <directionalLight position={[10, 10, 10]} intensity={1.8} />

        {/* Sun Core */}
        <Sun radius={4.2} />

        {/* Planets rendering */}
        {CELESTIAL_BODIES.filter((body) => body.id !== 'sun').map((body) => (
          <Planet key={body.id} data={body} />
        ))}

        {/* Asteroid Belt & Kuiper Belt */}
        <AsteroidBelt />

        {/* James Webb Space Telescope (JWST) at L2 */}
        <Jwst />

        {/* Camera Control System */}
        <CameraController />

        {/* Bloom and Post Processing effects */}
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.7}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
export default SolarSystemCanvas;
