import * as THREE from 'three';

// Simple grid-based value noise for smooth organic textures
function noise2D(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  // Fade curves
  const u = xf * xf * (3.0 - 2.0 * xf);
  const v = yf * yf * (3.0 - 2.0 * yf);

  // Hash function for grid corner values
  const hash = (i: number, j: number) => {
    const val = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453123;
    return val - Math.floor(val);
  };

  const n00 = hash(xi, yi);
  const n10 = hash(xi + 1, yi);
  const n01 = hash(xi, yi + 1);
  const n11 = hash(xi + 1, yi + 1);

  // Bilinear interpolation
  const x1 = n00 + u * (n10 - n00);
  const x2 = n01 + u * (n11 - n01);
  return x1 + v * (x2 - x1);
}

// Fractal Brownian Motion (FBM) for complex planetary textures
function fbm(x: number, y: number, octaves = 5): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

/**
 * Procedural texture generators.
 * Each function draws to an in-memory canvas and returns a THREE.CanvasTexture.
 */
export const ProceduralTextures = {
  createMercuryTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Basic rock noise
        const nVal = fbm(nx * 5 + 10, ny * 5 + nz * 5, 4);
        const colVal = Math.floor(90 + nVal * 80);

        data[idx] = colVal;     // R
        data[idx + 1] = colVal; // G
        data[idx + 2] = colVal; // B
        data[idx + 3] = 255;    // A
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw some crater rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 30; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = Math.random() * 8 + 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createVenusTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Venus has thick, sweeping gas bands
        const nVal1 = fbm(nx * 3 + ny * 2, nz * 3 + y * 0.02, 4);
        const nVal2 = noise2D(nx * 10 + nVal1 * 2, ny * 10);
        
        // Base color yellow-orange
        const r = Math.floor(210 + nVal1 * 45);
        const g = Math.floor(165 + nVal2 * 40);
        const b = Math.floor(100 + nVal1 * 30);

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createEarthTexture: (): THREE.CanvasTexture => {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        // Spherical projection
        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Generate landmass noise (fractal)
        const landVal = fbm(nx * 2.2 + 5, ny * 2.2 - 2, 6);
        const isWater = landVal < 0.44;

        if (isWater) {
          // Oceans: deep blue to light blue
          const depth = landVal / 0.44;
          data[idx] = Math.floor(10 + depth * 20);      // R
          data[idx + 1] = Math.floor(40 + depth * 60);  // G
          data[idx + 2] = Math.floor(140 + depth * 90); // B
        } else {
          // Land: green forests, brown hills, white poles
          const alt = (landVal - 0.44) / 0.56;
          const isPole = Math.abs(nz) > 0.85;

          if (isPole) {
            // Ice Caps
            data[idx] = 245;
            data[idx + 1] = 245;
            data[idx + 2] = 250;
          } else if (alt > 0.6) {
            // Mountains: brown/beige
            data[idx] = Math.floor(139 - alt * 40);
            data[idx + 1] = Math.floor(115 - alt * 30);
            data[idx + 2] = Math.floor(85 - alt * 25);
          } else {
            // Forests/grassland: green
            data[idx] = Math.floor(34 + alt * 40);
            data[idx + 1] = Math.floor(120 + alt * 30);
            data[idx + 2] = Math.floor(40 + alt * 10);
          }
        }

        // Apply polar ice borders directly based on latitude
        if (Math.abs(nz) > 0.92) {
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
        }

        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createEarthCloudsTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Swirling cloud noise
        const cloudVal = fbm(nx * 4.5, ny * 4.5 + nz * 2, 5);
        const alpha = cloudVal > 0.45 ? Math.floor((cloudVal - 0.45) * 2.5 * 255) : 0;

        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = Math.min(alpha, 220); // semi-transparency
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  createMoonTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Cratered gray surface, dark basaltic seas (Maria)
        const seaVal = fbm(nx * 1.8 + 20, ny * 1.8, 3);
        const rockVal = fbm(nx * 8 + 5, ny * 8 + nz * 8, 5);

        let col = 110 + rockVal * 80;
        if (seaVal < 0.45) {
          // Maria: darker gray basalt
          col = 70 + rockVal * 40;
        }

        data[idx] = col;
        data[idx + 1] = col;
        data[idx + 2] = col;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Overlay bright impact craters and rays
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = Math.random() * 6 + 1;
      
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw faint rays out of major craters
      if (r > 4 && Math.random() > 0.5) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        for (let j = 0; j < 8; j++) {
          const angle = (j / 8) * 2 * Math.PI;
          const rayLen = Math.random() * 40 + 20;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createMarsTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Rust red with dark regions (Syrte major)
        const redVal = fbm(nx * 3 + 1, ny * 3, 5);
        const darkRegionVal = fbm(nx * 1.5 - 5, ny * 1.5 + nz, 3);

        let r = 180 + redVal * 75;
        let g = 80 + redVal * 40;
        let b = 45 + redVal * 20;

        if (darkRegionVal < 0.4) {
          // Dark iron oxide regions
          r -= 40;
          g -= 15;
          b -= 5;
        }

        // Martian white ice polar caps
        if (Math.abs(nz) > 0.88) {
          const capVal = fbm(nx * 5, ny * 5, 2);
          if (Math.abs(nz) + capVal * 0.1 > 0.90) {
            r = 240 + Math.random() * 15;
            g = 240 + Math.random() * 15;
            b = 245 + Math.random() * 10;
          }
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createJupiterTexture: (): THREE.CanvasTexture => {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      const sinLat = Math.sin(lat);
      const cosLat = Math.cos(lat);
      
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * sinLat;
        const ny = Math.sin(lon) * sinLat;
        const nz = cosLat;

        // Jupiter gas bands (based highly on Y coordinate with perturbations)
        const wave = Math.sin(y * 0.12 + fbm(nx * 4, ny * 4, 3) * 1.5);
        const nVal = fbm(nx * 8 + 12, ny * 8 + nz * 8, 4);

        // Define colors for zones (light beige) and belts (red-brown)
        let r = 185, g = 145, b = 110;

        if (wave > 0.3) {
          // Warm red-brown belts
          r = Math.floor(155 + nVal * 40);
          g = Math.floor(95 + nVal * 25);
          b = Math.floor(65 + nVal * 15);
        } else if (wave < -0.3) {
          // Orange-brown belts
          r = Math.floor(190 + nVal * 45);
          g = Math.floor(130 + nVal * 30);
          b = Math.floor(85 + nVal * 20);
        } else {
          // Bright zones
          r = Math.floor(225 + nVal * 30);
          g = Math.floor(205 + nVal * 30);
          b = Math.floor(180 + nVal * 25);
        }

        // Great Red Spot coordinates around y = 330, x = 600 (22 deg south, 220 deg west)
        // Check local distance to the center of GRS
        const grsX = 0.6 * width;
        const grsY = 0.68 * height;
        
        // Elliptical distance metric
        const dx = (x - grsX) / 45;
        const dy = (y - grsY) / 22;
        const dist = dx * dx + dy * dy;

        if (dist < 1.0) {
          // GRS core
          const intensity = 1.0 - dist;
          r = Math.floor(r * (1 - intensity) + 185 * intensity);
          g = Math.floor(g * (1 - intensity) + 50 * intensity);
          b = Math.floor(b * (1 - intensity) + 30 * intensity);
        } else if (dist < 1.4) {
          // GRS swirl ring
          const intensity = (1.4 - dist) / 0.4;
          r = Math.floor(r * (1 - intensity) + 120 * intensity);
          g = Math.floor(g * (1 - intensity) + 65 * intensity);
          b = Math.floor(b * (1 - intensity) + 45 * intensity);
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createSaturnTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Soft linear gas bands
        const wave = Math.sin(y * 0.08 + Math.sin(y * 0.02) * 1.5);
        const nVal = noise2D(x * 0.04, y * 0.04) * 15;

        let r = 215, g = 190, b = 150;

        if (wave > 0.2) {
          // Yellow-brown bands
          r = Math.floor(215 + nVal);
          g = Math.floor(185 + nVal);
          b = Math.floor(135 + nVal);
        } else {
          // Cream bands
          r = Math.floor(235 + nVal);
          g = Math.floor(215 + nVal);
          b = Math.floor(180 + nVal);
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createUranusTexture: (): THREE.CanvasTexture => {
    const width = 256;
    const height = 128;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Faint, almost featureless gas lines
        const nVal = noise2D(x * 0.02, y * 0.05) * 8;

        data[idx] = Math.floor(190 + nVal);     // R
        data[idx + 1] = Math.floor(225 + nVal); // G
        data[idx + 2] = Math.floor(230 + nVal); // B
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createNeptuneTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Turbulent deep blue bands with bright clouds and dark storms
        const wave = Math.sin(y * 0.09 + fbm(nx * 3, ny * 3, 2));
        const nVal = fbm(nx * 6, ny * 6 + nz * 6, 4);

        let r = 40, g = 90, b = 210;

        if (wave > 0.4) {
          // Deep royal blue belts
          r = Math.floor(25 + nVal * 15);
          g = Math.floor(60 + nVal * 20);
          b = Math.floor(180 + nVal * 30);
        } else if (nVal > 0.62) {
          // White methane storm clouds
          r = Math.floor(120 + nVal * 100);
          g = Math.floor(160 + nVal * 80);
          b = Math.floor(255);
        } else {
          // Mid blue zones
          r = Math.floor(40 + nVal * 20);
          g = Math.floor(95 + nVal * 25);
          b = Math.floor(220 + nVal * 25);
        }

        // Great Dark Spot (around y = 170, x = 320)
        const gdsX = 0.55 * width;
        const gdsY = 0.65 * height;
        const dx = (x - gdsX) / 30;
        const dy = (y - gdsY) / 16;
        const dist = dx * dx + dy * dy;

        if (dist < 1.0) {
          const intensity = 1.0 - dist;
          r = Math.max(10, Math.floor(r * (1 - intensity) + 10 * intensity));
          g = Math.max(25, Math.floor(g * (1 - intensity) + 30 * intensity));
          b = Math.max(80, Math.floor(b * (1 - intensity) + 110 * intensity));
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createPlutoTexture: (): THREE.CanvasTexture => {
    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const lat = (y / height) * Math.PI;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const lon = (x / width) * 2 * Math.PI;

        const nx = Math.cos(lon) * Math.sin(lat);
        const ny = Math.sin(lon) * Math.sin(lat);
        const nz = Math.cos(lat);

        // Grayish-brown surface with dark blotches and a heart shape
        const nVal = fbm(nx * 4 + 8, ny * 4 - 8, 4);
        const blotch = fbm(nx * 1.5, ny * 1.5, 3);

        let r = 145 + nVal * 40;
        let g = 130 + nVal * 30;
        let b = 120 + nVal * 25;

        if (blotch < 0.38) {
          // Dark tholin regions
          r -= 55;
          g -= 45;
          b -= 40;
        }

        // Bright heart-shaped nitrogen glacier (Tombaugh Regio)
        // Centered around lat = 20N, lon = 180 (y = 120, x = 256)
        const hx = 0.5 * width;
        const hy = 0.58 * height;
        const dx = (x - hx) / 38;
        const dy = (y - hy) / 28;

        // Simple heart polar formula approximation
        // (x^2 + y^2 - 1)^3 - x^2 * y^3 = 0
        // We can just construct a beautiful dual-lobe distance check:
        // Left lobe center: dx = -0.3, dy = -0.1
        // Right lobe center: dx = 0.3, dy = -0.1
        const leftLobe = Math.pow(dx + 0.35, 2) + Math.pow(dy + 0.1, 2) * 1.3;
        const rightLobe = Math.pow(dx - 0.35, 2) + Math.pow(dy + 0.1, 2) * 1.3;
        const bottomPoint = Math.abs(dx) * 0.8 + (dy - 0.3); // V-shape at bottom

        const isHeart = (leftLobe < 0.32 || rightLobe < 0.32) || (dy >= -0.1 && bottomPoint < 0.25 && Math.abs(dx) < 0.65);

        if (isHeart) {
          const fade = Math.min(1, fbm(nx * 10, ny * 10, 2) * 0.5 + 0.8);
          r = Math.floor(235 * fade);
          g = Math.floor(220 * fade);
          b = Math.floor(210 * fade);
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  },

  createRingsTexture: (colorStr: string): THREE.CanvasTexture => {
    // Generates a 1D vertical texture mapped concentrically as a ring
    const width = 1;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Convert hex color to rgb
    const r = parseInt(colorStr.substring(1, 3), 16) || 220;
    const g = parseInt(colorStr.substring(3, 5), 16) || 200;
    const b = parseInt(colorStr.substring(5, 7), 16) || 160;

    for (let y = 0; y < height; y++) {
      // Concentric gaps using trig and noise
      const ringVal = Math.sin(y * 0.4) * Math.cos(y * 0.1) + Math.sin(y * 0.05) * 0.5;
      let alpha = Math.floor((ringVal * 0.5 + 0.5) * 200);

      // Create sharp Cassini division division & gaps
      if (y > 140 && y < 155) {
        alpha = 0; // Cassini division
      } else if (y > 60 && y < 65) {
        alpha = 10; // Encke gap
      } else if (y > 220 && y < 225) {
        alpha = 5; // Outer ring edge gap
      }

      data[y * 4] = Math.floor(r * 0.8 + (y / height) * r * 0.2);
      data[y * 4 + 1] = Math.floor(g * 0.8 + (y / height) * g * 0.2);
      data[y * 4 + 2] = Math.floor(b * 0.8 + (y / height) * b * 0.2);
      data[y * 4 + 3] = alpha;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
};
