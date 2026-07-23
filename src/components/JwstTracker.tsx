"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Radio, Thermometer, Compass, Settings, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { useSolarStore } from '../store/useSolarStore';

interface MirrorSegment {
  id: string;
  name: string;
  wavefrontError: string;
  temp: string;
  aligned: boolean;
  row: number;
  col: number;
}

export function JwstTracker() {
  const setSelectedBodyId = useSolarStore((state) => state.setSelectedBodyId);

  // 18 Hexagonal primary mirror segments matching JWST's real mirror coordinate layout
  const mirrorSegments: MirrorSegment[] = [
    { id: 'a1', name: 'Segment A1', wavefrontError: '8.4 nm', temp: '36.8 K', aligned: true, row: 1, col: 2 },
    { id: 'a2', name: 'Segment A2', wavefrontError: '9.1 nm', temp: '36.9 K', aligned: true, row: 1, col: 4 },
    { id: 'a3', name: 'Segment A3', wavefrontError: '7.8 nm', temp: '37.1 K', aligned: true, row: 2, col: 1 },
    { id: 'a4', name: 'Segment A4', wavefrontError: '8.2 nm', temp: '36.7 K', aligned: true, row: 2, col: 5 },
    { id: 'a5', name: 'Segment A5', wavefrontError: '9.3 nm', temp: '36.9 K', aligned: true, row: 3, col: 2 },
    { id: 'a6', name: 'Segment A6', wavefrontError: '8.0 nm', temp: '37.0 K', aligned: true, row: 3, col: 4 },
    { id: 'b1', name: 'Segment B1', wavefrontError: '7.5 nm', temp: '37.2 K', aligned: true, row: 0, col: 2 },
    { id: 'b2', name: 'Segment B2', wavefrontError: '8.6 nm', temp: '36.9 K', aligned: true, row: 0, col: 4 },
    { id: 'b3', name: 'Segment B3', wavefrontError: '9.0 nm', temp: '36.8 K', aligned: true, row: 1, col: 5 },
    { id: 'b4', name: 'Segment B4', wavefrontError: '8.4 nm', temp: '37.1 K', aligned: true, row: 3, col: 5 },
    { id: 'b5', name: 'Segment B5', wavefrontError: '7.9 nm', temp: '36.7 K', aligned: true, row: 4, col: 4 },
    { id: 'b6', name: 'Segment B6', wavefrontError: '8.3 nm', temp: '36.9 K', aligned: true, row: 4, col: 2 },
    { id: 'b7', name: 'Segment B7', wavefrontError: '8.8 nm', temp: '37.0 K', aligned: true, row: 3, col: 1 },
    { id: 'b8', name: 'Segment B8', wavefrontError: '9.2 nm', temp: '36.8 K', aligned: true, row: 1, col: 1 },
    { id: 'c1', name: 'Segment C1', wavefrontError: '8.1 nm', temp: '36.9 K', aligned: true, row: 0, col: 3 },
    { id: 'c2', name: 'Segment C2', wavefrontError: '7.6 nm', temp: '37.1 K', aligned: true, row: 2, col: 6 },
    { id: 'c3', name: 'Segment C3', wavefrontError: '8.5 nm', temp: '37.0 K', aligned: true, row: 4, col: 3 },
    { id: 'c4', name: 'Segment C4', wavefrontError: '9.0 nm', temp: '36.8 K', aligned: true, row: 2, col: 0 }
  ];

  const galleryImages = [
    {
      title: "Deep Field SMACS 0723",
      desc: "Webb's first deep field showing thousands of galaxies, including the faintest objects ever observed in the infrared.",
      url: "/images/jwst/deep_field.jpg"
    },
    {
      title: "Cosmic Cliffs (Carina Nebula)",
      desc: "A stellar nursery revealing emerging stellar baby stars and hot ionized gas clouds previously hidden behind dust.",
      url: "/images/jwst/cosmic_cliffs.jpg"
    },
    {
      title: "Pillars of Creation",
      desc: "Newly formed baby stars stand out in neon red columns of gas and dust inside the Eagle Nebula in infrared detail.",
      url: "/images/jwst/pillars_of_creation.jpg"
    }
  ];

  const [hoveredSeg, setHoveredSeg] = useState<MirrorSegment | null>(mirrorSegments[0]);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-[92vw] lg:w-[85vw] h-[85vh] rounded-[24px] bg-[#09090C]/90 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-white font-sans"
      >
        {/* Header HUD */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white">JWST TELEMETRY COMMAND</h2>
              <p className="text-[10px] text-white/55 font-bold uppercase">James Webb Space Telescope Operations (L2)</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedBodyId(null)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dashboard Panels */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 custom-scrollbar">
          
          {/* Column 1: Mission Diagnostics (Left) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Status Panel */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3">
              <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-wider">Mission Profile</span>
              
              <div className="space-y-2.5 text-[11px] font-semibold text-white/80">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/50">Launch Date:</span>
                  <span className="text-white font-bold">Dec 25, 2021</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/50">Location:</span>
                  <span className="text-[#FF9500] font-black">Lagrange Point L2</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/50">Orbit:</span>
                  <span className="text-white font-bold">Halo Orbit (6mo Period)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/50">Spacecraft Mass:</span>
                  <span className="text-white font-bold">6,500 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Primary Mirror:</span>
                  <span className="text-white font-bold">6.5m (Beryllium-Gold)</span>
                </div>
              </div>
            </div>

            {/* Diagnostics Stats */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3">
              <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-wider">Telemetry Diagnostics</span>
              
              <div className="space-y-3">
                {/* Fuel */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1 font-bold">
                    <span className="text-white/50">Propellant Reserves:</span>
                    <span className="text-[#34C759]">94.2% (Est. 20yr life)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-[#34C759] rounded-full" style={{ width: '94.2%' }} />
                  </div>
                </div>

                {/* Wavefront Alignment */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1 font-bold">
                    <span className="text-white/50">Global Alignment:</span>
                    <span className="text-[#007AFF]">Wavefront Aligned</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-[#007AFF] rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Communications link */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-mono leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-ping" />
                    <span className="text-white/50">DSN DOWNLINK:</span>
                  </div>
                  <span className="font-bold text-white">-112.5 dBm (Ka-Band)</span>
                </div>
              </div>
            </div>

            {/* Instrument Suite list */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex-1 flex flex-col gap-2.5 min-h-[160px]">
              <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-wider">Scientific Instruments</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold">NIRCam (Near-IR Camera)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#34C759]/25 text-[#34C759] font-extrabold">38.2 K</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold">NIRSpec (Near-IR Spectrograph)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#34C759]/25 text-[#34C759] font-extrabold">37.8 K</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold">MIRI (Mid-IR Instrument)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF3B30]/25 text-[#FF3B30] font-extrabold animate-pulse">6.4 K (Cryocooled)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Mirror Alignment Array (Center) */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-between min-h-[350px]">
            <div className="w-full text-center mb-4">
              <span className="text-[9px] font-black tracking-widest text-[#007AFF] uppercase">Wavefront Alignment Matrix</span>
              <h3 className="text-xs font-bold text-white/75 mt-0.5">Primary Mirror Segments Array</h3>
            </div>

            {/* Honeycomb Mirror Array */}
            <div className="relative flex items-center justify-center flex-1 w-full max-w-[280px] aspect-square">
              {/* Central secondary mirror shadow blocker */}
              <div className="absolute w-8 h-8 rounded-full bg-black/60 border border-white/10 z-10 flex items-center justify-center">
                <Settings className="w-3.5 h-3.5 text-white/40" />
              </div>

              {/* Hexagon honeycombs via grid translation mapping */}
              <div className="grid grid-cols-7 gap-y-1 gap-x-2 w-full">
                {Array.from({ length: 5 }).map((_, r) => (
                  <React.Fragment key={r}>
                    {Array.from({ length: 7 }).map((_, c) => {
                      // Find if mirror segment exists at this honeycomb grid coordinates
                      const segment = mirrorSegments.find((s) => s.row === r && s.col === c);
                      if (!segment) {
                        return <div key={c} className="aspect-square opacity-0 pointer-events-none" />;
                      }

                      const isSelected = hoveredSeg?.id === segment.id;

                      return (
                        <div
                          key={segment.id}
                          onMouseEnter={() => setHoveredSeg(segment)}
                          className={`relative aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'scale-110 drop-shadow-[0_0_12px_#FFC72C]'
                              : 'hover:scale-105'
                          }`}
                          style={{
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                            backgroundColor: isSelected ? '#FFC72C' : 'rgba(212, 175, 55, 0.45)',
                            border: isSelected ? '1px solid #FFF' : '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <span className={`text-[8px] font-black leading-none uppercase ${isSelected ? 'text-black' : 'text-white'}`}>
                            {segment.id.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Highlighted Segment Details Card */}
            {hoveredSeg && (
              <div className="w-full mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/15 flex justify-between items-center animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#FFC72C]">{hoveredSeg.name}</span>
                  <span className="text-[9px] text-white/50 mt-0.5">Temp: {hoveredSeg.temp}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 block">Wavefront Error</span>
                  <span className="text-xs font-black text-[#34C759]">{hoveredSeg.wavefrontError} (Aligned)</span>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Thermal Sunshield & Gallery (Right) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Thermal Shield Status */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3">
              <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-wider">Thermal Sunshield Gradient</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2.5 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex flex-col">
                  <span className="text-[8px] text-white/60 font-bold uppercase">Hot Side (Sun facing)</span>
                  <span className="text-base font-black text-[#FF3B30] mt-0.5">85°C</span>
                  <span className="text-[8px] text-white/40 mt-0.5">Instruments Shielded</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#5856D6]/10 border border-[#5856D6]/20 flex flex-col">
                  <span className="text-[8px] text-white/60 font-bold uppercase">Cold Side (Deep Space)</span>
                  <span className="text-base font-black text-[#8E8DFF] mt-0.5">-233°C</span>
                  <span className="text-[8px] text-white/40 mt-0.5">Optimal IR Cooling</span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="relative h-2 rounded-full bg-gradient-to-r from-[#FF3B30] via-[#FF9500] to-[#5856D6] w-full overflow-hidden mt-1 shadow-inner">
                <div className="absolute top-0 bottom-0 left-[26%] right-[70%] bg-white/70 shadow-2xl w-1.5" title="Sunshield Boundary Layer" />
              </div>
            </div>

            {/* Gallery Panel */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-[#007AFF] uppercase tracking-wider">JWST Observation Log</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/70">Gallery</span>
              </div>

              {/* Active Slide Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={galleryImages[activeGalleryIndex].url}
                  alt={galleryImages[activeGalleryIndex].title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-2 inset-x-2.5 text-left text-white leading-tight">
                  <h4 className="text-[10px] font-black text-white">{galleryImages[activeGalleryIndex].title}</h4>
                  <p className="text-[8px] text-white/70 font-medium truncate mt-0.5">
                    {galleryImages[activeGalleryIndex].desc}
                  </p>
                </div>
              </div>

              {/* Slide Buttons */}
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={img.title}
                    onClick={() => setActiveGalleryIndex(i)}
                    className={`px-1 py-1.5 rounded-lg border text-[8px] font-black transition-all cursor-pointer truncate ${
                      activeGalleryIndex === i
                        ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-md shadow-[#007AFF]/15'
                        : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Slide {i + 1}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
export default JwstTracker;
