'use strict';
/* =========================================================
   Super Noah – Grafik. Alles wird mit Formen gezeichnet,
   es gibt keine Bilddateien.
   ========================================================= */

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function circle(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (fill) { c.fillStyle = fill; c.fill(); } }
function ellipse(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); if (fill) { c.fillStyle = fill; c.fill(); } }
function tri(c, x1, y1, x2, y2, x3, y3, fill) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fillStyle = fill; c.fill(); }
function eye(c, x, y, r, look = 1, angry = false) {
  ellipse(c, x, y, r, r * 1.15, '#fff');
  circle(c, x + look * r * 0.35, y + r * 0.1, r * 0.55, '#111');
  circle(c, x + look * r * 0.35 + r * 0.2, y - r * 0.2, r * 0.18, '#fff');
  if (angry) { c.strokeStyle = '#111'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - r * 1.1, y - r * 1.5); c.lineTo(x + r * 1.1, y - r * 0.9); c.stroke(); }
}
function star5(c, x, y, R, r, rot, fill) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + i * Math.PI / 5 - Math.PI / 2, rad = i % 2 ? r : R;
    c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  c.closePath(); c.fillStyle = fill; c.fill();
}
function flame(c, cx, by, w, h, t, seed = 0) {
  const layers = [['#e53935', 1], ['#ff9800', 0.72], ['#ffeb3b', 0.42]];
  for (const [col, s] of layers) {
    const ww = w * s, hh = h * s * (0.9 + 0.12 * Math.sin(t * 13 + seed));
    const sway = Math.sin(t * 9 + seed * 3) * w * 0.12;
    c.beginPath();
    c.moveTo(cx - ww / 2, by);
    c.bezierCurveTo(cx - ww * 0.75, by - hh * 0.5, cx - ww * 0.1 + sway, by - hh * 0.6, cx + sway, by - hh);
    c.bezierCurveTo(cx + ww * 0.15 + sway, by - hh * 0.55, cx + ww * 0.8, by - hh * 0.45, cx + ww / 2, by);
    c.closePath(); c.fillStyle = col; c.fill();
  }
}
function heartShape(c, x, y, s, fill) {
  c.beginPath();
  c.moveTo(x, y + s * 0.3);
  c.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  c.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.75, x, y + s);
  c.bezierCurveTo(x, y + s * 0.75, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  c.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  c.fillStyle = fill; c.fill();
}

const THEMES = {
  dino:  { sky: ['#6fc3f0', '#d4f1fb'], dirt: '#9a6233', dirtDark: '#7a4a24', top: '#5cbf3a', topDark: '#3f9a28', brick: '#c0703a', brickLine: '#8b4b22' },
  city:  { sky: ['#ff8c55', '#ffd59a'], dirt: '#8a3b32', dirtDark: '#6e2e27', top: '#a3a5ad', topDark: '#7d8089', brick: '#b8473a', brickLine: '#7a2a22' },
  space: { sky: ['#070722', '#26124a'], dirt: '#8d8aa6', dirtDark: '#6d6a86', top: '#cfcce2', topDark: '#a8a5bf', brick: '#5b4b8a', brickLine: '#3a2f63' },
};

/* ---------------- Hintergründe ---------------- */
function drawBackground(c, theme, cam, t) {
  const th = THEMES[theme];
  const g = c.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
  c.fillStyle = g; c.fillRect(0, 0, VW, VH);
  ({ dino: bgDino, city: bgCity, space: bgSpace, ice: bgIce, sea: bgSea, robo: bgRobo }[theme] || bgSpace)(c, cam, t);
}

function hills(c, cam, p, base, amp, col, f1, f2) {
  c.fillStyle = col; c.beginPath(); c.moveTo(0, VH);
  for (let x = 0; x <= VW + 20; x += 20) {
    const wx = x + cam * p;
    c.lineTo(x, base + Math.sin(wx * f1) * amp + Math.sin(wx * f2 + 1.3) * amp * 0.5);
  }
  c.lineTo(VW, VH); c.closePath(); c.fill();
}

function bgDino(c, cam, t) {
  circle(c, 820, 90, 46, '#fff6b0'); circle(c, 820, 90, 36, '#ffe066');
  // Wolken
  for (let i = -1; i < 6; i++) {
    const seg = 380, off = (cam * 0.08 + t * 6) % seg;
    const x = i * seg - off + hash(i + Math.floor((cam * 0.08 + t * 6) / seg)) * 120;
    const y = 60 + hash(i * 3.1 + Math.floor((cam * 0.08 + t * 6) / seg)) * 80;
    c.fillStyle = 'rgba(255,255,255,0.9)';
    ellipse(c, x, y, 50, 18); c.fill(); ellipse(c, x + 30, y - 10, 34, 20); c.fill(); ellipse(c, x - 28, y - 4, 28, 14); c.fill();
  }
  // Vulkane
  const vs = 900, vo = cam * 0.15;
  for (let i = Math.floor(vo / vs) - 1; i < Math.floor(vo / vs) + 3; i++) {
    const x = i * vs - vo + 200 + hash(i) * 300, h = 220 + hash(i + 7) * 80;
    c.fillStyle = '#7d6a8c';
    c.beginPath(); c.moveTo(x - 230, 430); c.lineTo(x - 40, 430 - h); c.lineTo(x + 40, 430 - h); c.lineTo(x + 230, 430); c.fill();
    c.fillStyle = '#ff7043'; c.beginPath(); c.moveTo(x - 40, 430 - h); c.lineTo(x + 40, 430 - h); c.lineTo(x + 25, 430 - h + 22); c.lineTo(x - 10, 430 - h + 40); c.lineTo(x - 28, 430 - h + 18); c.fill();
    for (let k = 0; k < 4; k++) {
      const pt = (t * 0.25 + k / 4) % 1;
      c.fillStyle = `rgba(120,110,120,${0.5 * (1 - pt)})`;
      circle(c, x + Math.sin(pt * 5 + k) * 15, 430 - h - 15 - pt * 120, 14 + pt * 26); c.fill();
    }
  }
  hills(c, cam, 0.3, 420, 30, '#7fc95a', 0.004, 0.011);
  // Palmen
  const ps = 260, po = cam * 0.55;
  for (let i = Math.floor(po / ps) - 1; i < Math.floor(po / ps) + 5; i++) {
    if (hash(i * 1.7) < 0.35) continue;
    const x = i * ps - po + hash(i) * 120, by = 470, h = 110 + hash(i + 2) * 60;
    c.strokeStyle = '#8d6e47'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x + 15, by - h / 2, x + 6, by - h); c.stroke();
    c.fillStyle = '#3f9a28';
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k - 2) * 0.62 + Math.sin(t * 1.5 + i) * 0.05;
      c.save(); c.translate(x + 6, by - h); c.rotate(a);
      ellipse(c, 0, -28, 9, 32); c.fill(); c.restore();
    }
  }
  hills(c, cam, 0.5, 470, 18, '#5aa83f', 0.006, 0.017);
}

