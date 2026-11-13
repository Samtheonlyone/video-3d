// Mixe l'audio de « Fin » (voix + bruitages) avec ffmpeg, sans rendre d'images : écrit audio/fin.aac (88 s).
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const S = JSON.parse(fs.readFileSync("src/fin/script.json", "utf8")), DUR = 88;
const ins = [], fx = [], lab = []; let n = 0;
const add = (file, filt, delay = 0, loop = false) => { const i = n++; ins.push(...(loop ? ["-stream_loop", "-1"] : []), "-i", file); fx.push(`[${i}:a]${filt},adelay=${Math.round(delay * 1000)}|${Math.round(delay * 1000)}[a${i}]`); lab.push(`[a${i}]`); };
// ambiances (volumes = ceux de Fin.tsx, ×0.5 de gain général)
add("public/sfx/ville.wav", `atrim=0:57.5,asetpts=N/SR/TB,volume='0.25*(1-clip((t-25)/2,0,1))+0.1*clip((t-25)/2,0,1)*(1-clip(t-56,0,1))':eval=frame`, 0, true);
add("public/sfx/mer.wav", `atrim=0:90,asetpts=N/SR/TB,volume='0.15+0.25*clip((t-50)/5,0,1)*(1-clip((t-57)/1,0,1))-0.09*clip((t-58.5)/1,0,1)':eval=frame`, 0, true);
// nappe grave (2 notes, fondu) sous tout le film : fait monter la tension sans musique protégée
fx.push("sine=frequency=49:duration=90,volume=0.05,afade=t=in:d=4,afade=t=out:st=84:d=6[dr1]", "sine=frequency=73.4:duration=90,volume=0.025,afade=t=in:d=6,afade=t=out:st=84:d=6[dr2]"); lab.push("[dr1]", "[dr2]");
// coups : [instant, fichier, volume]
[[25.5, "explosion", .55], [26.5, "debris", .8], [29.5, "debris", .9], [33, "debris", .6], [36, "debris", .7], [38.5, "debris", .5], [19.7, "debris", .5], [21.5, "debris", .45], [43, "explosion", .4], [46, "debris", .5], [56.9, "explosion", 1], [57.1, "explosion", 1]]
  .forEach(([t, n, v]) => add(`public/sfx/${n}.wav`, `volume=${(v * 0.5).toFixed(2)}`, t));
// voix par-dessus (volume 1)
S.lignes.forEach((l) => add(`public/voix/${l.id}.wav`, "volume=1.0", l.debut));
const filtre = fx.join(";") + `;${lab.join("")}amix=inputs=${lab.length}:normalize=0,atrim=0:${DUR},loudnorm=I=-14:TP=-1.5[out]`;
fs.mkdirSync("audio", { recursive: true });
const r = spawnSync("ffmpeg", ["-y", ...ins, "-filter_complex", filtre, "-map", "[out]", "-t", String(DUR), "-ar", "48000", "-c:a", "aac", "-b:a", "256k", "audio/fin.aac"], { encoding: "utf8" });
if (r.status) { console.error(r.stderr.slice(-1500)); process.exit(1); }
console.log("✔ audio/fin.aac");
