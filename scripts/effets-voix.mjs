// Effets de voix appliqués directement sur le fichier WAV (en JavaScript : le ffmpeg intégré à Remotion n'a pas ces filtres).
// Dans script.json, une réplique peut avoir "fx": "telephone" | "hautparleur" | "loin" | "masque" | "radio".
import fs from "node:fs";

// --- lecture / écriture d'un WAV PCM 16 bits
export const lireWav = (f) => {
  const b = fs.readFileSync(f); let p = 12, fmt = null, data = null;
  while (p < b.length - 8) { const id = b.toString("ascii", p, p + 4), n = b.readUInt32LE(p + 4); if (id === "fmt ") fmt = { ch: b.readUInt16LE(p + 10), sr: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) }; if (id === "data") data = { off: p + 8, n }; p += 8 + n + (n % 2); }
  if (!fmt || !data || fmt.bits !== 16) throw new Error("WAV 16 bits attendu : " + f);
  const N = Math.floor(data.n / 2 / fmt.ch), x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = b.readInt16LE(data.off + i * 2 * fmt.ch) / 32768; // on garde le 1er canal (les voix sont en mono)
  return { sr: fmt.sr, x };
};
export const ecrireWav = (f, sr, x) => {
  const b = Buffer.alloc(44 + x.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(f, b);
};

// --- briques de traitement
const biquad = (x, sr, type, f0, q = 0.707, gainDb = 0) => {
  const w = (2 * Math.PI * f0) / sr, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q), A = Math.pow(10, gainDb / 40);
  let b0, b1, b2, a0, a1, a2;
  if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; a0 = 1 + a; a1 = -2 * c; a2 = 1 - a; }
  else if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; a0 = 1 + a; a1 = -2 * c; a2 = 1 - a; }
  else { b0 = 1 + a * A; b1 = -2 * c; b2 = 1 - a * A; a0 = 1 + a / A; a1 = -2 * c; a2 = 1 - a / A; } // bosse (peak)
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
};
const sature = (x, k) => x.map((v) => Math.tanh(v * k) / Math.tanh(k));
const echo = (x, sr, ms, fb) => { const d = Math.round((sr * ms) / 1000), y = new Float32Array(x.length + d * 4); y.set(x); for (let i = d; i < y.length; i++) y[i] += y[i - d] * fb; return y; };
const crush = (x, niveaux) => x.map((v) => Math.round(v * niveaux) / niveaux);
const compresse = (x, sr, seuil = 0.25, ratio = 4) => { let env = 0; const at = Math.exp(-1 / (sr * 0.005)), rel = Math.exp(-1 / (sr * 0.08)); return x.map((v) => { const a = Math.abs(v); env = a > env ? at * env + (1 - at) * a : rel * env + (1 - rel) * a; const g = env > seuil ? (seuil + (env - seuil) / ratio) / env : 1; return v * g; }); };
const crete = (x) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

export const FX = {
  telephone: (x, sr) => compresse(sature(biquad(biquad(biquad(x, sr, "hp", 380), sr, "lp", 3300), sr, "peak", 1800, 1, 4), sr, 2), sr),
  hautparleur: (x, sr) => echo(echo(crush(biquad(biquad(x, sr, "hp", 420), sr, "lp", 3300), 64), sr, 90, 0.3), sr, 160, 0.2),
  loin: (x, sr) => echo(biquad(x, sr, "lp", 2600), sr, 120, 0.25).map((v) => v * 0.8),
  masque: (x, sr) => echo(biquad(biquad(biquad(x, sr, "hp", 130), sr, "lp", 3400), sr, "peak", 950, 1.2, 6), sr, 12, 0.25),
  radio: (x, sr) => compresse(sature(biquad(biquad(x, sr, "hp", 500), sr, "lp", 2800), sr, 3), sr),
};

// applique un effet sur place, en gardant la même crête qu'avant (le volume perçu reste proche)
export const appliquerFx = (fichier, nom) => {
  if (!FX[nom]) throw new Error(`effet inconnu « ${nom} » (possibles : ${Object.keys(FX).join(", ")})`);
  const { sr, x } = lireWav(fichier), avant = crete(x) || 1;
  let y = FX[nom](x, sr); const apres = crete(y) || 1; y = y.map((v) => (v * avant) / apres);
  ecrireWav(fichier, sr, y);
};
