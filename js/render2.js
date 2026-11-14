'use strict';
/* =========================================================
   Super Noah – Grafik für die Welten 4–6
   (Eis-Land, Tiefsee, Roboter-Station) und die Weltkarte
   ========================================================= */

Object.assign(THEMES, {
  ice:  { sky: ['#8fd3ff', '#eaf7ff'], dirt: '#5aa9dc', dirtDark: '#3f8cc4', top: '#ffffff', topDark: '#dff1fb', brick: '#8fd0f2', brickLine: '#3f8cc4' },
  sea:  { sky: ['#1976b8', '#08264d'], dirt: '#c9a66b', dirtDark: '#a8854e', top: '#e8cf96', topDark: '#c9a66b', brick: '#b5713c', brickLine: '#7a4a22' },
  robo: { sky: ['#10131f', '#252b45'], dirt: '#4a5568', dirtDark: '#2d3748', top: '#a0aec0', topDark: '#718096', brick: '#b7791f', brickLine: '#7b4f10' },
});

/* ---------------- Hintergründe ---------------- */
function bgIce(c, cam, t) {
  circle(c, 780, 90, 44, 'rgba(255,255,255,0.75)');
  const ms = 420, mo = cam * 0.15;
  for (let i = Math.floor(mo / ms) - 1; i < Math.floor(mo / ms) + 4; i++) {
    const x = i * ms - mo + hash(i) * 150, h = 200 + hash(i + 3) * 120;
    c.fillStyle = '#9cc4e4'; c.beginPath(); c.moveTo(x - 210, 445); c.lineTo(x, 445 - h); c.lineTo(x + 210, 445); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x, 445 - h); c.lineTo(x - 62, 445 - h * 0.7); c.lineTo(x - 26, 445 - h * 0.75);
    c.lineTo(x, 445 - h * 0.66); c.lineTo(x + 30, 445 - h * 0.76); c.lineTo(x + 62, 445 - h * 0.7); c.fill();
  }
  hills(c, cam, 0.3, 430, 28, '#d6ecfa', 0.004, 0.011);
  const ps = 220, po = cam * 0.5;
  for (let i = Math.floor(po / ps) - 1; i < Math.floor(po / ps) + 6; i++) {
    if (hash(i * 1.9) < 0.3) continue;
    const x = i * ps - po + hash(i) * 100, by = 476, h = 70 + hash(i + 2) * 50;
    c.fillStyle = '#6b4f33'; c.fillRect(x - 4, by - 14, 8, 14);
    for (let k = 0; k < 3; k++) {
      const w = 34 - k * 8, yy = by - 12 - k * h / 3.4;
      tri(c, x - w, yy, x, yy - h / 2.4, x + w, yy, '#2f6f5e');
      tri(c, x - w * 0.5, yy - h / 4.8, x, yy - h / 2.4, x + w * 0.5, yy - h / 4.8, '#fff');
    }
  }
  hills(c, cam, 0.5, 480, 14, '#eef8ff', 0.007, 0.019);
  for (let i = 0; i < 70; i++) {
    const sp = 30 + hash(i) * 50;
    const x = ((hash(i + 5) * VW - cam * 0.2 + Math.sin(t + i) * 20) % VW + VW) % VW;
    const y = (hash(i + 11) * VH + t * sp) % VH;
    circle(c, x, y, 1.5 + hash(i) * 2, 'rgba(255,255,255,0.85)');
  }
}

function bgSea(c, cam, t) {
  for (let i = 0; i < 6; i++) {
    const x = ((i * 220 - cam * 0.1 + Math.sin(t * 0.3 + i) * 30) % 1320 + 1320) % 1320 - 180;
    c.fillStyle = 'rgba(255,255,255,0.05)';
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 70, 0); c.lineTo(x - 60, VH); c.lineTo(x - 180, VH); c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.moveTo(0, 0);
  for (let x = 0; x <= VW; x += 20) c.lineTo(x, 8 + Math.sin((x + cam) * 0.03 + t * 2) * 4);
  c.lineTo(VW, 0); c.fill();
  hills(c, cam, 0.2, 430, 40, '#0c3a6b', 0.006, 0.015);
  for (let i = 0; i < 5; i++) {
    const x = ((hash(i) * 1400 + t * (20 + i * 6) - cam * 0.25) % 1400 + 1400) % 1400 - 200, y = 120 + hash(i + 2) * 250;
    ellipse(c, x, y, 16, 7, 'rgba(8,36,74,0.55)');
    tri(c, x - 14, y, x - 26, y - 8, x - 26, y + 8, 'rgba(8,36,74,0.55)');
  }
  const gs = 90, go = cam * 0.5;
  c.strokeStyle = '#145c4a'; c.lineWidth = 7; c.lineCap = 'round';
  for (let i = Math.floor(go / gs) - 1; i < Math.floor(go / gs) + 13; i++) {
    const x = i * gs - go + hash(i) * 40, h = 60 + hash(i + 1) * 90;
    c.beginPath(); c.moveTo(x, 505);
    c.quadraticCurveTo(x + Math.sin(t * 1.5 + i) * 25, 505 - h / 2, x + Math.sin(t * 1.5 + i + 1) * 18, 505 - h); c.stroke();
  }
  hills(c, cam, 0.5, 492, 12, '#0e4372', 0.008, 0.02);
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.5;
  for (let i = 0; i < 25; i++) {
    const x = ((hash(i) * VW * 1.5 - cam * 0.3) % VW + VW) % VW + Math.sin(t * 2 + i) * 6;
    const y = VH - ((t * (30 + hash(i + 4) * 40) + hash(i + 8) * VH) % VH);
    circle(c, x, y, 2 + hash(i) * 4); c.stroke();
  }
}