function bgCity(c, cam, t) {
  circle(c, 200, 150, 60, 'rgba(255,240,180,0.85)');
  const layer = (p, seg, base, col, win, seed) => {
    const off = cam * p;
    for (let i = Math.floor(off / seg) - 1; i < Math.floor(off / seg) + Math.ceil(VW / seg) + 2; i++) {
      const x = i * seg - off, h = 120 + hash(i * 1.3 + seed) * 200, w = seg - 8;
      c.fillStyle = col; c.fillRect(x, base - h, w, h + 200);
      if (hash(i + seed) > 0.6) { c.fillRect(x + w / 2 - 3, base - h - 30, 6, 30); }
      if (win) {
        for (let wy = base - h + 16; wy < base - 10; wy += 26)
          for (let wx = x + 10; wx < x + w - 14; wx += 20)
            if (hash(wx * 0.37 + wy * 1.91 + seed) > 0.5) { c.fillStyle = win; c.fillRect(wx, wy, 9, 13); }
      }
    }
  };
  layer(0.15, 110, 420, '#c66a6a', null, 1);
  layer(0.3, 140, 450, '#8d4a5a', 'rgba(255,230,140,0.75)', 5);
  // Rauchsäulen in der Ferne
  for (let k = 0; k < 2; k++) {
    const x = ((k * 600 + 300 - cam * 0.3) % 1200 + 1200) % 1200 - 100;
    for (let j = 0; j < 6; j++) {
      const pt = (t * 0.2 + j / 6) % 1;
      c.fillStyle = `rgba(90,80,90,${0.35 * (1 - pt)})`;
      circle(c, x + Math.sin(pt * 4 + j) * 20 + pt * 60, 330 - pt * 260, 18 + pt * 40); c.fill();
    }
  }
  layer(0.5, 180, 490, '#5a3550', 'rgba(255,210,100,0.9)', 9);
}

function bgSpace(c, cam, t) {
  // Sterne
  for (let i = 0; i < 140; i++) {
    const x = ((hash(i) * 2400 - cam * (0.03 + hash(i + 9) * 0.05)) % 2400 + 2400) % 2400 * 0.4;
    const y = hash(i + 50) * VH;
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
    c.fillStyle = `rgba(255,255,255,${0.3 + tw * 0.7})`;
    c.fillRect(x, y, hash(i + 3) > 0.9 ? 3 : 2, hash(i + 3) > 0.9 ? 3 : 2);
  }
  // Nebel
  c.fillStyle = 'rgba(160,80,200,0.12)'; ellipse(c, 300 - (cam * 0.05) % 1400 + 400, 200, 260, 90); c.fill();
  // Planeten
  const px = 760 - (cam * 0.08) % 1800 + (cam * 0.08 > 900 ? 1800 : 0);
  circle(c, px, 140, 60, '#f0a35e'); circle(c, px - 15, 125, 60, 'rgba(255,255,255,0.12)');
  c.strokeStyle = '#ffd59a'; c.lineWidth = 6; ellipse(c, px, 140, 95, 18, null, -0.3); c.stroke();
  const ex = 160 - (cam * 0.04) % 2000 + (cam * 0.04 > 1000 ? 2000 : 0);
  circle(c, ex, 90, 38, '#2e7bd6'); c.fillStyle = '#4caf50';
  ellipse(c, ex - 10, 82, 14, 10); c.fill(); ellipse(c, ex + 14, 100, 10, 7); c.fill();
  // Mondberge
  hills(c, cam, 0.25, 440, 26, '#3b2d6b', 0.005, 0.013);
  hills(c, cam, 0.45, 480, 16, '#4c3c85', 0.008, 0.019);
}

/* ---------------- Kacheln ---------------- */
const isSolidChar = c => c === 'G' || c === 'B' || c === 'Q' || c === 'U' || c === 'X' || c === '>' || c === '<';

function drawTiles(c, lvl, cam, t) {
  const th = THEMES[lvl.theme];
  const x0 = Math.max(0, Math.floor(cam / T)), x1 = Math.min(lvl.w - 1, Math.floor((cam + VW) / T) + 1);
  // Abgründe dunkel einfärben, damit man sie gut erkennt
  const pg = c.createLinearGradient(0, 420, 0, VH);
  pg.addColorStop(0, 'rgba(0,0,0,0)'); pg.addColorStop(1, (lvl.theme === 'space' || lvl.theme === 'robo' || lvl.theme === 'sea') ? 'rgba(0,0,10,0.85)' : lvl.theme === 'ice' ? 'rgba(10,50,110,0.7)' : 'rgba(20,5,0,0.6)');
  c.fillStyle = pg;
  for (let tx = x0; tx <= x1; tx++) if (lvl.grid[LH - 1][tx] === '.') c.fillRect(tx * T - cam, 420, T + 0.5, VH - 420);
  for (let ty = 0; ty < lvl.h; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const ch = lvl.grid[ty][tx];
      if (ch === '.') continue;
      let x = tx * T - cam, y = ty * T;
      const bump = lvl.bumps[tx + ',' + ty];
      if (bump) y -= Math.sin(Math.min(1, bump / 0.18) * Math.PI) * 10;
      switch (ch) {
        case 'G': drawGround(c, lvl, th, tx, ty, x, y); break;
        case 'B': drawBrick(c, th, x, y); break;
        case 'Q': drawBox(c, x, y, t, tx); break;
        case 'U': c.fillStyle = '#8d7a62'; rr(c, x + 1, y + 1, T - 2, T - 2, 5); c.fill();
          c.fillStyle = '#6f5d48'; [[6, 6], [T - 10, 6], [6, T - 10], [T - 10, T - 10]].forEach(([a, b]) => { circle(c, x + a + 2, y + b + 2, 2.5); c.fill(); }); break;
        case 'P': drawPlat(c, lvl.theme, x, y, T, t); break;
        case 'L': drawLava(c, x, y, t, tx, lvl.theme); break;
        case '>': drawConveyor(c, x, y, t, 1); break;
        case '<': drawConveyor(c, x, y, t, -1); break;
        case 'X': drawGate(c, lvl.theme, x, y, t, ty); break;
      }
    }
  }
}

