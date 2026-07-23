import React, { useState } from 'react';
import { Search, RefreshCw, Eye, EyeOff, Scale, Compass, Target } from 'lucide-react';
import { useSolarStore } from '../store/useSolarStore';
import { CELESTIAL_BODIES } from '../constants/celestialData';

export function Toolbar() {
  const searchQuery = useSolarStore((state) => state.searchQuery);
  const setSearchQuery = useSolarStore((state) => state.setSearchQuery);
  const setSelectedBodyId = useSolarStore((state) => state.setSelectedBodyId);
  const setCameraMode = useSolarStore((state) => state.setCameraMode);

  const scaleMode = useSolarStore((state) => state.scaleMode);
  const setScaleMode = useSolarStore((state) => state.setScaleMode);

  const orbitLinesVisible = useSolarStore((state) => state.orbitLinesVisible);
  const setOrbitLinesVisible = useSolarStore((state) => state.setOrbitLinesVisible);

  const showAsteroids = useSolarStore((state) => state.showAsteroids);
  const setShowAsteroids = useSolarStore((state) => state.setShowAsteroids);

  const showAsteroidTracker = useSolarStore((state) => state.showAsteroidTracker);
  const setShowAsteroidTracker = useSolarStore((state) => state.setShowAsteroidTracker);

  const resetSim = useSolarStore((state) => state.resetSim);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length > 0) {
      const filtered = CELESTIAL_BODIES.filter((body) =>
        body.name.toLowerCase().includes(val.toLowerCase())
      ).map((body) => body.name);

      if ('james webb space telescope jwst'.includes(val.toLowerCase())) {
        filtered.push('JWST');
      }

      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    if (name === 'JWST') {
      setSelectedBodyId('jwst');
      setCameraMode('follow');
      setSearchQuery('');
      setShowDropdown(false);
      return;
    }
    const body = CELESTIAL_BODIES.find((b) => b.name === name);
    if (body) {
      setSelectedBodyId(body.id);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      if ('james webb space telescope jwst'.includes(searchQuery.toLowerCase())) {
        setSelectedBodyId('jwst');
        setCameraMode('follow');
        setSearchQuery('');
        setShowDropdown(false);
        return;
      }
      const match = CELESTIAL_BODIES.find((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        setSelectedBodyId(match.id);
        setSearchQuery('');
        setShowDropdown(false);
      }
    }
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full px-6 py-4 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white pointer-events-auto">
      {/* App Branding */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25">
          <Compass className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-none">ORION</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-xs">
        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-[#007AFF] transition-all">
            <Search className="w-4 h-4 text-white" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
              placeholder="Search planets, moons, dwarfs..."
              className="w-full bg-transparent text-sm text-white placeholder-white/90 font-medium outline-none border-none font-sans"
            />
          </div>
        </form>

        {/* Suggestion Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 mt-2 py-1 max-h-48 overflow-y-auto rounded-xl bg-black/85 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150 custom-scrollbar">
            {suggestions.map((name) => (
              <li
                key={name}
                onMouseDown={() => handleSuggestionClick(name)}
                className="px-4 py-2 text-sm text-white font-bold hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Settings & Telemetry Multi-Select Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Real Scale */}
        <button
          onClick={() => setScaleMode(scaleMode === 'visual' ? 'realistic' : 'visual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border transition-all ${
            scaleMode === 'realistic'
              ? 'bg-[#007AFF] text-white border-white/10 shadow-md shadow-[#007AFF]/25'
              : 'bg-white/5 text-white border border-white/20 hover:bg-white/15 hover:text-white'
          }`}
          title="Toggle realistic sizes/distances vs visual helper sizes"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{scaleMode === 'realistic' ? 'Realistic Scale' : 'Visual Scale'}</span>
        </button>

        {/* Toggle Orbits */}
        <button
          onClick={() => setOrbitLinesVisible(!orbitLinesVisible)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border transition-all ${
            orbitLinesVisible
              ? 'bg-[#007AFF] text-white border-white/10 shadow-md shadow-[#007AFF]/25'
              : 'bg-white/5 text-white border border-white/20 hover:bg-white/15 hover:text-white'
          }`}
          title="Show or hide planet orbital trajectory path lines"
        >
          {orbitLinesVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Orbits</span>
        </button>

        {/* Toggle Asteroids */}
        <button
          onClick={() => setShowAsteroids(!showAsteroids)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border transition-all ${
            showAsteroids
              ? 'bg-[#007AFF] text-white border-white/10 shadow-md shadow-[#007AFF]/25'
              : 'bg-white/5 text-white border border-white/20 hover:bg-white/15 hover:text-white'
          }`}
          title="Show or hide Asteroid & Kuiper belts"
        >
          {showAsteroids ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Belts</span>
        </button>

        {/* Toggle Asteroid Tracker */}
        <button
          onClick={() => setShowAsteroidTracker(!showAsteroidTracker)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border transition-all ${
            showAsteroidTracker
              ? 'bg-[#007AFF] text-white border-white/10 shadow-md shadow-[#007AFF]/25'
              : 'bg-white/5 text-white border border-white/20 hover:bg-white/15 hover:text-white'
          }`}
          title="Open Live Near-Earth Asteroid Tracker (NeoWs)"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Asteroid Tracker</span>
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block"></div>

        {/* Reset System */}
        <button
          onClick={() => {
            resetSim();
            setCameraMode('free');
          }}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 text-[#D75800] border border-white/20 hover:bg-white/15 shadow-sm hover:rotate-180 transition-all duration-300"
          title="Reset simulation parameters and return camera to Sun center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
export default Toolbar;