function bgRobo(c, cam, t) {
  const ps = 160, po = cam * 0.3;
  for (let i = Math.floor(po / ps) - 1; i < Math.floor(po / ps) + 8; i++) {
    const x = i * ps - po;
    c.fillStyle = i % 2 ? '#1c2236' : '#202842'; c.fillRect(x, 0, ps - 4, VH);
    if (((i % 3) + 3) % 3 === 0) {
      c.fillStyle = '#05060f'; rr(c, x + 25, 110, ps - 54, 160, 30); c.fill();
      for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t + k + i))})`; c.fillRect(x + 35 + hash(i * 9 + k) * (ps - 80), 125 + hash(i * 5 + k + 3) * 130, 2, 2); }
      if (hash(i) > 0.45) { circle(c, x + ps / 2, 200, 26, '#2e7bd6'); ellipse(c, x + ps / 2 - 6, 194, 10, 7, '#4caf50'); }
      c.strokeStyle = '#4a5568'; c.lineWidth = 6; rr(c, x + 25, 110, ps - 54, 160, 30); c.stroke();
    } else {
      c.fillStyle = 'rgba(255,255,255,0.04)'; c.fillRect(x + 14, 70, ps - 32, 6); c.fillRect(x + 14, 400, ps - 32, 6);
      circle(c, x + ps / 2, 330, 5, (Math.floor(t * 2) + i) % 3 === 0 ? '#ff5252' : '#3d4a66');
      circle(c, x + ps / 2 + 16, 330, 5, (Math.floor(t * 2) + i) % 3 === 1 ? '#69f0ae' : '#3d4a66');
    }
  }
  const o2 = (cam * 0.6) % 120;
  c.fillStyle = '#2d3748'; c.fillRect(0, 18, VW, 16);
  c.fillStyle = '#4a5568'; c.fillRect(0, 18, VW, 4);
  for (let x = -o2; x < VW; x += 120) c.fillRect(x, 13, 10, 26);
}

/* ---------------- Boden, Plattformen, Laufbänder ---------------- */
function drawGroundExtra(c, lvl, th, tx, ty, x, y, topOpen) {
  const theme = lvl.theme, h1 = hash(tx * 5 + ty * 9);
  if (theme === 'ice') {
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x + 6 + h1 * 10, y + 30); c.lineTo(x + 18 + h1 * 10, y + 12);
    if (h1 > 0.6) { c.moveTo(x + 24, y + 34); c.lineTo(x + 32, y + 22); }
    c.stroke();
    if (topOpen) {
      c.fillStyle = '#fff'; c.fillRect(x, y, T + 0.5, 11);
      for (let i = 0; i < 4; i++) circle(c, x + 5 + i * 10, y + 11, 5, '#fff');
      c.fillStyle = '#e3f4fd'; c.fillRect(x, y + 7, T + 0.5, 2);
    }
  } else if (theme === 'sea') {
    c.fillStyle = th.dirtDark;
    circle(c, x + 8 + h1 * 22, y + 12 + hash(tx + ty * 5) * 18, 2.5 + h1 * 2); c.fill();
    if (h1 > 0.5) { circle(c, x + 30, y + 30, 2); c.fill(); }
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x, y, T + 0.5, 9);
      c.fillStyle = th.topDark; for (let i = 0; i < 4; i++) { circle(c, x + 5 + i * 10, y + 9, 4); c.fill(); }
      const d = hash(tx * 3.3);
      if (d > 0.78) {
        c.strokeStyle = '#2e9e6b'; c.lineWidth = 3; c.lineCap = 'round';
        for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + 20 + k * 5, y); c.quadraticCurveTo(x + 20 + k * 9, y - 8, x + 20 + k * 6, y - 15 - (k === 0 ? 5 : 0)); c.stroke(); }
      } else if (d > 0.66) star5(c, x + 20, y - 3, 7, 3, d * 6, '#ff8a80');
    }
  } else {
    c.strokeStyle = th.dirtDark; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, T - 2, T - 2);
    c.fillStyle = th.dirtDark;
    [[6, 6], [T - 6, 6], [6, T - 6], [T - 6, T - 6]].forEach(([a, b]) => { circle(c, x + a, y + b, 1.8); c.fill(); });
    if (h1 > 0.7) { c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x + 9, y + 16, 22, 8); }
    if (topOpen) {
      c.fillStyle = th.top; c.fillRect(x - 0.5, y, T + 1, 7);
      c.fillStyle = th.topDark; c.fillRect(x - 0.5, y + 6, T + 1, 3);
      c.fillStyle = '#f6c343'; c.fillRect(x + 6, y + 2, 10, 3); c.fillRect(x + 26, y + 2, 10, 3);
    }
  }
}

function drawPlatExtra(c, theme, x, y, w, t) {
  if (theme === 'ice') {
    c.fillStyle = 'rgba(140,210,245,0.9)'; rr(c, x, y + 2, w, 14, 5); c.fill();
    c.fillStyle = '#fff'; rr(c, x, y, w, 7, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 8; k < w; k += 22) c.fillRect(x + k, y + 9, 8, 2);
  } else if (theme === 'sea') {
    c.fillStyle = '#7a4a22'; rr(c, x, y + 2, w, 13, 4); c.fill();
    c.fillStyle = '#9b6a3a'; rr(c, x, y + 2, w, 5, 3); c.fill();
    c.fillStyle = '#2e9e6b'; for (let k = 6; k < w; k += 18) { circle(c, x + k, y + 3, 3); c.fill(); }
  } else {
    const glow = 0.5 + 0.5 * Math.sin(t * 4 + x * 0.01);
    c.fillStyle = `rgba(255,170,60,${0.25 + glow * 0.3})`; c.fillRect(x + 4, y + 14, w - 8, 6);
    c.fillStyle = '#718096'; rr(c, x, y + 1, w, 13, 4); c.fill();
    c.fillStyle = '#f6c343'; for (let k = 4; k < w - 6; k += 16) c.fillRect(x + k, y + 3, 8, 3);
  }
}

function drawConveyor(c, x, y, t, dir) {
  c.fillStyle = '#2d3748'; c.fillRect(x, y, T + 0.5, T);
  c.fillStyle = '#1a202c'; rr(c, x - 0.5, y, T + 1, 14, 3); c.fill();
  const off = ((t * 110 * dir) % 20 + 20) % 20;
  c.fillStyle = '#f6c343';
  c.save(); c.beginPath(); c.rect(x, y, T, 14); c.clip();
  for (let k = -20; k < T + 20; k += 20) {
    const px = x + k + off;
    c.beginPath();
    if (dir > 0) { c.moveTo(px, y + 3); c.lineTo(px + 7, y + 7); c.lineTo(px, y + 11); }
    else { c.moveTo(px + 7, y + 3); c.lineTo(px, y + 7); c.lineTo(px + 7, y + 11); }
    c.fill();
  }
  c.restore();
  circle(c, x + 10, y + 24, 6, '#4a5568'); circle(c, x + 30, y + 24, 6, '#4a5568');
  circle(c, x + 10, y + 24, 2, '#a0aec0'); circle(c, x + 30, y + 24, 2, '#a0aec0');
}

/* ---------------- Gegner ---------------- */
function drawWalkerExtra(c, e, theme, t, step) {
  if (theme === 'ice') {
    ellipse(c, -5 + step * 2, -1, 4.5, 2.5, '#5fb0dc'); ellipse(c, 5 - step * 2, -1, 4.5, 2.5, '#5fb0dc');
    c.strokeStyle = '#6b4f33'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, -12); c.lineTo(-15, -18 + step * 2); c.moveTo(8, -12); c.lineTo(15, -17 - step * 2); c.stroke();
    circle(c, 0, -10, 10, '#fff'); circle(c, -2, -11, 6, '#eef8ff');
    circle(c, 1, -23, 8, '#fff');
    eye(c, 0, -24, 2.4, 1, true); eye(c, 6, -24, 2.4, 1, true);
    tri(c, 7, -22, 15, -20, 7, -18.5, '#ff9800');
  } else if (theme === 'sea') {
    c.strokeStyle = '#b3261e'; c.lineWidth = 2.5; c.lineCap = 'round';
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(s * 8, -6); c.lineTo(s * (15 + k * 2), -1 - k * 2 + step * s * 2 * (k % 2 ? 1 : -1)); c.stroke(); }
    c.beginPath(); c.moveTo(-10, -12); c.lineTo(-15, -20 + step); c.moveTo(10, -12); c.lineTo(15, -20 - step); c.stroke();
    circle(c, -16, -22 + step, 5, '#e53935'); circle(c, 16, -22 - step, 5, '#e53935');
    tri(c, -16, -22 + step, -21, -28 + step, -13, -27 + step, '#7a1010'); tri(c, 16, -22 - step, 21, -28 - step, 13, -27 - step, '#7a1010');
    ellipse(c, 0, -9, 14, 9, '#e53935'); ellipse(c, 0, -7, 9, 5, '#ff7961');
    eye(c, -5, -17, 3, 0, true); eye(c, 5, -17, 3, 0, true);
  } else {
    circle(c, 0, -6, 6, '#1a202c'); circle(c, 0, -6, 2.5, '#a0aec0');
    c.fillStyle = '#4a5568'; c.fillRect(-15, -20 + step, 4, 9); c.fillRect(11, -20 - step, 4, 9);
    c.fillStyle = '#a0aec0'; rr(c, -12, -27, 24, 18, 4); c.fill();
    c.fillStyle = '#1a202c'; rr(c, -8, -23, 18, 7, 3); c.fill();
    circle(c, 4 + Math.sin(t * 3) * 3, -19.5, 2.4, '#ff5252');
    c.strokeStyle = '#718096'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -27); c.lineTo(0, -33); c.stroke();
    circle(c, 0, -34, 2.5, Math.floor(t * 4) % 2 ? '#ffeb3b' : '#f6ad55');
  }
}

function drawSpikyExtra(c, e, theme, t, step, f) {
  if (theme === 'ice') {
    for (let i = 0; i < 6; i++) { const a = Math.PI * (1.1 + i * 0.16); tri(c, Math.cos(a - 0.13) * 11, -11 + Math.sin(a - 0.13) * 9, Math.cos(a) * 24, -11 + Math.sin(a) * 22, Math.cos(a + 0.13) * 11, -11 + Math.sin(a + 0.13) * 9, '#e0f7ff'); }
    c.fillStyle = '#4e9cc7'; c.fillRect(-10 + step * 2, -5, 5, 5); c.fillRect(5 - step * 2, -5, 5, 5);
    ellipse(c, 0, -11, 15, 10, '#7fc8ee'); ellipse(c, 13, -8, 6, 5, '#bfe6f8');
    eye(c, 13, -10, 2.2, 1, true); circle(c, 18, -7, 1.5, '#333');
  } else if (theme === 'sea') {
    c.strokeStyle = '#2a1540'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.02 + i * 0.12); c.beginPath(); c.moveTo(Math.cos(a) * 10, -4 + Math.sin(a) * 10); c.lineTo(Math.cos(a) * 24, -4 + Math.sin(a) * 24); c.stroke(); }
    c.fillStyle = '#4a2a6b'; c.beginPath(); c.arc(0, -2, 14, Math.PI, 0); c.fill(); c.fillRect(-14, -3, 28, 3);
    eye(c, -4, -8, 2.6, 1, true); eye(c, 5, -8, 2.6, 1, true);
  } else {
    c.save(); c.translate(0, -22); c.rotate(t * 10 * f);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; tri(c, Math.cos(a - 0.2) * 8, Math.sin(a - 0.2) * 8, Math.cos(a) * 14, Math.sin(a) * 14, Math.cos(a + 0.2) * 8, Math.sin(a + 0.2) * 8, '#e2e8f0'); }
    circle(c, 0, 0, 9, '#cbd5e0'); circle(c, 0, 0, 3, '#4a5568');
    c.restore();
    circle(c, -8, -4, 4, '#1a202c'); circle(c, 8, -4, 4, '#1a202c');
    c.fillStyle = '#c53030'; rr(c, -14, -17, 28, 13, 4); c.fill();
    c.fillStyle = '#1a202c'; rr(c, -2, -14, 13, 6, 2); c.fill();
    circle(c, 7, -11, 2, '#ffeb3b');
  }
}

function drawFlyerExtra(c, e, theme, t, flap) {
  if (theme === 'ice') {
    c.fillStyle = '#dbeeff';
    c.beginPath(); c.moveTo(-5, -2); c.lineTo(-25, -4 - flap * 13); c.lineTo(-8, 8); c.fill();
    c.beginPath(); c.moveTo(5, -2); c.lineTo(25, -4 - flap * 13); c.lineTo(8, 8); c.fill();
    ellipse(c, 0, 2, 10, 11, '#fff');
    circle(c, -4, -2, 4.2, '#ffd54f'); circle(c, 4, -2, 4.2, '#ffd54f');
    circle(c, -3.5, -2, 2, '#222'); circle(c, 4.5, -2, 2, '#222');
    tri(c, -2, 2, 2, 2, 0, 6, '#ff9800');
    c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, -7); c.lineTo(-1, -5); c.moveTo(8, -7); c.lineTo(1, -5); c.stroke();
  } else if (theme === 'sea') {
    tri(c, -12, 0, -25, -9 + flap * 3, -25, 9 + flap * 3, '#f57c00');
    tri(c, -4, -8, 4, -15, 6, -7, '#f57c00');
    ellipse(c, 0, 0, 15, 9, '#ff9800');
    c.fillStyle = '#fff'; c.fillRect(-3, -8, 4, 16);
    eye(c, 8, -2, 3, 1, true);
  } else {
    c.strokeStyle = '#718096'; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, -2); c.lineTo(-17, -8); c.moveTo(8, -2); c.lineTo(17, -8); c.stroke();
    const r = 4 + Math.abs(Math.sin(t * 30 + e.sx)) * 9;
    ellipse(c, -17, -10, r, 2, 'rgba(200,230,255,0.75)'); ellipse(c, 17, -10, r, 2, 'rgba(200,230,255,0.75)');
    c.fillStyle = '#4a5568'; rr(c, -11, -5, 22, 12, 5); c.fill();
    circle(c, 4, 1, 3.5, '#1a202c'); circle(c, 4, 1, 2, '#ff5252');
    c.fillStyle = Math.floor(t * 5) % 2 ? '#69f0ae' : '#2d3748'; c.fillRect(-8, -2, 4, 3);
  }
}

function drawJelly(c, e, t) {
  const cx = e.x + e.w / 2, y = e.y, p = Math.sin(t * 3 + e.sx);
  c.strokeStyle = 'rgba(255,128,200,0.75)'; c.lineWidth = 3; c.lineCap = 'round';
  for (let k = -1.5; k <= 1.5; k++) {
    c.beginPath(); c.moveTo(cx + k * 7, y + 16);
    c.quadraticCurveTo(cx + k * 7 + Math.sin(t * 4 + k) * 5, y + 28, cx + k * 8 + Math.sin(t * 4 + k + 1) * 4, y + 38 + p * 2); c.stroke();
  }
  c.fillStyle = 'rgba(255,128,200,0.9)'; c.beginPath(); c.ellipse(cx, y + 17, 17 + p, 16 - p, 0, Math.PI, 0); c.fill();
  c.fillStyle = 'rgba(255,220,240,0.7)'; ellipse(c, cx - 5, y + 8, 5, 3, null, -0.4); c.fill();
  circle(c, cx - 5, y + 12, 2, '#5a1040'); circle(c, cx + 5, y + 12, 2, '#5a1040');
}

function drawUrchin(c, e, theme, t) {
  const cx = e.x + e.w / 2, by = e.y + e.h;
  if (theme === 'ice') {
    for (let k = -1; k <= 1; k++) {
      const h = k === 0 ? 30 : 22;
      tri(c, cx + k * 11 - 7, by, cx + k * 11, by - h, cx + k * 11 + 7, by, '#9fd8f5');
      tri(c, cx + k * 11 - 2, by, cx + k * 11, by - h, cx + k * 11 + 2, by, '#e8f8ff');
    }
  } else if (theme === 'robo') {
    c.strokeStyle = '#718096'; c.lineWidth = 4;
    for (let i = 0; i < 6; i++) { const a = Math.PI * (1 + i / 5); c.beginPath(); c.moveTo(cx, by - 12); c.lineTo(cx + Math.cos(a) * 17, by - 12 + Math.sin(a) * 17); c.stroke(); }
    circle(c, cx, by - 12, 12, '#4a5568'); circle(c, cx, by - 12, 5, Math.floor(t * 4) % 2 ? '#ff5252' : '#7a1c1c');
    if (Math.floor(t * 6) % 3 === 0) { c.strokeStyle = '#ffeb3b'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 14, by - 26); c.lineTo(cx - 9, by - 21); c.lineTo(cx - 13, by - 18); c.moveTo(cx + 14, by - 27); c.lineTo(cx + 10, by - 22); c.lineTo(cx + 15, by - 19); c.stroke(); }
  } else {
    c.strokeStyle = '#1c0d2e'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 11; i++) { const a = Math.PI * (0.95 + i * 0.11); c.beginPath(); c.moveTo(cx, by - 9); c.lineTo(cx + Math.cos(a) * 19, by - 9 + Math.sin(a) * 21); c.stroke(); }
    c.fillStyle = '#2a1540'; c.beginPath(); c.arc(cx, by - 2, 11, Math.PI, 0); c.fill();
    circle(c, cx - 4, by - 7, 1.8, '#fff'); circle(c, cx + 4, by - 7, 1.8, '#fff');
  }
}

function drawLaser(c, e, t) {
  const cx = e.x + e.w / 2;
  c.fillStyle = '#4a5568'; rr(c, cx - 11, e.y - 4, 22, 12, 3); c.fill(); rr(c, cx - 11, e.y + e.h - 8, 22, 12, 3); c.fill();
  circle(c, cx, e.y + 3, 3, e.on ? '#ff5252' : (e.warn ? '#ffb74d' : '#2d3748'));
  circle(c, cx, e.y + e.h - 3, 3, e.on ? '#ff5252' : (e.warn ? '#ffb74d' : '#2d3748'));
  if (e.on) {
    c.fillStyle = 'rgba(255,60,60,0.3)'; c.fillRect(cx - 8, e.y + 8, 16, e.h - 16);
    c.fillStyle = '#ff5252'; c.fillRect(cx - 3.5, e.y + 8, 7, e.h - 16);
    c.fillStyle = '#ffd6d6'; c.fillRect(cx - 1 + Math.sin(t * 40) * 0.8, e.y + 8, 2, e.h - 16);
  } else if (e.warn && Math.floor(t * 12) % 2) {
    c.fillStyle = 'rgba(255,160,60,0.6)'; c.fillRect(cx - 1, e.y + 8, 2, e.h - 16);
  }
}

function drawIceFish(c, cx, cy, vy) {
  c.save(); c.translate(cx, cy); c.rotate(vy < 0 ? -Math.PI / 2 : Math.PI / 2);
  tri(c, -10, 0, -20, -8, -20, 8, '#1976d2');
  ellipse(c, 0, 0, 14, 8, '#42a5f5'); ellipse(c, 2, 3, 8, 3, '#bbdefb');
  eye(c, 7, -2, 2.6, 1, true);
  c.restore();
}

function drawIcicle(c, cx, cy) {
  tri(c, cx - 10, cy - 18, cx + 10, cy - 18, cx, cy + 20, '#9fd8f5');
  tri(c, cx - 4, cy - 18, cx + 1, cy - 18, cx - 1, cy + 8, '#f1fbff');
}

/* ---------------- Schätze ---------------- */
function drawCollectExtra(c, theme, t, empty) {
  if (theme === 'ice') {
    ellipse(c, 0, 2, 10, 13, empty ? '#666' : '#263238');
    if (!empty) {
      ellipse(c, 0, 5, 6.5, 9, '#fff');
      circle(c, -3.5, -5, 2.4, '#fff'); circle(c, 3.5, -5, 2.4, '#fff'); circle(c, -3.2, -5, 1.2, '#111'); circle(c, 3.8, -5, 1.2, '#111');
      tri(c, -3, -2, 3, -2, 0, 2.5, '#ff9800');
      ellipse(c, -5, 15, 4, 2, '#ff9800'); ellipse(c, 5, 15, 4, 2, '#ff9800');
      ellipse(c, -11, 3 + Math.sin((t || 0) * 6) * 2, 3, 6, '#263238', 0.4); ellipse(c, 11, 3 - Math.sin((t || 0) * 6) * 2, 3, 6, '#263238', -0.4);
    }
  } else if (theme === 'sea') {
    c.fillStyle = empty ? '#666' : '#f48fb1'; c.beginPath(); c.ellipse(0, 4, 15, 10, 0, 0, Math.PI); c.fill();
    c.beginPath(); c.ellipse(0, 2, 15, 13, 0, Math.PI, 0); c.fill();
    if (!empty) {
      c.strokeStyle = '#d81b60'; c.lineWidth = 1.5;
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(0, 2); c.lineTo(k * 6, -9 + Math.abs(k) * 2); c.stroke(); }
      c.fillStyle = '#fce4ec'; c.beginPath(); c.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2); c.fill();
      circle(c, 0, 3, 5, '#fff'); circle(c, -1.5, 1.5, 1.6, '#e1f5fe');
    }
  } else {
    c.save(); c.rotate((t || 0) * 1.5);
    c.fillStyle = empty ? '#666' : '#ffc107';
    for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.fillRect(-3.5, -16, 7, 8); c.restore(); }
    circle(c, 0, 0, 11, empty ? '#666' : '#ffc107');
    if (!empty) { circle(c, 0, 0, 8, '#ffe082'); circle(c, 0, 0, 3.5, '#a67c00'); }
    c.restore();
  }
}

/* ---------------- Ziele ---------------- */
function drawGoalExtra(c, e, theme, t, anim, cx, by) {
  const dx = anim > 1 ? (anim - 1) * (anim - 1) * 260 : 0;
  if (theme === 'ice') {
    const x = cx - 80 + dx, run = anim > 1 ? Math.sin(t * 18) : 0;
    // Husky
    const hx = x + 120;
    c.strokeStyle = '#6b4f33'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 78, by - 22); c.lineTo(hx - 14, by - 24); c.stroke();
    c.fillStyle = '#78909c'; c.fillRect(hx - 14 + run * 4, by - 16, 5, 16); c.fillRect(hx + 10 - run * 4, by - 16, 5, 16);
    c.beginPath(); c.moveTo(hx - 18, by - 28); c.quadraticCurveTo(hx - 30, by - 44, hx - 22, by - 46); c.lineWidth = 6; c.strokeStyle = '#90a4ae'; c.stroke();
    ellipse(c, hx, by - 24, 20, 11, '#90a4ae'); ellipse(c, hx + 2, by - 20, 13, 6, '#eceff1');
    circle(c, hx + 20, by - 34, 10, '#90a4ae'); ellipse(c, hx + 24, by - 31, 6, 5, '#eceff1');
    tri(c, hx + 13, by - 41, hx + 15, by - 50, hx + 20, by - 43, '#78909c'); tri(c, hx + 21, by - 43, hx + 26, by - 50, hx + 27, by - 40, '#78909c');
    circle(c, hx + 22, by - 36, 1.8, '#1565c0'); circle(c, hx + 29, by - 31, 2, '#222');
    // Schlitten
    c.strokeStyle = '#8d6e47'; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, by - 3); c.lineTo(x + 78, by - 3); c.quadraticCurveTo(x + 94, by - 4, x + 92, by - 20); c.stroke();
    c.fillStyle = '#c62828'; rr(c, x + 4, by - 26, 70, 14, 5); c.fill();
    c.fillStyle = '#8d6e47'; c.fillRect(x + 12, by - 13, 5, 9); c.fillRect(x + 58, by - 13, 5, 9);
    c.fillStyle = '#c62828'; rr(c, x + 2, by - 50, 8, 26, 3); c.fill();
    if (anim > 0.4) { circle(c, x + 36, by - 40, 9, '#ffd3ad'); c.fillStyle = '#e3261f'; c.beginPath(); c.arc(x + 36, by - 43, 9.5, Math.PI, 0); c.fill(); c.fillStyle = '#25358a'; rr(c, x + 27, by - 32, 18, 8, 3); c.fill(); }
  } else {
    const x = cx + 10 + dx, y = by - 50 - dx * 0.25;
    for (let i = 0; i < 4; i++) { const pt = (t * 0.8 + i / 4) % 1; c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - pt)})`; c.lineWidth = 2; circle(c, x - 85 - pt * 40, y - pt * 50 + Math.sin(pt * 8 + i) * 6, 4 + pt * 6); c.stroke(); }
    c.save(); c.translate(x - 78, y); c.rotate(t * (anim > 1 ? 20 : 3)); c.fillStyle = '#9e9e9e'; c.fillRect(-3, -16, 6, 32); c.fillRect(-16, -3, 32, 6); c.restore();
    c.fillStyle = '#f9a825'; rr(c, x - 22, y - 62, 40, 34, 10); c.fill();
    c.fillStyle = '#9e9e9e'; c.fillRect(x - 2, y - 84, 6, 24); c.fillRect(x - 2, y - 86, 18, 6);
    ellipse(c, x, y, 76, 36, '#fdd835');
    c.fillStyle = '#f9a825'; c.beginPath(); c.ellipse(x, y + 4, 76, 32, 0, 0, Math.PI); c.fill();
    for (let k = -1; k <= 1; k++) { circle(c, x + k * 36, y - 4, 13, '#607d8b'); circle(c, x + k * 36, y - 4, 9.5, '#81d4fa'); }
    if (anim > 0.4) { circle(c, x + 36, y - 2, 6.5, '#ffd3ad'); c.fillStyle = '#e3261f'; c.beginPath(); c.arc(x + 36, y - 4, 7, Math.PI, 0); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(c, x - 30, y - 22, 16, 5, null, -0.2); c.fill();
  }
}

