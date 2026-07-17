"use client";

import dynamic from 'next/dynamic';
import { useSolarStore } from '@/store/useSolarStore';
import { useTime } from '@/hooks/useTime';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingScreen } from '@/components/LoadingScreen';

// Load the 3D Canvas dynamically with SSR disabled to prevent Canvas/WebGL loading conflicts
const SolarSystemCanvas = dynamic(
  () => import('@/three/SolarSystemCanvas'),
  { ssr: false }
);

export default function Home() {
  // Start the Keplerian clock loop
  useTime();

  const isLoaded = useSolarStore((state) => state.isLoaded);

  return (
    <>
      {/* Show overlay facts loader until canvas is ready */}
      {!isLoaded && <LoadingScreen />}
      
      {/* Interactive Cockpit HUD */}
      <DashboardLayout>
        <SolarSystemCanvas />
      </DashboardLayout>
    </>
  );
}
