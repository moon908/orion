import React from 'react';
import { motion } from 'framer-motion';
import { useSolarStore } from '../store/useSolarStore';
import { CELESTIAL_BODIES } from '../constants/celestialData';

export function Sidebar() {
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const setSelectedBodyId = useSolarStore((state) => state.setSelectedBodyId);
  const hoveredBodyId = useSolarStore((state) => state.hoveredBodyId);
  const setHoveredBodyId = useSolarStore((state) => state.setHoveredBodyId);

  const activeItemRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedBodyId]);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col w-64 max-h-[80vh] px-4 py-6 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white pointer-events-auto"
    >
      <div className="mb-4">
        <h2 className="text-xs font-bold tracking-widest text-[#8E8DFF] uppercase">CELESTIAL OBJECTS</h2>
        <p className="text-[10px] text-white font-bold">Select target to lock telemetry</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {CELESTIAL_BODIES.map((body) => {
          const isSelected = selectedBodyId === body.id;
          const isHovered = hoveredBodyId === body.id;

          return (
            <button
              key={body.id}
              ref={isSelected ? activeItemRef : null}
              onClick={() => setSelectedBodyId(body.id)}
              onMouseEnter={() => setHoveredBodyId(body.id)}
              onMouseLeave={() => setHoveredBodyId(null)}
              className={`flex items-center justify-between w-full p-2.5 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25'
                  : isHovered
                  ? 'bg-white/15 text-white'
                  : 'hover:bg-white/5 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Visual Icon Capsule: circular color circle */}
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                  style={{
                    backgroundColor: body.color,
                    boxShadow: isSelected ? `0 0 10px ${body.color}` : 'none'
                  }}
                />
                <div>
                  <div className={`text-sm font-bold tracking-tight ${isSelected ? 'text-white' : 'text-white'}`}>
                    {body.name}
                  </div>
                  <div className={`text-[10px] font-extrabold capitalize leading-none ${isSelected ? 'text-blue-100' : 'text-[#A5F3FC]'}`}>
                    {body.type === 'star' ? 'G2V Star' : body.type === 'dwarf' ? 'Dwarf Planet' : 'Planet'}
                  </div>
                </div>
              </div>

              {/* Focus indicators */}
              {isSelected && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-2 h-2 rounded-full bg-white shadow"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
export default Sidebar;
