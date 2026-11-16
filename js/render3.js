'use strict';
/* =========================================================
   Super Noah – Grafik für die Welten 7–9 (Ritterburg,
   Chemielabor, Polizei-Einsatz), die Werkzeuge und die
   Weltkarte mit drei Seiten
   ========================================================= */

Object.assign(THEMES, {
  knight: { sky: ['#9ec9f5', '#f3e9ff'], dirt: '#8d8a96', dirtDark: '#6f6b7a', top: '#6cbf45', topDark: '#4f9a30', brick: '#a1887f', brickLine: '#6d4c41' },
  lab:    { sky: ['#e0f2f1', '#ffffff'], dirt: '#eceff1', dirtDark: '#b0bec5', top: '#26a69a', topDark: '#00897b', brick: '#80cbc4', brickLine: '#4db6ac' },
  police: { sky: ['#0b1440', '#283f7a'], dirt: '#454b57', dirtDark: '#31363f', top: '#b0b6c0', topDark: '#8a919c', brick: '#5d4e7a', brickLine: '#3e325a' },
});

/* ---------------- Hintergründe ---------------- */
function bgKnight(c, cam, t) {
  circle(c, 820, 90, 40, '#fff8d6');
  // Burgen in der Ferne
  const bs = 700, bo = cam * 0.15;
  for (let i = Math.floor(bo / bs) - 1; i < Math.floor(bo / bs) + 3; i++) {
    const x = i * bs - bo + 120 + hash(i) * 200, by = 420;
    c.fillStyle = '#b3a9c9';
    c.fillRect(x, by - 120, 180, 120);
    for (const tx of [x - 30, x + 180]) {
      c.fillRect(tx, by - 180, 50, 180);
      tri(c, tx - 8, by - 180, tx + 25, by - 230, tx + 58, by - 180, '#8e7cc3');
      c.fillStyle = '#e53935'; c.fillRect(tx + 24, by - 262, 2, 34);
      c.beginPath(); c.moveTo(tx + 26, by - 262); c.lineTo(tx + 46 + Math.sin(t * 3 + i) * 3, by - 254); c.lineTo(tx + 26, by - 246); c.fill();
      c.fillStyle = '#b3a9c9';
    }
    for (let k = 0; k < 6; k++) c.fillRect(x + k * 32, by - 134, 18, 14);
    c.fillStyle = '#6f6596'; c.beginPath(); c.arc(x + 90, by, 26, Math.PI, 0); c.fill();
  }
  hills(c, cam, 0.3, 425, 26, '#8fd16a', 0.004, 0.012);
  // Bäume und Fahnen
  const ps = 240, po = cam * 0.5;
  for (let i = Math.floor(po / ps) - 1; i < Math.floor(po / ps) + 6; i++) {
    const x = i * ps - po + hash(i) * 90, by = 478;
    if (hash(i * 2.3) > 0.5) {
      c.fillStyle = '#6d4c41'; c.fillRect(x - 5, by - 50, 10, 50);
      circle(c, x, by - 64, 28, '#43a047'); circle(c, x - 18, by - 50, 18, '#4caf50'); circle(c, x + 18, by - 52, 20, '#388e3c');
    } else {
      c.fillStyle = '#795548'; c.fillRect(x, by - 90, 4, 90);
      const col = ['#e53935', '#1e88e5', '#fdd835', '#8e24aa'][i & 3];
      c.fillStyle = col; c.beginPath(); c.moveTo(x + 4, by - 88);
      c.lineTo(x + 34, by - 84 + Math.sin(t * 4 + i) * 3); c.lineTo(x + 4, by - 66); c.fill();
    }
  }
  hills(c, cam, 0.5, 482, 12, '#6cbf45', 0.007, 0.018);
}

function bgLab(c, cam, t) {
  const o = (cam * 0.2) % 40;
  c.strokeStyle = 'rgba(0,105,92,0.08)'; c.lineWidth = 2;
  for (let x = -o; x < VW; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, VH); c.stroke(); }
  for (let y = 0; y < VH; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(VW, y); c.stroke(); }
  const ss = 300, so = cam * 0.3;
  for (let i = Math.floor(so / ss) - 1; i < Math.floor(so / ss) + 5; i++) {
    const x = i * ss - so;
    // Regal mit Flaschen
    c.fillStyle = '#90a4ae'; c.fillRect(x + 20, 190, 200, 8); c.fillRect(x + 20, 290, 200, 8);
    for (let k = 0; k < 5; k++) {
      const fx = x + 40 + k * 38, col = ['#ff4081', '#69f0ae', '#40c4ff', '#ffd740', '#b388ff'][(i * 3 + k) & 4 ? (k % 5) : ((k + 2) % 5)];
      const shelf = k % 2 ? 190 : 290;
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.arc(fx, shelf - 14, 12, 0, Math.PI * 2); c.fill(); c.fillRect(fx - 4, shelf - 40, 8, 18);
      c.fillStyle = col; c.beginPath(); c.arc(fx, shelf - 12, 10, 0, Math.PI); c.fill();
      const bp = (t * 0.8 + k * 0.3 + i) % 1;
      circle(c, fx + Math.sin(bp * 6) * 3, shelf - 20 - bp * 30, 2.5, col);
    }
    // große Röhre
    if (hash(i) > 0.4) {
      const tx = x + 250, col = hash(i + 1) > 0.5 ? 'rgba(105,240,174,0.55)' : 'rgba(64,196,255,0.5)';
      c.fillStyle = 'rgba(255,255,255,0.6)'; rr(c, tx, 120, 40, 330, 18); c.fill();
      c.fillStyle = col; rr(c, tx + 4, 220, 32, 226, 14); c.fill();
      for (let b = 0; b < 4; b++) { const bp = (t * 0.6 + b / 4 + i) % 1; circle(c, tx + 20 + Math.sin(bp * 9) * 6, 440 - bp * 220, 4, 'rgba(255,255,255,0.8)'); }
      c.fillStyle = '#78909c'; c.fillRect(tx - 4, 112, 48, 12); c.fillRect(tx - 4, 444, 48, 12);
    }
  }
  c.fillStyle = '#cfd8dc'; c.fillRect(0, 470, VW, 90);
}

