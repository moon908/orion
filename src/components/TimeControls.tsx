import React from 'react';
import { Play, Pause, RotateCcw, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSolarStore } from '../store/useSolarStore';

export function TimeControls() {
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const setTimeSpeed = useSolarStore((state) => state.setTimeSpeed);
  
  const simDate = useSolarStore((state) => state.simDate);
  const setSimDate = useSolarStore((state) => state.setSimDate);
  
  const isPaused = timeSpeed === 0;

  // Track the last positive speed, default to 1
  const lastActiveSpeed = React.useRef(timeSpeed !== 0 ? timeSpeed : 1);

  React.useEffect(() => {
    if (timeSpeed !== 0) {
      lastActiveSpeed.current = timeSpeed;
    }
  }, [timeSpeed]);

  const togglePlay = () => {
    if (isPaused) {
      // Resume to last active speed
      setTimeSpeed(lastActiveSpeed.current);
    } else {
      // Pause
      setTimeSpeed(0);
    }
  };

  const handleSpeedSelect = (multiplier: number) => {
    // Maintain sign (forward vs reverse) when switching speeds
    const isReverse = timeSpeed < 0;
    const nextSpeed = isReverse ? -multiplier : multiplier;
    setTimeSpeed(nextSpeed);
  };

  const toggleReverse = () => {
    if (timeSpeed === 0) {
      // Start backward play at -1x
      setTimeSpeed(-1);
    } else {
      // Invert speed direction
      setTimeSpeed(-timeSpeed);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        setSimDate(parsedDate);
      }
    }
  };

  const formattedDate = simDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = simDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const speedOptions = [1, 10, 100, 1000, 1000000];
  const activeSpeedMagnitude = Math.abs(timeSpeed);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full px-6 py-4 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white pointer-events-auto">
      {/* Date & Chronology Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-[#007AFF] shadow-sm">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold tracking-widest text-white uppercase leading-none mb-1">
            SIMULATION EPOCH
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-white leading-none">{formattedDate}</span>
            <span className="text-xs font-bold text-[#8E8DFF] leading-none">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Primary Capsule Timeline Controls */}
      <div className="flex items-center gap-2 bg-white/[0.06] border border-white/15 p-1 rounded-xl">
        {/* Rewind/Reverse Toggle */}
        <button
          onClick={toggleReverse}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
            timeSpeed < 0
              ? 'bg-[#D75800] text-white shadow'
              : 'hover:bg-white/10 text-white'
          }`}
          title="Toggle Reverse playback (timeline replay)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={togglePlay}
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
            isPaused
              ? 'bg-white/5 text-white hover:bg-white/15'
              : 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25'
          }`}
          title={isPaused ? 'Resume simulation' : 'Pause simulation'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
        </button>

        {/* Step Forward / Normal Play indicator */}
        <button
          onClick={() => timeSpeed <= 0 && setTimeSpeed(1)}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
            timeSpeed > 0
              ? 'bg-[#007AFF] text-white shadow'
              : 'hover:bg-white/10 text-white'
          }`}
          title="Resume forward play"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Multiplier Segmented control */}
      <div className="flex items-center gap-1 bg-white/[0.06] border border-white/15 p-1 rounded-xl text-xs font-bold">
        {speedOptions.map((mult) => {
          const isActive = activeSpeedMagnitude === mult && !isPaused;
          return (
            <button
              key={mult}
              onClick={() => handleSpeedSelect(mult)}
              className={`px-3 py-1 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'hover:bg-white/10 text-white'
              }`}
            >
              {mult.toLocaleString()}x
            </button>
          );
        })}
      </div>

      {/* Date Warp Input & Reset Today */}
      <div className="flex items-center gap-2">
        {/* Warp Date input */}
        <div className="flex items-center px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 shadow-inner text-xs font-bold focus-within:ring-2 focus-within:ring-[#007AFF] transition-all">
          <input
            type="date"
            onChange={handleDateChange}
            value={simDate.toISOString().split('T')[0]}
            className="bg-transparent border-none outline-none text-white font-sans cursor-pointer"
          />
        </div>

        {/* Reset to Today */}
        <button
          onClick={() => setSimDate(new Date())}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white/5 border border-white/20 hover:bg-white/10 text-white shadow-sm transition-all"
          title="Warp to current real date and time"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Today</span>
        </button>
      </div>
    </div>
  );
}
export default TimeControls;
