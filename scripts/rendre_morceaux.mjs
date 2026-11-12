// Rendu par morceaux (résiste aux plantages « Page crashed ») : images sans son par tranches, son à part, puis assemblage → out/video.mp4.
// Les morceaux déjà finis sont gardés : relancer reprend où ça s'est arrêté.
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { COMPO, ffmpeg } from "./outils.mjs";

const TOTAL = 2124, PAS = 150, D = "out/morceaux";
fs.mkdirSync(D, { recursive: true });
const run = (cmd) => spawnSync(cmd, { stdio: "inherit", shell: true }).status === 0;
const parts = [];
for (let a = 0; a < TOTAL; a += PAS) {
  const b = Math.min(a + PAS - 1, TOTAL - 1), f = `${D}/p${String(a).padStart(4, "0")}.mp4`; parts.push(f);
  if (fs.existsSync(f)) continue;
  let ok = false;
  for (let essai = 0; essai < 4 && !ok; essai++) ok = run(`npx remotion render src/index.ts ${COMPO} ${f} --gl=angle --codec h264 --crf 18 --muted --concurrency=1 --timeout 240000 --frames=${a}-${b}`);
  if (!ok) { console.log(`✖ morceau ${a}-${b} impossible`); process.exit(1); }
  console.log(`MORCEAU_OK ${a}-${b}`);
}
if (!fs.existsSync(`${D}/son.aac`) && !run(`npx remotion render src/index.ts ${COMPO} ${D}/son.aac --codec=aac`)) process.exit(1);
fs.writeFileSync(`${D}/liste.txt`, parts.map((p) => `file '${p.replace("out/morceaux/", "")}'`).join("\n"));
ffmpeg(["-f", "concat", "-safe", "0", "-i", `${D}/liste.txt`, "-i", `${D}/son.aac`, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "out/video.mp4"]);
console.log("✔ out/video.mp4");
