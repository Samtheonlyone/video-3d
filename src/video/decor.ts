// @ts-nocheck
// Le décor 3D : baie d'Alger au lever du jour, la flotte française, la barque d'Ali, le port, les ruelles de la Casbah, la place.
// Règles : décor plein et vivant (trois plans), pas trop sombre, rien ne traverse rien, personne à moins de 1,5 m de la caméra.
import { THREE, canvasTex, glowTex, smokeTex } from "../kit/gfx";
import { mkFlat, gait, blend, POSES, blinkAt } from "../kit/perso";
import { perso3d } from "../kit/perso3d";
import { hash, smooth, clamp01, lerp, seg, easeOut } from "../kit/outils";
import type { Cam } from "../kit/camera";
import { mat, boite, objet as add, sprite } from "../kit/formes";
import { EV, ADV, SHIP0, SOL, alt, wv, heros, yamina, hamid, foule, mule, messager, garde, leadPos, rame } from "./chrono";
import { parle } from "./lignes";
import { ASSETS, tex, pbr } from "../kit/assets";

// photos CC0 (Poly Haven) et ciel HDRI réel : chargés avant la première image
const jeu = (nom: string, f: string) => ({ [nom + "_diff"]: `assets/${f}_diff.jpg`, [nom + "_nor"]: `assets/${f}_nor_gl.jpg`, [nom + "_rough"]: `assets/${f}_rough.jpg` });
export const FICHIERS: Record<string, string> = { hdr: "assets/ciel.hdr", ciel: "assets/ciel.jpg", eau: "assets/eau_normal.jpg", perso_test: "assets/perso_test.glb", femme: "assets/femme.glb", matt: "assets/matt.glb", soldier_male: "assets/soldier_male.glb", knight_male: "assets/knight_male.glb",
  ...jeu("stuc", "white_stucco"), ...jeu("argile", "clay_plaster"), ...jeu("pave", "cobblestone_floor_04"), ...jeu("dalles", "seaworn_stone_tiles"), ...jeu("bois", "brown_planks_05") };
const V2 = (x: number, y = x) => new THREE.Vector2(x, y);

// ------------------------------------------------------------ textures dessinées
const cielTex = () => canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); [[0, "#3f78bd"], [0.3, "#6f9fd0"], [0.45, "#e9c598"], [0.5, "#e6d2b6"], [0.56, "#d9cdbd"], [1, "#d9cdbd"]].forEach(([k, c]) => gr.addColorStop(k, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const merTex = (rep: number) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#2f89a6"; g.fillRect(0, 0, w, h); for (let i = 0; i < 240; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "10,50,70"},${0.05 + 0.12 * hash(i * 3)})`; g.fillRect(hash(i * 7) * w, hash(i * 11) * h, 10 + 30 * hash(i * 5), 1.5 + 1.5 * hash(i * 13)); } }, [rep, rep]);
const dallesTex = () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#c2b7a2"; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "70,55,35"},${0.04 + 0.06 * hash(i * 3)})`; g.fillRect(hash(i * 7) * w, hash(i * 11) * h, 6, 6); } g.strokeStyle = "rgba(60,45,30,.35)"; g.lineWidth = 2; for (let k = 0; k <= 256; k += 64) { g.beginPath(); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.stroke(); } }, [120, 90]);
const paveTex = () => canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#a89c86"; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "230,220,200" : "60,45,30"},${0.18 + 0.2 * hash(i * 3)})`; g.beginPath(); g.ellipse(hash(i * 7) * w, hash(i * 11) * h, 9 + 6 * hash(i), 6 + 4 * hash(i * 2), hash(i), 0, 7); g.fill(); } }, [3, 30]);
const murTex = (seed: number) => canvasTex(256, 512, (g, w, h) => {
  const R = (k: number) => hash(seed * 31 + k);
  g.fillStyle = ["#f1ebdd", "#ede4d0", "#f3eee2", "#e9dcc2"][seed % 4]; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 420; i++) { g.fillStyle = `rgba(${R(i) > 0.5 ? "130,108,84" : "255,255,255"},${0.025 + 0.05 * R(i * 3)})`; g.fillRect(R(i * 7) * w, R(i * 11) * h, 26 * R(i * 5), 18 * R(i * 2)); }
  for (let i = 0; i < 7; i++) { const x = R(i * 17 + 5) * w, gr = g.createLinearGradient(0, 0, 0, h * 0.55); gr.addColorStop(0, "rgba(80,60,40,.0)"); gr.addColorStop(1, "rgba(80,60,40,.0)"); g.fillStyle = "rgba(80,62,44,.07)"; g.fillRect(x, 40, 5 + 9 * R(i), 120 + 160 * R(i * 3)); } // coulures
  const gr2 = g.createLinearGradient(0, h - 120, 0, h); gr2.addColorStop(0, "rgba(90,70,50,0)"); gr2.addColorStop(1, "rgba(90,70,50,.34)"); g.fillStyle = gr2; g.fillRect(0, h - 120, w, 120); // saleté au pied du mur
  g.fillStyle = "rgba(70,55,40,.35)"; g.fillRect(0, h - 22, w, 22); // soubassement
  // porte cintrée en bois cloutée
  const dx = 88, dw = 80, dh = 150, dy = h - 22 - dh, col = ["#2f6b8a", "#6a4a2c", "#2a7a6a", "#7a3a2a"][seed % 4];
  g.fillStyle = "#c9bca2"; g.beginPath(); g.moveTo(dx - 8, h - 22); g.lineTo(dx - 8, dy + 30); g.arc(dx + dw / 2, dy + 30, dw / 2 + 8, Math.PI, 0); g.lineTo(dx + dw + 8, h - 22); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(dx, h - 22); g.lineTo(dx, dy + 30); g.arc(dx + dw / 2, dy + 30, dw / 2, Math.PI, 0); g.lineTo(dx + dw, h - 22); g.fill();
  g.fillStyle = "rgba(0,0,0,.32)"; for (let k = 1; k < 5; k++) g.fillRect(dx + k * 16, dy, 2, dh); g.fillStyle = "rgba(20,15,10,.55)"; for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) { g.beginPath(); g.arc(dx + 8 + c * 20, dy + 40 + r * 18, 2, 0, 7); g.fill(); }
  g.fillStyle = "#26211b"; g.beginPath(); g.arc(dx + dw / 2 + 12, dy + 90, 5, 0, 7); g.fill();
  // fenêtres d'étage cintrées : grille de fer ou volets de bois, un volet entrouvert
  [[22, 60], [168, 60], [22, 230], [168, 230]].forEach(([x, y], i) => {
    const ww = 64, wh = 92, open = R(i + 40) > 0.55;
    g.fillStyle = "#d4c7ad"; g.beginPath(); g.moveTo(x - 6, y + wh + 8); g.lineTo(x - 6, y + 26); g.arc(x + ww / 2, y + 26, ww / 2 + 6, Math.PI, 0); g.lineTo(x + ww + 6, y + wh + 8); g.fill();
    g.fillStyle = "#1c1814"; g.beginPath(); g.moveTo(x, y + wh); g.lineTo(x, y + 26); g.arc(x + ww / 2, y + 26, ww / 2, Math.PI, 0); g.lineTo(x + ww, y + wh); g.fill();
    if (open) { g.strokeStyle = "#30261b"; g.lineWidth = 3; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 16, y + 4); g.lineTo(x + k * 16, y + wh); g.stroke(); } g.beginPath(); g.moveTo(x, y + 56); g.lineTo(x + ww, y + 56); g.stroke(); }
    else { g.fillStyle = col; g.fillRect(x + 2, y + 26, ww / 2 - 3, wh - 26); g.fillRect(x + ww / 2 + 1, y + 26, ww / 2 - 3, wh - 26); g.fillStyle = "rgba(0,0,0,.35)"; for (let k = 0; k < 8; k++) { g.fillRect(x + 2, y + 32 + k * 9, ww / 2 - 3, 2); g.fillRect(x + ww / 2 + 1, y + 32 + k * 9, ww / 2 - 3, 2); } }
    g.fillStyle = "#5a4630"; g.fillRect(x - 10, y + wh, ww + 20, 6); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x - 10, y + wh + 6, ww + 20, 5); // appui et ombre
  });
  g.fillStyle = "#6a4a2c"; g.fillRect(0, 22, w, 12); g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(0, 34, w, 6); // poutre de corniche
}, [1, 1]);
const planchesTex = () => canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#cdb27c"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(70,45,20,.4)"; for (let k = 0; k < 64; k += 16) g.fillRect(0, k, w, 2); });
const rayuresTex = (c: string) => canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#f4efe3"; g.fillRect(0, 0, w, h); g.fillStyle = c; for (let k = 0; k < 64; k += 16) g.fillRect(k, 0, 8, h); }, [3, 1]);