function drawGround(c, lvl, th, tx, ty, x, y) {
  const above = ty > 0 ? lvl.grid[ty - 1][tx] : '.';
  const topOpen = above !== 'G';
  const theme = lvl.theme;
  c.fillStyle = th.dirt; c.fillRect(x, y, T + 0.5, T + 0.5);
  if (theme === 'dino') {
    c.fillStyle = th.dirtDark;
    const h1 = hash(tx * 7 + ty * 13);
    circle(c, x + 8 + h1 * 22, y + 12 + hash(tx + ty * 5) * 18, 3 + h1 * 2); c.fill();
    if (h1 > 0.6) { circle(c, x + 30, y + 30, 2.5); c.fill(); }
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x, y, T + 0.5, 12);
      c.fillStyle = th.topDark;
      for (let i = 0; i < 4; i++) { circle(c, x + 5 + i * 10, y + 12, 5); c.fill(); }
      c.fillStyle = '#86e05e'; c.fillRect(x, y, T + 0.5, 3);
      if (hash(tx * 3.3) > 0.7) { c.fillStyle = '#ff6f91'; circle(c, x + 20, y - 4, 3.5); c.fill(); c.fillStyle = '#ffeb3b'; circle(c, x + 20, y - 4, 1.5); c.fill(); }
    }
  } else if (theme === 'city') {
    c.strokeStyle = th.dirtDark; c.lineWidth = 2;
    c.beginPath();
    for (let r = 0; r < 4; r++) {
      c.moveTo(x, y + r * 10 + 0.5); c.lineTo(x + T, y + r * 10 + 0.5);
      const off = (r % 2) * 10 + ((tx % 2) * 20);
      for (let k = off % 20; k < T; k += 20) { c.moveTo(x + k + 0.5, y + r * 10); c.lineTo(x + k + 0.5, y + r * 10 + 10); }
    }
    c.stroke();
    if (!topOpen && hash(tx * 5.1 + ty * 2.7) > 0.72 && ty > 0) {
      c.fillStyle = '#ffe08a'; c.fillRect(x + 10, y + 8, 20, 22);
      c.strokeStyle = '#5a2a22'; c.lineWidth = 3; c.strokeRect(x + 10, y + 8, 20, 22);
      c.beginPath(); c.moveTo(x + 20, y + 8); c.lineTo(x + 20, y + 30); c.stroke();
    }
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x - 0.5, y, T + 1, 10);
      c.fillStyle = th.topDark; c.fillRect(x - 0.5, y + 8, T + 1, 4);
      c.fillStyle = '#c9cbd3'; c.fillRect(x - 0.5, y, T + 1, 2);
    }
  } else if (theme !== 'space') { drawGroundExtra(c, lvl, th, tx, ty, x, y, topOpen); } else {
    c.fillStyle = th.dirtDark;
    const h1 = hash(tx * 11 + ty * 3);
    if (h1 > 0.35) { ellipse(c, x + 10 + h1 * 18, y + 14 + hash(tx * 2 + ty) * 14, 6 + h1 * 4, 4 + h1 * 2); c.fill(); }
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x, y, T + 0.5, 10);
      c.fillStyle = th.topDark;
      if (hash(tx * 9.7) > 0.5) { ellipse(c, x + 20, y + 4, 9, 3); c.fill(); }
      c.fillStyle = '#e9e6f7'; c.fillRect(x, y, T + 0.5, 2);
    }
  }
}

function drawBrick(c, th, x, y) {
  c.fillStyle = th.brick; c.fillRect(x, y, T, T);
  c.strokeStyle = th.brickLine; c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(x, y + T / 2); c.lineTo(x + T, y + T / 2);
  c.moveTo(x + T / 2, y); c.lineTo(x + T / 2, y + T / 2);
  c.moveTo(x + T / 4, y + T / 2); c.lineTo(x + T / 4, y + T);
  c.moveTo(x + T * 0.75, y + T / 2); c.lineTo(x + T * 0.75, y + T);
  c.stroke();
  c.strokeRect(x + 1, y + 1, T - 2, T - 2);
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 2, y + 2, T - 4, 3);
}

function drawBox(c, x, y, t, tx) {
  const shine = 0.5 + 0.5 * Math.sin(t * 4 + tx);
  c.fillStyle = '#c98a00'; rr(c, x + 1, y + 1, T - 2, T - 2, 6); c.fill();
  c.fillStyle = '#ffc61a'; rr(c, x + 3, y + 3, T - 6, T - 7, 5); c.fill();
  c.fillStyle = `rgba(255,255,255,${0.25 + shine * 0.35})`; rr(c, x + 5, y + 5, T - 10, 5, 2); c.fill();
  star5(c, x + T / 2, y + T / 2 + 1, 11, 5, 0, '#fff7d0');
  star5(c, x + T / 2, y + T / 2 + 1, 8, 3.6, 0, '#ff9800');
  c.fillStyle = '#a06c00';
  [[6, 6], [T - 6, 6], [6, T - 7], [T - 6, T - 7]].forEach(([a, b]) => { circle(c, x + a, y + b, 1.8); c.fill(); });
}

function drawPlat(c, theme, x, y, w, t) {
  if (theme === 'dino') {
    c.fillStyle = '#8b5a2b'; rr(c, x, y + 2, w, 14, 5); c.fill();
    c.fillStyle = '#a8743d'; rr(c, x, y + 2, w, 6, 3); c.fill();
    c.strokeStyle = '#6b4220'; c.lineWidth = 2;
    for (let k = 10; k < w; k += 20) { c.beginPath(); c.moveTo(x + k, y + 4); c.lineTo(x + k, y + 15); c.stroke(); }
  } else if (theme === 'city') {
    c.fillStyle = '#e65100'; c.fillRect(x, y + 1, w, 14);
    c.fillStyle = '#ff8a3d'; c.fillRect(x, y + 1, w, 4);
    c.fillStyle = '#9a3500';
    for (let k = 10; k < w; k += 20) { circle(c, x + k, y + 9, 3); c.fill(); }
  } else if (theme !== 'space') { drawPlatExtra(c, theme, x, y, w, t); } else {
    const glow = 0.5 + 0.5 * Math.sin(t * 3 + x * 0.01);
    c.fillStyle = `rgba(80,220,255,${0.25 + glow * 0.25})`; c.fillRect(x + 2, y + 14, w - 4, 6);
    c.fillStyle = '#5c4fa3'; rr(c, x, y + 1, w, 13, 4); c.fill();
    c.fillStyle = '#9fe8ff'; c.fillRect(x + 3, y + 3, w - 6, 3);
  }
}

function drawLava(c, x, y, t, tx, theme) {
  const ice = theme === 'ice';
  c.fillStyle = ice ? '#1e88e5' : '#e64a19'; c.fillRect(x, y + 8, T + 0.5, T - 8);
  c.fillStyle = ice ? '#64b5f6' : '#ff9800';
  c.beginPath(); c.moveTo(x, y + 14);
  for (let k = 0; k <= T; k += 5) c.lineTo(x + k, y + 9 + Math.sin(t * 4 + (tx * T + k) * 0.15) * 4);
  c.lineTo(x + T, y + 20); c.lineTo(x, y + 20); c.fill();
  c.fillStyle = ice ? '#e3f2fd' : '#ffeb3b';
  if (hash(tx + Math.floor(t * 2)) > 0.7) { circle(c, x + 20, y + 22, 3); c.fill(); }
}

function drawGate(c, theme, x, y, t, ty) {
  const col = { dino: '#6d5a4b', city: '#555c6b', space: '#3d2f7a', ice: '#5fa8d3', sea: '#3b5b6b', robo: '#4a5568' }[theme];
  c.fillStyle = col; c.fillRect(x, y, T, T);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 6, y, 6, T); c.fillRect(x + 28, y, 6, T);
  const glow = 0.5 + 0.5 * Math.sin(t * 4 + ty);
  c.fillStyle = theme === 'space' ? `rgba(120,220,255,${glow})` : `rgba(255,190,60,${glow})`;
  c.fillRect(x + 18, y, 4, T);
}