function bgPolice(c, cam, t) {
  circle(c, 800, 90, 34, '#fffde7'); circle(c, 812, 82, 30, '#1a2a63');
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(t + i))})`; c.fillRect(((hash(i) * 2000 - cam * 0.05) % VW + VW) % VW, hash(i + 9) * 260, 2, 2); }
  // Suchscheinwerfer
  for (let k = 0; k < 2; k++) {
    const bx = ((k * 520 + 200 - cam * 0.2) % 1200 + 1200) % 1200 - 120, a = Math.sin(t * 0.6 + k * 2) * 0.5 - Math.PI / 2;
    c.fillStyle = 'rgba(255,255,200,0.07)'; c.beginPath(); c.moveTo(bx, 470);
    c.lineTo(bx + Math.cos(a - 0.12) * 700, 470 + Math.sin(a - 0.12) * 700); c.lineTo(bx + Math.cos(a + 0.12) * 700, 470 + Math.sin(a + 0.12) * 700); c.fill();
  }
  const layer = (p, seg, base, col, win, seed) => {
    const off = cam * p;
    for (let i = Math.floor(off / seg) - 1; i < Math.floor(off / seg) + Math.ceil(VW / seg) + 2; i++) {
      const x = i * seg - off, h = 110 + hash(i * 1.3 + seed) * 190, w = seg - 8;
      c.fillStyle = col; c.fillRect(x, base - h, w, h + 200);
      if (win) for (let wy = base - h + 14; wy < base - 10; wy += 24) for (let wx = x + 9; wx < x + w - 12; wx += 18)
        if (hash(wx * 0.37 + wy * 1.91 + seed) > 0.62) { c.fillStyle = win; c.fillRect(wx, wy, 8, 12); }
    }
  };
  layer(0.15, 110, 430, '#1e2c5e', null, 2);
  layer(0.35, 150, 470, '#16224a', 'rgba(255,224,130,0.8)', 7);
  // Blaulicht-Schimmer am Horizont
  const on = Math.floor(t * 3) % 2;
  c.fillStyle = on ? 'rgba(255,40,40,0.10)' : 'rgba(40,120,255,0.12)'; c.fillRect(0, 380, VW, 180);
}

/* ---------------- Boden und Plattformen ---------------- */
const _groundExtra = drawGroundExtra;
drawGroundExtra = function (c, lvl, th, tx, ty, x, y, topOpen) {
  const theme = lvl.theme;
  if (theme === 'knight') {
    c.strokeStyle = th.dirtDark; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x, y + 20.5); c.lineTo(x + T, y + 20.5);
    const off = (ty % 2) * 20; c.moveTo(x + off + 0.5, y); c.lineTo(x + off + 0.5, y + 20); c.moveTo(x + ((off + 20) % 40) + 0.5, y + 20); c.lineTo(x + ((off + 20) % 40) + 0.5, y + 40);
    c.stroke();
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x, y, T + 0.5, 11);
      c.fillStyle = th.topDark; for (let i = 0; i < 4; i++) { circle(c, x + 5 + i * 10, y + 11, 5); c.fill(); }
      if (hash(tx * 3.1) > 0.75) { c.fillStyle = '#fff176'; circle(c, x + 20, y - 4, 3); c.fill(); }
    }
  } else if (theme === 'lab') {
    c.strokeStyle = th.dirtDark; c.lineWidth = 1.5; c.strokeRect(x + 0.5, y + 0.5, 19.5, 19.5); c.strokeRect(x + 20.5, y + 20.5, 19.5, 19.5);
    c.strokeRect(x + 20.5, y + 0.5, 19.5, 19.5); c.strokeRect(x + 0.5, y + 20.5, 19.5, 19.5);
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x - 0.5, y, T + 1, 7);
      c.fillStyle = '#e0f2f1'; c.fillRect(x - 0.5, y + 7, T + 1, 2);
    }
  } else if (theme === 'police') {
    c.fillStyle = th.dirtDark; if (hash(tx * 7 + ty) > 0.6) { c.fillRect(x + 6 + hash(tx) * 20, y + 18, 10, 3); }
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x - 0.5, y, T + 1, 9);
      c.fillStyle = th.topDark; c.fillRect(x - 0.5, y + 9, T + 1, 3);
      c.fillStyle = '#ffd54f'; c.fillRect(x - 0.5, y + 12, T + 1, 2);
    }
  } else _groundExtra(c, lvl, th, tx, ty, x, y, topOpen);
};

const _platExtra = drawPlatExtra;
drawPlatExtra = function (c, theme, x, y, w, t) {
  if (theme === 'knight') {
    c.fillStyle = '#8d6e47'; rr(c, x, y + 2, w, 13, 3); c.fill();
    c.fillStyle = '#a1887f'; c.fillRect(x, y + 2, w, 4);
    c.fillStyle = '#5d4037'; for (let k = 6; k < w; k += 20) { circle(c, x + k, y + 9, 2); c.fill(); }
    c.strokeStyle = '#757575'; c.lineWidth = 2; for (let k = 10; k < w; k += 40) { c.beginPath(); c.moveTo(x + k, y + 14); c.lineTo(x + k, y + 22); c.stroke(); }
  } else if (theme === 'lab') {
    c.fillStyle = 'rgba(178,235,242,0.85)'; rr(c, x, y + 2, w, 10, 3); c.fill();
    c.fillStyle = '#90a4ae'; c.fillRect(x, y + 11, w, 4);
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(x + 4, y + 4, w - 8, 2);
  } else if (theme === 'police') {
    c.fillStyle = '#607d8b'; c.fillRect(x, y + 1, w, 13);
    c.strokeStyle = '#37474f'; c.lineWidth = 2;
    for (let k = 0; k < w; k += 10) { c.beginPath(); c.moveTo(x + k, y + 1); c.lineTo(x + k + 8, y + 14); c.stroke(); }
    c.fillStyle = '#90a4ae'; c.fillRect(x, y + 1, w, 3);
  } else _platExtra(c, theme, x, y, w, t);
};

const _drawLava = drawLava;
drawLava = function (c, x, y, t, tx, theme) {
  if (theme === 'knight') return _drawLava(c, x, y, t, tx, 'ice');
  if (theme !== 'lab') return _drawLava(c, x, y, t, tx, theme);
  c.fillStyle = '#2e7d32'; c.fillRect(x, y + 8, T + 0.5, T - 8);
  c.fillStyle = '#76ff03';
  c.beginPath(); c.moveTo(x, y + 14);
  for (let k = 0; k <= T; k += 5) c.lineTo(x + k, y + 9 + Math.sin(t * 4 + (tx * T + k) * 0.15) * 4);
  c.lineTo(x + T, y + 20); c.lineTo(x, y + 20); c.fill();
  const bp = (t * 1.3 + tx * 0.37) % 1;
  c.strokeStyle = 'rgba(204,255,144,0.9)'; c.lineWidth = 2; circle(c, x + 10 + hash(tx) * 20, y + 26 - bp * 14, 3 + bp * 2); c.stroke();
};

/* ---------------- Gegner ---------------- */
const _walkerExtra = drawWalkerExtra;
drawWalkerExtra = function (c, e, theme, t, step) {
  if (theme === 'knight') {
    c.fillStyle = '#5d4037'; c.fillRect(-7 + step * 2, -9, 5, 9); c.fillRect(2 - step * 2, -9, 5, 9);
    ellipse(c, 0, -13, 11, 9, '#8bc34a');
    circle(c, 2, -24, 9, '#9ccc65');
    c.fillStyle = '#9e9e9e'; c.beginPath(); c.arc(2, -26, 10, Math.PI, 0); c.fill();
    c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(-10, -44, -12, -34); c.lineTo(-2, -34); c.fill();
    eye(c, 6, -23, 2.6, 1, true);
    tri(c, -6, -24, -14, -30, -8, -20, '#9ccc65');
    c.fillStyle = '#795548'; rr(c, 9, -20, 5, 14, 2); c.fill();
    circle(c, 11, -22, 4.5, '#8d6e63');
  } else if (theme === 'lab') {
    const wob = Math.sin(t * 6 + e.x) * 2;
    c.fillStyle = '#7cb342'; c.beginPath(); c.moveTo(-15 - wob, 0); c.quadraticCurveTo(-16, -26, 0, -25); c.quadraticCurveTo(16, -26, 15 + wob, 0); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; ellipse(c, -5, -17, 4, 6); c.fill();
    c.fillStyle = '#37474f'; c.fillRect(-11, -18, 22, 4);
    circle(c, -4, -16, 5, '#b3e5fc'); circle(c, 6, -16, 5, '#b3e5fc'); circle(c, -3, -16, 2, '#111'); circle(c, 7, -16, 2, '#111');
  } else if (theme === 'police') {
    c.fillStyle = '#263238'; c.fillRect(-7 + step * 2, -10, 5, 10); c.fillRect(2 - step * 2, -10, 5, 10);
    c.fillStyle = '#fafafa'; rr(c, -9, -24, 18, 15, 4); c.fill();
    c.fillStyle = '#212121'; for (let k = 0; k < 3; k++) c.fillRect(-9, -22 + k * 5, 18, 2.4);
    circle(c, 1, -31, 8, '#ffcc80');
    c.fillStyle = '#212121'; c.beginPath(); c.arc(1, -34, 8.5, Math.PI, 0); c.fill(); c.fillRect(-8, -35, 18, 3);
    c.fillStyle = '#212121'; rr(c, -6, -33, 15, 5, 2); c.fill();
    circle(c, 0, -30.5, 1.6, '#fff'); circle(c, 6, -30.5, 1.6, '#fff');
    c.fillStyle = '#a1887f'; ellipse(c, -11, -24, 8, 9); c.fill();
    c.fillStyle = '#ffd54f'; c.font = 'bold 9px Arial'; c.textAlign = 'center'; c.fillText('$', -11, -21);
  } else _walkerExtra(c, e, theme, t, step);
};

const _spikyExtra = drawSpikyExtra;
drawSpikyExtra = function (c, e, theme, t, step, f) {
  if (theme === 'knight') {
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.11); tri(c, Math.cos(a - 0.1) * 12, -10 + Math.sin(a - 0.1) * 10, Math.cos(a) * 21, -10 + Math.sin(a) * 19, Math.cos(a + 0.1) * 12, -10 + Math.sin(a + 0.1) * 10, '#6d4c41'); }
    c.fillStyle = '#4e342e'; c.fillRect(-8 + step * 2, -4, 4, 4); c.fillRect(5 - step * 2, -4, 4, 4);
    ellipse(c, 0, -9, 14, 9, '#8d6e63'); ellipse(c, 12, -7, 6, 5, '#d7ccc8');
    circle(c, 17, -7, 1.6, '#111'); eye(c, 11, -9, 2, 1);
  } else if (theme === 'lab') {
    c.fillStyle = '#455a64'; c.fillRect(-8 + step * 2, -5, 4, 5); c.fillRect(4 - step * 2, -5, 4, 5);
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(0, -15, 12, 0, Math.PI * 2); c.fill(); c.fillRect(-4, -36, 8, 12);
    c.fillStyle = '#76ff03'; c.beginPath(); c.arc(0, -14, 10, -0.2, Math.PI + 0.2); c.fill();
    for (let b = 0; b < 3; b++) { const bp = (t * 1.5 + b / 3) % 1; circle(c, Math.sin(bp * 8 + b) * 3, -30 - bp * 16, 2.5 + bp * 2, `rgba(118,255,3,${1 - bp})`); }
    eye(c, -4, -16, 2.6, 1, true); eye(c, 5, -16, 2.6, 1, true);
  } else if (theme === 'police') {
    c.fillStyle = '#263238'; c.fillRect(-7 + step * 2, -10, 5, 10); c.fillRect(2 - step * 2, -10, 5, 10);
    c.fillStyle = '#fafafa'; rr(c, -10, -24, 20, 15, 4); c.fill();
    c.fillStyle = '#212121'; for (let k = 0; k < 3; k++) c.fillRect(-10, -22 + k * 5, 20, 2.4);
    circle(c, 1, -31, 8, '#ffcc80');
    c.fillStyle = '#212121'; rr(c, -6, -33, 15, 5, 2); c.fill();
    circle(c, 0, -30.5, 1.6, '#fff'); circle(c, 6, -30.5, 1.6, '#fff');
    c.fillStyle = '#78909c'; c.beginPath(); c.arc(1, -36, 9, Math.PI, 0); c.fill();
    for (let i = 0; i < 5; i++) tri(c, -7 + i * 4, -40 + Math.abs(i - 2), -5 + i * 4, -49 + Math.abs(i - 2) * 1.5, -3 + i * 4, -40 + Math.abs(i - 2), '#cfd8dc');
  } else _spikyExtra(c, e, theme, t, step, f);
};

const _flyerExtra = drawFlyerExtra;
drawFlyerExtra = function (c, e, theme, t, flap) {
  if (theme === 'knight') {
    c.fillStyle = '#5e35b1';
    c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-16, -14 - flap * 10, -26, -2 - flap * 8); c.lineTo(-18, 2); c.lineTo(-12, -2); c.lineTo(-6, 6); c.fill();
    c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(16, -14 - flap * 10, 26, -2 - flap * 8); c.lineTo(18, 2); c.lineTo(12, -2); c.lineTo(6, 6); c.fill();
    ellipse(c, 0, 2, 8, 9, '#4527a0');
    tri(c, -6, -5, -4, -13, -1, -6, '#4527a0'); tri(c, 6, -5, 4, -13, 1, -6, '#4527a0');
    eye(c, -3, 0, 2.2, 1, true); eye(c, 4, 0, 2.2, 1, true);
  } else if (theme === 'lab') {
    circle(c, 0, 0, 7, '#ff4081'); circle(c, -2, -2, 3, '#ff80ab');
    c.strokeStyle = '#40c4ff'; c.lineWidth = 2;
    for (let k = 0; k < 3; k++) { c.save(); c.rotate(k * Math.PI / 3 + t * 0.5); ellipse(c, 0, 0, 20, 7); c.stroke(); circle(c, Math.cos(t * 5 + k * 2) * 20, Math.sin(t * 5 + k * 2) * 7, 3, '#ffd740'); c.restore(); }
    eye(c, -2, -1, 2, 1, true); eye(c, 3, -1, 2, 1, true);
  } else if (theme === 'police') {
    c.fillStyle = '#212121';
    c.beginPath(); c.moveTo(-3, -2); c.quadraticCurveTo(-18, -16 - flap * 10, -26, -4 - flap * 10); c.quadraticCurveTo(-14, 2, -3, 6); c.fill();
    c.beginPath(); c.moveTo(3, -2); c.quadraticCurveTo(14, -16 - flap * 10, 22, -4 - flap * 10); c.quadraticCurveTo(12, 2, 3, 6); c.fill();
    ellipse(c, 0, 2, 11, 8, '#37474f');
    tri(c, 9, 0, 17, 3, 9, 5, '#ffb300');
    eye(c, 5, -2, 2.4, 1, true);
    c.strokeStyle = '#ffd740'; c.lineWidth = 2; circle(c, 18, 6, 3.5); c.stroke();
  } else _flyerExtra(c, e, theme, t, flap);
};

const _drawUrchin = drawUrchin;
drawUrchin = function (c, e, theme, t) {
  const cx = e.x + e.w / 2, by = e.y + e.h;
  if (theme === 'knight' || theme === 'police') {
    c.fillStyle = theme === 'knight' ? '#6d4c41' : '#8d6e63'; rr(c, cx - 17, by - 6, 34, 6, 2); c.fill();
    for (let k = 0; k < 5; k++) tri(c, cx - 16 + k * 7, by - 5, cx - 12.5 + k * 7, by - 22, cx - 9 + k * 7, by - 5, '#cfd8dc');
  } else if (theme === 'lab') {
    ellipse(c, cx, by - 3, 18, 5, '#76ff03');
    ellipse(c, cx - 4, by - 4, 8, 2, '#ccff90');
    for (let b = 0; b < 3; b++) { const bp = (t * 1.2 + b / 3 + e.sx * 0.1) % 1; c.strokeStyle = `rgba(118,255,3,${1 - bp})`; c.lineWidth = 2; circle(c, cx - 8 + b * 8, by - 6 - bp * 18, 3 + bp * 2); c.stroke(); }
  } else _drawUrchin(c, e, theme, t);
};

const _drawJumper = drawJumper;
drawJumper = function (c, e, t, theme) {
  if (theme !== 'lab') return _drawJumper(c, e, t, theme);
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  circle(c, cx, cy, 15, '#64dd17'); circle(c, cx - 4, cy - 4, 8, '#b2ff59'); circle(c, cx - 6, cy - 7, 3, '#f1f8e9');
  eye(c, cx - 4, cy, 2.5, 0, true); eye(c, cx + 5, cy, 2.5, 0, true);
};

const _drawMeteor = drawMeteor;
drawMeteor = function (c, e, t, theme) {
  if (theme !== 'knight' && theme !== 'lab') return _drawMeteor(c, e, t, theme);
  const a = 0.35 + 0.35 * Math.sin(t * 14);
  c.strokeStyle = `rgba(255,40,40,${a + 0.2})`; c.lineWidth = 3; ellipse(c, e.tx, e.groundY - 2, 26, 7); c.stroke();
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (theme === 'knight') {
    circle(c, cx, cy, 16, '#8d8a96'); circle(c, cx - 5, cy - 5, 5, '#a9a6b3'); circle(c, cx + 5, cy + 4, 3, '#6f6b7a');
  } else {
    c.fillStyle = '#76ff03'; c.beginPath(); c.moveTo(cx, cy - 20); c.quadraticCurveTo(cx + 14, cy + 4, cx, cy + 14); c.quadraticCurveTo(cx - 14, cy + 4, cx, cy - 20); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)'; ellipse(c, cx - 4, cy + 2, 3, 5); c.fill();
  }
};

/* ---------------- Schätze ---------------- */
const _collectExtra = drawCollectExtra;
drawCollectExtra = function (c, theme, t, empty) {
  if (theme === 'knight') {
    const col = empty ? '#666' : '#ffc107';
    c.fillStyle = col; c.beginPath(); c.moveTo(-14, 8); c.lineTo(-14, -6); c.lineTo(-7, 1); c.lineTo(0, -10); c.lineTo(7, 1); c.lineTo(14, -6); c.lineTo(14, 8); c.closePath(); c.fill();
    if (!empty) { circle(c, 0, 3, 3, '#e53935'); circle(c, -8, 4, 2.2, '#1e88e5'); circle(c, 8, 4, 2.2, '#43a047'); c.fillStyle = '#fff59d'; c.fillRect(-14, 6, 28, 2); }
  } else if (theme === 'lab') {
    const col = empty ? '#666' : '#b388ff';
    c.fillStyle = col; c.beginPath(); c.moveTo(0, -15); c.lineTo(10, -3); c.lineTo(6, 14); c.lineTo(-6, 14); c.lineTo(-10, -3); c.closePath(); c.fill();
    if (!empty) { c.fillStyle = '#e1bee7'; c.beginPath(); c.moveTo(0, -15); c.lineTo(4, -3); c.lineTo(0, 14); c.lineTo(-4, -3); c.fill(); star5(c, 9, -11, 4, 1.6, (t || 0) * 3, '#fff'); }
  } else if (theme !== 'police') {
    _collectExtra(c, theme, t, empty);
  } else {
    const col = empty ? '#666' : '#4dd0e1';
    c.fillStyle = col; c.beginPath(); c.moveTo(-14, -5); c.lineTo(-8, -12); c.lineTo(8, -12); c.lineTo(14, -5); c.lineTo(0, 13); c.closePath(); c.fill();
    if (!empty) {
      c.fillStyle = '#b2ebf2'; c.beginPath(); c.moveTo(-14, -5); c.lineTo(14, -5); c.lineTo(0, 13); c.fill();
      c.fillStyle = '#e0f7fa'; c.beginPath(); c.moveTo(-8, -12); c.lineTo(-3, -5); c.lineTo(3, -12); c.fill();
      star5(c, 10, -12, 4, 1.6, (t || 0) * 3, '#fff');
    }
  }
};

/* ---------------- Werkzeuge ---------------- */
function drawToolArm(c, tool, swing, arm) {
  // swing läuft von 1 (Beginn) bis 0 (Ende); in Ruhe wird das Werkzeug hochgehalten
  const ang = swing > 0 ? -2.9 + (1 - swing) * 2.2 : -2.6;
  arm(4, -27, ang);
  c.save(); c.translate(4, -27); c.rotate(ang); c.translate(0, 12);
  if (tool === 'sword') {
    c.fillStyle = '#ffd54f'; c.fillRect(-6, -1, 12, 3);
    c.fillStyle = '#6d4c41'; c.fillRect(-1.5, -6, 3, 6);
    c.fillStyle = '#eceff1'; c.beginPath(); c.moveTo(-2.5, 2); c.lineTo(2.5, 2); c.lineTo(2, 26); c.lineTo(0, 30); c.lineTo(-2, 26); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(-0.5, 4, 1, 22);
  } else {
    c.fillStyle = '#8d6e63'; c.fillRect(-1.5, -4, 3, 26);
    c.strokeStyle = '#eceff1'; c.lineWidth = 2; circle(c, 0, 30, 9); c.stroke();
    c.strokeStyle = 'rgba(236,239,241,0.6)'; c.lineWidth = 1;
    c.beginPath(); for (let k = -6; k <= 6; k += 4) { c.moveTo(k, 22); c.lineTo(k, 38); c.moveTo(-8, 30 + k * 0.7); c.lineTo(8, 30 + k * 0.7); } c.stroke();
  }
  c.restore();
  if (swing > 0) {
    c.strokeStyle = `rgba(255,255,255,${0.7 * swing + 0.2})`; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.arc(4, -27, 40, -2.4, -2.4 + (1 - swing) * 2.4 + 0.3); c.stroke();
  }
}

function drawToolIcon(c, theme, cx, cy, s) {
  const tool = toolOf(theme);
  if (tool === 'water') return false;
  c.save(); c.translate(cx, cy); c.scale(s, s);
  if (tool === 'sword') {
    c.rotate(-0.7);
    c.fillStyle = '#eceff1'; c.beginPath(); c.moveTo(-2.5, -16); c.lineTo(2.5, -16); c.lineTo(2.5, 8); c.lineTo(-2.5, 8); c.fill(); tri(c, -2.5, -16, 2.5, -16, 0, -21, '#eceff1');
    c.fillStyle = '#ffd54f'; c.fillRect(-8, 8, 16, 3); c.fillStyle = '#6d4c41'; c.fillRect(-2, 11, 4, 8);
  } else if (tool === 'net') {
    c.rotate(-0.6); c.fillStyle = '#8d6e63'; c.fillRect(-1.5, 0, 3, 20);
    c.strokeStyle = '#eceff1'; c.lineWidth = 2; circle(c, 0, -8, 9); c.stroke();
    c.lineWidth = 1; c.beginPath(); for (let k = -6; k <= 6; k += 4) { c.moveTo(k, -16); c.lineTo(k, 0); c.moveTo(-8, -8 + k * 0.7); c.lineTo(8, -8 + k * 0.7); } c.stroke();
  } else {
    const col = tool === 'foam' ? '#2e7d32' : '#0277bd';
    c.fillStyle = col; rr(c, -14, -10, 10, 20, 4); c.fill();
    c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(-9, -10); c.quadraticCurveTo(-2, -16, 2, -2); c.stroke();
    c.fillStyle = '#333'; rr(c, 0, -4, 10, 6, 2); c.fill();
    const dc = tool === 'foam' ? '#b9f6ca' : '#e1f5fe';
    circle(c, 14, -2, 3.4, dc); circle(c, 18, 3, 2.6, dc); circle(c, 17, -8, 2.2, dc);
  }
  c.restore();
  return true;
}

function drawShotExtra(c, s, t) {
  if (s.kind === 'flask') {
    c.save(); c.translate(s.x, s.y); c.rotate(t * 8);
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(0, 3, 9, 0, Math.PI * 2); c.fill(); c.fillRect(-3, -12, 6, 9);
    c.fillStyle = '#76ff03'; c.beginPath(); c.arc(0, 4, 7, 0, Math.PI); c.fill();
    c.restore();
  } else {
    c.save(); c.translate(s.x, s.y); c.rotate(s.vx * t * 0.02);
    circle(c, 0, 0, s.r, '#a1887f'); c.fillStyle = '#6d4c41'; c.fillRect(-3, -s.r - 2, 6, 4);
    c.fillStyle = '#ffd54f'; c.font = 'bold 10px Arial'; c.textAlign = 'center'; c.fillText('$', 0, 4);
    c.restore();
  }
}

/* Hinweis, wenn sich das Werkzeug verwandelt hat */
const _drawHUD = drawHUD;
drawHUD = function (c, G) {
  _drawHUD(c, G);
  const tr = G.transform;
  if (!tr || G.bannerT > 0) return;
  const a = Math.min(1, tr.t, 4.5 - tr.t + 0.2);
  c.globalAlpha = Math.max(0, a);
  c.fillStyle = 'rgba(0,0,0,0.5)'; rr(c, VW / 2 - 290, 120, 580, 86, 24); c.fill();
  drawToolIcon(c, ({ water: 'city', foam: 'lab', sword: 'knight', net: 'police', bubble: 'sea' })[tr.from], VW / 2 - 240, 163, 1.4) || drawPowerIcon(c, 'hose', VW / 2 - 240, 163, 1.4, 'city');
  c.fillStyle = '#ffd54f'; c.font = 'bold 30px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center'; c.fillText('➜', VW / 2 - 190, 174);
  drawToolIcon(c, ({ water: 'city', foam: 'lab', sword: 'knight', net: 'police', bubble: 'sea' })[tr.to], VW / 2 - 140, 163, 1.4) || drawPowerIcon(c, 'hose', VW / 2 - 140, 163, 1.4, 'city');
  c.fillStyle = '#fff'; c.font = 'bold 19px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'left';
  const words = tr.text.split(' '); let l1 = '', l2 = '';
  for (const w of words) { if ((l1 + ' ' + w).length < 26 && !l2) l1 = (l1 ? l1 + ' ' : '') + w; else l2 = (l2 ? l2 + ' ' : '') + w; }
  c.fillText(l1, VW / 2 - 100, 157); c.fillText(l2, VW / 2 - 100, 184);
  c.globalAlpha = 1;
};

/* ---------------- Ziele ---------------- */
const _goalExtra = drawGoalExtra;
drawGoalExtra = function (c, e, theme, t, anim, cx, by) {
  if (theme === 'knight') {
    const x = cx + 30;
    c.fillStyle = '#9e9aa8'; c.fillRect(x - 10, by - 150, 170, 150);
    c.fillStyle = '#8d8a96'; for (let k = 0; k < 6; k++) c.fillRect(x - 10 + k * 30, by - 166, 18, 18);
    c.fillStyle = '#9e9aa8'; c.fillRect(x + 120, by - 210, 50, 210);
    tri(c, x + 112, by - 210, x + 145, by - 260, x + 178, by - 210, '#7e57c2');
    c.fillStyle = '#e53935'; c.fillRect(x + 144, by - 292, 2, 34);
    c.beginPath(); c.moveTo(x + 146, by - 292); c.lineTo(x + 170 + Math.sin(t * 4) * 3, by - 284); c.lineTo(x + 146, by - 276); c.fill();
    c.fillStyle = '#4e342e'; c.beginPath(); c.moveTo(x + 20, by); c.lineTo(x + 20, by - 60); c.arc(x + 50, by - 60, 30, Math.PI, 0); c.lineTo(x + 80, by); c.fill();
    // König winkt
    const kx = x + 50, ky = by - 150 - 6, wave = Math.sin(t * (anim > 0 ? 12 : 3)) * 0.5;
    c.fillStyle = '#c62828'; rr(c, kx - 12, ky - 26, 24, 26, 6); c.fill();
    circle(c, kx, ky - 34, 10, '#ffd3ad');
    c.fillStyle = '#eceff1'; c.beginPath(); c.arc(kx, ky - 30, 8, 0.1 * Math.PI, 0.9 * Math.PI); c.fill();
    c.fillStyle = '#ffc107'; c.beginPath(); c.moveTo(kx - 9, ky - 42); c.lineTo(kx - 9, ky - 52); c.lineTo(kx - 4, ky - 46); c.lineTo(kx, ky - 54); c.lineTo(kx + 4, ky - 46); c.lineTo(kx + 9, ky - 52); c.lineTo(kx + 9, ky - 42); c.fill();
    eye(c, kx - 3, ky - 36, 2, 0); eye(c, kx + 4, ky - 36, 2, 0);
    c.save(); c.translate(kx + 11, ky - 22); c.rotate(-2.4 + wave); c.fillStyle = '#c62828'; c.fillRect(-3, 0, 6, 14); circle(c, 0, 15, 3.5, '#ffd3ad'); c.restore();
  } else if (theme === 'lab') {
    const x = cx, glow = 0.5 + 0.5 * Math.sin(t * 6), boost = anim > 0 ? 1 : 0;
    c.fillStyle = '#78909c'; rr(c, x - 50, by - 14, 100, 14, 5); c.fill();
    c.fillStyle = '#455a64'; rr(c, x - 46, by - 200, 12, 190, 5); c.fill(); rr(c, x + 34, by - 200, 12, 190, 5); c.fill();
    c.fillStyle = '#455a64'; rr(c, x - 50, by - 212, 100, 16, 6); c.fill();
    c.fillStyle = `rgba(105,240,174,${0.18 + glow * 0.15 + boost * 0.35})`; c.fillRect(x - 34, by - 196, 68, 182);
    for (let k = 0; k < 4; k++) { const ry = by - 20 - ((t * 60 + k * 45) % 180); c.strokeStyle = `rgba(167,255,235,${0.6 + boost * 0.3})`; c.lineWidth = 3; ellipse(c, x, ry, 30, 6); c.stroke(); }
    c.fillStyle = '#00e676'; circle(c, x, by - 204, 4); c.fill();
  } else if (theme === 'police') {
    const dx = anim > 1 ? (anim - 1) * (anim - 1) * 260 : 0, x = cx - 70 + dx;
    c.fillStyle = '#eceff1'; rr(c, x, by - 56, 150, 40, 10); c.fill();
    c.fillStyle = '#1e3a8a'; rr(c, x + 26, by - 82, 92, 30, 10); c.fill();
    c.fillStyle = '#bbdefb'; rr(c, x + 34, by - 77, 34, 20, 4); c.fill(); rr(c, x + 76, by - 77, 34, 20, 4); c.fill();
    c.fillStyle = '#1e3a8a'; c.fillRect(x, by - 40, 150, 8);
    c.fillStyle = '#fff'; c.font = 'bold 12px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center'; c.fillText('POLIZEI', x + 75, by - 22);
    const blink = Math.floor(t * 6) % 2;
    c.fillStyle = blink ? '#2196f3' : '#e53935'; rr(c, x + 58, by - 92, 14, 10, 3); c.fill();
    c.fillStyle = blink ? '#e53935' : '#2196f3'; rr(c, x + 74, by - 92, 14, 10, 3); c.fill();
    [x + 30, x + 120].forEach(wx => { circle(c, wx, by - 12, 13, '#222'); circle(c, wx, by - 12, 6, '#bdbdbd'); });
    if (anim > 0.4) circle(c, x + 93, by - 66, 7, '#ffd3ad');
  } else _goalExtra(c, e, theme, t, anim, cx, by);
};

/* ---------------- Bosse ---------------- */
const _bossExtra = drawBossExtra;
drawBossExtra = function (c, e, t, flash, cx, by) {
  if (e.kind === 'knight') {
    c.translate(cx, by); c.scale(e.face, 1);
    const step = e.onGround ? Math.sin(t * 7) : 0.4, col = flash ? '#fff' : '#43a047', dark = flash ? '#eee' : '#2e7d32';
    // Flügel
    c.fillStyle = flash ? '#fff' : '#c62828';
    c.beginPath(); c.moveTo(-10, -70); c.lineTo(-60, -120 - Math.sin(t * 6) * 10); c.lineTo(-40, -82); c.lineTo(-70, -86 - Math.sin(t * 6) * 8); c.lineTo(-20, -56); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(-40, -50); c.quadraticCurveTo(-90, -46, -96, -18); c.lineTo(-40, -30); c.fill();
    tri(c, -96, -18, -110, -28, -100, -8, '#ffb300');
    c.fillStyle = dark; rr(c, -30 + step * 7, -36, 20, 36, 8); c.fill(); rr(c, 10 - step * 7, -36, 20, 36, 8); c.fill();
    ellipse(c, 0, -52, 44, 30, col);
    ellipse(c, 6, -44, 28, 16, flash ? '#fff' : '#fff59d');
    for (let i = 0; i < 5; i++) tri(c, -34 + i * 12, -78 + Math.abs(i - 2) * 3, -28 + i * 12, -92 + Math.abs(i - 2) * 3, -22 + i * 12, -78 + Math.abs(i - 2) * 3, '#ffb300');
    c.save(); c.translate(40, -78);
    c.fillStyle = col; rr(c, -8, -18, 48, 30, 12); c.fill();
    tri(c, 0, -16, -6, -32, 8, -18, '#fff8e1'); tri(c, 14, -16, 12, -32, 22, -18, '#fff8e1');
    eye(c, 18, -6, 6, 1, true);
    circle(c, 36, 2, 2, '#1b5e20');
    if (e.dropT < 0.5 && e.onGround) flame(c, 50, 14, 22, 30, t, 3);
    c.restore();
  } else if (e.kind === 'lab') {
    c.translate(cx, by); c.scale(e.face, 1);
    const step = Math.sin(t * 6), coat = flash ? '#ffcdd2' : '#fafafa';
    c.fillStyle = '#37474f'; c.fillRect(-14 + step * 3, -26, 10, 26); c.fillRect(4 - step * 3, -26, 10, 26);
    c.fillStyle = coat; c.beginPath(); c.moveTo(-24, -26); c.lineTo(-20, -74); c.lineTo(20, -74); c.lineTo(24, -26); c.fill();
    c.fillStyle = '#4db6ac'; c.fillRect(-4, -70, 8, 30);
    circle(c, 0, -86, 16, '#ffd3ad');
    c.fillStyle = flash ? '#fff' : '#eeeeee';
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.85 + i * 0.22); circle(c, Math.cos(a) * 16, -90 + Math.sin(a) * 15 - 4, 7 + Math.sin(t * 8 + i) * 1.5); c.fill(); }
    c.fillStyle = '#37474f'; c.fillRect(-14, -92, 28, 4);
    circle(c, -6, -88, 6, '#b3e5fc'); circle(c, 8, -88, 6, '#b3e5fc'); circle(c, -5, -88, 2.4, '#111'); circle(c, 9, -88, 2.4, '#111');
    c.strokeStyle = '#6d4c41'; c.lineWidth = 2; c.beginPath(); c.arc(2, -76, 6, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
    // erhobener Arm mit Kolben
    c.save(); c.translate(16, -66); c.rotate(-2.2 + Math.sin(t * 4) * 0.3);
    c.fillStyle = coat; c.fillRect(-4, 0, 8, 22); circle(c, 0, 24, 4.5, '#ffd3ad');
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(0, 36, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#76ff03'; c.beginPath(); c.arc(0, 37, 6, 0, Math.PI); c.fill();
    c.restore();
  } else if (e.kind === 'police') {
    c.translate(cx, by); c.scale(e.face, 1);
    const step = e.onGround ? Math.sin(t * 10) : 0.5, sh = flash ? '#ffcdd2' : '#fafafa';
    c.fillStyle = '#263238'; rr(c, -18 + step * 6, -34, 14, 34, 5); c.fill(); rr(c, 4 - step * 6, -34, 14, 34, 5); c.fill();
    c.fillStyle = sh; rr(c, -24, -72, 48, 42, 10); c.fill();
    c.fillStyle = '#212121'; for (let k = 0; k < 4; k++) c.fillRect(-24, -66 + k * 10, 48, 4);
    circle(c, 2, -86, 16, '#ffcc80');
    c.fillStyle = '#212121'; c.beginPath(); c.arc(2, -92, 17, Math.PI, 0); c.fill(); c.fillRect(-14, -94, 34, 5);
    c.fillStyle = '#212121'; rr(c, -10, -92, 28, 9, 4); c.fill();
    circle(c, -2, -87.5, 3, '#fff'); circle(c, 10, -87.5, 3, '#fff'); circle(c, -1, -87.5, 1.5, '#111'); circle(c, 11, -87.5, 1.5, '#111');
    c.strokeStyle = '#5d4037'; c.lineWidth = 2; c.beginPath(); c.arc(4, -76, 6, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    c.fillStyle = '#a1887f'; ellipse(c, -30, -64, 18, 22); c.fill();
    c.fillStyle = '#ffd54f'; c.font = 'bold 18px Arial'; c.textAlign = 'center'; c.fillText('$', -30, -58);
    star5(c, -22, -84, 6, 2.6, t * 2, '#4dd0e1');
  } else _bossExtra(c, e, t, flash, cx, by);
};

/* ---------------- Weltkarte: drei Seiten mit je drei Welten ---------------- */
const MAP_LAYOUT = [];
for (let col = 0; col < 3; col++) for (const [dx, y] of [[80, 405], [165, 300], [250, 405]]) MAP_LAYOUT.push([col * 320 + dx, y]);
const MAP_NODES = LEVELS.map((L, i) => MAP_LAYOUT[i % 9]);

function mapBand3(c, w, x, t) {
  const y = 0, h = VH;
  const grads = [['#a5e07a', '#5fae3e'], ['#ffcf8a', '#e8814c'], ['#3a2a78', '#120b33'], ['#cfeeff', '#8fc9ee'], ['#1976b8', '#0b2f5e'],
    ['#2a3352', '#141a2c'], ['#cbb8f0', '#7e57c2'], ['#e0f2f1', '#80cbc4'], ['#1c2b66', '#0b1440']];
  const g = c.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, grads[w][0]); g.addColorStop(1, grads[w][1]);
  c.fillStyle = g; c.fillRect(x, y, 321, h);
  c.save(); c.beginPath(); c.rect(x, y, 320, h); c.clip();
  if (w === 0) {
    c.fillStyle = '#7d6a8c'; c.beginPath(); c.moveTo(x + 60, 250); c.lineTo(x + 150, 125); c.lineTo(x + 185, 125); c.lineTo(x + 275, 250); c.fill();
    tri(c, x + 150, 125, x + 185, 125, x + 167, 150, '#ff7043');
    for (let k = 0; k < 3; k++) { const pt = (t * 0.3 + k / 3) % 1; circle(c, x + 168 + Math.sin(pt * 5) * 10, 115 - pt * 60, 9 + pt * 16, `rgba(110,100,110,${0.5 * (1 - pt)})`); }
    ellipse(c, x + 160, 520, 200, 70, '#4c9a2f');
  } else if (w === 1) {
    for (let i = 0; i < 7; i++) {
      const bx = x + 8 + i * 44, bh = 80 + hash(i + 3) * 110;
      c.fillStyle = '#9b4f5a'; c.fillRect(bx, 260 - bh, 38, bh + 400);
      c.fillStyle = 'rgba(255,230,140,0.8)';
      for (let wy = 268 - bh; wy < 520; wy += 22) for (let wx = bx + 6; wx < bx + 32; wx += 14) if (hash(wx + wy) > 0.55) c.fillRect(wx, wy, 7, 10);
    }
    flame(c, x + 118, 150, 26, 36, t, 2);
  } else if (w === 2) {
    for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t + i))})`; c.fillRect(x + hash(i) * 320, hash(i + 20) * h, 2, 2); }
    circle(c, x + 250, 150, 34, '#f0a35e'); c.strokeStyle = '#ffd59a'; c.lineWidth = 5; ellipse(c, x + 250, 150, 54, 10, null, -0.3); c.stroke();
    circle(c, x + 70, 170, 18, '#2e7bd6');
  } else if (w === 3) {
    c.fillStyle = '#9cc4e4'; c.beginPath(); c.moveTo(x + 120, 260); c.lineTo(x + 220, 120); c.lineTo(x + 330, 260); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 220, 120); c.lineTo(x + 192, 160); c.lineTo(x + 212, 152); c.lineTo(x + 224, 166); c.lineTo(x + 248, 156); c.fill();
    ellipse(c, x + 160, 530, 220, 80, '#fff');
    for (let i = 0; i < 24; i++) circle(c, x + hash(i) * 320, (hash(i + 7) * h + t * 25) % h, 2, 'rgba(255,255,255,0.9)');
  } else if (w === 4) {
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) { circle(c, x + hash(i) * 320, h - (hash(i + 5) * h + t * 30) % h, 2 + hash(i) * 3); c.stroke(); }
    ellipse(c, x + 240, 170, 18, 9, '#ff9800'); tri(c, x + 224, 170, x + 210, 160, x + 210, 180, '#f57c00'); circle(c, x + 248, 168, 2.4, '#222');
    c.strokeStyle = '#2e9e6b'; c.lineWidth = 7; c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const sx = x + 20 + i * 70; c.beginPath(); c.moveTo(sx, h); c.quadraticCurveTo(sx + Math.sin(t * 1.5 + i) * 16, h - 50, sx + Math.sin(t * 1.5 + i + 1) * 12, h - 95); c.stroke(); }
  } else if (w === 5) {
    c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 2;
    for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(x + k * 40, 0); c.lineTo(x + k * 40, h); c.stroke(); }
    for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(x, k * 40); c.lineTo(x + 320, k * 40); c.stroke(); }
    c.save(); c.translate(x + 240, 160); c.rotate(t * 0.6);
    c.fillStyle = '#718096'; for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.fillRect(-7, -36, 14, 16); c.restore(); }
    circle(c, 0, 0, 24, '#718096'); circle(c, 0, 0, 9, '#2a3352'); c.restore();
  } else if (w === 6) {
    const bx = x + 150, by2 = 250;
    c.fillStyle = '#b3a9c9'; c.fillRect(bx - 60, by2 - 70, 140, 70);
    for (const tx of [bx - 80, bx + 70]) { c.fillRect(tx, by2 - 120, 36, 120); tri(c, tx - 6, by2 - 120, tx + 18, by2 - 160, tx + 42, by2 - 120, '#7e57c2'); }
    c.fillStyle = '#6f6596'; c.beginPath(); c.arc(bx + 10, by2, 18, Math.PI, 0); c.fill();
    ellipse(c, x + 160, 530, 220, 70, '#6cbf45');
    c.fillStyle = '#e53935'; c.fillRect(bx + 87, by2 - 192, 2, 32); c.beginPath(); c.moveTo(bx + 89, by2 - 192); c.lineTo(bx + 108 + Math.sin(t * 4) * 3, by2 - 184); c.lineTo(bx + 89, by2 - 176); c.fill();
  } else if (w === 7) {
    c.strokeStyle = 'rgba(0,105,92,0.12)'; c.lineWidth = 2;
    for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(x + k * 40, 0); c.lineTo(x + k * 40, h); c.stroke(); }
    for (let k = 0; k < 3; k++) {
      const fx = x + 70 + k * 90, col = ['#ff4081', '#69f0ae', '#40c4ff'][k];
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(fx, 200, 26, 0, Math.PI * 2); c.fill(); c.fillRect(fx - 8, 146, 16, 34);
      c.fillStyle = col; c.beginPath(); c.arc(fx, 204, 22, 0, Math.PI); c.fill();
      for (let b = 0; b < 3; b++) { const bp = (t * 0.7 + b / 3 + k) % 1; circle(c, fx + Math.sin(bp * 8) * 5, 150 - bp * 60, 4 + bp * 3, col); }
    }
  } else {
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * Math.abs(Math.sin(t + i))})`; c.fillRect(x + hash(i) * 320, hash(i + 20) * 260, 2, 2); }
    for (let i = 0; i < 6; i++) { const bx = x + i * 54, bh = 70 + hash(i + 4) * 110; c.fillStyle = '#16224a'; c.fillRect(bx, 270 - bh, 48, bh + 400);
      c.fillStyle = 'rgba(255,224,130,0.8)'; for (let wy = 280 - bh; wy < 520; wy += 24) for (let wx = bx + 7; wx < bx + 42; wx += 14) if (hash(wx * 1.3 + wy) > 0.65) c.fillRect(wx, wy, 7, 10); }
    const on = Math.floor(t * 3) % 2;
    circle(c, x + 250, 120, 14, on ? '#e53935' : '#1e88e5'); circle(c, x + 250, 120, 26, on ? 'rgba(229,57,53,0.25)' : 'rgba(30,136,229,0.25)');
  }
  c.restore();
}

function drawMap(c, t, save, sel, tokenPos) {
  const page = Math.floor(sel / 9), pages = Math.ceil(LEVELS.length / 9);
  for (let col = 0; col < 3; col++) { const w = page * 3 + col; if (w < WORLDS.length) mapBand3(c, w, col * 320, t); }
  // Weltnamen
  c.textAlign = 'center';
  for (let col = 0; col < 3; col++) {
    const wi = page * 3 + col; if (wi >= WORLDS.length) continue;
    const w = WORLDS[wi], unlocked = Store.isUnlocked(save, wi * 3);
    c.font = 'bold 21px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif';
    const tw = c.measureText(w.name).width + 30;
    c.fillStyle = 'rgba(0,0,0,0.4)'; rr(c, col * 320 + 160 - tw / 2, 70, tw, 34, 17); c.fill();
    c.fillStyle = unlocked ? '#fff' : 'rgba(255,255,255,0.5)'; c.fillText(w.name, col * 320 + 160, 94);
  }
  const first = page * 9, last = Math.min(LEVELS.length, first + 9) - 1;
  // Weg
  c.setLineDash([2, 12]); c.lineCap = 'round'; c.lineWidth = 7;
  for (let i = first; i < last; i++) {
    const [x1, y1] = MAP_NODES[i], [x2, y2] = MAP_NODES[i + 1];
    c.strokeStyle = Store.isUnlocked(save, i + 1) ? '#fff8e1' : 'rgba(255,255,255,0.35)';
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 26, x2, y2); c.stroke();
  }
  c.setLineDash([]);
  // Knoten
  for (let i = first; i <= last; i++) {
    const [x, y] = MAP_NODES[i], L = LEVELS[i], rec = save && save.levels[L.id];
    const unlocked = Store.isUnlocked(save, i), theme = WORLDS[L.world].theme;
    ellipse(c, x, y + 26, 30, 8, 'rgba(0,0,0,0.3)');
    circle(c, x, y, 28, unlocked ? '#fff' : '#9e9e9e');
    circle(c, x, y, 23, unlocked ? (rec && rec.done ? '#ffb300' : WORLDS[L.world].color) : '#757575');
    if (i === sel) { c.strokeStyle = '#fff'; c.lineWidth = 4; circle(c, x, y, 34 + Math.sin(t * 5) * 2); c.stroke(); }
    c.fillStyle = '#fff'; c.textAlign = 'center';
    if (!unlocked) {
      c.fillStyle = '#eee'; rr(c, x - 9, y - 4, 18, 14, 3); c.fill();
      c.strokeStyle = '#eee'; c.lineWidth = 3.5; c.beginPath(); c.arc(x, y - 5, 6, Math.PI, 0); c.stroke();
    } else if (L.boss) { c.font = 'bold 15px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif'; c.fillText('BOSS', x, y + 6); }
    else { c.font = 'bold 18px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif'; c.fillText(L.id, x, y + 7); }
    if (unlocked) for (let k = 0; k < 3; k++) drawCollectIcon(c, theme, x - 22 + k * 22, y + 44, 0.6, t, !(rec && rec.stars[k]));
  }
  if (tokenPos && Math.floor(sel / 9) === page) drawNoah(c, tokenPos[0], tokenPos[1] - 26 - Math.abs(Math.sin(t * 4)) * 6, { outfit: save ? save.outfit : 'feuerwehr', power: 'helmet', facing: 1, t, scale: 1.1 });
  // Seitenwechsel
  for (const [ax, dir] of [[26, -1], [VW - 26, 1]]) {
    const np = page + dir; if (np < 0 || np >= pages) continue;
    const open = Store.isUnlocked(save, np * 9);
    circle(c, ax, 300, 24, open ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)');
    c.fillStyle = open ? '#e53935' : '#9e9e9e'; c.font = 'bold 24px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
    c.fillText(dir < 0 ? '◀' : '▶', ax + dir * 1, 308);
  }
  // Seitenpunkte
  for (let pi = 0; pi < pages; pi++) circle(c, VW / 2 - (pages - 1) * 12 + pi * 24, 474, 6, pi === page ? '#fff' : 'rgba(255,255,255,0.4)');
  // Infotafel
  const L = LEVELS[sel];
  c.fillStyle = 'rgba(0,0,0,0.55)'; rr(c, VW / 2 - 250, 488, 500, 58, 20); c.fill();
  c.fillStyle = '#ffd54f'; c.font = 'bold 17px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
  c.fillText(WORLDS[L.world].name + ' · Level ' + L.id, VW / 2, 510);
  c.fillStyle = '#fff'; c.font = 'bold 21px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", Arial, sans-serif';
  c.fillText(L.name, VW / 2, 535);
}
