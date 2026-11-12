// Ouvre la planche d'images (out/planche.html) dans le navigateur, pour que l'utilisateur voie les images de contrôle.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ouvrir = (fichier) => {
  const f = path.resolve(fichier);
  const cmd = process.platform === "win32" ? `start "" "${f}"` : process.platform === "darwin" ? `open "${f}"` : `xdg-open "${f}"`;
  spawn(cmd, { shell: true, detached: true, stdio: "ignore" }).unref();
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync("out/planche.html")) { console.log("Pas encore de planche : lance d'abord npm run images -- <secondes>"); process.exit(1); }
  ouvrir("out/planche.html"); console.log("Planche ouverte dans le navigateur : out/planche.html");
}
