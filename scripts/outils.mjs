// Outils partagés par les scripts : lire le script de la vidéo, lancer ffmpeg / ffprobe.
// On utilise le ffmpeg fourni avec Remotion (« npx remotion ffmpeg ») : rien à installer.
// Il est réduit : seulement loudnorm, silencedetect, atrim, volume, atempo, apad… (pas de silenceremove ni d'alimiter).
import fs from "node:fs";
import { spawnSync } from "node:child_process";

export const lireJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
// Quelle vidéo ? src/video/ dès qu'elle existe, sinon l'exemple. On peut forcer : VIDEO=exemple npm run images -- 0
export const DOSSIER = process.env.VIDEO || (fs.existsSync("src/video/chrono.ts") ? "video" : "exemple");
export const COMPO = DOSSIER.charAt(0).toUpperCase() + DOSSIER.slice(1); // video → Video, exemple → Exemple
export const SCRIPT_PATH = `src/${DOSSIER}/script.json`;
export const CALAGE_PATH = `src/${DOSSIER}/calage.json`;

const q = (a) => (/^[\w./:=-]+$/.test(a) ? a : `"${String(a).replace(/"/g, '\\"')}"`);
const lancer = (outil, args) => spawnSync(`npx remotion ${outil} ${args.map(q).join(" ")}`, { encoding: "utf8", shell: true, maxBuffer: 64 * 1024 * 1024 });
export const ffmpegBrut = (args) => { const r = lancer("ffmpeg", ["-hide_banner", "-nostats", ...args]); return { ok: r.status === 0, sortie: (r.stderr || "") + (r.stdout || "") }; };
export const ffmpeg = (args) => { const r = ffmpegBrut(["-loglevel", "error", "-y", ...args]); if (!r.ok) throw new Error("ffmpeg a échoué : " + r.sortie.trim().split("\n").slice(-3).join(" | ")); return r.sortie; };
export const duree = (fichier) => {
  const r = lancer("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", fichier]);
  const d = parseFloat((r.stdout || "").trim());
  if (Number.isNaN(d)) throw new Error("Durée illisible pour " + fichier + " : " + r.stderr);
  return d;
};
// Mesure du volume perçu (LUFS) et de la crête (dB) avec loudnorm en mode mesure.
export const mesurer = (fichier) => {
  const r = ffmpegBrut(["-i", fichier, "-vn", "-af", "loudnorm=print_format=json", "-f", "null", "-"]);
  const j = JSON.parse(r.sortie.slice(r.sortie.lastIndexOf("{"), r.sortie.lastIndexOf("}") + 1));
  return { lufs: parseFloat(j.input_i), crete: parseFloat(j.input_tp), j };
};
// Début et fin de la parole (on ignore les silences au début et à la fin, seuil −45 dB).
export const bornesParole = (fichier) => {
  const total = duree(fichier), o = ffmpegBrut(["-i", fichier, "-af", "silencedetect=n=-45dB:d=0.08", "-f", "null", "-"]).sortie;
  const starts = [...o.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => +m[1]), ends = [...o.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  let a = 0, b = total;
  if (starts.length && starts[0] <= 0.02 && ends.length) a = ends[0];
  const last = starts[starts.length - 1]; if (starts.length && last > a && (ends.length < starts.length || ends[ends.length - 1] >= total - 0.02)) b = last;
  return { a: Math.max(0, a - 0.04), b: Math.min(total, b + 0.08) };
};
// Nettoie une voix : coupe les silences du début et de la fin, met le volume au même niveau que les autres
// (−14,5 LUFS ; −17,5 pour un chuchotement), mono 48 kHz.
// hauteur : 1.07 = voix 7 % plus aiguë (même vitesse) ; sert à faire deux rôles avec une même voix.
// fx : effet de voix (téléphone, haut-parleur, loin, masque, radio), voir effets-voix.mjs.
export const normaliser = async (entree, sortie, chuchote = false, o = {}) => {
  const { a, b } = bornesParole(entree), I = chuchote ? -17.5 : -14.5, h = o.hauteur && o.hauteur !== 1 ? o.hauteur : null;
  const hauteur = h ? `aresample=48000,asetrate=${Math.round(48000 * h)},aresample=48000,atempo=${(1 / h).toFixed(4)},` : "";
  ffmpeg(["-i", entree, "-af", `atrim=start=${a.toFixed(3)}:end=${b.toFixed(3)},asetpts=N/SR/TB,${hauteur}loudnorm=I=${I}:TP=-1.5:LRA=11`, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", sortie]);
  if (o.fx) { const { appliquerFx } = await import("./effets-voix.mjs"); appliquerFx(sortie, o.fx); }
};
// Texte à dire : les indications [entre crochets] sont gardées pour ElevenLabs v3, retirées pour Voicebox.
export const sansCrochets = (s) => s.replace(/\[[^\]]*\]\s*/g, "").trim();
export const estChuchote = (s) => /\[(chuchot|murmur|whisper)/i.test(s);