/* ---------------- Super Noah ---------------- */
function drawNoah(c, cx, by, o) {
  const of = outfitById(o.outfit);
  const t = o.t || 0, power = o.power || 'none';
  c.save(); c.translate(cx, by); c.scale((o.facing || 1) * (o.scale || 1), o.scale || 1);
  if (o.rot) c.rotate(o.rot);
  const air = o.air, moving = o.moving;
  let swing = moving && !air ? Math.sin(o.run || 0) * 0.75 : 0;
  const bob = moving && !air ? Math.abs(Math.sin(o.run || 0)) * 2 : 0;
  c.translate(0, -bob);
  const skin = '#ffd3ad';

  const leg = (x, ang) => {
    c.save(); c.translate(x, -14); c.rotate(ang);
    c.fillStyle = of.pants; rr(c, -3.5, -1, 7, 12, 3); c.fill();
    c.fillStyle = of.boots; rr(c, -4, 8, 10, 6, 2.5); c.fill();
    c.restore();
  };
  const arm = (x, y, ang) => {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = of.jacket; rr(c, -3, -1, 6, 12, 3); c.fill();
    c.fillStyle = of.stripe; c.fillRect(-3, 6, 6, 2);
    circle(c, 0, 12, 3.4, skin);
    c.restore();
  };

  if (of.style === 'dino') { // Schwanz
    c.fillStyle = of.jacket; c.beginPath(); c.moveTo(-8, -20); c.quadraticCurveTo(-24, -14, -22, -6); c.lineTo(-8, -14); c.fill();
  }
  if (power === 'hose') {
    c.fillStyle = '#c62828'; rr(c, -18, -31, 9, 17, 4); c.fill();
    c.fillStyle = '#e0e0e0'; c.fillRect(-17, -27, 7, 2.5); c.fillRect(-17, -21, 7, 2.5);
    c.strokeStyle = '#333'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-12, -31); c.quadraticCurveTo(-6, -40, 4, -24); c.stroke();
  }
  leg(-3, air ? 0.5 : -swing);
  arm(-3, -27, air ? -2.6 : swing * 0.9);
  c.fillStyle = of.jacket; rr(c, -10, -30, 20, 18, 6); c.fill();
  c.fillStyle = of.stripe; c.fillRect(-10, -21, 20, 3);
  c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-1, -30, 2, 9);
  leg(4, air ? -0.6 : swing);

  // Kopf
  circle(c, 2, -40, 11, skin);
  c.fillStyle = '#6b3e1e'; c.beginPath(); c.arc(1, -42, 11.5, Math.PI * 0.95, Math.PI * 1.9); c.lineTo(1, -42); c.fill();
  eye(c, 7, -41, 3.2, 1);
  circle(c, 4, -35.5, 2.4, 'rgba(255,120,120,0.45)');
  c.strokeStyle = '#7a3b1e'; c.lineWidth = 1.8; c.beginPath(); c.arc(7.5, -36.5, 3, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();

  // Kopfbedeckung
  if (power === 'none') {
    c.fillStyle = of.helmet;
    c.beginPath(); c.arc(1, -44, 10.5, Math.PI, Math.PI * 2); c.fill();
    rr(c, 4, -46, 13, 4, 2); c.fill();
    c.fillStyle = '#fff'; circle(c, 1, -51, 2.5); c.fill();
  } else if (of.style === 'space') {
    c.fillStyle = 'rgba(190,230,255,0.35)'; circle(c, 2, -40, 16); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 3; circle(c, 2, -40, 16); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.7)'; ellipse(c, 8, -49, 4, 2.5, null, 0.6); c.fill();
    c.fillStyle = of.stripe; rr(c, -12, -27, 28, 4, 2); c.fill();
  } else if (of.style === 'dino') {
    c.fillStyle = of.helmet; c.beginPath(); c.arc(1, -44, 13, Math.PI * 0.9, Math.PI * 2.05); c.fill();
    for (let i = 0; i < 4; i++) tri(c, -10 + i * 6, -52 + Math.abs(i - 1.5) * 2, -6 + i * 6, -60 + Math.abs(i - 1.5) * 2, -2 + i * 6, -52 + Math.abs(i - 1.5) * 2, '#ffeb3b');
    c.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) tri(c, 4 + i * 3.5, -44, 5.75 + i * 3.5, -40.5, 7.5 + i * 3.5, -44, '#fff');
    eye(c, 6, -50, 2.3, 1);
  } else {
    // Feuerwehrhelm
    c.fillStyle = of.helmet; c.beginPath(); c.arc(1, -45, 12.5, Math.PI, Math.PI * 2); c.fill();
    ellipse(c, 0, -45, 18, 4.5); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(-1, -57, 3, 12);
    c.fillStyle = '#ffd54f'; rr(c, 7, -55, 7, 9, 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; ellipse(c, -4, -52, 4, 2, null, -0.4); c.fill();
  }

  // vorderer Arm (mit Strahlrohr)
  if (power === 'hose') {
    arm(4, -27, -1.45);
    c.fillStyle = '#333'; rr(c, 14, -27, 11, 5, 2); c.fill();
    c.fillStyle = '#ffd54f'; c.fillRect(23, -28, 3, 7);
  } else {
    arm(4, -27, air ? -2.5 : -swing * 0.9);
  }
  if (of.sparkle) {
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + i * 2.1, r = 22;
      star5(c, Math.cos(a) * r, -26 + Math.sin(a * 1.3) * r, 4, 1.6, 0, 'rgba(255,255,200,0.9)');
    }
  }
  c.restore();
}

/* ---------------- Gegner ---------------- */
function drawWalker(c, e, theme, t) {
  const cx = e.x + e.w / 2, by = e.y + e.h, f = e.vx > 0 ? 1 : -1;
  c.save(); c.translate(cx, by);
  if (e.squash) c.scale(1.2, 0.35);
  c.scale(f, 1);
  const step = Math.sin(t * 12 + e.x * 0.05);
  if (theme === 'dino') {
    c.fillStyle = '#5ea83a';
    c.beginPath(); c.moveTo(-6, -16); c.quadraticCurveTo(-22, -20, -24, -12); c.lineTo(-6, -10); c.fill();
    c.fillStyle = '#3d7d24'; c.fillRect(-7 + step * 2, -9, 5, 9); c.fillRect(2 - step * 2, -9, 5, 9);
    ellipse(c, 0, -14, 13, 9, '#6ab04c');
    ellipse(c, 2, -11, 8, 5, '#c5e1a5');
    ellipse(c, 11, -22, 9, 7, '#6ab04c');
    c.fillStyle = '#fff'; tri(c, 14, -18, 16, -14, 18, -18, '#fff');
    eye(c, 12, -24, 2.8, 1, true);
    c.fillStyle = '#3d7d24'; c.fillRect(6, -14, 5, 2);
  } else if (theme === 'city') {
    const p = Math.sin(t * 5 + e.x) * 1.5;
    c.fillStyle = '#6d6d78';
    circle(c, -8, -10 - p, 10); c.fill(); circle(c, 8, -10 + p, 10); c.fill(); circle(c, 0, -18, 12); c.fill();
    c.fillStyle = '#8a8a96'; circle(c, -2, -21, 6); c.fill();
    eye(c, -3, -16, 3.2, 1, true); eye(c, 6, -16, 3.2, 1, true);
    c.strokeStyle = '#222'; c.lineWidth = 2; c.beginPath(); c.arc(2, -6, 4, 1.1 * Math.PI, 1.9 * Math.PI); c.stroke();
  } else if (theme !== 'space') { drawWalkerExtra(c, e, theme, t, step); } else {
    const wob = Math.sin(t * 6 + e.x) * 2;
    c.strokeStyle = '#2e7d32'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -24); c.lineTo(2, -32); c.stroke();
    circle(c, 2, -33, 3.5, '#ff4081');
    c.fillStyle = '#66bb6a'; c.beginPath(); c.moveTo(-15 - wob, 0); c.quadraticCurveTo(-16, -28, 0, -26); c.quadraticCurveTo(16, -28, 15 + wob, 0); c.fill();
    eye(c, 3, -15, 6, 1);
    c.fillStyle = '#2e7d32'; for (let i = -12; i < 14; i += 6) { ellipse(c, i, 0, 3, 2); c.fill(); }
  }
  c.restore();
}

