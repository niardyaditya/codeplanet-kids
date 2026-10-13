// Efek suara sederhana dengan Web Audio: tanpa file audio, jadi ringan.
const KUNCI = "cp-kids-v1";
let ctx = null;

function suaraAktif() {
  try {
    const raw = window.localStorage.getItem(KUNCI);
    if (!raw) return true;
    return JSON.parse(raw).suara !== false;
  } catch {
    return true;
  }
}

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function nada(freq, mulai, durasi, tipe = "sine", volume = 0.12) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + mulai;
  o.type = tipe;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + durasi + 0.03);
}

export function bunyi(jenis) {
  if (typeof window === "undefined" || !suaraAktif()) return;
  switch (jenis) {
    case "klik":
      nada(880, 0, 0.06);
      break;
    case "jalan":
      nada(330, 0, 0.08, "triangle", 0.08);
      break;
    case "ambil":
      nada(988, 0, 0.1);
      nada(1319, 0.09, 0.14);
      break;
    case "benar":
      [523, 659, 784, 1047].forEach((f, i) => nada(f, i * 0.11, 0.22));
      break;
    case "salah":
      nada(220, 0, 0.22, "sawtooth", 0.07);
      nada(180, 0.2, 0.25, "sawtooth", 0.06);
      break;
    default:
      break;
  }
}