/* ---------------- Bosse ---------------- */
function drawBossExtra(c, e, t, flash, cx, by) {
  if (e.kind === 'ice') {
    c.translate(cx, by); c.scale(e.face, 1);
    const step = Math.sin(t * 6), fur = flash ? '#ffd6d6' : '#ffffff', shade = flash ? '#ffc0c0' : '#dcefff';
    c.fillStyle = shade; rr(c, -30 + step * 5, -34, 22, 34, 9); c.fill(); rr(c, 8 - step * 5, -34, 22, 34, 9); c.fill();
    ellipse(c, -40, -52 + step * 4, 13, 26, shade, 0.3);
    ellipse(c, 0, -58, 44, 48, fur);
    for (let i = 0; i < 7; i++) tri(c, -40 + i * 12, -22, -34 + i * 12, -8, -28 + i * 12, -22, fur);
    ellipse(c, 10, -76, 24, 20, '#bfe6f8');
    eye(c, 2, -80, 5.5, 1, true); eye(c, 19, -80, 5.5, 1, true);
    c.fillStyle = '#37474f'; rr(c, 0, -70, 24, 10, 4); c.fill();
    for (let i = 0; i < 3; i++) tri(c, 3 + i * 7, -70, 6.5 + i * 7, -64, 10 + i * 7, -70, '#fff');
    ellipse(c, 42, -56 - step * 4, 13, 26, fur, -0.3);
    if (e.timer < 0.5) circle(c, 50, -84, 11, '#fff');
  } else if (e.kind === 'sea') {
    c.translate(cx, e.y + 44);
    const col = flash ? '#fff' : '#ab47bc', dark = flash ? '#eee' : '#8e24aa';
    c.strokeStyle = dark; c.lineWidth = 13; c.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      const sx = -42 + k * 17, w = Math.sin(t * 3 + k * 1.3);
      c.beginPath(); c.moveTo(sx, 20); c.quadraticCurveTo(sx + w * 16, 48, sx + (k - 2.5) * 6 + Math.sin(t * 3 + k * 1.3 + 1) * 12, 72); c.stroke();
    }
    ellipse(c, 0, 0, 58, 46, col);
    circle(c, -30, -22, 6, dark); circle(c, 26, -28, 5, dark); circle(c, 4, -34, 4, dark);
    eye(c, -18, 6, 11, e.face, true); eye(c, 18, 6, 11, e.face, true);
    ellipse(c, 0, 28, 8, 5, '#4a148c');
  } else {
    c.translate(cx, by); c.scale(e.face, 1);
    const step = e.onGround ? Math.sin(t * 7) : 0.5, body = flash ? '#fff' : '#718096', light = flash ? '#fff' : '#a0aec0';
    c.fillStyle = '#4a5568'; rr(c, -30 + step * 7, -36, 22, 36, 5); c.fill(); rr(c, 8 - step * 7, -36, 22, 36, 5); c.fill();
    c.fillStyle = '#2d3748'; rr(c, -34 + step * 7, -8, 30, 8, 3); c.fill(); rr(c, 4 - step * 7, -8, 30, 8, 3); c.fill();
    c.fillStyle = '#4a5568'; rr(c, -52, -84, 16, 40, 6); c.fill();
    c.fillStyle = body; rr(c, -40, -92, 80, 58, 9); c.fill();
    c.fillStyle = '#2d3748'; rr(c, -26, -80, 52, 30, 5); c.fill();
    for (let i = 0; i < 3; i++) circle(c, -14 + i * 14, -65, 5, (Math.floor(t * 5) + i) % 3 === 0 ? '#69f0ae' : (i === 1 ? '#ffeb3b' : '#ff5252'));
    c.fillStyle = light; rr(c, -27, -124, 54, 34, 8); c.fill();
    c.fillStyle = '#1a202c'; rr(c, -18, -116, 42, 14, 6); c.fill();
    circle(c, 8 + Math.sin(t * 4) * 9, -109, 5, '#ff5252'); circle(c, 8 + Math.sin(t * 4) * 9, -109, 2, '#ffd6d6');
    c.strokeStyle = light; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -124); c.lineTo(-14, -136); c.stroke();
    circle(c, -14, -138, 4, Math.floor(t * 6) % 2 ? '#ff5252' : '#7a1c1c');
    c.fillStyle = '#4a5568'; rr(c, 30, -76, 34, 18, 6); c.fill();
    circle(c, 64, -67, 7, e.timer < 0.5 ? '#ffeb3b' : '#1a202c');
  }
}