const COUL_BARQUES = ["#2c6e9b", "#b8322a", "#e8e4dc", "#3a8a6a", "#d8a02a", "#6a4a8a"];

export function creerMonde(renderer: any) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#d2cdbe", 95, 2700); // brume chaude plus dense (look GTA : hazy) : le lointain se voile, perspective aérienne marquée
  const dmy = new THREE.Object3D();
  const matrice = (im: any, i: number, px: number, py: number, pz: number, sx: number, sy: number, sz: number, rz = 0) => { dmy.position.set(px, py, pz); dmy.rotation.set(0, 0, rz); dmy.scale.set(sx, sy, sz); dmy.updateMatrix(); im.setMatrixAt(i, dmy.matrix); };
  const inst = (g: any, m: any, n: number, dyn = false) => { const im = new THREE.InstancedMesh(g, m, n); im.castShadow = !dyn; im.receiveShadow = true; if (dyn) im.frustumCulled = false; scene.add(im); return im; };

  // ------------------------------------------------------------ ciel, soleil bas, nuages
  { const ciel = new THREE.Mesh(new THREE.SphereGeometry(4300, 64, 32), new THREE.MeshBasicMaterial({ map: ASSETS.ciel, side: THREE.BackSide, fog: false })); ciel.rotation.y = 0.69; scene.add(ciel); } // vrai ciel photo, soleil aligné sur la lumière
  { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(ASSETS.hdr).texture; pm.dispose(); } // éclairage d'ambiance et reflets réels
  const hemi = new THREE.HemisphereLight("#cfe0f2", "#a89070", 0.4); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffd79e", 2.9); sun.castShadow = true; // soleil doré rasant (contre-jour chaud, signature GTA) sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 300 }); sun.shadow.bias = -0.0006; scene.add(sun); scene.add(sun.target);

  // ------------------------------------------------------------ la mer : vagues autour du port, grande nappe au loin
  const merM = new THREE.MeshStandardMaterial({ color: "#1b5a72", normalMap: tex("eau", 12, 12), normalScale: V2(0.55), roughness: 0.05, metalness: 0, emissive: "#0b3a4c", emissiveIntensity: 0.2 });
  const mer = new THREE.Mesh(new THREE.PlaneGeometry(260, 260, 90, 90).rotateX(-Math.PI / 2), merM); mer.position.set(0, 0, -85); mer.receiveShadow = true; scene.add(mer);
  const merBase = Float32Array.from(mer.geometry.attributes.position.array);
  const merLoin = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#1b5a72", normalMap: tex("eau", 420, 420), normalScale: V2(0.4), roughness: 0.07, emissive: "#0b3a4c", emissiveIntensity: 0.2 })); merLoin.position.y = -0.35; scene.add(merLoin);
  // collines lointaines autour de la baie
  const colline = mat("#9aa38a", 1);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = 3400, c = add(scene, new THREE.SphereGeometry(1, 16, 10), colline, Math.sin(a) * r, -10, Math.cos(a) * r, false); c.scale.set(600 + 200 * hash(i), 70 + 70 * hash(i * 3), 400); }

  // ------------------------------------------------------------ la flotte (140 navires : coques, mâts, voiles carrées), elle avance avec ADV(t)
  const NS = 140;
  const nav = Array.from({ length: NS }, (_, i) => i === 0 ? { x: SHIP0[0], z: SHIP0[2], L: 36, s: 1.5 } : { x: -380 + (i % 14) * 58 + 40 * hash(i * 3), z: -540 - Math.floor(i / 14) * 70 - 30 * hash(i * 5), L: 28 + 14 * hash(i * 7), s: 1.0 + 0.4 * hash(i) });
  // coque galbée : étroite à la proue et à la poupe, plus fine en bas, château arrière relevé
  const coqueG = (() => { const g = new THREE.BoxGeometry(1, 1, 1, 4, 3, 12), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = Math.abs(2 * z); p.setX(i, x * (1 - 0.8 * Math.pow(u, 2.4)) * (0.55 + 0.45 * (y + 0.5))); p.setY(i, y + (y > 0 ? 0.35 * Math.pow(Math.max(0, -2 * z), 2) : 0)); } g.computeVertexNormals(); return g; })();
  const coques = inst(coqueG, mat("#3b2a1e", 1, { normalMap: tex("bois_nor", 1, 4), roughnessMap: tex("bois_rough", 1, 4) }), NS, true);
  const mats = inst(new THREE.CylinderGeometry(0.5, 0.5, 1, 6), mat("#4a3a2a", 0.9), NS * 3, true);
  // voiles gonflées par le vent (vers l'avant, +Z)
  const voileG = (() => { const g = new THREE.PlaneGeometry(1, 1, 10, 8), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 2.6 * (1 - 4 * x * x) * (0.55 + 0.45 * (0.5 - y))); } g.computeVertexNormals(); return g; })();
  const voiles = inst(voileG, new THREE.MeshStandardMaterial({ color: "#e6dcc4", roughness: 0.95, side: THREE.DoubleSide, emissive: "#f3ead6", emissiveIntensity: 0.1 }), NS * 6, true);
  const sabords = canvasTex(256, 32, (g, w, h) => { g.fillStyle = "#c9a04a"; g.fillRect(0, 0, w, h); g.fillStyle = "#16120e"; for (let x = 6; x < w; x += 18) g.fillRect(x, 8, 10, 16); }, [3, 1]); // rangée de sabords (canons)
  const bandes = inst(coqueG, mat("#ffffff", 0.8, { map: sabords }), NS, true);
  const bouche = sprite(glowTex(), "#ffd49a", true); scene.add(bouche);
  const fumeeCanon = Array.from({ length: 6 }, (_, i) => { const s = sprite(smokeTex(i + 400), "#f0e8dc", false, 0); scene.add(s); return s; });

  // ------------------------------------------------------------ éclaboussures (obus qui tombent) et débris de la barque de Hamid
  const mkEclab = () => ({ col: Array.from({ length: 16 }, (_, k) => { const s = sprite(smokeTex(k + 200), "#eaf6fa", false, 0); scene.add(s); return s; }), mousse: (() => { const s = sprite(smokeTex(321), "#ffffff", false, 0); scene.add(s); return s; })() });
  const E1 = mkEclab(), E2 = mkEclab();
  const eclab = (E: any, x: number, z: number, t0: number, t: number, H: number) => {
    const a = t - t0;
    E.col.forEach((s: any, k: number) => {
      if (a < 0 || a > 3.2) { s.material.opacity = 0; return; }
      const u = k / 15, rise = easeOut(a / 0.45), fall = smooth(0.8, 2.2, a);
      s.position.set(x + (hash(k) - 0.5) * 1.5 * (1 + a), 0.8 + H * u * rise * (1 - 0.85 * fall) + 0.5 * hash(k * 5), z + (hash(k * 3) - 0.5) * 1.5 * (1 + a));
      s.scale.setScalar((2.2 + 2.4 * (1 - u) + 1.2 * a) * (0.4 + 0.6 * rise)); s.material.opacity = 0.85 * smooth(0, 0.1, a) * (1 - smooth(1.3, 2.8, a));
    });
    E.mousse.position.set(x, 0.6, z); E.mousse.scale.set(10 + 14 * easeOut(a / 1.2), 5, 1); E.mousse.material.opacity = a < 0 || a > 4 ? 0 : 0.7 * smooth(0, 0.1, a) * (1 - smooth(1.5, 4, a));
  };
  const planches = inst(new THREE.BoxGeometry(1, 0.08, 0.2), mat("#7a5a3a", 0.8), 14, true);

  // ------------------------------------------------------------ barques
  const mkBarque = (col: string, len = 4.6, voile = true, vcol = "#f0e6cf") => {
    const g = new THREE.Group(), c = mat(col, 0.9, { normalMap: tex("bois_nor", 1, 2), roughnessMap: tex("bois_rough", 1, 2) }), inn = pbr("bois", 1, 3), trim = mat("#9a7448", 0.85, { normalMap: tex("bois_nor", 2, 0.4), roughnessMap: tex("bois_rough", 2, 0.4) });
    boite(g, 1.3, 0.55, len, c, 0, 0.27, 0); boite(g, 1.05, 0.1, len - 0.2, inn, 0, 0.58, 0);
    [-1, 1].forEach((s) => boite(g, 0.1, 0.2, len, trim, s * 0.6, 0.68, 0));
    const proue = add(g, new THREE.ConeGeometry(0.65, 1.1, 4), c, 0, 0.3, -len / 2 - 0.45); proue.rotation.x = -Math.PI / 2; proue.scale.z = 0.45;
    if (voile) { add(g, new THREE.CylinderGeometry(0.05, 0.07, 3.6, 6), mat("#4a3a2a"), 0, 2.2, -0.6); const sh = new THREE.Shape(); sh.moveTo(-1.4, 0); sh.lineTo(1.6, 0); sh.lineTo(-0.9, 3.6); sh.closePath(); const v = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: vcol, roughness: 1, side: THREE.DoubleSide, emissive: "#6b6252", emissiveIntensity: 0.3 })); v.rotation.y = Math.PI / 2; v.position.set(0.04, 0.9, -0.5); v.castShadow = true; g.add(v); }
    return g;
  };
  // la barque d'Ali : bout vers +Z, sièges, rames
  const BA = new THREE.Group(); scene.add(BA); const barqueAli = mkBarque("#2c6e9b", 4.6, false); barqueAli.rotation.y = Math.PI; BA.add(barqueAli);
  [0, -1.85, 1.55].forEach((z) => boite(barqueAli, 1.05, 0.07, 0.34, pbr("bois", 1, 0.35), 0, 0.72, z));
  const rames = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.62, 0.82, 0.3); barqueAli.add(p); const sh = add(p, new THREE.CylinderGeometry(0.035, 0.035, 3, 6), mat("#9a7a4a", 0.7), s * 0.9, 0, 0); sh.rotation.z = Math.PI / 2; add(p, new THREE.BoxGeometry(0.55, 0.03, 0.15), mat("#c9a15a", 0.7), s * 2.3, 0, 0); return { p, s }; });
  // la barque de Hamid (touchée à 10,4 s)
  const BH = new THREE.Group(); scene.add(BH); BH.add(mkBarque("#b8322a", 4.0, true, "#f4ecd6"));
  // barques amarrées, barques qui fuient vers le quai
  const amarrees = [[-16, 15, 0.5], [-26, 8, 2.0], [-34, 21, 1.1], [16, 19, -0.4], [27, 10, 0.8], [38, 20, 2.5], [-48, 14, 0.3], [48, 12, -0.9], [-60, 22, 1.6], [58, 22, 0.2]].map(([x, z, r], i) => { const g = mkBarque(COUL_BARQUES[i % 6], 3.8 + hash(i), i % 3 !== 0, i % 2 ? "#f0e6cf" : "#e8d6b0"); g.rotation.y = r; g.userData = { x, z }; scene.add(g); return g; });
  const fuyardes = [[-20, -14, 3.0], [22, -22, 4.5], [-34, -30, 6.0], [40, -8, 5.0], [-8, -40, 7.0]].map(([x, z, t0], i) => { const g = mkBarque(COUL_BARQUES[(i + 2) % 6], 4.0, true, "#f0e6cf"); g.rotation.y = Math.PI; g.userData = { x, z, t0 }; scene.add(g); return g; });

  // ------------------------------------------------------------ le quai, le môle, le fort, le phare
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(1000, 640).rotateX(-Math.PI / 2), pbr("dalles", 330, 210)); sol.position.set(0, SOL, 348); sol.receiveShadow = true; scene.add(sol);
  const pierre = mat("#9a8e7a", 0.95), clair = mat("#d6ccb8", 0.9);
  boite(scene, 1000, 8, 1.2, pierre, 0, SOL - 4, 28.6); boite(scene, 1000, 0.25, 0.9, clair, 0, SOL + 0.1, 28.55, false);
  boite(scene, 8, 2.4, 92, pierre, 62, 0.5, -18); boite(scene, 6.4, 0.2, 92, clair, 62, 1.78, -18, false); // le môle
  add(scene, new THREE.CylinderGeometry(2.4, 3.0, 17, 16), mat("#efe9dc"), 62, 10, -62); add(scene, new THREE.CylinderGeometry(2.0, 2.0, 2.4, 12), new THREE.MeshStandardMaterial({ color: "#ffe9a8", emissive: "#ffc860", emissiveIntensity: 0.8 }), 62, 19.4, -62); add(scene, new THREE.ConeGeometry(2.6, 2.4, 12), mat("#8a3a2a"), 62, 21.8, -62);
  boite(scene, 14, 6, 12, mat("#e6dcc4"), 62, 4, -48);
  // le fort à gauche : murs, créneaux, canons
  boite(scene, 52, 9, 20, mat("#cdbf9f", 0.95), -66, SOL + 4.5, 42); [...Array(20).keys()].forEach((i) => boite(scene, 1.6, 1.4, 1.6, mat("#cdbf9f"), -91 + i * 2.6, SOL + 9.7, 31.5));
  [-80, -70, -60, -50].forEach((x) => { const c = add(scene, new THREE.CylinderGeometry(0.28, 0.34, 3.2, 10), mat("#2a2a2e", 0.5), x, SOL + 8.6, 30.4); c.rotation.x = Math.PI / 2; });
  // bollards et cordages, caisses, tonneaux, jarres, nappes de filets
  for (let i = 0; i < 22; i++) add(scene, new THREE.CylinderGeometry(0.22, 0.28, 0.7, 10), mat("#2a2a2e", 0.5), -66 + i * 6.2, SOL + 0.55, 29.4);
  const caisses = inst(new THREE.BoxGeometry(1, 1, 1), mat("#9a7a4a", 0.9), 70), tonneaux = inst(new THREE.CylinderGeometry(0.45, 0.45, 0.95, 12), mat("#6a4a2c", 0.9), 40), jarres = inst(new THREE.SphereGeometry(0.4, 12, 10), mat("#b8602a", 0.8), 36);
  const hors = (x: number) => (Math.abs(x) < 4.6 ? x + Math.sign(x || 1) * 5 : x);
  for (let i = 0; i < 70; i++) { const s = 0.7 + 0.5 * hash(i), x = hors((hash(i * 3) - 0.5) * 120), z = 31 + 20 * hash(i * 7), h = i % 4 === 0 ? 2 : 1; matrice(caisses, i, x, SOL + s * 0.5 * h, z, s, s * h, s, hash(i) * 0.5); }
  for (let i = 0; i < 40; i++) matrice(tonneaux, i, hors((hash(i * 11) - 0.5) * 110), SOL + 0.48, 31 + 18 * hash(i * 5), 1, 1, 1);
  for (let i = 0; i < 36; i++) matrice(jarres, i, hors((hash(i * 13) - 0.5) * 100), SOL + 0.4, 31 + 18 * hash(i * 9), 0.9 + 0.3 * hash(i), 1.2, 0.9 + 0.3 * hash(i));
  for (let i = 0; i < 10; i++) { const n = boite(scene, 3 + 2 * hash(i), 0.12, 2 + hash(i * 3), mat(i % 2 ? "#5a4a34" : "#7a6a4a", 1), hors((hash(i * 17) - 0.5) * 90), SOL + 0.08, 32 + 14 * hash(i * 19), false); n.rotation.y = hash(i); }
  // étals à toile rayée et palmiers sur le quai (jamais dans l'axe d'Ali)
  [[-10, 42, "#c8402a"], [-24, 38, "#2a6aa8"], [-34, 46, "#c8402a"], [11, 40, "#2a6aa8"], [24, 44, "#c8402a"], [35, 38, "#2a6aa8"]].forEach(([x, z, c], i) => { const g = new THREE.Group(); g.position.set(x, SOL, z); scene.add(g); [[-1.4, -1], [1.4, -1], [-1.4, 1], [1.4, 1]].forEach(([dx, dz]) => boite(g, 0.1, 2.4, 0.1, mat("#5a3a22"), dx, 1.2, dz)); const toit = boite(g, 3.4, 0.08, 2.6, new THREE.MeshStandardMaterial({ map: rayuresTex(c), roughness: 1 }), 0, 2.5, 0); toit.rotation.x = 0.12; boite(g, 2.6, 0.8, 1.0, mat("#9a7a4a"), 0, 0.5, 0.6); [0, 1, 2].forEach((k) => add(g, new THREE.SphereGeometry(0.2, 8, 6), mat(["#e07a1a", "#c8302a", "#e8c030"][(k + i) % 3], 0.7), -0.8 + k * 0.8, 1.05, 0.5)); });
  for (let i = 0; i < 9; i++) { const x = hors((hash(i * 5) - 0.5) * 110), z = 34 + 22 * hash(i * 7), g = new THREE.Group(); g.position.set(x, SOL, z); scene.add(g); const tr = add(g, new THREE.CylinderGeometry(0.2, 0.3, 7 + 2 * hash(i), 8), mat("#7a5a3a"), 0, 3.6, 0); tr.rotation.z = 0.08; for (let k = 0; k < 8; k++) { const f = boite(g, 0.3, 0.04, 3.2, mat("#3f7a34", 0.9), 0, 7.6, 0, false); f.rotation.set(0.5, (k / 8) * Math.PI * 2, 0); f.position.set(Math.sin((k / 8) * Math.PI * 2) * 1.2, 7.4, Math.cos((k / 8) * Math.PI * 2) * 1.2); f.rotation.x = 0; f.rotation.z = 0; f.rotation.y = (k / 8) * Math.PI * 2; f.rotation.x = -0.45; } }

  // ------------------------------------------------------------ la ville blanche : façade du port, ruelle de la Casbah, place, colline
  const crepi = (rx = 2, ry = 2) => ({ normalMap: tex("stuc_nor", rx, ry), roughnessMap: tex("stuc_rough", rx, ry), normalScale: V2(1.1) }); // relief du crépi chaulé
  const facades = [0, 1, 2, 3, 4, 5].map((s) => new THREE.MeshStandardMaterial({ map: murTex(s), roughness: 1, ...crepi(1.5, 3) })), blanc = mat("#efe9dc", 1, crepi()), ocre = mat("#e0d0b0", 1, { ...crepi(), map: tex("argile_diff", 2, 2), color: "#f2e2c2" }), sable = mat("#d8c8aa", 1, crepi());
  // front de mer : rangée de maisons le long du quai (sauf la porte de la ruelle)
  for (let x = -160; x < 160; x += 10) { if (Math.abs(x) < 4) continue; const h = 5.5 + 5 * hash(x * 0.37 + 3), m = [blanc, ocre, sable][Math.floor(hash(x * 3 + 1) * 3)], fa = facades[Math.abs(Math.round(x / 10)) % 6]; const b = new THREE.Mesh(new THREE.BoxGeometry(9.2, h, 9), [m, m, m, m, m, fa]); b.position.set(x + 4.6 * 0, SOL + h / 2, 57 + 3 * hash(x)); b.castShadow = b.receiveShadow = true; scene.add(b); boite(scene, 9.4, 0.5, 9.2, mat("#d8ccb4"), x, SOL + h + 0.25, 57 + 3 * hash(x), false); }
  // ruelle : deux files de maisons (étage visible avec porte et fenêtres à claustra), balcons de bois, deux passages couverts, porte du port
  const sureleve = [];
  for (const cote of [-1, 1]) for (let j = 0; j < 12; j++) {
    const zc = 54 + 4 * j, a = alt(zc), hh = zc < 76 ? 3.4 + 2 * hash(j * 3 + cote) : 5 + 3 * hash(j * 3 + cote), x = cote * 5.4;
    boite(scene, 6, a + 0.2, 3.9, blanc, x, (a + 0.2) / 2 - 0.1, zc, false);
    const m = [blanc, blanc, ocre, blanc, blanc, blanc]; m[cote < 0 ? 0 : 1] = facades[(j + (cote > 0 ? 3 : 0)) % 6];
    const b = new THREE.Mesh(new THREE.BoxGeometry(6, hh + 0.6, 3.9), m); b.position.set(x, a - 0.6 + (hh + 0.6) / 2, zc); b.castShadow = b.receiveShadow = true; scene.add(b);
    boite(scene, 0.42, 0.12, 3.0, mat("#6a4a2c"), cote * 2.2, a + 2.8, zc, false); boite(scene, 0.4, 0.5, 0.08, mat("#6a4a2c"), cote * 2.2, a + 3.1, zc - 1.4, false);
  }
  [[52, 0], [60, 1], [79, 2]].forEach(([z, k]) => { const a = alt(z); boite(scene, 4.8, 1.6, 3.2, k === 0 ? mat("#e6dcc4") : blanc, 0, a + 3.9, z); boite(scene, 0.5, 3.2, 3.2, blanc, -2.2, a + 2.0, z); boite(scene, 0.5, 3.2, 3.2, blanc, 2.2, a + 2.0, z); });
  const ruelle = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 52, 1, 52).rotateX(-Math.PI / 2), pbr("pave", 2.4, 26)); ruelle.position.set(0, 0, 76);
  { const p = ruelle.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, alt(p.getZ(i) + 76) + 0.03); p.needsUpdate = true; ruelle.geometry.computeVertexNormals(); } ruelle.receiveShadow = true; scene.add(ruelle);
  // charrette renversée dans la ruelle (z = 66) : Ali et Yamina sautent par-dessus
  { const g = new THREE.Group(); g.position.set(0, SOL, 66); scene.add(g); const lit = boite(g, 3.2, 0.14, 1.5, mat("#7a5a3a"), -0.7, 0.45, 0); lit.rotation.z = 0.16; [-2.1, 0.7].forEach((x, i) => { const r = add(g, new THREE.CylinderGeometry(0.46, 0.46, 0.08, 14), mat("#4a3622"), x, 0.55 + 0.1 * i, 0.82); r.rotation.x = Math.PI / 2; }); boite(g, 2.4, 0.08, 0.1, mat("#5a4028"), -2.4, 0.5, -0.4); [[-1.8, 0.2, -0.9], [-0.4, 0.2, 0.9], [0.5, 0.15, 0.2]].forEach(([x, y, z], i) => { const c = boite(g, 0.6, 0.45, 0.6, mat("#9a7a4a"), x, y + 0.15, z); c.rotation.y = i; }); }
  // détails de vie : tonneaux, caisses, sacs, linge qui sèche, lanternes, auvents (ruelle et quai)
  { const bois = mat("#6b4a2a", 1), cerc = mat("#2a2118", 1), toile = [mat("#b8402e", 1), mat("#2f6f8a", 1), mat("#d8b050", 1), mat("#e8e0cc", 1)], sac = mat("#c8b48a", 1);
    for (let j = 0; j < 12; j++) for (const cote of [-1, 1]) {
      const zc = 54 + 4 * j, a = alt(zc), r = hash(j * 13 + cote * 5), x = cote * 2.05;
      if (r < 0.3) { const ton = add(scene, new THREE.CylinderGeometry(0.3, 0.27, 0.62, 14), bois, x, a + 0.31, zc + 1.0 * (r - 0.15), true); add(scene, new THREE.TorusGeometry(0.29, 0.015, 6, 16), cerc, x, a + 0.45, zc + 1.0 * (r - 0.15), false).rotation.x = Math.PI / 2; }
      else if (r < 0.55) { const c = boite(scene, 0.55, 0.5, 0.55, mat("#8a6a3e", 1), x, a + 0.28, zc + 0.5, true); c.rotation.y = r * 6; if (r < 0.42) boite(scene, 0.45, 0.4, 0.45, mat("#9a7a4a", 1), x, a + 0.7, zc + 0.5, true).rotation.y = r * 3; }
      else if (r < 0.7) { const s2 = add(scene, new THREE.SphereGeometry(0.28, 10, 8), sac, x, a + 0.2, zc, true); s2.scale.set(1, 0.7, 0.8); }
      if (r > 0.45 && j > 1) { const w = 3.9, c = toile[Math.floor(hash(j * 7 + cote) * 4)]; const ln = boite(scene, 0.015, 0.015, w, mat("#3a3228", 1), cote * 2.35, a + 3.3, zc, false); ln.rotation.z = 0; for (let k = 0; k < 4; k++) { const pc = boite(scene, 0.03, 0.5 + 0.2 * hash(k + j), 0.45, toile[(k + j) % 4], cote * 2.35, a + 3.0, zc - 1.4 + k * 0.85, false); pc.rotation.x = 0.05 * Math.sin(k + j); } }
      if (r > 0.2 && r < 0.5) { const aw = boite(scene, 1.1, 0.06, 2.2, toile[(j + 1) % 4], cote * 2.0, a + 2.55, zc, true); aw.rotation.z = -cote * 0.18; }
      if (r > 0.6) { add(scene, new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: "#f4c874", emissive: "#f4a844", emissiveIntensity: 1.1 }), cote * 2.25, a + 2.6, zc - 1.2, false); }
    }
    for (let x = -150; x < 150; x += 7) { if (Math.abs(x) < 6) continue; const q = hash(x * 1.7 + 9); if (q < 0.45) { const ton = add(scene, new THREE.CylinderGeometry(0.34, 0.3, 0.7, 14), bois, x, SOL + 0.35, 52.8, true); } else if (q < 0.75) { const c = boite(scene, 0.8, 0.6, 0.8, mat("#8a6a3e", 1), x, SOL + 0.32, 52.8, true); c.rotation.y = q * 5; boite(scene, 0.6, 0.5, 0.6, mat("#9a7a4a", 1), x + 0.1, SOL + 0.85, 52.8, true); } else { const s2 = add(scene, new THREE.SphereGeometry(0.4, 10, 8), sac, x, SOL + 0.28, 52.8, true); s2.scale.set(1, 0.7, 0.8); } }
  }
  // la place (9,2 m de haut) : sol, parapet, fontaine, bâtiments autour, citronniers
  boite(scene, 32, 9.2, 34, mat("#c8bca6", 0.95), 0, 4.6, 115); boite(scene, 32, 0.12, 34, pbr("dalles", 11, 12), 0, 9.26, 115, false);
  [[-9.2, 13.6], [9.2, 13.6]].forEach(([x, w]) => boite(scene, w, 1.0, 0.5, blanc, x, 9.7, 98.3));
  add(scene, new THREE.CylinderGeometry(1.7, 1.9, 0.6, 20), mat("#cfc6b2"), 0, 9.5, 114); add(scene, new THREE.CylinderGeometry(1.5, 1.5, 0.12, 20), new THREE.MeshStandardMaterial({ color: "#4aa0b8", roughness: 0.15 }), 0, 9.74, 114); add(scene, new THREE.CylinderGeometry(0.2, 0.3, 2.0, 10), mat("#cfc6b2"), 0, 10.4, 114);
  [[-8, 106], [8, 124], [-9, 126]].forEach(([x, z], i) => { add(scene, new THREE.CylinderGeometry(0.15, 0.2, 2, 8), mat("#5a4030"), x, 10.2, z); add(scene, new THREE.IcosahedronGeometry(1.5, 1), mat(["#4a7a34", "#3f6a2c", "#558a3c"][i], 1), x, 12.2, z); });
  [[-19, 115, 6, 34, 0], [19, 115, 6, 34, 1], [0, 134.5, 40, 5, 2]].forEach(([x, z, w, d, k], i) => { const h = 9 + 4 * hash(i * 7); const m = [blanc, blanc, blanc, blanc, blanc, blanc]; boite(scene, w, h, d, blanc, x, 9.2 + h / 2, z); [0, 1].forEach((q) => boite(scene, w * 0.98, 1.2, d * 0.98, mat("#d8c8aa"), x, 9.2 + h - 0.6 + q * 0, z, false)); });
  // mosquée et minaret (point de repère visible depuis la mer et depuis le quai)
  boite(scene, 14, 7, 14, mat("#f4efe3"), -30, SOL + 3.5, 74); add(scene, new THREE.SphereGeometry(4.6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat("#eee8da"), -30, SOL + 7, 74); add(scene, new THREE.CylinderGeometry(0.9, 1.1, 24, 12), mat("#f4efe3"), -38, SOL + 12, 70); add(scene, new THREE.CylinderGeometry(1.5, 1.5, 0.4, 12), mat("#cfc6b2"), -38, SOL + 18, 70); add(scene, new THREE.ConeGeometry(1.1, 3.2, 12), mat("#2f7a52"), -38, SOL + 26.6, 70);
  // lignes de maisons de part et d'autre (toits plats bas près de la ruelle pour garder la vue sur la baie depuis la place)
  const cubes = [mat("#f1ebdd", 0.95), mat("#e6dcc6", 0.95), mat("#ddcdae", 0.95)].map((m) => inst(new THREE.BoxGeometry(1, 1, 1), m, 190));
  const cpt = [0, 0, 0];
  const poser = (k: number, x: number, y: number, z: number, w: number, h: number, d: number) => { if (cpt[k] < 190) matrice(cubes[k], cpt[k]++, x, y + h / 2, z, w, h, d); };
  for (let i = 0; i < 160; i++) { const side = i % 2 ? 1 : -1, x = side * (10 + 90 * hash(i * 3)), z = 66 + 34 * hash(i * 7), h = 3 + 2.4 * hash(i * 5), w = 6 + 4 * hash(i * 9); poser(i % 3, x, SOL - 0.2, z, w, h, 6 + 3 * hash(i * 11)); }
  // la colline couverte de cubes blancs, de plus en plus haute (amphithéâtre d'Alger)
  const hillY = (z: number) => SOL + 0.34 * Math.max(0, z - 104);
  const terr = new THREE.Mesh(new THREE.PlaneGeometry(1400, 420, 4, 80).rotateX(-Math.PI / 2), mat("#d6c9b0", 1)); terr.position.set(0, 0, 314); { const p = terr.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, hillY(p.getZ(i) + 314) - 0.5); p.needsUpdate = true; terr.geometry.computeVertexNormals(); } terr.receiveShadow = true; scene.add(terr);
  for (let i = 0; i < 520; i++) { const z = 104 + 400 * hash(i * 3 + 1), x = (hash(i * 5 + 2) - 0.5) * (240 + 1.4 * z), w = 8 + 9 * hash(i * 7), h = 5 + 9 * hash(i * 11) + 0.03 * (z - 104); poser(i % 3, x, hillY(z) - 0.8, z, w, h, 8 + 8 * hash(i * 13)); }
  cubes.forEach((c, k) => { c.count = cpt[k]; c.instanceMatrix.needsUpdate = true; });
  // la citadelle au sommet
  boite(scene, 60, 22, 34, mat("#e0d4b8", 0.95), -60, hillY(430) + 8, 430); boite(scene, 10, 38, 10, mat("#e8dcc2", 0.95), -30, hillY(430) + 15, 430);

  // ------------------------------------------------------------ vie : oiseaux, foule lointaine, mule
  const mouettes = inst(new THREE.BoxGeometry(0.9, 0.05, 0.28), new THREE.MeshBasicMaterial({ color: "#f4f1ea" }), 26, true);
  const NC = 36, foules = [0, 1, 2].map((k) => inst(new THREE.CapsuleGeometry(0.2, 0.85, 4, 8), new THREE.MeshLambertMaterial({ color: ["#e8e0cc", "#3a5a8a", "#8a9a5a"][k], emissive: ["#e8e0cc", "#3a5a8a", "#8a9a5a"][k], emissiveIntensity: 0.25 }), NC / 3, true));
  const cible = (i: number) => { const x = (i % 2 ? 1 : -1) * (4.6 + 22 * hash(i * 5)); return [x, 49.5]; };
  const mulet = (() => { const g = new THREE.Group(); scene.add(g); const c = mat("#7a5a40", 0.9); boite(g, 0.55, 0.62, 1.5, c, 0, 1.0, 0); const tete = boite(g, 0.26, 0.34, 0.75, c, 0, 1.28, -0.95); tete.rotation.x = 0.5; [-1, 1].forEach((s) => boite(g, 0.06, 0.28, 0.1, c, s * 0.1, 1.55, -1.2)); boite(g, 0.1, 0.1, 0.5, c, 0, 1.05, 0.95).rotation.x = -0.6; const pattes = [[-0.2, -0.55], [0.2, -0.55], [-0.2, 0.55], [0.2, 0.55]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, 0.72, z); g.add(p); add(p, new THREE.CylinderGeometry(0.06, 0.05, 0.72, 6), c, 0, -0.36, 0); return p; }); boite(g, 0.9, 0.18, 1.0, mat("#b8322a", 0.9), 0, 1.38, 0.1); return { g, pattes }; })();

  // ------------------------------------------------------------ personnages
  const yaminaP = mkFlat(scene, { skin: "#c89a6e", hair: "#1a1008", hairStyle: "long", female: true, kid: true, shirt: "#a8432e", shirt2: "#a8432e", pants: "#e3d5b8", shoes: "#5a3e26", scale: 0.72, scarf: "#2a5a6a" });
  const yamina3d = perso3d(scene, "femme", { ech: 0.5, offsetYaw: 3.14159, calePieds: false }); // PROTOTYPE : Yamina = vraie humaine Casual_Female (matériaux natifs), clips Idle/Walk/Run/SitDown
  const hamid3d = perso3d(scene, "matt", { ech: 1.06, offsetYaw: 3.14159, calePieds: false }); // Hamid 3D (sur terre)
  const garde3d = perso3d(scene, "soldier_male", { ech: 0.53, offsetYaw: 3.14159, calePieds: false }); // le garde 3D
  const mess3d = perso3d(scene, "knight_male", { ech: 0.49, offsetYaw: 3.14159, calePieds: false }); // le messager 3D // ESSAI : vrai modèle 3D riggé à la place de Yamina (~1,5 m)
  const hamidP = mkFlat(scene, { skin: "#b8845a", hair: "#2a1a10", beard: true, stubble: true, wrinkle: true, shirt: "#b8322a", pants: "#e8e0d0", hat: "#f2ede0" });
  const gardeP = mkFlat(scene, { skin: "#b88a62", hair: "#1a1008", beard: true, shirt: "#7e2620", pants: "#e3dccb", hat: "#b8302a", build: 1.1 });
  const messP = mkFlat(scene, { skin: "#c89a6e", hair: "#1a1008", stubble: true, shirt: "#d9c8a0", pants: "#7a6a50", hat: "#f2ede0" });
  const fouleP = [
    mkFlat(scene, { skin: "#d8a888", hair: "#2a1a10", hairStyle: "long", female: true, shirt: "#f2efe8", pants: "#f2efe8", scarf: "#e8e4dc" }),
    mkFlat(scene, { skin: "#b8845a", hair: "#1a1008", beard: true, shirt: "#3a5a8a", pants: "#e8e0d0", hat: "#e8e0d0" }),
    mkFlat(scene, { skin: "#d0a07a", hair: "#2a1a10", hairStyle: "bun", female: true, shirt: "#e8e4dc", pants: "#d8d0c0" }),
    mkFlat(scene, { skin: "#a87a52", hair: "#2a2a2a", stubble: true, shirt: "#7a8a4a", pants: "#c8b890", hat: "#f2ede0" }),
  ];
  const poser2 = (p: any, x: number, y: number, z: number, fac: number, J: any) => { p.root.position.set(x, y, z); p.fac = fac; p.pose(J); };
  const sortie = (t: number, t0: number) => smooth(t0, t0 + 0.5, t);

  return {
    scene,
    update(t: number, cam: any, c: Cam) {
      const H = heros(t);
      sun.position.set(H.x + 30, 78, H.z - 92); sun.target.position.set(H.x, 0, H.z); // soleil bas du matin, il suit Ali (ombres nettes)
      // la mer bouge, la texture glisse
      { const p = mer.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, wv(merBase[i * 3], merBase[i * 3 + 2] - 85, t)); p.needsUpdate = true; mer.geometry.computeVertexNormals(); merM.normalMap.offset.set(t * 0.006, t * 0.012); }
      // la flotte
      for (let i = 0; i < NS; i++) {
        const S = nav[i], z = S.z + ADV(t), s = S.s, L = S.L, bob = 0.8 * Math.sin(t * 0.7 + i), roll = 0.03 * Math.sin(t * 0.6 + i * 1.7);
        matrice(coques, i, S.x, 2.2 * s + bob, z, 9 * s, 5.5 * s, L * s, roll); matrice(bandes, i, S.x, 3.4 * s + bob, z, 9.1 * s, 0.7 * s, L * s * 0.9, roll);
        for (let k = 0; k < 3; k++) { const zk = z + (k - 1) * 0.3 * L * s; matrice(mats, i * 3 + k, S.x, 20 * s + bob, zk, 1.1 * s, 38 * s, 1.1 * s, roll); matrice(voiles, i * 6 + k * 2, S.x, 17 * s + bob, zk + 0.8, 22 * s, 15 * s, 1, roll); matrice(voiles, i * 6 + k * 2 + 1, S.x, 33 * s + bob, zk + 0.8, 15 * s, 11 * s, 1, roll); }
      }
      [coques, mats, voiles, bandes].forEach((m) => { m.instanceMatrix.needsUpdate = true; });
      // coup de canon du navire de tête
      { const a = t - EV.canon, L0 = leadPos(t); bouche.visible = a > 0 && a < 0.25; bouche.position.set(L0[0] - 2, 6, L0[2] + 17); bouche.scale.setScalar(150 * Math.max(0, 1 - a / 0.25) + 1);
        fumeeCanon.forEach((s, i) => { s.position.set(L0[0] - 6 + 3 * i, 7 + a * 3 + i, L0[2] + 18 + 2 * i); s.scale.setScalar(24 + a * 30 + i * 4); s.material.opacity = a < 0 ? 0 : 0.8 * smooth(0, 0.15, a) * (1 - smooth(2, 5, a)); }); }
      eclab(E1, 6, -18, EV.choc, t, 17); eclab(E2, 5.5, 12, EV.obus2, t, 11);
      // la barque de Hamid se retourne ; ses planches volent
      { const a = t - EV.obus2, flip = smooth(0, 0.9, a), couler = smooth(0.5, 3, a); BH.position.set(5.5, wv(5.5, 12, t) * 0.7 - 0.55 * flip - 0.3 * couler, 12); BH.rotation.set(0.15 * Math.sin(t * 1.3) * (1 - flip), 0.3, Math.PI * flip + 0.06 * Math.sin(t * 1.7));
        for (let i = 0; i < 14; i++) { const v = [(hash(i) - 0.5) * 9, 6 + 5 * hash(i * 3), (hash(i * 5) - 0.5) * 9], u = clamp01(a), tl = Math.min(Math.max(a, 0), 1.6); dmy.position.set(5.5 + v[0] * tl, Math.max(0.1, 0.8 + v[1] * tl - 4.9 * tl * tl), 12 + v[2] * tl); dmy.rotation.set(a * 3 + i, a * 2, i); dmy.scale.setScalar(a > 0 ? 1 + hash(i * 7) * 1.5 : 0); dmy.updateMatrix(); planches.setMatrixAt(i, dmy.matrix); } planches.instanceMatrix.needsUpdate = true; }
      // barques amarrées et barques qui fuient
      amarrees.forEach((g, i) => { const { x, z } = g.userData; g.position.set(x, wv(x, z, t) * 0.7, z); g.rotation.z = 0.04 * Math.sin(t * 1.2 + i); g.rotation.x = 0.03 * Math.sin(t * 0.9 + i * 2); });
      fuyardes.forEach((g, i) => { const { x, z, t0 } = g.userData, k = Math.max(0, t - t0), zz = Math.min(z + 2.4 * k, 24), xx = x * (1 - smooth(0, 30, k) * 0.8); g.position.set(xx, wv(xx, zz, t) * 0.7, zz); g.rotation.z = 0.04 * Math.sin(t * 1.5 + i); });
      // la barque d'Ali : suit son trajet, tangue, les rames brassent
      { const r = rame(t); BA.position.set(H.x, wv(H.x, H.z, t) * 0.7 - 0.05, Math.min(H.z, 24.2) + 0.15); BA.rotation.z = 0.035 * Math.sin(t * 1.6) + 0.02 * Math.sin(t * 3.1); BA.rotation.x = 0.02 * Math.sin(t * 1.2 + 1);
        const ph = (H.dist / 1.6) * Math.PI; rames.forEach(({ p, s }) => { p.rotation.y = r * 0.5 * Math.sin(ph) * (s > 0 ? 1 : 1); p.rotation.z = -s * (0.05 + 0.3 * r * (0.6 + 0.4 * Math.cos(ph))); }); BA.visible = t < EV.accoste + 3; }
      // mouettes : tournent au-dessus du port, s'envolent au premier obus
      for (let i = 0; i < 26; i++) { const a = t * 0.35 + i * 0.7, fuite = Math.max(0, t - EV.choc + 0.2) * 9 * (i % 3 + 1); dmy.position.set(-10 + 36 * Math.sin(a) + 4 * hash(i), 16 + 10 * hash(i * 3) + 1.5 * Math.sin(t * 3 + i) + fuite * 0.3, 22 + 20 * Math.cos(a * 0.9) + fuite * 0.5); dmy.rotation.set(0, a, 0.6 * Math.sin(t * 9 + i)); dmy.scale.set(1, 1, 1); dmy.updateMatrix(); mouettes.setMatrixAt(i, dmy.matrix); }
      mouettes.instanceMatrix.needsUpdate = true;
      // foule lointaine : s'agite sur le quai, puis se groupe devant les maisons
      { const nb = [0, 0, 0]; for (let i = 0; i < NC; i++) { const k = i % 3, x0 = (i % 2 ? 1 : -1) * (6 + 38 * hash(i * 3 + 7)), z0 = 31 + 16 * hash(i * 9), [xc, zc] = cible(i), q = smooth(10, 30, t), x = lerp(x0, xc, q) + 3 * Math.sin(t * 0.8 + i) * (1 - q), z = lerp(z0, zc, q) + 3 * Math.cos(t * 0.7 + i * 2) * (1 - q), y = SOL + 0.75 + 0.07 * Math.abs(Math.sin(t * 9 + i)); matrice(foules[k], nb[k]++, hors(x), y, z, 1, 1, 1); } foules.forEach((f) => { f.instanceMatrix.needsUpdate = true; }); }
      { const M = mule(t), on = smooth(24.6, 25.2, t); mulet.g.visible = t > 24.6; mulet.g.position.set(M.x, SOL, M.z); mulet.g.rotation.y = M.fac; mulet.pattes.forEach((p, i) => { p.rotation.x = 0.7 * Math.sin(M.dist * 3.4 + (i % 2) * Math.PI + (i > 1 ? 0.8 : 0)) * on; }); }

      // ------------------------------------------------------------ personnages
      { const Y = yamina(t), barque = 1 - smooth(24.9, 25.4, t), pont = lerp(SOL, 0.58 + wv(Y.x, Y.z, t) * 0.6, barque), tombe = smooth(EV.chute, EV.chute + 0.4, t) * (1 - smooth(42.0, 42.6, t)), sj = Math.sin(Math.PI * seg(t, 32.9, 33.6));
        const J = gait(Y.mode, Y.dist, t, 1); blend(J, barque, POSES.assis); blend(J, barque, { a1: 0.9, e1: 0.9, a2: 0.9, e2: 0.9, lean: 0.1 }); blend(J, sj, { t1: 1.0, k1: 1.4, t2: 0.9, k2: 1.2, a1: 2.2, a2: 2.2 }); blend(J, tombe, { ...POSES.assis, lean: 0.35, a1: 0.9, e1: 0.4, a2: 0.7, e2: 0.6 });
        blend(J, smooth(42.6, 43.2, t) * (1 - smooth(50, 51, t)), { lean: 0.12, e1: 0.5, a1: 0.5 });
        const fac = barque > 0.5 ? 0 : t > EV.chute && t < 42.4 ? Math.atan2(-(H.x - Y.x), -(H.z - Y.z)) : t > 49.5 ? Math.atan2(-(H.x - Y.x), -(H.z - Y.z)) : Y.fac;
        poser2(yaminaP, Y.x, (barque > 0.5 ? pont : alt(Y.z)) + (barque > 0.5 ? 0 : 0.8 * sj), Y.z, fac, J); yaminaP.setFace(parle("yamina", t) ? "talkw" : t > EV.choc ? "scared" : "neutral", blinkAt(t, 0.3));
        const u3 = barque < 0.5; yaminaP.root.visible = !u3; yamina3d.holder.visible = u3; // 3D sur terre, à plat dans la barque (pas de clip assis)
        if (u3) yamina3d.set(t, Y.x, alt(Y.z), Y.z, fac, Y.mode === "run" ? 3.2 : Y.mode === "walk" ? 1.5 : 0); }
      { const Ha = hamid(t), dansEau = smooth(10.4, 11.1, t) * (1 - smooth(14.6, 15.4, t)), assis = smooth(15.2, 15.6, t) * (1 - smooth(25.4, 26.0, t)), quai = smooth(25.6, 26.6, t);
        const J = gait(Ha.mode, Ha.dist, t, 2); blend(J, assis, POSES.assis); blend(J, dansEau, { a1: 2.4 + 0.4 * Math.sin(t * 5), e1: 0.3, a2: 2.2 - 0.4 * Math.sin(t * 5), e2: 0.4 });
        const bas = t < EV.obus2 ? 0.58 + wv(5.5, 12, t) * 0.6 : 0.58 + wv(Ha.x, Ha.z, t) * 0.6, yb = t < 10.4 ? bas : lerp(bas, -1.05 + wv(Ha.x, Ha.z, t) * 0.5, dansEau), y = lerp(yb, SOL, quai) + (t > 10.4 && t < 11.2 ? 1.2 * Math.sin(Math.PI * seg(t, 10.4, 11.2)) : 0);
        const fac = t < 10.4 ? 0.4 : dansEau > 0.3 ? Math.atan2(-(H.x - Ha.x), -(H.z - Ha.z)) : assis > 0.5 ? (t > 17.2 && t < 21 ? 0 : Math.PI) : Ha.fac;
        poser2(hamidP, Ha.x, y + (t > 14.6 && t < 15.4 ? 0.4 * smooth(14.6, 15.4, t) : 0), Ha.z, fac, J); hamidP.setFace(parle("hamid", t) ? "talk" : t > EV.choc ? "scared" : "neutral", blinkAt(t, 0.6));
        const hu3 = quai > 0.5; hamidP.root.visible = !hu3; hamid3d.holder.visible = hu3; // 3D une fois sur le quai, à plat dans l'eau/la barque
        if (hu3) hamid3d.set(t, Ha.x, SOL, Ha.z, fac, Ha.mode === "run" ? 3.2 : Ha.mode === "walk" ? 1.5 : 0); }
      { const M = messager(t), J = gait(M.mode, M.dist, t, 3); blend(J, smooth(55.4, 55.8, t) * (1 - smooth(56.8, 57.2, t)), { a1: 2.2, e1: 0.4 }); const vis = t > 49 && M.z < 133; messP.root.visible = false; mess3d.holder.visible = vis; if (vis) mess3d.set(t, M.x, alt(M.z), M.z, M.fac, M.mode === "run" ? 3.2 : M.mode === "walk" ? 1.5 : 0); }
      { const G = garde(t), fac = G.mode === "stand" ? Math.atan2(-(H.x - G.x), -(H.z - G.z)) : G.fac, vis = t > 55; gardeP.root.visible = false; garde3d.holder.visible = vis; if (vis) garde3d.set(t, G.x, 9.25, G.z, fac, G.mode === "run" ? 3.2 : G.mode === "walk" ? 1.5 : 0); }
      fouleP.forEach((p, i) => { const F = foule[i](t), J = gait(F.mode, F.dist, t, 5 + i), vis = t > 24 && t < 62; p.root.visible = vis; poser2(p, F.x, alt(F.z) || SOL, F.z, F.fac, J); p.setFace(t > EV.choc ? "scared" : "neutral", blinkAt(t, i * 0.3)); });
      [yaminaP, hamidP, gardeP, messP, ...fouleP].forEach((p) => p.orient(c.yaw, p.fac));
    },
  };
}
