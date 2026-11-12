// Images de contrôle : rend quelques instants de la vidéo en PNG (moitié de la taille), sans faire tout le rendu.
// Usage : npm run images -- 0 3 8.5 16      (des secondes)
// Résultat : out/img_<seconde>.png + une planche out/planche.html (toutes les images côte à côte).
// La planche s'ouvre dans le navigateur avec npm run planche (ou directement en ajoutant --montrer).
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import { COMPO } from "./outils.mjs";
import { ouvrir } from "./planche.mjs";

const montrer = process.argv.includes("--montrer");
const secondes = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
if (!secondes.length) { console.log("Donne des secondes, par exemple : npm run images -- 0 3 8"); process.exit(1); }
const id = process.env.COMPO || COMPO;
fs.mkdirSync("out", { recursive: true });
console.log(`Préparation (composition « ${id} »)…`);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, chromiumOptions: { gl: "angle" } });
for (const s of secondes) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = path.resolve(`out/img_${s}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale: 0.5, chromiumOptions: { gl: "angle" }, timeoutInMilliseconds: 240000 });
  console.log("✔", output);
}
const v = Date.now(); // évite que le navigateur garde une ancienne image en mémoire
const cartes = secondes.map((s) => `<figure><img src="img_${s}.png?v=${v}"><figcaption>${s} s</figcaption></figure>`).join("\n");
fs.writeFileSync("out/planche.html", `<!doctype html><meta charset="utf-8"><title>Images de contrôle</title>
<style>body{margin:0;padding:16px;background:#15131a;color:#eee;font:16px system-ui,sans-serif}h1{font-size:18px;margin:0 0 12px}
.g{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0}img{height:70vh;max-height:960px;border-radius:8px;display:block}figcaption{text-align:center;padding:6px;font-weight:700}</style>
<h1>Images de contrôle — ${id} — ${new Date().toLocaleString("fr-FR")}</h1><div class="g">${cartes}</div>`);
console.log("Planche : out/planche.html" + (montrer ? " (ouverte)" : " — npm run planche pour l'ouvrir"));
if (montrer) ouvrir("out/planche.html");
