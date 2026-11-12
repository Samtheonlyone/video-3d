// Rendu complet de la vidéo : src/video/ si elle existe, sinon l'exemple. Sortie : out/video.mp4.
// Arguments en plus passés à Remotion, ex. : npm run rendre -- --frames=300-450   (seulement de 10 s à 15 s)
import { spawnSync } from "node:child_process";
import { COMPO } from "./outils.mjs";

const extra = process.argv.slice(2).join(" ");
console.log(`Rendu de la composition « ${COMPO} » → out/video.mp4`);
const r = spawnSync(`npx remotion render src/index.ts ${COMPO} out/video.mp4 --gl=angle --codec h264 --crf 18 --timeout 240000 ${extra}`, { stdio: "inherit", shell: true });
if (r.status === 0) console.log("✔ out/video.mp4 — étape suivante : npm run son");
process.exit(r.status ?? 1);
