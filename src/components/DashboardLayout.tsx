import React, { useState } from 'react';
import { Menu, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { InfoPanel } from './InfoPanel';
import { TimeControls } from './TimeControls';
import { useSolarStore } from '../store/useSolarStore';
import { AsteroidTracker } from './AsteroidTracker';
import { JwstTracker } from './JwstTracker';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const horizonsLoading = useSolarStore((state) => state.horizonsLoading);
  const showAsteroidTracker = useSolarStore((state) => state.showAsteroidTracker);
  const showJwstDashboard = useSolarStore((state) => state.showJwstDashboard);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#09090B] font-sans select-none">
      {/* 1. Fullscreen R3F 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* 2. Floating JPL Horizons Loading Status Overlay */}
      <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <AnimatePresence>
          {horizonsLoading && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-lg text-white font-sans text-xs font-bold pointer-events-auto"
            >
              <div className="w-3.5 h-3.5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
              <span>Updating planetary positions...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Interactive Telemetry HUD Grid Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 pointer-events-none">
        
        {/* Top Header Section */}
        <div className="w-full flex justify-between items-center gap-2">
          <div className="w-full">
            <Toolbar />
          </div>
          
          {/* Mobile HUD Controls */}
          <div className="flex gap-2 sm:hidden pointer-events-auto">
            {/* Mobile Sidebar Trigger */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setMobileInfoOpen(false);
              }}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl text-white hover:bg-white/20 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Info Panel Trigger */}
            {selectedBodyId && (
              <button
                onClick={() => {
                  setMobileInfoOpen(!mobileInfoOpen);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl text-[#007AFF] hover:bg-white/20 transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Center Telemetry Section */}
        <div className="flex-1 flex justify-between my-4 relative overflow-hidden">
          
          {/* Left Sidebar Overlay (Desktop and Mobile) */}
          <div
            className={`absolute sm:relative sm:flex left-0 z-20 h-full transition-transform duration-300 pointer-events-auto ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-80 sm:translate-x-0'
            }`}
          >
            <Sidebar />
          </div>

          {/* Right Information Panel Overlay (Desktop and Mobile) */}
          <div
            className={`absolute sm:relative sm:flex right-0 z-20 h-full transition-transform duration-300 pointer-events-auto ${
              mobileInfoOpen || (selectedBodyId && (selectedBodyId !== 'jwst' || !showJwstDashboard) && !mobileMenuOpen) ? 'translate-x-0' : 'translate-x-80 sm:translate-x-0'
            }`}
          >
            {(selectedBodyId && (selectedBodyId !== 'jwst' || !showJwstDashboard)) && <InfoPanel />}
          </div>
        </div>

        {/* Bottom Time Controls */}
        <div className="w-full">
          <TimeControls />
        </div>
      </div>

      {/* 4. Fullscreen Near-Earth Asteroid Tracking Overlay */}
      <AnimatePresence>
        {showAsteroidTracker && <AsteroidTracker />}
      </AnimatePresence>

      {/* 5. Fullscreen James Webb Space Telescope Telemetry Dashboard */}
      <AnimatePresence>
        {(selectedBodyId === 'jwst' && showJwstDashboard) && <JwstTracker />}
      </AnimatePresence>
    </div>
  );
}
export default DashboardLayout;