function drawSpiky(c, e, theme, t) {
  const cx = e.x + e.w / 2, by = e.y + e.h, f = e.vx > 0 ? 1 : -1;
  c.save(); c.translate(cx, by); c.scale(f, 1);
  const step = Math.sin(t * 9 + e.x * 0.05);
  if (theme === 'dino') {
    for (let i = 0; i < 5; i++) tri(c, -14 + i * 6, -18 - Math.sin(i / 4 * Math.PI) * 4, -11 + i * 6, -32 - Math.sin(i / 4 * Math.PI) * 6, -8 + i * 6, -18 - Math.sin(i / 4 * Math.PI) * 4, '#ff7043');
    c.fillStyle = '#4e7f72'; c.fillRect(-12 + step * 2, -9, 6, 9); c.fillRect(6 - step * 2, -9, 6, 9);
    c.fillStyle = '#5d9c8a'; c.beginPath(); c.moveTo(-14, -14); c.lineTo(-24, -10); c.lineTo(-14, -8); c.fill();
    tri(c, -24, -10, -27, -16, -21, -11, '#ff7043');
    ellipse(c, 0, -14, 16, 9, '#5d9c8a');
    ellipse(c, 16, -9, 6, 5, '#5d9c8a');
    eye(c, 17, -11, 2.2, 1);
  } else if (theme === 'city') {
    flame(c, 0, -2, 30, 38, t, e.x);
    c.fillStyle = '#7a1c00'; c.fillRect(-8 + step * 2, -4, 5, 4); c.fillRect(4 - step * 2, -4, 5, 4);
    eye(c, -3, -14, 3.2, 1, true); eye(c, 5, -14, 3.2, 1, true);
  } else if (theme !== 'space') { drawSpikyExtra(c, e, theme, t, step, f); } else {
    c.save(); c.translate(0, -15); c.rotate(t * 3 * f);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; tri(c, Math.cos(a - 0.25) * 12, Math.sin(a - 0.25) * 12, Math.cos(a) * 20, Math.sin(a) * 20, Math.cos(a + 0.25) * 12, Math.sin(a + 0.25) * 12, '#e040fb'); }
    c.restore();
    circle(c, 0, -15, 13, '#8e24aa');
    eye(c, -4, -16, 3.5, 1, true); eye(c, 5, -16, 3.5, 1, true);
  }
  c.restore();
}

function drawFlyer(c, e, theme, t) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2, f = e.face || -1;
  c.save(); c.translate(cx, cy);
  if (e.squash) c.scale(1.2, 0.4);
  c.scale(f, 1);
  const flap = Math.sin(t * 10 + e.sx);
  if (theme === 'dino') {
    c.fillStyle = '#b0683a';
    c.beginPath(); c.moveTo(-4, -2); c.lineTo(-26, -6 - flap * 14); c.lineTo(-8, 6); c.fill();
    c.beginPath(); c.moveTo(4, -2); c.lineTo(22, -6 - flap * 14); c.lineTo(6, 6); c.fill();
    ellipse(c, 0, 2, 10, 7, '#c97a48');
    ellipse(c, 11, -4, 7, 6, '#c97a48');
    tri(c, 15, -6, 30, -2, 15, -1, '#e8a33d');
    tri(c, 6, -8, -4, -16, 10, -9, '#a0522d');
    eye(c, 12, -5, 2.2, 1, true);
  } else if (theme === 'city') {
    c.fillStyle = '#55555f';
    c.beginPath(); c.moveTo(-3, -2); c.quadraticCurveTo(-18, -16 - flap * 10, -26, -4 - flap * 10); c.quadraticCurveTo(-14, 2, -3, 6); c.fill();
    c.beginPath(); c.moveTo(3, -2); c.quadraticCurveTo(14, -16 - flap * 10, 22, -4 - flap * 10); c.quadraticCurveTo(12, 2, 3, 6); c.fill();
    ellipse(c, 0, 2, 11, 9, '#6d6d78');
    tri(c, 9, 0, 17, 3, 9, 6, '#ffb300');
    eye(c, 5, -2, 2.6, 1, true);
    c.fillStyle = 'rgba(120,120,130,0.4)'; circle(c, -16, 8 + flap * 2, 5); c.fill();
  } else if (theme !== 'space') { drawFlyerExtra(c, e, theme, t, flap); } else {
    c.fillStyle = 'rgba(150,255,200,0.6)'; c.beginPath(); c.arc(0, -4, 9, Math.PI, 0); c.fill();
    circle(c, 0, -5, 4, '#66bb6a'); circle(c, 1, -6, 1.5, '#111');
    ellipse(c, 0, 1, 20, 7, '#9e9eb8');
    for (let i = 0; i < 4; i++) { circle(c, -12 + i * 8, 2, 2, (Math.floor(t * 6) + i) % 2 ? '#ffeb3b' : '#ff4081'); }
  }
  c.restore();
}

function drawJumper(c, e, t, theme) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (theme === 'ice') { drawIceFish(c, cx, cy, e.vy); return; }
  if (e.vy < 0) { c.fillStyle = 'rgba(255,152,0,0.5)'; ellipse(c, cx, cy + 16, 8, 14); c.fill(); }
  circle(c, cx, cy, 15, '#ff5722'); circle(c, cx - 3, cy - 3, 10, '#ffab40'); circle(c, cx - 5, cy - 6, 4, '#fff59d');
  eye(c, cx - 4, cy - 1, 2.5, 0, true); eye(c, cx + 5, cy - 1, 2.5, 0, true);
}

function drawFire(c, e, t) {
  const s = 0.45 + 0.55 * (e.hp / e.maxHp);
  flame(c, e.x + e.w / 2, e.y + e.h, e.w * s * 1.1, e.h * s * 1.15, t, e.sx);
  c.fillStyle = '#4e342e'; rr(c, e.x + 6, e.y + e.h - 5, e.w - 12, 5, 2); c.fill();
}

function drawMeteor(c, e, t, theme) {
  // Warnkreis
  const a = 0.35 + 0.35 * Math.sin(t * 14);
  c.strokeStyle = `rgba(255,40,40,${a + 0.2})`; c.lineWidth = 3;
  ellipse(c, e.tx, e.groundY - 2, 26, 7); c.stroke();
  c.fillStyle = `rgba(255,40,40,${a * 0.4})`; c.fill();
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (theme === 'ice') { drawIcicle(c, cx, cy); return; }
  for (let i = 1; i <= 4; i++) { c.fillStyle = `rgba(255,${120 + i * 25},0,${0.6 - i * 0.12})`; circle(c, cx - i * 7, cy - i * 16, 14 - i * 2); c.fill(); }
  circle(c, cx, cy, 16, '#795548'); circle(c, cx - 5, cy - 4, 4, '#5d4037'); circle(c, cx + 6, cy + 5, 3, '#5d4037');
}

/* ---------------- Dinge ---------------- */
function drawCoin(c, x, y, t, seed = 0) {
  const w = Math.abs(Math.cos(t * 3 + seed * 0.7));
  ellipse(c, x, y, 10 * w + 1, 12, '#e6a100');
  ellipse(c, x, y, 7 * w + 0.5, 9, '#ffd54f');
  if (w > 0.4) { c.fillStyle = '#fff7c2'; c.fillRect(x - 1.5 * w, y - 5, 3 * w, 10); }
}

