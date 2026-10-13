let ctx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    ctx = ctx || new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(audio, { freq, start = 0, duration = 0.12, type = 'sine', volume = 0.05 }) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const t0 = audio.currentTime + start;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const SOUNDS = {
  placeX: [{ freq: 540, duration: 0.09, type: 'triangle' }],
  placeO: [{ freq: 400, duration: 0.09, type: 'triangle' }],
  undo: [{ freq: 300, duration: 0.08, type: 'sine' }],
  click: [{ freq: 620, duration: 0.05, type: 'sine', volume: 0.03 }],
  win: [523, 659, 784, 1047].map((freq, i) => ({ freq, start: i * 0.09, duration: 0.18, type: 'triangle' })),
  lose: [
    { freq: 330, duration: 0.2, type: 'sawtooth', volume: 0.025 },
    { freq: 247, start: 0.16, duration: 0.3, type: 'sawtooth', volume: 0.025 },
  ],
  draw: [
    { freq: 392, duration: 0.14, type: 'sine' },
    { freq: 392, start: 0.16, duration: 0.18, type: 'sine' },
  ],
};

export function playSound(name, enabled = true) {
  if (!enabled || !SOUNDS[name]) return;
  const audio = getContext();
  if (!audio) return;
  SOUNDS[name].forEach((note) => tone(audio, note));
}
