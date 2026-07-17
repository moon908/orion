import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass } from 'lucide-react';

const LOADING_FACTS = [
  'Jupiter acts as a giant cosmic shield, its gravity diverting comets and asteroids away from Earth.',
  'One day on Venus (rotation period) is longer than one Venusian year (orbit period).',
  'Saturn\'s rings are not solid, but made of billions of individual ice particles and rock chunks.',
  'A spacecraft traveling at the speed of light would take 5.5 hours to reach Pluto from the Sun.',
  'The Sun is nearly a perfect sphere, with a difference of only 10 km between its polar and equatorial diameters.',
  'Due to its low density, Saturn would float in a water bath large enough to hold it.',
  'Light from the Sun takes roughly 8 minutes and 20 seconds to reach Earth.'
];

export function LoadingScreen() {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % LOADING_FACTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090B] text-white">
      {/* Background Star Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,86,214,0.08),transparent)] pointer-events-none" />

      {/* Rotating Solar loader */}
      <div className="relative flex items-center justify-center w-40 h-40 mb-8">
        {/* Sun Core */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D75800] to-[#FFB800] shadow-[0_0_24px_rgba(255,184,0,0.6)]"
        />

        {/* Orbit 1: Inner Planet */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute w-20 h-20 rounded-full border border-white/5"
        >
          <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-[#007AFF] shadow-[0_0_6px_#007AFF]" />
        </motion.div>

        {/* Orbit 2: Outer Planet */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute w-32 h-32 rounded-full border border-white/5"
        >
          <div className="absolute -top-1.5 left-1/4 w-3 h-3 rounded-full bg-[#5856D6] shadow-[0_0_8px_#5856D6]" />
        </motion.div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-5 h-5 text-[#007AFF] animate-spin-slow" />
        <h2 className="text-xl font-bold tracking-widest text-[#F2F2F7]">INITIALIZING SYSTEM</h2>
      </div>

      {/* Facts text carousel */}
      <div className="w-full max-w-sm px-6 text-center h-16 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={factIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-xs text-neutral-400 font-medium font-sans leading-relaxed"
          >
            {LOADING_FACTS[factIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mini loading progress bar */}
      <div className="w-32 h-1 rounded-full bg-neutral-800 overflow-hidden mt-6">
        <motion.div
          animate={{ x: [-128, 128] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full bg-[#007AFF] rounded-full"
        />
      </div>
    </div>
  );
}
export default LoadingScreen;