function drawStarItem(c, e, theme, t) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2 + Math.sin(t * 3 + e.sx) * 3;
  const g = c.createRadialGradient(cx, cy, 2, cx, cy, 30);
  g.addColorStop(0, 'rgba(255,255,200,0.8)'); g.addColorStop(1, 'rgba(255,255,200,0)');
  c.fillStyle = g; circle(c, cx, cy, 30); c.fill();
  drawCollectIcon(c, theme, cx, cy, 1, t);
}

function drawCollectIcon(c, theme, cx, cy, s, t, empty = false) {
  c.save(); c.translate(cx, cy); c.scale(s, s);
  if (empty) c.globalAlpha = 0.35;
  if (theme === 'dino') {
    ellipse(c, 0, 1, 12, 15, empty ? '#666' : '#fff3d6');
    if (!empty) { c.fillStyle = '#7cb342'; circle(c, -4, -4, 3.5); c.fill(); circle(c, 5, 3, 3); c.fill(); circle(c, -2, 9, 2.5); c.fill(); c.fillStyle = 'rgba(255,255,255,0.8)'; ellipse(c, -5, -7, 3, 5); c.fill(); }
  } else if (theme === 'city') {
    const col = empty ? '#666' : '#ff9a3c';
    c.fillStyle = col; c.beginPath(); c.moveTo(8, 10); c.quadraticCurveTo(20, 8, 15, -6); c.lineWidth = 4; c.strokeStyle = col; c.stroke();
    ellipse(c, 0, 6, 10, 9, col);
    circle(c, 0, -7, 9, col);
    tri(c, -8, -9, -7, -19, -2, -13, col); tri(c, 8, -9, 7, -19, 2, -13, col);
    if (!empty) {
      c.fillStyle = '#c45f12'; c.fillRect(-2, -15, 4, 3);
      circle(c, -3.5, -8, 2, '#222'); circle(c, 3.5, -8, 2, '#222');
      tri(c, -1.5, -4, 1.5, -4, 0, -2, '#ff6f91');
      ellipse(c, 0, 8, 5, 5, '#ffe0c0');
    }
  } else if (theme !== 'space') { drawCollectExtra(c, theme, t, empty); } else {
    star5(c, 0, 0, 15, 7, Math.sin((t || 0) * 2) * 0.2, empty ? '#666' : '#ffd600');
    if (!empty) { star5(c, 0, 0, 9, 4.2, Math.sin((t || 0) * 2) * 0.2, '#fff59d'); circle(c, -3, -1, 1.5, '#333'); circle(c, 3, -1, 1.5, '#333'); }
  }
  c.restore();
}

function drawItem(c, e, t) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2 + Math.sin(t * 4) * 3;
  c.fillStyle = 'rgba(255,255,255,0.35)'; circle(c, cx, cy, 20); c.fill();
  drawPowerIcon(c, e.item, cx, cy, 1);
}

