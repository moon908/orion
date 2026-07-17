# Orion: Solar System Simulation (NASA Eyes Inspired)

Orion is a production-quality, scientifically-inspired, highly interactive 3D Solar System Simulation web application built with **Next.js 15 (App Router)**, **React Three Fiber (R3F)**, **Three.js**, **Tailwind CSS (v4)**, **Zustand**, and **Framer Motion**.

The simulation computes Keplerian orbital mechanics in real-time, features dynamic procedural textures and solar corona shaders, and houses a high-tech floating glass heads-up display (HUD) that adheres to custom design specs.

## 🚀 Key Features

1. **Precision Physics**: Real-time Keplerian orbital positioning solving Kepler's Equation ($E - e \sin(E) = M$) using Newton-Raphson approximation. Runs frame-rate independently using delta time.
2. **Dual-Scale Modes**:
   - *Visual Mode*: Logarithmic scaling of planetary sizes and distances to visualize the entire system simultaneously.
   - *Realistic Mode*: True scientific relative sizes and orbital distances (useful for scale comparisons).
3. **High-Tech Cockpit HUD**:
   - Floating glassmorphism cards featuring Primary `#007AFF` (active markers), Secondary `#5856D6` (badges), and Tertiary `#D75800` (critical timeline rewind markers) states.
   - Left Sidebar listing all celestial bodies with click-to-focus.
   - Right Info Panel compiling planetary mass, radius, diameter, moons, and atmospheric compositions.
   - Bottom Time Travelers deck with a Date Warp picker, normal speed multipliers up to $1,000,000\times$, play/pause, and negative-speed reverse playback (timeline replay).
   - Top Toolbar with search auto-completion, trajectory orbit line toggles, and asteroid/kuiper belt switches.
4. **Breathtaking Visual Effects**:
   - GPU Twinkling Stars field.
   - Animated Solar Corona Shader.
   - Custom Atmospheric Glow (Rayleigh scattering approximation).
   - Translucent concentric ring systems (Saturn and Uranus).
   - Bloom and HDR tone-mapping post-processing.
5. **Procedural Planet Surfaces**:
   - Zero-asset delay. Generates continental maps (Earth), gas giant bands (Jupiter, Saturn), crater rays (Mercury, Moon), and tholin-rich icy terrains (Pluto) programmatically using JS Fractal Noise (FBM) engines on load.
6. **Future-Ready Design**:
   - Includes custom integration hooks (`useHorizons.ts`) configured with the NASA API key, pre-structured to query JPL Horizons state vectors or Near-Earth Object Web Services (NeoWs).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript + React
- **3D Graphics**: Three.js + React Three Fiber + @react-three/drei
- **Post-Processing**: @react-three/postprocessing
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS + Lucide Icons

---

## 📦 Directory Structure

```
solar_system/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router (page, layout, styles)
│   ├── components/         # HUD Panels (Toolbar, Sidebar, InfoPanel, etc.)
│   ├── constants/          # Scientific parameters of celestial bodies
│   ├── hooks/              # Time simulation loops & NASA integration hooks
│   ├── store/              # Zustand state engine
│   ├── three/              # 3D canvas, Starfield, Sun, and Planet meshes
│   ├── types/              # Type-safe TypeScript interfaces
│   └── utils/              # Keplerian math and procedural textures
├── .env.local              # Local environment keys (NASA API key)
├── package.json
└── README.md
```

---

## 🚦 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18.0.0 or higher) and **npm** installed.

### 2. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 3. Running Locally
Launch the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the simulation.

### 4. Building for Production
Verify types, linting, and compile the optimized production build:
```bash
npm run build
```
Start the production server:
```bash
npm start
```
