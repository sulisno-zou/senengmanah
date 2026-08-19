import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  const scale = size / 512;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 250 * scale;
  const rInner = 172 * scale;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > rOuter) {
        // Transparent outside circle
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      } else if (dist >= rInner) {
        // Outer Blue Ring (#0022e6) with double white ring highlight
        const distFromEdge = rOuter - dist;
        const distFromInner = dist - rInner;
        if (distFromEdge >= 3 * scale && distFromEdge <= 6 * scale) {
          // White thin ring line
          png.data[idx] = 255;
          png.data[idx + 1] = 255;
          png.data[idx + 2] = 255;
          png.data[idx + 3] = 255;
        } else if (distFromInner >= 1 * scale && distFromInner <= 4 * scale) {
          // White inner separator line
          png.data[idx] = 255;
          png.data[idx + 1] = 255;
          png.data[idx + 2] = 255;
          png.data[idx + 3] = 255;
        } else {
          // Deep Royal Blue (#0022e6)
          png.data[idx] = 0;
          png.data[idx + 1] = 34;
          png.data[idx + 2] = 230;
          png.data[idx + 3] = 255;
        }
      } else {
        // Inside Circle (White #FFFFFF background)
        let r = 255, g = 255, b = 255;

        // Red Crescent Moon check
        // Outer moon circle center (-40*scale, +10*scale from center)
        const moonDx1 = x - (cx - 35 * scale);
        const moonDy1 = y - (cy + 10 * scale);
        const moonDist1 = Math.sqrt(moonDx1 * moonDx1 + moonDy1 * moonDy1);

        // Inner moon cut circle
        const moonDx2 = x - (cx + 10 * scale);
        const moonDy2 = y - (cy - 10 * scale);
        const moonDist2 = Math.sqrt(moonDx2 * moonDx2 + moonDy2 * moonDy2);

        if (moonDist1 < 145 * scale && moonDist2 > 125 * scale && x < cx + 40 * scale) {
          // Red Crescent (#e60000)
          r = 230;
          g = 0;
          b = 0;
        }

        // Archer Central Silhouette
        const nx = (x - cx) / scale; // coordinate relative to 512x512 center (0,0 is cx,cy)
        const ny = (y - cy) / scale;

        // Head (around nx: -26, ny: -76)
        const headDist = Math.sqrt((nx + 26) * (nx + 26) + (ny + 76) * (ny + 76));
        if (headDist < 18) {
          r = 10; g = 10; b = 10;
        }

        // Torso (-50 <= nx <= 0, -55 <= ny <= 40)
        if (nx >= -50 && nx <= 0 && ny >= -55 && ny <= 40) {
          const torsoWidth = 44 - (ny + 55) * 0.1;
          if (Math.abs(nx + 25) < torsoWidth / 2) {
            r = 10; g = 10; b = 10;
          }
        }

        // Left Leg (-50 <= nx <= -25, 40 <= ny <= 140)
        if (nx >= -52 && nx <= -20 && ny >= 40 && ny <= 140) {
          r = 10; g = 10; b = 10;
        }

        // Right Leg (-15 <= nx <= 15, 40 <= ny <= 140)
        if (nx >= -18 && nx <= 15 && ny >= 40 && ny <= 140) {
          r = 10; g = 10; b = 10;
        }

        // Quiver on Hip (-65 <= nx <= -45, 0 <= ny <= 60)
        if (nx >= -65 && nx <= -45 && ny >= 0 && ny <= 60) {
          r = 10; g = 10; b = 10;
        }

        // Left Arm (extended up-right towards bow: -10 <= nx <= 70, -120 <= ny <= -50)
        const armLineDist = Math.abs(ny - (-0.9 * nx - 60));
        if (armLineDist < 12 && nx >= -15 && nx <= 70 && ny >= -125 && ny <= -45) {
          r = 10; g = 10; b = 10;
        }

        // Right Arm (drawing string back to chin: -85 <= nx <= -20, -60 <= ny <= -35)
        const drawArmDist = Math.abs(ny - (0.4 * nx - 35));
        if (drawArmDist < 11 && nx >= -85 && nx <= -20 && ny >= -70 && ny <= -35) {
          r = 10; g = 10; b = 10;
        }

        // Bow Curve (around nx: 70, ny: -120, curving up and down)
        const bowDx = nx - 70;
        const bowDy = ny - (-120);
        // Upper limb
        if (nx >= 0 && nx <= 75 && ny >= -155 && ny <= -115) {
          const curveDist = Math.abs((nx - 70) * (nx - 70) / 40 + (ny + 120) - 0);
          if (curveDist < 8) {
            r = 10; g = 10; b = 10;
          }
        }
        // Lower limb
        if (nx >= 65 && nx <= 95 && ny >= -125 && ny <= -30) {
          const lowerCurveDist = Math.abs((nx - 70) - 0.25 * (ny + 120));
          if (lowerCurveDist < 5) {
            r = 10; g = 10; b = 10;
          }
        }

        // Arrow on String (line from -25,-65 to 80,-130)
        const arrowDist = Math.abs((ny + 65) - (-0.62 * (nx + 25)));
        if (arrowDist < 3.5 && nx >= -25 && nx <= 85 && ny >= -135 && ny <= -60) {
          r = 10; g = 10; b = 10;
        }

        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      }
    }
  }

  return png;
}

const icon192 = createIcon(192);
const icon512 = createIcon(512);

fs.writeFileSync('./public/icon-192.png', PNG.sync.write(icon192));
fs.writeFileSync('./public/icon-512.png', PNG.sync.write(icon512));
fs.writeFileSync('./public/logo.png', PNG.sync.write(icon512));
fs.writeFileSync('./public/apple-touch-icon.png', PNG.sync.write(icon192));
console.log('Icons generated successfully in /public!');
