import React from 'react';
import { Play, Pause, RotateCcw, Calendar, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { useSolarStore } from '../store/useSolarStore';

export function TimeControls() {
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const setTimeSpeed = useSolarStore((state) => state.setTimeSpeed);
  
  const simDate = useSolarStore((state) => state.simDate);
  const setSimDate = useSolarStore((state) => state.setSimDate);
  const setShowAsteroids = useSolarStore((state) => state.setShowAsteroids);
  const setShowAsteroidTracker = useSolarStore((state) => state.setShowAsteroidTracker);
  const setSelectedBodyId = useSolarStore((state) => state.setSelectedBodyId);
  const setCameraMode = useSolarStore((state) => state.setCameraMode);
  const setShowJwstDashboard = useSolarStore((state) => state.setShowJwstDashboard);
  
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

  const presets = [
    { name: 'Asteroid Tracking', date: new Date('2026-07-17T12:00:00Z'), desc: 'Asteroid tracking mode' },
    { name: 'JWST', date: new Date('2021-12-25T12:20:00Z'), desc: 'James Webb Space Telescope Launch (2021)' },
    { name: 'Curiosity', date: new Date('2012-08-06T05:17:57Z'), desc: 'Curiosity Mars Landing (2012)' },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    setSimDate(preset.date);
    if (preset.name === 'Asteroid Tracking') {
      setShowAsteroids(true);
      setShowAsteroidTracker(true);
    } else if (preset.name === 'JWST') {
      setSelectedBodyId('jwst');
      setCameraMode('follow');
      setShowJwstDashboard(false);
    }
  };

  return (
    <div className="relative w-full pointer-events-auto">
      {/* Centered Preset Epoch Buttons above bottom controls (absolutely positioned to prevent layout height changes) */}
      <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2.5 w-max max-w-[90vw] z-20">
        {presets.map((preset) => {
          const isActive = simDate.toDateString() === preset.date.toDateString();
          return (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-[#007AFF] text-white border border-[#007AFF] shadow-[0_0_12px_rgba(0,122,255,0.4)] scale-105 font-bold'
                  : 'bg-white/[0.05] hover:bg-white/[0.12] text-white/80 hover:text-white border border-white/10 hover:border-white/25 hover:scale-102'
              }`}
              title={`Jump telemetry to: ${preset.desc}`}
            >
              <Rocket className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8E8DFF]'}`} />
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Controls Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full px-6 py-4 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white">
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
    </div>
  );
}
export default TimeControls;
