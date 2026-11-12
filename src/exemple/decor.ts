// @ts-nocheck
// Le décor 3D : la rue, les maisons, les voitures, les arbres, le ciel, la météorite, l'impact, le feu, les personnages.
// Règles : décor plein et vivant (jamais vide), pas trop sombre, pas de lumière blanche derrière une fenêtre,
// rien ne traverse rien, personne à moins de 1,5 m de la caméra.
import { THREE, canvasTex, glowTex, smokeTex, flameTex } from "../kit/gfx";
import { mkFlat, gait, blend, POSES, blinkAt } from "../kit/perso";
import { hash, smooth, clamp01, lerp, hit } from "../kit/outils";
import type { Cam } from "../kit/camera";
import { EV, IMPACT, meteorite, front, heros, zoe, maman, voisins } from "./chrono";
import { parle } from "./lignes";

import { mat, boite, objet as add, sprite, instances, ligneImmeubles } from "../kit/formes";

// ------------------------------------------------------------ textures dessinées
const routeTex = () => canvasTex(256, 1024, (g, w, h) => {
  g.fillStyle = "#3b3d42"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "0,0,0"},${0.04 + 0.05 * hash(i * 3)})`; g.fillRect(hash(i * 7) * w, hash(i * 11) * h, 2, 2); }
  g.fillStyle = "#e8e2c8"; for (let y = 0; y < h; y += 256) g.fillRect(w / 2 - 5, y + 40, 10, 140); // pointillés
  g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h);
}, [1, 30]);
const herbeTex = () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#5f8a3e"; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = hash(i) > 0.5 ? "#6f9a48" : "#4f7834"; g.fillRect(hash(i * 5) * w, hash(i * 9) * h, 2, 4); } }, [80, 80]);
const trottoirTex = () => canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#b9b4aa"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 2; for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, [1, 60]);
// façade : mur, fenêtres avec rideaux (pas de blanc pur), porte
const facadeTex = (mur: string, porte: string, seed: number) => canvasTex(512, 384, (g, w, h) => {
  g.fillStyle = mur; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${0.03 * hash(seed + i)})`; g.fillRect(hash(seed * 3 + i) * w, hash(seed * 5 + i) * h, 6, 6); }
  const fen = (x: number, y: number) => {
    g.fillStyle = "#ece6da"; g.fillRect(x - 6, y - 6, 92, 112);
    const gr = g.createLinearGradient(0, y, 0, y + 100); gr.addColorStop(0, "#5d7486"); gr.addColorStop(1, "#2c3a48"); g.fillStyle = gr; g.fillRect(x, y, 80, 100);
    g.fillStyle = hash(seed + x) > 0.5 ? "#c9a76e" : "#9a6a5a"; g.fillRect(x, y, 18, 100); g.fillRect(x + 62, y, 18, 100); // rideaux
    g.fillStyle = "#ece6da"; g.fillRect(x + 38, y, 4, 100); g.fillRect(x, y + 48, 80, 4);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x - 6, y + 106, 92, 6);
  };
  fen(50, 50); fen(220, 50); fen(380, 50); fen(50, 230); fen(380, 230);
  g.fillStyle = porte; g.fillRect(228, 220, 72, 164); g.fillStyle = "rgba(255,255,255,.15)"; g.fillRect(238, 232, 52, 60); g.fillStyle = "#d8c070"; g.beginPath(); g.arc(288, 310, 5, 0, 7); g.fill();
});
const cielTex = () => canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#3d6fae"); gr.addColorStop(0.45, "#86aed6"); gr.addColorStop(0.62, "#e9c9a4"); gr.addColorStop(1, "#c9b8a4"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

const MURS = ["#e8dcc4", "#d9c2a0", "#c9d2c4", "#e4cfc8", "#d6d0c0", "#cfc6b8"];
const TOITS = ["#7a3a2c", "#5a4a44", "#6a3428", "#4a4a50"];
const PORTES = ["#6a2a22", "#2a4a6a", "#3a5a3a", "#5a3a22"];

