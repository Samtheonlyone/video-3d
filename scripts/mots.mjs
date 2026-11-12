// Facultatif : cale chaque mot des sous-titres sur l'instant où il est vraiment prononcé (Whisper, en local).
// Le premier lancement installe Whisper dans outils/whisper/ et télécharge le modèle (plusieurs centaines de Mo).
// Windows : rien d'autre à installer. Mac : il faut les outils de développement d'Apple (xcode-select --install).
// Usage : npm run mots          → toutes les répliques qui ont une voix
//         npm run mots -- h2 z3 → seulement celles-ci
// Résultat : "mots" ajouté à chaque réplique dans calage.json (lu par les sous-titres).
import fs from "node:fs";
import path from "node:path";
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { lireJSON, SCRIPT_PATH, CALAGE_PATH, ffmpeg } from "./outils.mjs";

const VERSION = "1.5.5", MODELE = process.env.WHISPER_MODELE || "small", DOSSIER = path.resolve("outils/whisper");
const S = lireJSON(SCRIPT_PATH), cal = fs.existsSync(CALAGE_PATH) ? lireJSON(CALAGE_PATH) : {};
const args = process.argv.slice(2);
const lignes = S.lignes.filter((l) => cal[l.id] && fs.existsSync(`public/voix/${l.id}.wav`) && (!args.length || args.includes(l.id)));
if (!lignes.length) { console.log("Aucune réplique avec voix et calage : lance d'abord npm run voix puis npm run caler."); process.exit(1); }

await installWhisperCpp({ to: DOSSIER, version: VERSION, printOutput: true });
await downloadWhisperModel({ model: MODELE, folder: DOSSIER, printOutput: true });
fs.mkdirSync("out/w16", { recursive: true });

const lettres = (w) => w.replace(/[^A-Za-zÀ-ÿ0-9]/g, "").length;
let ok = 0;
for (const l of lignes) {
  process.stdout.write(`• ${l.id} … `);
  try {
    const w16 = path.resolve(`out/w16/${l.id}.wav`);
    ffmpeg(["-i", `public/voix/${l.id}.wav`, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", w16]); // Whisper veut du 16 kHz mono
    const r = await transcribe({ inputPath: w16, whisperPath: DOSSIER, whisperCppVersion: VERSION, model: MODELE, tokenLevelTimestamps: true, language: S.langue || "fr", printOutput: false });
    const mots = toCaptions({ whisperCppOutput: r }).captions.map((c) => ({ t: c.startMs / 1000, f: c.endMs / 1000, n: lettres(c.text) })).filter((m) => m.n > 0);
    if (!mots.length) throw new Error("Whisper n'a rien entendu (cri, souffle ?) : mots répartis par défaut");
    // on répartit les lettres du sous-titre sur les mots entendus : le k-ième % des lettres tombe au k-ième % de la parole
    const totW = mots.reduce((s, m) => s + m.n, 0), sous = l.texte.split(" ").filter(Boolean), totS = sous.reduce((s, w) => s + lettres(w.replace(/^[RBY]\|/, "")), 0) || 1;
    let avant = 0, dernier = mots[0].t; const out = [];
    for (const w of sous) {
      const n = lettres(w.replace(/^[RBY]\|/, ""));
      if (!n) { out.push(Math.round(dernier * 100) / 100); continue; } // « ! » ou « ? » : même instant que le mot d'avant
      let cible = (avant / totS) * totW, j = 0; while (j < mots.length - 1 && cible >= mots[j].n) { cible -= mots[j].n; j++; }
      const m = mots[j], t = m.t + Math.min(1, cible / m.n) * (m.f - m.t);
      dernier = Math.max(dernier, t); out.push(Math.round(dernier * 100) / 100); avant += n;
    }
    cal[l.id].mots = out; ok++; console.log("✔ " + mots.map((m) => m.t.toFixed(2)).join(" "));
  } catch (e) { console.log("✖ " + e.message); }
}
fs.writeFileSync(CALAGE_PATH, JSON.stringify(cal, null, 2) + "\n");
console.log(`\n${ok}/${lignes.length} répliques calées au mot près. (Relancer npm run mots après avoir refait une voix.)`);
