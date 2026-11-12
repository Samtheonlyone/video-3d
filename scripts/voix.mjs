// Génère une voix par réplique dans public/voix/<id>.wav, à partir de src/<video>/script.json.
// Le moteur se choisit dans voix.config.json : "voicebox" (gratuit, sur ton PC), "elevenlabs" (en ligne, clé API), ou "manuel" (tes propres fichiers).
// Usage : npm run voix              → génère les répliques qui n'ont pas encore de voix
//         npm run voix -- h2 z3     → (re)génère seulement ces répliques
//         npm run voix -- tout      → tout regénérer
import fs from "node:fs";
import path from "node:path";
import { lireJSON, SCRIPT_PATH, normaliser, sansCrochets, estChuchote } from "./outils.mjs";

if (!fs.existsSync("voix.config.json")) { console.log("✖ Il manque voix.config.json. Copie voix.config.exemple.json en voix.config.json et remplis-le."); process.exit(1); }
const C = lireJSON("voix.config.json"), S = lireJSON(SCRIPT_PATH);
const args = process.argv.slice(2), tout = args.includes("tout");
fs.mkdirSync("public/voix", { recursive: true }); fs.mkdirSync("out/voix_brutes", { recursive: true });
const aFaire = S.lignes.filter((l) => (args.length && !tout ? args.includes(l.id) : tout || !fs.existsSync(`public/voix/${l.id}.wav`)));
if (!aFaire.length) { console.log("Toutes les répliques ont déjà une voix. (npm run voix -- tout pour tout refaire)"); process.exit(0); }
console.log(`Moteur : ${C.moteur} — ${aFaire.length} réplique(s) à faire.`);

const enregistrer = async (rep, fichier) => { if (!rep.ok) throw new Error(`HTTP ${rep.status} : ${(await rep.text()).slice(0, 300)}`); fs.writeFileSync(fichier, Buffer.from(await rep.arrayBuffer())); };

async function voicebox(l) {
  const V = C.voicebox, profil = V.profils?.[l.voix];
  if (!profil) throw new Error(`pas de profil Voicebox pour « ${l.voix} » dans voix.config.json (voicebox.profils)`);
  const corps = { profile_id: profil, text: sansCrochets(l.dit), language: C.langue || "fr" };
  if (V.moteur_tts) corps.engine = V.moteur_tts;
  const brut = `out/voix_brutes/${l.id}.wav`;
  // /generate/stream attend la fin de la génération et renvoie directement le fichier WAV
  await enregistrer(await fetch(`${V.url || "http://127.0.0.1:17493"}/generate/stream`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) }), brut);
  return brut;
}
async function elevenlabs(l) {
  const E = C.elevenlabs, voix = E.voix?.[l.voix], cle = E.cle || process.env.ELEVENLABS_API_KEY;
  if (!cle) throw new Error("pas de clé ElevenLabs (elevenlabs.cle dans voix.config.json)");
  if (!voix) throw new Error(`pas de voix ElevenLabs pour « ${l.voix} » (elevenlabs.voix)`);
  const brut = `out/voix_brutes/${l.id}.mp3`;
  await enregistrer(await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voix}?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": cle, "Content-Type": "application/json" },
    body: JSON.stringify({ text: l.dit, model_id: E.modele || "eleven_v3" }), // le modèle v3 comprend les indications [crie], [chuchote]…
  }), brut);
  return brut;
}
function manuel(l) {
  const dossier = C.manuel?.dossier || "voix_brutes";
  const f = fs.existsSync(dossier) ? fs.readdirSync(dossier).find((n) => path.parse(n).name === l.id) : null;
  if (!f) throw new Error(`fichier ${dossier}/${l.id}.(wav|mp3|m4a) introuvable`);
  return path.join(dossier, f);
}

let ok = 0;
for (const l of aFaire) {
  process.stdout.write(`• ${l.id} (${l.voix}) « ${sansCrochets(l.dit)} » … `);
  try {
    const brut = C.moteur === "voicebox" ? await voicebox(l) : C.moteur === "elevenlabs" ? await elevenlabs(l) : manuel(l);
    await normaliser(brut, `public/voix/${l.id}.wav`, estChuchote(l.dit), { fx: l.fx, hauteur: l.hauteur });
    console.log("✔"); ok++;
  } catch (e) { console.log("✖ " + e.message); }
}
console.log(`\n${ok}/${aFaire.length} voix prêtes dans public/voix/. Étape suivante : npm run caler`);