export function creerMonde(renderer: any) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#c9c4bc", 70, 420);
  // ciel
  const ciel = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), new THREE.MeshBasicMaterial({ map: cielTex(), side: THREE.BackSide, fog: false })); scene.add(ciel);
  // lumières : ciel + soleil de fin d'après-midi (ombres) ; la lueur du feu s'ajoute après l'impact
  const hemi = new THREE.HemisphereLight("#cfe0f2", "#6a5a48", 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffe2b8", 2.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 }); sun.shadow.bias = -0.0005; scene.add(sun); scene.add(sun.target);
  const lueurFeu = new THREE.PointLight("#ff7a2a", 0, 40, 1.6); scene.add(lueurFeu);
  const lueurImpact = new THREE.PointLight("#ffb060", 0, 260, 1.2); lueurImpact.position.set(IMPACT[0], 20, IMPACT[2]); scene.add(lueurImpact);

  // sol, route, trottoirs
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ map: herbeTex(), roughness: 1 })); sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
  const route = new THREE.Mesh(new THREE.PlaneGeometry(8, 300), new THREE.MeshStandardMaterial({ map: routeTex(), roughness: 0.95 })); route.rotation.x = -Math.PI / 2; route.position.set(0, 0.01, -20); route.receiveShadow = true; scene.add(route);
  const tm = new THREE.MeshStandardMaterial({ map: trottoirTex(), roughness: 0.95 });
  [-5.25, 5.25].forEach((x) => boite(scene, 2.5, 0.15, 300, tm, x, 0.075, -20));

  // maisons des deux côtés (façade vers la rue). La maison bleue de Maman est à droite, z = 42.
  const maisons: any[] = [];
  for (let i = 0; i < 40; i++) {
    const cote = i % 2 ? 1 : -1, z = -130 + Math.floor(i / 2) * 14 + (cote > 0 ? 5 : 0), estMaman = cote > 0 && Math.abs(z - 42) < 7;
    const w = 9 + 2 * hash(i), h = 6 + 1.5 * hash(i * 3), d = 8, x = cote * (11 + 1.5 * hash(i * 7));
    const mur = estMaman ? "#6f9cc8" : MURS[i % MURS.length];
    const fac = new THREE.MeshStandardMaterial({ map: facadeTex(mur, estMaman ? "#f4f0e6" : PORTES[i % 4], i + 1), roughness: 0.9 }), m = mat(mur);
    const mats = cote > 0 ? [m, fac, m, m, m, m] : [fac, m, m, m, m, m];
    const g = new THREE.Group(); scene.add(g); g.position.set(x, 0, estMaman ? 42 : z);
    const corps = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), mats); corps.position.y = h / 2; corps.castShadow = corps.receiveShadow = true; g.add(corps);
    const tm2 = mat(TOITS[i % 4]); [-1, 1].forEach((s) => { const r = boite(g, d * 0.62, 0.3, w + 0.6, tm2, s * d * 0.24, h + 1.4, 0); r.rotation.z = s * -0.62; });
    // clôture basse et haie devant chaque maison
    if (!estMaman) boite(scene, 0.4, 0.9, w * 0.8, mat("#4a6a34", 1), cote * 7.2, 0.45, z + 1.5);
    maisons.push({ g, x, z: estMaman ? 42 : z, h });
  }
  // arbres et lampadaires sur les trottoirs
  const tronc = mat("#5a4030"), feuilles = [mat("#4f7a34"), mat("#5d8a3c"), mat("#466e2e")];
  for (let i = 0; i < 22; i++) {
    const cote = i % 2 ? 1 : -1, z = -120 + i * 7.5 + 3 * hash(i), x = cote * 5.9;
    if (Math.abs(z - 41) < 4 && cote > 0) continue; // pas d'arbre devant la porte de Maman
    add(scene, new THREE.CylinderGeometry(0.14, 0.2, 2.6, 8), tronc, x, 1.3, z);
    add(scene, new THREE.IcosahedronGeometry(1.6 + 0.4 * hash(i * 3), 1), feuilles[i % 3], x, 3.4, z).scale.set(1, 1.15, 1);
    if (i % 3 === 0) { add(scene, new THREE.CylinderGeometry(0.06, 0.08, 5, 8), mat("#2a2c30", 0.5), -x * 1.0, 2.5, z + 3.5); add(scene, new THREE.BoxGeometry(0.5, 0.15, 0.3), mat("#2a2c30", 0.5), -x * 0.95, 5, z + 3.5); }
  }
  // voitures garées (jamais sur les trajets : x = ±3,4)
  const COUL = ["#b8322a", "#2a4e8a", "#e8e4dc", "#3a3e44", "#c9a43a", "#4a6a4a"], roue = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14), noir = mat("#18181a", 0.6), vitre = mat("#2a3440", 0.2);
  const voitures: any[] = [];
  for (let i = 0; i < 10; i++) {
    const cote = i % 2 ? 1 : -1, z = -105 + i * 13 + 4 * hash(i * 5); if (z > 28 && z < 46) continue;
    const g = new THREE.Group(); g.position.set(cote * 3.35, 0, z); scene.add(g); const c = mat(COUL[i % COUL.length], 0.4);
    boite(g, 1.75, 0.7, 4.2, c, 0, 0.62, 0); boite(g, 1.6, 0.6, 2.2, c, 0, 1.25, -0.2); boite(g, 1.62, 0.45, 2.0, vitre, 0, 1.28, -0.2);
    [[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]].forEach(([x, zz]) => { const r = add(g, roue, noir, x, 0.33, zz); r.rotation.z = Math.PI / 2; });
    voitures.push({ g, z });
  }

  // ------------------------------------------------------------ le fond : on ne doit jamais voir un horizon vide
  // 1) une deuxième rangée de maisons derrière les jardins, 2) la ville au loin des deux côtés et aux deux bouts de la rue,
  // 3) des collines à l'horizon, 4) des nuages. Le brouillard fond le tout dans la distance.
  for (let i = 0; i < 44; i++) {
    const cote = i % 2 ? 1 : -1, z = -150 + Math.floor(i / 2) * 15 + 6 * hash(i * 9), x = cote * (30 + 4 * hash(i * 4));
    const w = 8 + 3 * hash(i * 2), h = 5.5 + 2 * hash(i * 6), m = mat(MURS[(i + 3) % MURS.length]);
    boite(scene, 8, h, w, m, x, h / 2, z, false);
    const tm3 = mat(TOITS[(i + 1) % 4]); [-1, 1].forEach((s) => { const r = boite(scene, 5, 0.3, w + 0.6, tm3, x + s * 1.9, h + 1.3, z, false); r.rotation.z = s * -0.62; });
  }
  instances(scene, new THREE.IcosahedronGeometry(1, 1), mat("#4d7a36", 1), 70, (i, o) => { const cote = i % 2 ? 1 : -1; o.position.set(cote * (20 + 14 * hash(i * 3)), 3 + 1.5 * hash(i), -150 + i * 4.3); o.scale.set(2.2 + hash(i * 5), 2.6 + 1.2 * hash(i * 7), 2.2 + hash(i * 8)); });
  instances(scene, new THREE.CylinderGeometry(0.18, 0.25, 3, 6), mat("#5a4030"), 70, (i, o) => { const cote = i % 2 ? 1 : -1; o.position.set(cote * (20 + 14 * hash(i * 3)), 1.5, -150 + i * 4.3); });
  ligneImmeubles(scene, { de: -150, a: 150, fixe: -260, seed: 1 });                      // la ville au bout de la rue
  ligneImmeubles(scene, { de: -150, a: 150, fixe: 200, seed: 2, hMin: 14, hMax: 40 });  // et derrière nous
  ligneImmeubles(scene, { de: -240, a: 190, fixe: -75, axe: "z", seed: 3, hMin: 12, hMax: 34 });
  ligneImmeubles(scene, { de: -240, a: 190, fixe: 75, axe: "z", seed: 4, hMin: 12, hMax: 34 });
  const colline = mat("#8aa08a", 1);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = 520; const c = add(scene, new THREE.SphereGeometry(1, 16, 10), colline, Math.sin(a) * r, -6, Math.cos(a) * r, false); c.scale.set(200 + 80 * hash(i), 28 + 22 * hash(i * 3), 160); }
  const nuages = Array.from({ length: 16 }, (_, i) => { const s = sprite(smokeTex(i + 90), "#ffffff", false, 0.75); s.position.set(-300 + 600 * hash(i * 3), 140 + 60 * hash(i * 5), -500 + 700 * hash(i * 7)); s.scale.set(140 + 80 * hash(i), 50 + 20 * hash(i * 2), 1); scene.add(s); return s; });

  // ------------------------------------------------------------ les détails de la rue (ce qui rend un lieu crédible)
  // clôtures en piquets blancs, boîtes aux lettres, poubelles, poteaux électriques avec câbles, panneaux
  instances(scene, new THREE.BoxGeometry(0.08, 0.9, 0.08), mat("#ece8e0", 0.7), 360, (i, o) => { const cote = i % 2 ? 1 : -1, z = -135 + Math.floor(i / 2) * 1.5; if (cote > 0 && z > 37 && z < 47) { o.scale.set(0, 0, 0); return; } o.position.set(cote * 6.9, 0.45, z); });
  instances(scene, new THREE.BoxGeometry(0.06, 0.08, 270), mat("#ece8e0", 0.7), 2, (i, o) => o.position.set((i ? 1 : -1) * 6.9, 0.72, -135 + 135), true).visible = false;
  for (let i = 0; i < 18; i++) {
    const cote = i % 2 ? 1 : -1, z = -124 + Math.floor(i / 2) * 14 + 3.5 + (cote > 0 ? 5 : 0); if (cote > 0 && Math.abs(z - 42) < 6) continue;
    add(scene, new THREE.BoxGeometry(0.35, 0.3, 0.5), mat(["#2a4a7a", "#7a2a2a", "#2a5a3a"][i % 3], 0.5), cote * 6.4, 1.05, z); add(scene, new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), mat("#3a3a3a"), cote * 6.4, 0.45, z);
    add(scene, new THREE.CylinderGeometry(0.28, 0.24, 0.95, 12), mat(i % 2 ? "#2f5a3a" : "#3a3e44", 0.6), cote * 6.5, 0.48, z + 1.4);
  }
  const poteau = mat("#5a4a3a", 0.9), cable = new THREE.MeshBasicMaterial({ color: "#2a2a2a" });
  for (let i = 0; i < 10; i++) { const z = -130 + i * 30; add(scene, new THREE.CylinderGeometry(0.12, 0.16, 9, 8), poteau, -4.6, 4.5, z); add(scene, new THREE.BoxGeometry(1.6, 0.12, 0.12), poteau, -4.6, 8.6, z);
    if (i < 9) [-0.7, 0.7].forEach((dx) => { const c = add(scene, new THREE.CylinderGeometry(0.015, 0.015, 30, 4), cable, -4.6 + dx, 8.3, z + 15, false); c.rotation.x = Math.PI / 2; }); }
  const panneau = add(scene, new THREE.CircleGeometry(0.4, 20), new THREE.MeshStandardMaterial({ map: canvasTex(64, 64, (g) => { g.fillStyle = "#c8141c"; g.beginPath(); g.arc(32, 32, 31, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(32, 32, 24, 0, 7); g.fill(); g.fillStyle = "#111"; g.font = "bold 22px Arial"; g.textAlign = "center"; g.fillText("30", 32, 40); }) }), 4.6, 2.4, 10); panneau.rotation.y = 0;
  add(scene, new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), mat("#9a9a9a", 0.4), 4.6, 1.2, 10.05);
  // une voiture qui roule au loin et pile au moment du choc ; des oiseaux qui s'envolent
  const roulante = new THREE.Group(); scene.add(roulante); { const c = mat("#d8d4c8", 0.4); boite(roulante, 1.75, 0.7, 4.2, c, 0, 0.62, 0); boite(roulante, 1.6, 0.6, 2.2, c, 0, 1.25, 0.2); boite(roulante, 1.62, 0.45, 2.0, mat("#2a3440", 0.2), 0, 1.28, 0.2);
    [[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]].forEach(([x, zz]) => { const r = add(roulante, new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14), mat("#18181a", 0.6), x, 0.33, zz); r.rotation.z = Math.PI / 2; }); }
  const oiseaux = instances(scene, new THREE.BoxGeometry(0.5, 0.04, 0.15), new THREE.MeshBasicMaterial({ color: "#2a2a30" }), 24, () => {}, false);
  const dmyO = new THREE.Object3D();

  // ------------------------------------------------------------ la météorite
  const meteo = new THREE.Group(); scene.add(meteo);
  add(meteo, new THREE.IcosahedronGeometry(5, 1), new THREE.MeshBasicMaterial({ color: "#fff1c8", fog: false }), 0, 0, 0);
  const halo = sprite(glowTex(), "#ff9a3a", true); halo.scale.setScalar(80); meteo.add(halo);
  const trainee = Array.from({ length: 14 }, (_, i) => { const s = sprite(i % 2 ? glowTex() : smokeTex(i), i % 2 ? "#ff8a2a" : "#a89a90", i % 2 === 1, 0.8 - i * 0.05); scene.add(s); return s; });

  // ------------------------------------------------------------ impact : flash, boule de feu, colonne de fumée, débris
  const boule = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: "#ff7a22", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); boule.position.set(IMPACT[0], 0, IMPACT[2]); scene.add(boule);
  const flashS = sprite(glowTex(), "#fff2d8", true); flashS.position.set(IMPACT[0], 10, IMPACT[2]); scene.add(flashS);
  const fumees = Array.from({ length: 46 }, (_, i) => { const s = sprite(smokeTex(i + 3), "#5a504a", false, 0); scene.add(s); return s; });
  const debrisM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat("#3a3230"), 70); debrisM.castShadow = true; scene.add(debrisM);
  const dmy = new THREE.Object3D();
  // ------------------------------------------------------------ le front du feu (traverse la rue) + toits en feu près de l'impact
  const flammes = Array.from({ length: 30 }, (_, i) => { const s = sprite(flameTex(i + 1), "#ffffff", true, 0); scene.add(s); return s; });
  const fumeesFront = Array.from({ length: 18 }, (_, i) => { const s = sprite(smokeTex(i + 50), "#4a4440", false, 0); scene.add(s); return s; });
  const toitsFeu = maisons.filter((m) => m.z < -55).flatMap((m, j) => [0, 1, 2].map((k) => { const s = sprite(flameTex(j * 3 + k + 40), "#ffffff", true, 0); s.position.set(m.x + (k - 1) * 2.5, m.h + 1.5, m.z + (k - 1)); scene.add(s); return s; }));

  // ------------------------------------------------------------ personnages
  const zoeP = mkFlat(scene, { skin: "#f0caa8", hair: "#6a3a20", hairStyle: "pigtails", female: true, kid: true, shirt: "#f2c230", pants: "#3a4a6a", shoes: "#e8e4dc", scale: 0.74 });
  const mamanP = mkFlat(scene, { skin: "#e6b794", hair: "#4a2a18", hairStyle: "long", female: true, shirt: "#a8c8e8", pants: "#2a3040" });
  const voisinsP = [
    mkFlat(scene, { skin: "#c88a62", hair: "#1a1410", shirt: "#b8322a", pants: "#2a2e38", stubble: true }), // la veste rouge : le figurant qu'on suit des yeux
    mkFlat(scene, { skin: "#e8c0a0", hair: "#c8a060", hairStyle: "bun", female: true, shirt: "#5a7a4a", pants: "#3a3a40" }),
    mkFlat(scene, { skin: "#d8a888", hair: "#8a8884", shirt: "#e8e4dc", pants: "#4a4e58", glasses: true, wrinkle: true }),
  ];
  const place = (p, x, y, z, fac, J) => { p.root.position.set(x, y, z); p.fac = fac; p.pose(J); };

  return {
    scene,
    update(t: number, cam: any, c: Cam) {
      const H = heros(t);
      // soleil qui suit le héros (ombres nettes autour de lui)
      sun.position.set(H.x - 30, 45, H.z - 25); sun.target.position.set(H.x, 0, H.z - 6);
      // météorite
      const m = meteorite(t), vis = t < EV.impact; meteo.visible = vis; meteo.position.set(...m);
      const m2 = meteorite(t - 0.25), dir = [m[0] - m2[0], m[1] - m2[1], m[2] - m2[2]];
      trainee.forEach((s, i) => { s.visible = vis; const k = (i + 1) * 0.6; s.position.set(m[0] - dir[0] * k, m[1] - dir[1] * k, m[2] - dir[2] * k); s.scale.setScalar(26 + i * 7); });
      // impact
      const ti = t - EV.impact;
      boule.visible = ti > 0 && ti < 2.2; boule.scale.setScalar(2 + 34 * Math.pow(clamp01(ti / 0.7), 0.5)); boule.material.opacity = ti > 0 ? 0.7 * Math.max(0, 1 - ti / 2.2) : 0;
      flashS.visible = ti > 0 && ti < 1; flashS.scale.setScalar(140 * Math.max(0, 1 - ti / 0.6)); flashS.visible = ti > 0 && ti < 0.6;
      lueurImpact.intensity = ti > 0 ? 600 * (0.3 + 0.7 * Math.max(0, 1 - ti / 1.5)) : 0;
      fumees.forEach((s, i) => { const t0 = i * 0.11, a = ti - t0; if (a <= 0) { s.material.opacity = 0; return; }
        s.position.set(IMPACT[0] + (hash(i) - 0.5) * 30 + (hash(i * 3) - 0.5) * a * 2, 6 + a * (7 + 5 * hash(i * 5)), IMPACT[2] + (hash(i * 7) - 0.5) * 30);
        s.scale.setScalar(16 + a * 6); s.material.opacity = Math.min(0.85, a * 1.5); s.material.color.set(a < 1.2 ? "#8a5a3a" : "#4a4240"); });
      for (let i = 0; i < 70; i++) { // débris balistiques (déterministes : hash, pas de hasard)
        const v = [(hash(i) - 0.5) * 24, 10 + 14 * hash(i * 3), (hash(i * 5) - 0.35) * 22], a = Math.max(0, ti), tl = Math.min(a, (v[1] + Math.sqrt(v[1] * v[1])) / 9.8);
        const y = Math.max(0.2, v[1] * tl - 4.9 * tl * tl), s = ti > 0 ? 0.3 + 0.9 * hash(i * 9) : 0;
        dmy.position.set(IMPACT[0] + v[0] * tl, y, IMPACT[2] + v[2] * tl); dmy.rotation.set(a * 3 + i, a * 2, i); dmy.scale.setScalar(s); dmy.updateMatrix(); debrisM.setMatrixAt(i, dmy.matrix);
      }
      debrisM.instanceMatrix.needsUpdate = true;
      // le front du feu
      const fz = front(t), on = smooth(EV.impact + 0.3, EV.impact + 1.2, t);
      flammes.forEach((s, i) => { const x = -15 + (i / 29) * 30, fl = 0.85 + 0.15 * Math.sin(t * 9 + i * 1.7); s.position.set(x, 2.2 * fl, fz + (hash(i) - 0.5) * 3); s.scale.set(3.2 * fl, 6 * fl, 1); s.material.opacity = on; });
      fumeesFront.forEach((s, i) => { const x = -16 + (i / 17) * 32, a = (t * 0.6 + hash(i)) % 1; s.position.set(x, 5 + a * 10, fz - 2 - a * 4); s.scale.setScalar(9 + a * 8); s.material.opacity = 0.75 * on * (1 - a); });
      lueurFeu.position.set(0, 3, fz + 2); lueurFeu.intensity = 30 * on;
      toitsFeu.forEach((s, i) => { const fl = 0.8 + 0.2 * Math.sin(t * 8 + i); s.scale.set(4 * fl, 7 * fl, 1); s.material.opacity = smooth(EV.impact + 0.2, EV.impact + 1, t); });
      // la voiture au loin : roule vers nous, pile au choc
      { const tr = Math.min(t, EV.impact + 0.6), z = -150 + 12 * tr - (t > EV.impact ? 6 * Math.pow(Math.min(0.6, t - EV.impact), 2) : 0); roulante.position.set(-2, 0, Math.min(z, -112)); roulante.rotation.y = t > EV.impact ? 0.25 * smooth(EV.impact, EV.impact + 0.6, t) : 0; }
      // les oiseaux tournent au-dessus des toits, puis s'enfuient au choc
      for (let i = 0; i < 24; i++) { const a = t * 0.4 + i * 0.6, fuite = Math.max(0, t - EV.impact + 0.3) * 18;
        dmyO.position.set(-20 + 14 * Math.sin(a) + 3 * hash(i), 22 + 4 * hash(i * 3) + Math.sin(t * 3 + i) * 0.5 + fuite * 0.4, -40 + 10 * Math.cos(a) + fuite); dmyO.rotation.set(0, a, 0.5 * Math.sin(t * 14 + i));
        dmyO.updateMatrix(); oiseaux.setMatrixAt(i, dmyO.matrix); }
      oiseaux.instanceMatrix.needsUpdate = true;
      nuages.forEach((s, i) => { s.material.color.set("#ffffff").lerp(new THREE.Color("#7a5a4a"), smooth(EV.impact, EV.impact + 6, t)); });
      // le ciel et la brume s'assombrissent après l'impact
      const k = smooth(EV.impact, EV.impact + 5, t); scene.fog.color.set("#c9c4bc").lerp(new THREE.Color("#8a6a58"), k); hemi.intensity = 1.1 - 0.3 * k; sun.intensity = 2.4 - 0.8 * k;

      // personnages
      { const Z = zoe(t), tombe = smooth(EV.chute, EV.chute + 0.35, t), J = gait(Z.mode, Z.dist, t, 1);
        if (t < EV.impact) blend(J, 1, POSES.montre); // elle montre le ciel
        blend(J, tombe, { ...POSES.assis, lean: 0.35, a1: 0.9, e1: 0.4, a2: 0.7, e2: 0.6 });
        place(zoeP, Z.x, 0, Z.z, t < EV.chute ? Z.fac : Math.atan2(-(H.x - Z.x), -(H.z - Z.z)), J); zoeP.setFace(parle("zoe", t) ? (t > EV.impact ? "talkw" : "talk") : t > EV.impact ? "scared" : "neutral", blinkAt(t, 0.3)); }
      { const M = maman(t), J = gait(M.mode, M.dist, t, 2); blend(J, smooth(EV.maman + 0.2, EV.maman + 0.5, t), POSES.appelle);
        mamanP.root.visible = t > EV.maman - 0.6; place(mamanP, M.x, 0.15, M.z, t > EV.maman + 0.3 ? Math.atan2(-(H.x - M.x), -(H.z - M.z)) : M.fac, J); mamanP.setFace(parle("maman", t) ? "talk" : "scared", blinkAt(t, 0.6)); }
      voisinsP.forEach((p, i) => { const V = voisins[i](t), J = gait(V.mode, V.dist, t, 3 + i); const dk = smooth(EV.impact, EV.impact + 0.2, t) * (1 - smooth(EV.impact + 0.5, EV.impact + 0.8, t)); blend(J, dk, POSES.accroupi);
        place(p, V.x, 0.0, V.z, t < EV.impact + 0.5 ? 0 : V.fac, J); p.setFace(t > EV.impact ? "scared" : "neutral", blinkAt(t, i)); });
      // la tête dessinée se tourne toujours vers la caméra
      [zoeP, mamanP, ...voisinsP].forEach((p) => p.orient(c.yaw, p.fac));
    },
  };
}
