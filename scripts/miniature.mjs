// Rend la miniature TikTok (1080 × 1440) en JPG : out/miniature.jpg
// Composition « Miniature » (src/video/Miniature.tsx) si la vidéo existe, sinon « MiniatureExemple ».
import { spawnSync } from "node:child_process";
import { DOSSIER } from "./outils.mjs";

const id = DOSSIER === "video" ? "Miniature" : "MiniatureExemple";
console.log(`Miniature : composition « ${id} »`);
const r = spawnSync(`npx remotion still src/index.ts ${id} out/miniature.jpg --frame=0 --gl=angle --image-format=jpeg --jpeg-quality=92 --timeout 240000`, { stdio: "inherit", shell: true });
if (r.status === 0) console.log("✔ out/miniature.jpg");
process.exit(r.status ?? 1);
