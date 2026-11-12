// Mesure la vraie durée de chaque voix (public/voix/<id>.wav), écrit src/<video>/calage.json,
// puis signale les répliques qui se chevauchent ou qui débordent sur la fin. Ne modifie pas le script : il propose.
import fs from "node:fs";
import { lireJSON, SCRIPT_PATH, CALAGE_PATH, duree } from "./outils.mjs";

const S = lireJSON(SCRIPT_PATH), cal = {}, ancien = fs.existsSync(CALAGE_PATH) ? lireJSON(CALAGE_PATH) : {};
// on garde les instants des mots (npm run mots) si la voix n'a pas changé
for (const l of S.lignes) { const f = `public/voix/${l.id}.wav`; if (!fs.existsSync(f)) continue; const d = Math.round(duree(f) * 100) / 100; cal[l.id] = { d }; if (ancien[l.id]?.mots && Math.abs(ancien[l.id].d - d) < 0.02) cal[l.id].mots = ancien[l.id].mots; }
fs.writeFileSync(CALAGE_PATH, JSON.stringify(cal, null, 2) + "\n");
const n = Object.keys(cal).length;
console.log(`${n}/${S.lignes.length} répliques calées sur leur vraie durée (${CALAGE_PATH}).`);
const manquent = S.lignes.filter((l) => !cal[l.id]).map((l) => l.id);
if (manquent.length) console.log("  Sans voix (durée estimée) : " + manquent.join(", "));

const est = (l) => Math.min(cal[l.id]?.d ?? 0.3 * l.texte.split(" ").filter((w) => /[A-Za-zÀ-ÿ0-9]/.test(w)).length + 0.3, l.max ?? 99);
const L = [...S.lignes].sort((a, b) => a.debut - b.debut);
let pb = 0;
for (let i = 0; i < L.length; i++) {
  const l = L[i], fin = l.debut + est(l), suiv = L[i + 1];
  if (cal[l.id] && l.max && cal[l.id].d > l.max) console.log(`  ✂ ${l.id} est coupée à ${l.max} s (voulu : « max »), sa voix dure ${cal[l.id].d} s.`);
  if (suiv && fin > suiv.debut - 0.05) { pb++; console.log(`  ⚠ ${l.id} finit à ${fin.toFixed(2)} s mais ${suiv.id} commence à ${suiv.debut} s → décaler ${suiv.id} à ${(fin + 0.1).toFixed(2)} s, ou raccourcir ${l.id}.`); }
  if (l.id !== L[L.length - 1].id && S.fin && fin > S.fin.debut + 0.2 && l.debut < S.fin.debut) { pb++; console.log(`  ⚠ ${l.id} déborde sur les cartes A/B (fin à ${fin.toFixed(2)} s, cartes à ${S.fin.debut} s).`); }
}
console.log(pb ? `\n${pb} problème(s). Corrige « debut » dans script.json (et les actions liées dans chrono.ts), puis relance npm run caler.` : "\nAucun chevauchement. Étape suivante : npm run mots (facultatif : sous-titres au mot près), npm run verifier, puis npm run images.");
