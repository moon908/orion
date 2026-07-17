import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Weight, Thermometer, Orbit, Moon, Compass } from 'lucide-react';
import { useSolarStore } from '../store/useSolarStore';
import { CELESTIAL_BODIES } from '../constants/celestialData';

export function InfoPanel() {
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const setSelectedBodyId = useSolarStore((state) => state.setSelectedBodyId);

  // Horizons Live State
  const planetVectors = useSolarStore((state) => state.planetVectors);
  const useHorizonsTelemetry = useSolarStore((state) => state.useHorizonsTelemetry);
  const horizonsLoading = useSolarStore((state) => state.horizonsLoading);
  const horizonsError = useSolarStore((state) => state.horizonsError);

  const selectedBody = CELESTIAL_BODIES.find((b) => b.id === selectedBodyId);

  return (
    <AnimatePresence>
      {selectedBody && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="flex flex-col w-80 max-h-[85vh] rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white pointer-events-auto overflow-hidden"
        >
          {/* Header Card */}
          <div className="relative p-5 text-white flex flex-col justify-end min-h-[100px]" style={{ backgroundColor: selectedBody.color }}>
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/35" />
            <button
              onClick={() => setSelectedBodyId(null)}
              className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm text-white transition-colors border border-white/10"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative z-10">
              <span className="text-[9px] font-bold tracking-widest text-[#FFF] uppercase opacity-90">
                {selectedBody.type === 'star' ? 'Main Sequence Star' : selectedBody.type === 'dwarf' ? 'Dwarf Planet' : 'Inner/Outer Planet'}
              </span>
              <h2 className="text-2xl font-black tracking-tight">{selectedBody.name}</h2>
            </div>
          </div>

          {/* Details Scroll Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar text-xs">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Diameter */}
              <div className="p-3 rounded-xl bg-white/[0.07] border border-white/15">
                <div className="flex items-center gap-1.5 text-[#8E8DFF] mb-1 font-bold">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Diameter</span>
                </div>
                <div className="text-sm font-black text-white">{selectedBody.diameter.toLocaleString()} km</div>
              </div>

              {/* Mass */}
              <div className="p-3 rounded-xl bg-white/[0.07] border border-white/15">
                <div className="flex items-center gap-1.5 text-[#8E8DFF] mb-1 font-bold">
                  <Weight className="w-3.5 h-3.5" />
                  <span>Mass</span>
                </div>
                <div className="text-xs font-black text-white leading-tight break-all">{selectedBody.mass}</div>
              </div>

              {/* Distance from Sun */}
              <div className="p-3 rounded-xl bg-white/[0.07] border border-white/15">
                <div className="flex items-center gap-1.5 text-[#8E8DFF] mb-1 font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Distance</span>
                </div>
                <div className="text-sm font-black text-white">
                  {selectedBody.id === 'sun' ? 'Center' : `${selectedBody.distanceFromSun.toLocaleString()}M km`}
                </div>
              </div>

              {/* Temp */}
              <div className="p-3 rounded-xl bg-white/[0.07] border border-white/15">
                <div className="flex items-center gap-1.5 text-[#8E8DFF] mb-1 font-bold">
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Avg Temp</span>
                </div>
                <div className="text-xs font-black text-white leading-tight">{selectedBody.temperature}</div>
              </div>
            </div>

            {/* Orbit & Rotation Stats */}
            <div className="p-4 rounded-2xl bg-white/[0.07] border border-white/15 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-[#007AFF] font-bold">
                <Orbit className="w-4 h-4" />
                <span>Orbital Mechanics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold">Orbital Period:</span>
                <span className="font-extrabold text-white">
                  {selectedBody.orbitalPeriod === 0 ? 'Static (Ref Frame)' : `${selectedBody.orbitalPeriod.toLocaleString()} Earth days`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold">Rotation Period:</span>
                <span className="font-extrabold text-white">
                  {Math.abs(selectedBody.rotationPeriod) < 24
                    ? `${selectedBody.rotationPeriod.toFixed(1)} hours`
                    : `${(selectedBody.rotationPeriod / 24).toFixed(1)} Earth days`}
                  {selectedBody.rotationPeriod < 0 && ' (Retrograde)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold">Surface Gravity:</span>
                <span className="font-extrabold text-white">{selectedBody.gravity} m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold">Satellites (Moons):</span>
                <span className="flex items-center gap-1 font-extrabold text-[#007AFF]">
                  <Moon className="w-3.5 h-3.5" />
                  {selectedBody.moonsCount}
                </span>
              </div>
            </div>

            {/* Atmosphere section */}
            <div className="p-4 rounded-2xl bg-white/[0.07] border border-white/15 space-y-2.5">
              <h4 className="font-bold text-white border-b border-white/10 pb-1.5">Atmosphere & Envelope</h4>
              <p className="text-[11px] text-white leading-relaxed font-semibold italic">{selectedBody.atmosphere.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedBody.atmosphere.composition.map((gas) => (
                  <span
                    key={gas}
                    className="px-2 py-0.5 rounded-full bg-white/15 border border-white/10 text-white font-bold text-[10px]"
                  >
                    {gas}
                  </span>
                ))}
              </div>
            </div>

            {/* Facts Section */}
            <div className="space-y-2">
              <h4 className="font-bold text-white pl-1">Mission Log / Quick Facts</h4>
              <ul className="space-y-2.5">
                {selectedBody.interestingFacts.map((fact, index) => (
                  <li
                    key={index}
                    className="p-3 rounded-xl bg-white/[0.06] border border-white/10 text-white font-semibold leading-relaxed font-sans"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default InfoPanel;