function drawPowerIcon(c, kind, cx, cy, s) {
  c.save(); c.translate(cx, cy); c.scale(s, s);
  if (kind === 'helmet') {
    c.fillStyle = '#e3261f'; c.beginPath(); c.arc(0, 4, 13, Math.PI, 0); c.fill();
    ellipse(c, 0, 4, 18, 4.5, '#e3261f');
    c.fillStyle = '#ffd54f'; rr(c, -4, -7, 8, 9, 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(c, -6, -3, 4, 2, null, -0.5); c.fill();
  } else if (kind === 'hose') {
    c.fillStyle = '#c62828'; rr(c, -14, -10, 10, 20, 4); c.fill();
    c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(-9, -10); c.quadraticCurveTo(-2, -16, 2, -2); c.stroke();
    c.fillStyle = '#333'; rr(c, 0, -4, 10, 6, 2); c.fill();
    c.fillStyle = '#4fc3f7'; circle(c, 14, -2, 3); c.fill(); circle(c, 18, 2, 2.4); c.fill(); circle(c, 17, -7, 2); c.fill();
  } else if (kind === 'heart') {
    heartShape(c, 0, -10, 22, '#e53935');
    c.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(c, -5, -4, 3, 2, null, -0.5); c.fill();
  }
  c.restore();
}

function drawSpring(c, e) {
  const sq = e.squash > 0 ? 0.5 : 1;
  const x = e.x, by = e.y + e.h, h = e.h * sq;
  c.fillStyle = '#555'; rr(c, x, by - 6, e.w, 6, 2); c.fill();
  c.strokeStyle = '#9e9e9e'; c.lineWidth = 3; c.beginPath();
  const n = 4;
  for (let i = 0; i <= n; i++) { const yy = by - 6 - (h - 12) * i / n; c.lineTo(x + (i % 2 ? 6 : e.w - 6), yy); }
  c.stroke();
  c.fillStyle = '#e53935'; rr(c, x - 2, by - h, e.w + 4, 7, 3); c.fill();
  c.fillStyle = '#fff'; c.fillRect(x + 6, by - h + 2, 6, 3); c.fillRect(x + e.w - 12, by - h + 2, 6, 3);
}

function drawMplat(c, e, theme, cam, t) {
  drawPlat(c, theme, e.x - cam, e.y, e.w, t);
  if (theme !== 'dino' && theme !== 'city') return;
  c.fillStyle = theme === 'city' ? '#444' : '#6b4220';
  if (e.dy) { c.fillRect(e.x - cam + e.w / 2 - 2, 0, 4, e.y); }
}

function drawCheck(c, e, theme, t) {
  const px = e.x + 4, by = e.y + e.h;
  c.fillStyle = '#795548'; rr(c, px - 6, by - 6, 16, 6, 2); c.fill();
  c.fillStyle = '#bdbdbd'; c.fillRect(px, by - 78, 4, 74);
  circle(c, px + 2, by - 80, 4, '#ffd54f');
  const col = e.active ? ({ dino: '#43a047', city: '#e53935', space: '#7e57c2', ice: '#039be5', sea: '#ff7043', robo: '#f6ad55' }[theme]) : '#9e9e9e';
  c.fillStyle = col; c.beginPath(); c.moveTo(px + 4, by - 76);
  for (let i = 0; i <= 8; i++) c.lineTo(px + 4 + i * 4, by - 76 + Math.sin(t * 6 + i * 0.7) * (e.active ? 3 : 1));
  for (let i = 8; i >= 0; i--) c.lineTo(px + 4 + i * 4, by - 52 + Math.sin(t * 6 + i * 0.7) * (e.active ? 3 : 1));
  c.closePath(); c.fill();
  c.fillStyle = '#fff'; c.font = 'bold 15px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
  c.fillText('N', px + 20, by - 58);
}

function drawSign(c, e) {
  const cx = e.x + e.w / 2, by = e.y + e.h;
  c.fillStyle = '#8d6e47'; c.fillRect(cx - 3, by - 20, 6, 20);
  c.fillStyle = '#a1785a'; rr(c, cx - 18, by - 42, 36, 26, 5); c.fill();
  c.strokeStyle = '#6b4f33'; c.lineWidth = 2.5; rr(c, cx - 18, by - 42, 36, 26, 5); c.stroke();
  c.fillStyle = '#fff'; c.font = 'bold 20px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
  c.fillText('!', cx, by - 22);
}

function drawGoal(c, e, theme, t, anim) {
  const cx = e.x + e.w / 2 + (theme === 'dino' ? 80 : 0), by = e.y + e.h;
  if (theme === 'dino') {
    // Dino-Mama (Langhals)
    const nod = anim > 0 ? Math.sin(anim * 8) * 0.12 : Math.sin(t * 1.5) * 0.04;
    c.fillStyle = '#8bc34a';
    c.fillRect(cx - 30, by - 40, 14, 40); c.fillRect(cx + 30, by - 40, 14, 40);
    c.fillRect(cx - 10, by - 38, 12, 38); c.fillRect(cx + 46, by - 38, 12, 38);
    c.beginPath(); c.moveTo(cx - 40, by - 60); c.quadraticCurveTo(cx - 90, by - 50, cx - 100, by - 20); c.lineTo(cx - 40, by - 45); c.fill();
    ellipse(c, cx + 10, by - 65, 58, 34, '#8bc34a');
    ellipse(c, cx + 14, by - 52, 40, 18, '#c5e1a5');
    c.fillStyle = '#689f38'; circle(c, cx - 10, by - 82, 7); c.fill(); circle(c, cx + 18, by - 88, 6); c.fill(); circle(c, cx + 40, by - 76, 5); c.fill();
    c.save(); c.translate(cx + 50, by - 80); c.rotate(nod);
    c.strokeStyle = '#8bc34a'; c.lineWidth = 22; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(30, -60, 20, -120); c.stroke();
    ellipse(c, 32, -126, 24, 15, '#8bc34a');
    eye(c, 38, -132, 5, 1);
    c.strokeStyle = '#33691e'; c.lineWidth = 2.5; c.beginPath(); c.arc(42, -122, 7, 0.1 * Math.PI, 0.8 * Math.PI); c.stroke();
    circle(c, 30, -122, 4, 'rgba(255,120,120,0.5)');
    c.restore();
    // Nest
    c.fillStyle = '#8d6e47'; ellipse(c, cx - 70, by - 6, 34, 10); c.fill();
    ellipse(c, cx - 78, by - 16, 9, 12, '#fff3d6'); ellipse(c, cx - 62, by - 15, 9, 12, '#fff3d6');
    c.fillStyle = '#7cb342'; circle(c, cx - 80, by - 19, 2.5); c.fill(); circle(c, cx - 60, by - 13, 2.5); c.fill();
    c.strokeStyle = '#6b4f33'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 104, by - 8); c.lineTo(cx - 36, by - 4); c.moveTo(cx - 100, by - 2); c.lineTo(cx - 40, by - 10); c.stroke();
  } else if (theme === 'city') {
    const dx = anim > 1 ? (anim - 1) * (anim - 1) * 260 : 0;
    const x = cx - 70 + dx;
    c.fillStyle = '#c62828'; rr(c, x, by - 62, 150, 48, 6); c.fill();
    c.fillStyle = '#e53935'; rr(c, x + 100, by - 82, 50, 68, 8); c.fill();
    c.fillStyle = '#bbdefb'; rr(c, x + 112, by - 76, 30, 22, 4); c.fill();
    c.fillStyle = '#fff'; c.fillRect(x + 4, by - 40, 142, 6);
    c.fillStyle = '#9e9e9e'; c.fillRect(x + 6, by - 74, 92, 6); c.fillRect(x + 6, by - 66, 92, 4);
    for (let i = 0; i < 9; i++) c.fillRect(x + 10 + i * 10, by - 74, 3, 12);
    const blink = Math.floor(t * 6) % 2;
    c.fillStyle = blink ? '#2196f3' : '#90caf9'; rr(c, x + 112, by - 92, 12, 10, 3); c.fill();
    c.fillStyle = blink ? '#90caf9' : '#2196f3'; rr(c, x + 128, by - 92, 12, 10, 3); c.fill();
    c.fillStyle = '#ffd54f'; rr(c, x + 140, by - 34, 10, 8, 2); c.fill();
    [x + 30, x + 120].forEach(wx => { circle(c, wx, by - 12, 13, '#222'); circle(c, wx, by - 12, 6, '#bdbdbd'); });
    c.fillStyle = '#fff'; c.font = 'bold 13px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
    c.fillText('112', x + 50, by - 46);
    if (anim > 0.4 && anim < 1.2) {
      // Noah sitzt schon drin
      circle(c, x + 126, by - 64, 8, '#ffd3ad');
    }
  } else if (theme === 'ice' || theme === 'sea') { drawGoalExtra(c, e, theme, t, anim, cx, by); } else {
    const lift = anim > 0.8 ? Math.pow(anim - 0.8, 2) * 300 : 0;
    const x = cx, y = by - lift;
    if (anim > 0.6) {
      for (let i = 0; i < 4; i++) flame(c, x + (i - 1.5) * 8, y + 30 + Math.random() * 10, 16, 40 + Math.random() * 20, t, i);
    }
    c.fillStyle = '#90a4ae'; c.beginPath(); c.moveTo(x - 30, y); c.lineTo(x - 50, y); c.lineTo(x - 30, y - 50); c.fill();
    c.beginPath(); c.moveTo(x + 30, y); c.lineTo(x + 50, y); c.lineTo(x + 30, y - 50); c.fill();
    c.fillStyle = '#eceff1'; rr(c, x - 30, y - 150, 60, 150, 20); c.fill();
    c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(x - 30, y - 130); c.quadraticCurveTo(x, y - 210, x + 30, y - 130); c.fill();
    c.fillStyle = '#e53935'; c.fillRect(x - 30, y - 30, 60, 10);
    circle(c, x, y - 90, 15, '#607d8b'); circle(c, x, y - 90, 11, '#81d4fa');
    if (anim > 0.4) circle(c, x, y - 90, 7, '#ffd3ad');
    c.fillStyle = 'rgba(255,255,255,0.6)'; ellipse(c, x - 4, y - 94, 4, 3); c.fill();
    c.fillStyle = '#e53935'; c.font = 'bold 14px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center'; c.fillText('NOAH', x, y - 52);
  }
}