/* ---------------- Weltkarte (6 Welten in zwei Reihen) ---------------- */

const MAP_NODES_OLD = (() => {
  const n = [];
  for (let w = 0; w < 6; w++) {
    const row = Math.floor(w / 3), col = row === 0 ? w : 5 - w;
    const x0 = col * 320, yb = row === 0 ? 205 : 418;
    const xs = row === 0 ? [72, 160, 250] : [250, 160, 72];
    xs.forEach((x, i) => n.push([x0 + x, yb - (i === 1 ? 62 : 0)]));
  }
  return n;
})();

function mapBand(c, w, t) {
  const row = Math.floor(w / 3), col = row === 0 ? w : 5 - w;
  const x = col * 320, y = row * MAP_ROW_H, h = row === 0 ? MAP_ROW_H : VH - MAP_ROW_H;
  const grads = [['#a5e07a', '#5fae3e'], ['#ffcf8a', '#e8814c'], ['#3a2a78', '#120b33'], ['#cfeeff', '#8fc9ee'], ['#1976b8', '#0b2f5e'], ['#2a3352', '#141a2c']];
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, grads[w][0]); g.addColorStop(1, grads[w][1]);
  c.fillStyle = g; c.fillRect(x, y, 321, h + 1);
  c.save(); c.beginPath(); c.rect(x, y, 320, h); c.clip();
  if (w === 0) {
    c.fillStyle = '#7d6a8c'; c.beginPath(); c.moveTo(x + 170, y + 150); c.lineTo(x + 240, y + 62); c.lineTo(x + 268, y + 62); c.lineTo(x + 330, y + 150); c.fill();
    tri(c, x + 240, y + 62, x + 268, y + 62, x + 252, y + 84, '#ff7043');
    for (let k = 0; k < 3; k++) { const pt = (t * 0.3 + k / 3) % 1; circle(c, x + 254 + Math.sin(pt * 5) * 8, y + 56 - pt * 40, 6 + pt * 12, `rgba(110,100,110,${0.5 * (1 - pt)})`); }
    ellipse(c, x + 160, y + 250, 190, 40, '#4c9a2f');
  } else if (w === 1) {
    for (let i = 0; i < 7; i++) {
      const bx = x + 8 + i * 44, bh = 50 + hash(i + 3) * 70;
      c.fillStyle = '#9b4f5a'; c.fillRect(bx, y + 150 - bh, 38, bh + 100);
      c.fillStyle = 'rgba(255,230,140,0.8)';
      for (let wy = y + 158 - bh; wy < y + 140; wy += 18) for (let wx = bx + 6; wx < bx + 32; wx += 14) if (hash(wx + wy) > 0.45) c.fillRect(wx, wy, 7, 9);
    }
    flame(c, x + 118, y + 92, 22, 30, t, 2);
  } else if (w === 2) {
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t + i))})`; c.fillRect(x + hash(i) * 320, y + hash(i + 20) * h, 2, 2); }
    circle(c, x + 262, y + 96, 26, '#f0a35e'); c.strokeStyle = '#ffd59a'; c.lineWidth = 4; ellipse(c, x + 262, y + 96, 42, 8, null, -0.3); c.stroke();
    circle(c, x + 70, y + 110, 14, '#2e7bd6');
  } else if (w === 3) {
    c.fillStyle = '#9cc4e4'; c.beginPath(); c.moveTo(x + 150, y + 150); c.lineTo(x + 235, y + 48); c.lineTo(x + 330, y + 150); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 235, y + 48); c.lineTo(x + 210, y + 78); c.lineTo(x + 228, y + 72); c.lineTo(x + 240, y + 84); c.lineTo(x + 262, y + 77); c.fill();
    ellipse(c, x + 160, y + 250, 200, 46, '#fff');
    for (let i = 0; i < 16; i++) circle(c, x + hash(i) * 320, y + (hash(i + 7) * h + t * 25) % h, 2, 'rgba(255,255,255,0.9)');
  } else if (w === 4) {
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) { circle(c, x + hash(i) * 320, y + h - (hash(i + 5) * h + t * 30) % h, 2 + hash(i) * 3); c.stroke(); }
    ellipse(c, x + 250, y + 90, 16, 8, '#ff9800'); tri(c, x + 236, y + 90, x + 224, y + 82, x + 224, y + 98, '#f57c00'); circle(c, x + 257, y + 88, 2, '#222');
    c.strokeStyle = '#2e9e6b'; c.lineWidth = 6; c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const sx = x + 20 + i * 70; c.beginPath(); c.moveTo(sx, y + h); c.quadraticCurveTo(sx + Math.sin(t * 1.5 + i) * 14, y + h - 30, sx + Math.sin(t * 1.5 + i + 1) * 10, y + h - 55); c.stroke(); }
  } else {
    c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 2;
    for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(x + k * 40, y); c.lineTo(x + k * 40, y + h); c.stroke(); }
    for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(x, y + k * 40); c.lineTo(x + 320, y + k * 40); c.stroke(); }
    c.save(); c.translate(x + 256, y + 92); c.rotate(t * 0.6);
    c.fillStyle = '#718096'; for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.fillRect(-6, -30, 12, 14); c.restore(); }
    circle(c, 0, 0, 20, '#718096'); circle(c, 0, 0, 8, '#2a3352'); c.restore();
    circle(c, x + 60, y + 100, 5, Math.floor(t * 3) % 2 ? '#ff5252' : '#69f0ae');
  }
  c.restore();
}

function drawMapOld(c, t, save, sel, tokenPos) {
  for (let w = 0; w < 6; w++) mapBand(c, w, t);
  // Weltnamen
  c.textAlign = 'center';
  WORLDS.forEach((w, i) => {
    const row = Math.floor(i / 3), col = row === 0 ? i : 5 - i;
    const unlocked = Store.isUnlocked(save, i * 3);
    const lx = col * 320 + 16, ly = row === 0 ? 58 : MAP_ROW_H + 10;
    c.font = 'bold 19px "Arial Rounded MT Bold", Arial, sans-serif';
    const tw = c.measureText(w.name).width + 28;
    c.fillStyle = 'rgba(0,0,0,0.4)'; rr(c, lx, ly, tw, 30, 15); c.fill();
    c.fillStyle = unlocked ? '#fff' : 'rgba(255,255,255,0.5)';
    c.fillText(w.name, lx + tw / 2, ly + 21);
  });
  // Weg
  c.setLineDash([2, 12]); c.lineCap = 'round'; c.lineWidth = 7;
  for (let i = 0; i < MAP_NODES.length - 1; i++) {
    const [x1, y1] = MAP_NODES[i], [x2, y2] = MAP_NODES[i + 1];
    c.strokeStyle = Store.isUnlocked(save, i + 1) ? '#fff8e1' : 'rgba(255,255,255,0.35)';
    c.beginPath(); c.moveTo(x1, y1);
    if (Math.abs(x1 - x2) < 5) c.quadraticCurveTo(x1 + 34, (y1 + y2) / 2, x2, y2);
    else c.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 22, x2, y2);
    c.stroke();
  }
  c.setLineDash([]);
  // Knoten
  MAP_NODES.forEach(([x, y], i) => {
    const L = LEVELS[i], rec = save && save.levels[L.id];
    const unlocked = Store.isUnlocked(save, i), theme = WORLDS[L.world].theme;
    ellipse(c, x, y + 22, 26, 7, 'rgba(0,0,0,0.3)');
    circle(c, x, y, 24, unlocked ? '#fff' : '#9e9e9e');
    circle(c, x, y, 20, unlocked ? (rec && rec.done ? '#ffb300' : WORLDS[L.world].color) : '#757575');
    if (i === sel) { c.strokeStyle = '#fff'; c.lineWidth = 4; circle(c, x, y, 30 + Math.sin(t * 5) * 2); c.stroke(); }
    c.fillStyle = '#fff'; c.textAlign = 'center';
    if (!unlocked) {
      c.fillStyle = '#eee'; rr(c, x - 8, y - 3, 16, 12, 3); c.fill();
      c.strokeStyle = '#eee'; c.lineWidth = 3; c.beginPath(); c.arc(x, y - 4, 5, Math.PI, 0); c.stroke();
    } else if (L.boss) { c.font = 'bold 13px "Arial Rounded MT Bold", Arial, sans-serif'; c.fillText('BOSS', x, y + 5); }
    else { c.font = 'bold 16px "Arial Rounded MT Bold", Arial, sans-serif'; c.fillText(L.id, x, y + 6); }
    if (unlocked) for (let k = 0; k < 3; k++) drawCollectIcon(c, theme, x - 17 + k * 17, y + 36, 0.48, t, !(rec && rec.stars[k]));
  });
  if (tokenPos) drawNoah(c, tokenPos[0], tokenPos[1] - 22 - Math.abs(Math.sin(t * 4)) * 5, { outfit: save ? save.outfit : 'feuerwehr', power: 'helmet', facing: 1, t, scale: 0.95 });
  // Infotafel
  const L = LEVELS[sel];
  c.fillStyle = 'rgba(0,0,0,0.55)'; rr(c, VW / 2 - 250, 488, 500, 58, 20); c.fill();
  c.fillStyle = '#ffd54f'; c.font = 'bold 17px "Arial Rounded MT Bold", Arial, sans-serif'; c.textAlign = 'center';
  c.fillText(WORLDS[L.world].name + ' · Level ' + L.id, VW / 2, 510);
  c.fillStyle = '#fff'; c.font = 'bold 21px "Arial Rounded MT Bold", Arial, sans-serif';
  c.fillText(L.name, VW / 2, 535);
}
