// Contrôles chiffrés AVANT le rendu (quelques secondes, sans image) :
// caméra trop brusque, personnage trop près de la caméra, choc trop tard, sous-titres qui se chevauchent, trous sans voix, durées.
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { DOSSIER } from "./outils.mjs";
console.log(`Vérification de src/${DOSSIER}/`);

fs.mkdirSync("out", { recursive: true });
const sortie = path.resolve("out/chrono.chk.mjs");
await build({ entryPoints: [`src/${DOSSIER}/chrono.ts`], bundle: true, format: "esm", platform: "node", outfile: sortie, logLevel: "error" });
const C = await import("file:///" + sortie.replace(/\\/g, "/") + "?v=" + Date.now());
const { camera, heros, DUR, SECOUSSES = [], LIGNES, PERSONNAGES = {}, CHOC, FIN_DEBUT } = C;
const finDebut = FIN_DEBUT ?? C.EV?.fin ?? DUR;
const FPS = 30, alertes = [], infos = [];
const unwrap = (a, ref) => { let d = a - ref; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

// 1. caméra : rotation par image < 0,2 rad (hors secousses voulues)
let pire = 0, quand = 0;
for (let f = 1; f < DUR * FPS; f++) {
  const t = f / FPS; if (SECOUSSES.some(([t0]) => t >= t0 - 0.05 && t < t0 + 0.6)) continue;
  const a = camera((f - 1) / FPS), b = camera(t), d = Math.hypot(unwrap(b.yaw, a.yaw), b.pitch - a.pitch);
  if (d > pire) { pire = d; quand = t; }
}
(pire > 0.2 ? alertes : infos).push(`Caméra : rotation max ${pire.toFixed(3)} rad/image à ${quand.toFixed(2)} s ${pire > 0.2 ? "(> 0,2 : trop brusque, ajouter une clé intermédiaire ou étaler le regard)" : "(ok, < 0,2)"}`);

// 2. personne à moins de 1,5 m de la caméra
for (const [nom, M] of Object.entries(PERSONNAGES)) {
  let min = 99, at = 0;
  for (let f = 0; f < DUR * FPS; f++) { const t = f / FPS, h = heros(t), m = M(t), d = Math.hypot(m.x - h.x, m.z - h.z); if (d < min) { min = d; at = t; } }
  (min < 1.5 ? alertes : infos).push(`${nom} : au plus près à ${min.toFixed(2)} m de la caméra (à ${at.toFixed(2)} s)${min < 1.5 ? " → trop près, écarter son trajet" : ""}`);
}

// 3. rythme
if (CHOC !== undefined) (CHOC > 6 ? alertes : infos).push(`Choc à ${CHOC} s ${CHOC > 6 ? "→ trop tard, il doit tomber avant 6 s (idéal : 3 s)" : "(ok, avant 6 s)"}`);
(DUR < 60 ? alertes : infos).push(`Durée : ${DUR.toFixed(1)} s ${DUR < 60 ? "→ moins de 60 s (normal pour la démo ; une vraie vidéo vise 70–80 s)" : DUR > 90 ? "→ plus de 90 s, trop long" : "(ok)"}`);
(DUR - finDebut > 10 ? alertes : infos).push(`Fin : ${(DUR - finDebut).toFixed(1)} s entre les cartes A/B et la fin ${DUR - finDebut > 10 ? "→ trop long (10 s max)" : "(ok)"}`);

// 4. sous-titres : chevauchements et trous de plus de 2 s sans voix
const L = [...LIGNES].sort((a, b) => a.t0 - b.t0);
for (let i = 0; i < L.length - 1; i++) {
  if (L[i].t1 > L[i + 1].t0 - 0.05) alertes.push(`Sous-titres : ${L[i].id} (fin ${L[i].t1.toFixed(2)} s) chevauche ${L[i + 1].id} (début ${L[i + 1].t0} s)`);
  const trou = L[i + 1].t0 - L[i].t1; if (trou > 2 && L[i + 1].t0 < finDebut) infos.push(`Trou de ${trou.toFixed(1)} s sans voix entre ${L[i].id} et ${L[i + 1].id} : vérifier qu'il y a de l'action à l'image`);
}
if (L.length && L[0].t0 > 1.5) alertes.push(`Première réplique à ${L[0].t0} s : trop tard, il faut parler dès la première seconde`);
for (const l of L) if (/\b[RBY]\|/.test(l.texte.replace(/^[RBY]\||\s[RBY]\|/g, " "))) alertes.push(`Sous-titre ${l.id} : marqueur de couleur au milieu d'un mot`);

console.log("\nÀ CORRIGER :" + (alertes.length ? "\n  ⚠ " + alertes.join("\n  ⚠ ") : " rien"));
console.log("\nINFOS :\n  • " + infos.join("\n  • "));
process.exit(0);
