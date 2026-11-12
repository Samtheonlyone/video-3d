// Après le rendu : mesure le son de out/video.mp4 et le remet au bon niveau pour TikTok
// (−14 LUFS, crête ≤ −1 dB) → out/video_finale.mp4. L'image n'est pas recalculée (copie directe).
// La mesure ne remplace pas une écoute : le dire. Si les voix ne passent pas devant, baisser « gain » des bruitages dans Video.tsx.
import fs from "node:fs";
import { ffmpeg, mesurer } from "./outils.mjs";

const src = process.argv[2] || "out/video.mp4", dst = src.replace(/\.mp4$/, "_finale.mp4");
if (!fs.existsSync(src)) { console.log(`✖ ${src} introuvable : lance d'abord npm run rendre`); process.exit(1); }
const a = mesurer(src);
console.log(`Avant : ${a.lufs} LUFS, crête ${a.crete} dB`);
if (!Number.isFinite(a.lufs) || a.lufs < -60) { console.log("⚠ Pas de son mesurable : les voix sont-elles dans public/voix ?"); process.exit(1); }
// deuxième passe linéaire avec les valeurs mesurées : le volume monte ou baisse d'un bloc, sans « pomper »
const j = a.j;
ffmpeg(["-i", src, "-map", "0:v", "-map", "0:a", "-c:v", "copy", "-af",
  `loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`,
  "-ar", "48000", "-c:a", "aac", "-b:a", "256k", dst]);
const b = mesurer(dst);
console.log(`Après : ${b.lufs} LUFS, crête ${b.crete} dB → ${dst}`);
console.log("Rappel : le son est mesuré, pas écouté. Écoute la vidéo avant de la publier.");