/* ---------------- Bosse ---------------- */
function drawBoss(c, e, t) {
  const cx = e.x + e.w / 2, by = e.y + e.h;
  const flash = (e.hurtT > 0 && Math.floor(t * 16) % 2) || e.flashT > 0;
  c.save();
  if (e.state === 'dead') { c.globalAlpha = Math.max(0, 1 - e.deadT / 1.6); }
  if (e.kind === 'dino') {
    c.translate(cx, by); c.scale(e.face, 1);
    const step = e.onGround ? Math.sin(t * 8) : 0.4;
    const col = flash ? '#fff' : '#5b8c3a', dark = flash ? '#eee' : '#456d2b';
    c.fillStyle = col;
    c.beginPath(); c.moveTo(-30, -70); c.quadraticCurveTo(-90, -70, -100, -40); c.lineTo(-30, -45); c.fill();
    c.fillStyle = dark; rr(c, -30 + step * 8, -40, 22, 40, 8); c.fill(); rr(c, 8 - step * 8, -40, 22, 40, 8); c.fill();
    ellipse(c, -2, -62, 42, 32, col);
    ellipse(c, 6, -52, 26, 18, flash ? '#fff' : '#c5e1a5');
    for (let i = 0; i < 5; i++) tri(c, -36 + i * 12, -88 + Math.abs(i - 2) * 3, -30 + i * 12, -102 + Math.abs(i - 2) * 3, -24 + i * 12, -88 + Math.abs(i - 2) * 3, '#ff7043');
    // Kopf
    const jaw = e.state === 'roar' ? 0.35 : 0.08 + Math.abs(Math.sin(t * 3)) * 0.06;
    c.save(); c.translate(30, -88);
    c.fillStyle = col; rr(c, -6, -22, 56, 30, 12); c.fill();
    c.save(); c.translate(0, 6); c.rotate(jaw); c.fillStyle = dark; rr(c, -2, 0, 50, 14, 6); c.fill();
    for (let i = 0; i < 5; i++) tri(c, 6 + i * 9, 0, 10 + i * 9, -6, 14 + i * 9, 0, '#fff');
    c.restore();
    for (let i = 0; i < 5; i++) tri(c, 6 + i * 9, 6, 10 + i * 9, 12, 14 + i * 9, 6, '#fff');
    eye(c, 26, -12, 6, 1, true);
    circle(c, 46, -14, 2, '#222');
    c.restore();
    c.fillStyle = dark; rr(c, 30, -58, 16, 6, 3); c.fill();
  } else if (e.kind === 'city') {
    c.translate(cx, by);
    if (flash) { c.globalAlpha *= 0.6; }
    const s = 0.75 + 0.25 * (e.hp / e.maxHp);
    flame(c, 0, 0, 110 * s, 135 * s, t, 1);
    flame(c, -48, -50, 34, 46, t, 4);
    flame(c, 48, -50, 34, 46, t, 7);
    eye(c, -14, -62 * s, 9, e.face, true); eye(c, 14, -62 * s, 9, e.face, true);
    c.fillStyle = '#7a1c00'; c.beginPath(); c.ellipse(0, -36 * s, 18, 10, 0, 0, Math.PI); c.fill();
    if (flash) { c.globalAlpha = 0.5; circle(c, 0, -50, 50, '#e3f2fd'); }
  } else if (e.kind !== 'space') { drawBossExtra(c, e, t, flash, cx, by); } else {
    c.translate(cx, e.y + e.h * 0.55);
    if (e.state === 'low') { c.rotate(Math.sin(t * 10) * 0.05); }
    if (e.state === 'low' || e.state === 'down') {
      c.fillStyle = 'rgba(160,255,160,0.18)'; c.beginPath(); c.moveTo(-40, 10); c.lineTo(40, 10); c.lineTo(70, 200); c.lineTo(-70, 200); c.fill();
    }
    c.fillStyle = 'rgba(150,255,200,0.55)'; c.beginPath(); c.arc(0, -10, 34, Math.PI, 0); c.fill();
    // Alien
    circle(c, 0, -18, 16, flash ? '#fff' : '#66bb6a');
    eye(c, -6, -20, 5, 0, true); eye(c, 7, -20, 5, 0, true);
    c.strokeStyle = '#1b5e20'; c.lineWidth = 2; c.beginPath(); c.arc(0, -10, 6, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
    ellipse(c, 0, 4, e.w / 2, 18, flash ? '#fff' : '#9e9eb8');
    ellipse(c, 0, 0, e.w / 2 - 10, 9, flash ? '#fff' : '#c5c5d8');
    for (let i = 0; i < 7; i++) circle(c, -54 + i * 18, 10, 4.5, (Math.floor(t * 8) + i) % 3 === 0 ? '#ffeb3b' : (i % 2 ? '#ff4081' : '#40c4ff'));
    if (e.state === 'low') {
      for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; star5(c, Math.cos(a) * 26, -40 + Math.sin(a) * 6, 6, 2.5, 0, '#ffeb3b'); }
    }
  }
  c.restore();
}

/* ---------------- HUD ---------------- */
function drawHUD(c, G) {
  const p = G.player, theme = G.lvl.theme;
  // Herzen
  for (let i = 0; i < 3; i++) {
    const x = 26 + i * 38, y = 14;
    heartShape(c, x + 2, y + 2, 30, 'rgba(0,0,0,0.3)');
    heartShape(c, x, y, 30, i < p.hearts ? '#e53935' : 'rgba(255,255,255,0.35)');
    if (i < p.hearts) { c.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(c, x - 6, y + 9, 3, 2, null, -0.5); c.fill(); }
  }
  // Kraft
  if (p.power !== 'none') {
    c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, 130, 10, 44, 40, 10); c.fill();
    drawPowerIcon(c, p.power, 152, 30, 0.9);
  }
  // Münzen
  const mx = p.power !== 'none' ? 190 : 140;
  c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, mx, 10, 96, 40, 12); c.fill();
  drawCoin(c, mx + 22, 30, 0);
  c.font = 'bold 24px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'left';
  c.fillStyle = '#fff'; c.fillText(String(G.coins), mx + 40, 39);
  // Sammelsachen
  for (let i = 0; i < 3; i++) drawCollectIcon(c, theme, VW - 200 + i * 40, 30, 0.95, G.t, !G.stars[i]);
  // Boss-Leben
  const boss = G.boss;
  if (boss && boss.active && boss.state !== 'dead') {
    c.fillStyle = 'rgba(0,0,0,0.4)'; rr(c, VW / 2 - 150, 16, 300, 26, 13); c.fill();
    c.fillStyle = '#ff5252'; rr(c, VW / 2 - 146, 20, 292 * Math.max(0, boss.hp / boss.maxHp), 18, 9); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 15px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
    c.fillText(boss.name, VW / 2, 35);
  }
  // Levelname
  if (G.bannerT > 0) {
    const a = Math.min(1, G.bannerT);
    c.globalAlpha = a;
    c.fillStyle = 'rgba(0,0,0,0.45)'; rr(c, VW / 2 - 260, 120, 520, 90, 24); c.fill();
    c.fillStyle = '#ffd54f'; c.font = 'bold 22px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
    c.fillText('Level ' + G.lvl.id, VW / 2, 155);
    c.fillStyle = '#fff'; c.font = 'bold 32px "Arial Rounded MT Bold", Arial, sans-serif';
    c.fillText(G.lvl.def.name, VW / 2, 193);
    c.globalAlpha = 1;
  }
}

function wrapText(c, text, maxW) {
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (c.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBubble(c, text, x, y) {
  c.font = 'bold 18px "Arial Rounded MT Bold", Arial, sans-serif';
  const lines = wrapText(c, text, 300);
  const w = Math.min(330, Math.max(...lines.map(l => c.measureText(l).width)) + 30), h = lines.length * 24 + 20;
  let bx = Math.max(10, Math.min(VW - w - 10, x - w / 2)), byy = y - h - 16;
  if (byy < 60) byy = 60;
  c.fillStyle = 'rgba(0,0,0,0.2)'; rr(c, bx + 3, byy + 4, w, h, 16); c.fill();
  c.fillStyle = '#fffdf3'; rr(c, bx, byy, w, h, 16); c.fill();
  c.beginPath(); c.moveTo(x - 10, byy + h - 1); c.lineTo(x + 10, byy + h - 1); c.lineTo(x, byy + h + 14); c.fill();
  c.strokeStyle = '#ffb300'; c.lineWidth = 3; rr(c, bx, byy, w, h, 16); c.stroke();
  c.fillStyle = '#4a3200'; c.textAlign = 'center';
  lines.forEach((l, i) => c.fillText(l, bx + w / 2, byy + 30 + i * 24));
}

