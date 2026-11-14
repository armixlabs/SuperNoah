'use strict';
/* =========================================================
   Super Noah – Klänge, Musik und Sprachausgabe
   Alles wird live im Browser erzeugt (keine Audiodateien).
   ========================================================= */

const Sfx = (() => {
  let ctx = null, master, sfxBus, musicBus, noiseBuf = null;
  const opts = { sfx: true, music: true, speech: true };

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = opts.music ? 0.16 : 0; musicBus.connect(master);
    } catch (e) { ctx = null; return false; }
    return true;
  }

  function tone(f, d, type = 'square', v = 0.3, f2 = null, delay = 0, bus = null) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(bus || sfxBus);
    o.start(t); o.stop(t + d + 0.03);
  }

  function noise(d, v = 0.3, freq = 1000, delay = 0, type = 'lowpass') {
    if (!ctx) return;
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const a = noiseBuf.getChannelData(0);
      for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(sfxBus);
    s.start(t); s.stop(t + d + 0.03);
  }

  const arp = (notes, step, type = 'square', v = 0.16, len = 0.14) =>
    notes.forEach((f, i) => tone(f, len, type, v, null, i * step));

  const SFX = {
    jump: () => tone(330, 0.16, 'square', 0.14, 720),
    coin: () => { tone(988, 0.06, 'square', 0.12); tone(1319, 0.2, 'square', 0.12, null, 0.06); },
    stomp: () => { tone(520, 0.14, 'square', 0.18, 140); noise(0.08, 0.15, 900); },
    bump: () => tone(170, 0.09, 'triangle', 0.3, 90),
    brick: () => { noise(0.25, 0.3, 1600); tone(200, 0.12, 'square', 0.12, 80); },
    power: () => arp([523, 659, 784, 1047, 1319, 1568], 0.06, 'square', 0.13),
    heart: () => arp([660, 880, 1100], 0.08, 'triangle', 0.25, 0.2),
    hurt: () => { tone(500, 0.35, 'sawtooth', 0.16, 120); },
    fall: () => tone(700, 0.8, 'triangle', 0.22, 90),
    spray: () => noise(0.07, 0.05, 2800, 0, 'highpass'),
    steam: () => noise(0.45, 0.18, 2200, 0, 'highpass'),
    star: () => arp([784, 988, 1175, 1568, 1976, 2349], 0.07, 'triangle', 0.22, 0.22),
    spring: () => tone(180, 0.35, 'sine', 0.35, 950),
    check: () => arp([659, 784, 1047], 0.1, 'triangle', 0.25, 0.2),
    select: () => tone(700, 0.07, 'square', 0.1),
    boom: () => { noise(0.55, 0.4, 500); tone(120, 0.4, 'sine', 0.3, 40); },
    bossHit: () => { tone(300, 0.3, 'square', 0.2, 80); noise(0.2, 0.2, 1200); },
    roar: () => { tone(110, 0.6, 'sawtooth', 0.22, 70); noise(0.6, 0.2, 600); },
    gate: () => { noise(0.8, 0.25, 300); arp([392, 523, 659, 784], 0.12, 'triangle', 0.2, 0.25); },
    siren: () => { for (let i = 0; i < 4; i++) { tone(700, 0.25, 'triangle', 0.15, 950, i * 0.5); tone(950, 0.25, 'triangle', 0.15, 700, i * 0.5 + 0.25); } },
    rocket: () => { noise(2.2, 0.35, 700); tone(80, 2, 'sawtooth', 0.12, 300); },
    win: () => {
      const n = [523, 523, 659, 784, 659, 784, 1047];
      const d = [0, 0.12, 0.24, 0.36, 0.6, 0.72, 0.9];
      n.forEach((f, i) => { tone(f, i === n.length - 1 ? 0.7 : 0.14, 'square', 0.14, null, d[i]); tone(f / 2, 0.14, 'triangle', 0.18, null, d[i]); });
    },
    swish: () => { noise(0.14, 0.18, 2600, 0, 'bandpass'); tone(900, 0.1, 'triangle', 0.08, 300); },
    swim: () => tone(260, 0.12, 'sine', 0.16, 520),
    buy: () => arp([880, 1175, 1568, 2093], 0.07, 'square', 0.12),
  };

  function play(name) {
    if (!opts.sfx || !ensure()) return;
    const f = SFX[name]; if (f) try { f(); } catch (e) { /* ignorieren */ }
  }

  /* ---------- Musik: kleiner Sequenzer mit eigenen Melodien ---------- */
  const _ = null;
  const SONGS = {
    map: { bpm: 112, lead: 'triangle', bass: [48, _, 55, _, 53, _, 55, _, 45, _, 52, _, 50, _, 55, _],
      mel: [72, _, 76, _, 79, _, 76, _, 77, _, 74, _, 72, _, _, _, 69, _, 72, _, 76, _, 74, _, 72, _, 71, _, 72, _, _, _] },
    dino: { bpm: 138, lead: 'square', bass: [48, _, 48, 55, _, 55, 53, _, 45, _, 45, 52, _, 52, 55, _],
      mel: [72, _, 74, 76, _, 79, 76, _, 74, 72, _, 69, 72, _, _, _, 69, _, 72, 74, _, 76, 74, 72, 74, _, 79, _, 76, _, _, _,
            81, _, 79, 76, _, 79, 76, 74, 72, _, 74, 76, 74, _, 72, _, 69, _, 72, _, 74, 76, 79, _, 72, _, _, _, _, _, _, _] },
    city: { bpm: 150, lead: 'square', bass: [45, _, 57, _, 45, _, 57, _, 43, _, 55, _, 41, _, 53, _],
      mel: [69, 69, _, 72, _, 69, 76, _, 74, _, 72, _, 69, _, _, _, 67, 67, _, 71, _, 67, 74, _, 72, _, 71, _, 69, _, _, _,
            76, _, 76, 77, 76, _, 74, _, 72, _, 74, 76, 69, _, _, _, 72, _, 71, _, 69, _, 67, _, 69, _, _, _, _, _, _, _] },
    space: { bpm: 104, lead: 'sine', bass: [41, _, _, 48, _, _, 53, _, 43, _, _, 50, _, _, 55, _],
      mel: [77, _, 81, _, 84, _, 81, _, 79, _, _, _, 76, _, _, _, 77, _, 81, _, 86, _, 84, _, 81, _, _, _, _, _, _, _,
            74, _, 77, _, 81, _, 79, _, 77, _, 76, _, 74, _, _, _, 76, _, 79, _, 84, _, 83, _, 84, _, _, _, _, _, _, _] },
    ice: { bpm: 126, lead: 'triangle', bass: [48, _, 60, _, 55, _, 60, _, 53, _, 65, _, 55, _, 59, _],
      mel: [84, _, 79, _, 76, _, 79, _, 84, _, 86, _, 88, _, _, _, 86, _, 84, _, 81, _, 84, _, 79, _, _, _, _, _, _, _,
            81, _, 77, _, 74, _, 77, _, 81, _, 84, _, 83, _, _, _, 84, _, 79, _, 76, _, 74, _, 72, _, _, _, _, _, _, _] },
    sea: { bpm: 92, lead: 'sine', bass: [38, _, _, 45, _, _, 50, _, 36, _, _, 43, _, _, 48, _],
      mel: [74, _, _, 77, _, 81, _, _, 79, _, 77, _, 74, _, _, _, 72, _, _, 76, _, 79, _, _, 77, _, 76, _, 72, _, _, _,
            74, _, _, 77, _, 81, _, _, 86, _, 84, _, 81, _, _, _, 79, _, 77, _, 76, _, 74, _, 74, _, _, _, _, _, _, _] },
    robo: { bpm: 144, lead: 'square', bass: [36, 36, _, 36, 48, _, 36, _, 39, 39, _, 39, 51, _, 41, 43],
      mel: [72, _, 72, 75, _, 72, 79, _, 77, _, 75, _, 72, _, _, _, 70, _, 70, 74, _, 70, 77, _, 75, _, 74, _, 70, _, _, _,
            72, 75, 79, _, 84, _, 79, _, 77, _, 75, 77, 79, _, _, _, 82, _, 79, _, 77, _, 75, _, 72, _, _, _, _, _, _, _] },
    knight: { bpm: 120, lead: 'triangle', bass: [45, _, 52, _, 45, _, 52, _, 43, _, 50, _, 48, _, 52, _],
      mel: [69, _, 72, 74, 76, _, 74, 72, 74, _, 69, _, 67, _, _, _, 69, _, 72, 74, 76, _, 79, 77, 76, _, 74, _, 72, _, _, _,
            76, _, 79, _, 81, _, 79, 76, 74, _, 72, _, 74, _, _, _, 72, _, 71, 69, 67, _, 69, _, 69, _, _, _, _, _, _, _] },
    lab: { bpm: 132, lead: 'square', bass: [43, _, 43, 50, _, 50, 46, _, 41, _, 41, 48, _, 48, 45, _],
      mel: [79, 78, 79, _, 74, _, 70, _, 72, _, 74, 75, 74, _, _, _, 79, 78, 79, _, 82, _, 79, _, 77, _, 75, 74, 72, _, _, _,
            74, _, 77, _, 81, _, 79, 77, 75, _, 74, _, 72, _, 70, _, 72, 74, 75, _, 74, _, 70, _, 67, _, _, _, _, _, _, _] },
    police: { bpm: 140, lead: 'square', bass: [40, _, 40, 47, _, 47, 45, _, 38, _, 38, 45, _, 45, 43, _],
      mel: [76, _, 76, 79, _, 76, 74, _, 72, _, 74, _, 76, _, _, _, 76, _, 79, 81, _, 79, 76, _, 74, _, 72, _, 71, _, _, _,
            72, _, 72, 76, _, 72, 79, _, 77, _, 76, _, 74, _, _, _, 76, 77, 79, _, 74, _, 76, _, 72, _, _, _, _, _, _, _] },
    boss: { bpm: 160, lead: 'sawtooth', bass: [40, 40, 52, 40, 40, 52, 40, 51, 38, 38, 50, 38, 38, 50, 38, 49],
      mel: [64, _, 67, _, 63, _, 67, _, 64, _, 70, _, 69, _, 67, _, 64, _, 67, _, 72, _, 71, _, 67, _, 63, _, 64, _, _, _] },
  };
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  let song = null, songName = '', step = 0, nextT = 0, timer = null;

  function schedule() {
    if (!ctx || !song) return;
    const stepDur = 60 / song.bpm / 2;
    while (nextT < ctx.currentTime + 0.15) {
      const b = song.bass[step % song.bass.length];
      const m = song.mel[step % song.mel.length];
      if (b != null) tone(midi(b), stepDur * 0.9, 'triangle', 0.5, null, nextT - ctx.currentTime, musicBus);
      if (m != null) tone(midi(m), stepDur * 1.6, song.lead, song.lead === 'sine' ? 0.45 : 0.22, null, nextT - ctx.currentTime, musicBus);
      nextT += stepDur; step++;
    }
  }

  function music(name) {
    if (songName === name) return;
    songName = name; song = SONGS[name] || null; step = 0;
    if (!ensure()) return;
    nextT = ctx.currentTime + 0.1;
    if (!timer) timer = setInterval(schedule, 30);
  }
  function stopMusic() { songName = ''; song = null; }

  /* ---------- Sprachausgabe ---------- */
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang));
    if (!vs.length) return null;
    const pref = ['Anna', 'Petra', 'Helena', 'Google Deutsch', 'Katja', 'Marlene'];
    for (const p of pref) { const v = vs.find(x => x.name.includes(p)); if (v) return v; }
    return vs[0];
  }
  if ('speechSynthesis' in window) {
    voice = pickVoice();
    speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
  }
  function speak(text) {
    if (!opts.speech || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[^\p{L}\p{N}\s.,!?'-]/gu, ''));
      u.lang = 'de-DE'; if (voice) u.voice = voice;
      u.rate = 1.0; u.pitch = 1.15; u.volume = 1;
      speechSynthesis.speak(u);
    } catch (e) { /* ignorieren */ }
  }

  function setOpts(o) {
    Object.assign(opts, o);
    if (musicBus) musicBus.gain.value = opts.music ? 0.16 : 0;
    if (!opts.speech && 'speechSynthesis' in window) speechSynthesis.cancel();
  }

  return { ensure, play, music, stopMusic, speak, setOpts, opts };
})();
