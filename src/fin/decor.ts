// @ts-nocheck
// « Et si la fin du monde arrivait comme dans le Coran ? » : une plage animée en plan fixe, qui subit les signes décrits par le Coran et les hadiths
// (soleil enroulé, montagnes comme de la laine cardée, séismes, feu, mers embrasées, Trompette). Aucune représentation du divin ni des prophètes.
// Même socle visuel que la vidéo d'Alger : ciel photo + éclairage HDRI, photos PBR (Poly Haven, CC0), normale d'eau, ombres du soleil, brume.
import { THREE, glowTex, smokeTex, flameTex } from "../kit/gfx";
import { mat, boite, objet, sprite } from "../kit/formes";
import { hash, smooth, seg, lerp, kick, clamp01 } from "../kit/outils";
import { ASSETS, tex, pbr } from "../kit/assets";
import type { Cam } from "../kit/camera";
import type { Effets } from "../kit/moteur";

export const DUR = 88;
export const FICHIERS: Record<string, string> = {
  hdr: "assets/ciel.hdr", ciel: "assets/ciel.jpg", eau: "assets/eau_normal.jpg",
  argile_diff: "assets/clay_plaster_diff.jpg", argile_nor: "assets/clay_plaster_nor_gl.jpg", argile_rough: "assets/clay_plaster_rough.jpg",
  bois_diff: "assets/brown_planks_05_diff.jpg", bois_nor: "assets/brown_planks_05_nor_gl.jpg", bois_rough: "assets/brown_planks_05_rough.jpg",
  stuc_diff: "assets/white_stucco_diff.jpg", stuc_nor: "assets/white_stucco_nor_gl.jpg", stuc_rough: "assets/white_stucco_rough.jpg",
};
// instants des signes (secondes)
export const T = {
  soleil: [10.8, 18.5], monts: [19.5, 25], seisme: 25.5, seismeFin: 41, feu: 42, mer: [50, 56], trompette: 57, blanc: [58, 62], noir: [84, 86],
} as const;

const COUL = ["#d94a3a", "#2f6fb5", "#f2c14e", "#3f9d6a", "#e8e0d0", "#b44aa0", "#f08a3c"];
const PEAU = ["#f1c49a", "#d9a57a", "#b07a52", "#8a5a3a", "#e8b890"];
const NP = 260, NPA = 70;

export const camera = (t: number): Cam => {
  const q = (kick(t, T.seisme, 1, 0.3) * smooth(T.seisme - 0.1, T.seisme + 0.4, t) + 0.55 * kick(t, 35.3, 1, 0.45) * smooth(35.2, 35.7, t) + 0.35 * kick(t, 44, 1, 0.4) * smooth(43.9, 44.3, t) + 0.5 * kick(t, T.trompette + 0.1, 1, 0.5) * smooth(T.trompette, T.trompette + 0.3, t));
  const s = Math.sin(t * 38) * q, c = Math.cos(t * 31) * q;
  const dolly = lerp(0, -3.5, seg(t, 0, 80));
  return { px: 0.9 * s, py: 14 + 0.7 * c, pz: 70 + dolly, yaw: 0.015 * s, pitch: -0.12 + 0.012 * c, roll: 0.02 * s, fov: 56 };
};

export const effets = (t: number): Effets => {
  const flash = Math.max(smooth(T.trompette + 0.2, T.trompette + 3.2, t) * (1 - smooth(66, 70, t)), 0);
  const sombre = smooth(T.soleil[0], T.soleil[1], t) * (1 - smooth(T.mer[0] - 4, T.mer[0] + 2, t));
  return {
    flash: flash * 0.96,
    exposition: lerp(1.05, 0.85, sombre) * lerp(1, 0.92, smooth(66, 78, t)),
    rouge: 0.4 * smooth(T.mer[0], T.mer[1], t) * (1 - smooth(T.trompette, T.trompette + 3, t)),
    chaud: 0.3 + 0.4 * smooth(T.mer[0], T.mer[1], t),
    poussiere: 0.22 * Math.max(0, Math.sin(Math.PI * seg(t, T.monts[0], T.monts[1] + 1))) + 0.18 * smooth(26, 31, t) * (1 - smooth(46, 50, t)) + 0.3 * smooth(68, 78, t),
    desat: 0.55 * smooth(66, 74, t),
    bloom: 0.42 + 0.6 * flash,
    vignette: 0.4 + 0.2 * smooth(66, 80, t),
    ca: 0.004 * kick(t, T.seisme, 1, 0.5),
  };
};

export function creerMonde(renderer: any) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#e3d2b4", 70, 1100);
  const dmy = new THREE.Object3D();
  const inst = (g: any, m: any, ombre = false) => { const im = new THREE.InstancedMesh(g, m, g.userData.n); im.frustumCulled = false; im.castShadow = ombre; im.receiveShadow = true; scene.add(im); return im; };
  const placer = (im: any, i: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { dmy.position.set(x, y, z); dmy.rotation.set(rx, ry, rz); dmy.scale.set(sx, sy, sz); dmy.updateMatrix(); im.setMatrixAt(i, dmy.matrix); };
  const G = (g: any, n: number) => { g.userData.n = n; return g; };

  // ---- ciel photo (comme à Alger) + éclairage d'ambiance HDRI + étoiles
  const cielM = new THREE.MeshBasicMaterial({ map: ASSETS.ciel, side: THREE.BackSide, fog: false });
  const ciel = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), cielM); ciel.rotation.y = 0.69 + Math.PI; scene.add(ciel);
  { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(ASSETS.hdr).texture; pm.dispose(); scene.environmentIntensity = 0.55; }
  const etoilesG = new THREE.BufferGeometry(), ep = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) { const a = hash(i) * Math.PI * 2, e = 0.12 + hash(i * 3) * 1.2; ep[i * 3] = Math.cos(a) * Math.cos(e) * 1400; ep[i * 3 + 1] = Math.sin(e) * 1400; ep[i * 3 + 2] = -Math.abs(Math.sin(a)) * Math.cos(e) * 1400 - 200; }
  etoilesG.setAttribute("position", new THREE.BufferAttribute(ep, 3));
  const etoilesM = new THREE.PointsMaterial({ color: "#fff6dc", size: 4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(etoilesG, etoilesM));
  // soleil bas : halo + disque, et lumière directionnelle avec ombres
  const dirSoleil = new THREE.Vector3(30, 14, -100).normalize();
  const soleilHalo = sprite(glowTex(), "#ffe6b0", true); soleilHalo.position.copy(dirSoleil).multiplyScalar(1300); scene.add(soleilHalo);
  const soleilDisque = sprite(glowTex(), "#fffaf0", true); soleilDisque.position.copy(dirSoleil).multiplyScalar(1290); scene.add(soleilDisque);
  const hemi = new THREE.HemisphereLight("#cfe0f2", "#a89070", 0.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffd79e", 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 40, bottom: -40, near: 1, far: 400 }); sun.shadow.bias = -0.0006;
  sun.target.position.set(0, 0, 10); sun.position.copy(dirSoleil).multiplyScalar(160).add(sun.target.position); scene.add(sun); scene.add(sun.target);

  // ---- sol : sable photo, mer à normale réelle
  const sable = new THREE.Mesh(new THREE.PlaneGeometry(400, 70).rotateX(-Math.PI / 2), pbr("argile", 50, 10, { color: "#ffeccb" })); sable.position.set(0, 0, 30); sable.receiveShadow = true; scene.add(sable);
  const merM = new THREE.MeshStandardMaterial({ color: "#1f7592", normalMap: tex("eau", 20, 16), normalScale: new THREE.Vector2(0.55, 0.55), roughness: 0.06, emissive: "#0a3a4c", emissiveIntensity: 0.12 });
  const mer = new THREE.Mesh(new THREE.PlaneGeometry(900, 700, 60, 60).rotateX(-Math.PI / 2), merM); mer.position.set(0, -0.05, -335); mer.receiveShadow = true; scene.add(mer);
  const merBase = Float32Array.from(mer.geometry.attributes.position.array);
  const ecume = new THREE.Mesh(new THREE.PlaneGeometry(260, 2.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.65 })); ecume.position.set(0, 0.02, -4.4); scene.add(ecume);
  const lueurMer = sprite(glowTex(), "#ff7a22", true, 0); lueurMer.scale.set(700, 90, 1); lueurMer.position.set(0, 6, -300); scene.add(lueurMer);

  // ---- falaise et colline au fond (les « montagnes »)
  const roche = (c: string) => pbr("stuc", 4, 4, { color: c });
  const falaise = objet(scene, new THREE.SphereGeometry(1, 28, 16), roche("#9aa86c"), -42, 0, -75); falaise.scale.set(34, 20, 30);
  const falaiseRoche = objet(scene, new THREE.SphereGeometry(1, 24, 14), roche("#d2bd96"), -30, 0, -66); falaiseRoche.scale.set(18, 13, 16);
  const colline = objet(scene, new THREE.SphereGeometry(1, 28, 16), roche("#b0b882"), 62, 0, -110); colline.scale.set(50, 16, 38);
  const montTous = [[falaise, 20], [falaiseRoche, 13], [colline, 16]]; const montCoul = montTous.map(([m]) => m.material.color.clone());

  // ---- jetée en bois (photo) + grande roue
  const boisM = pbr("bois", 1, 2);
  const jetee = []; for (let i = 0; i < 10; i++) jetee.push(boite(scene, 4.4, 0.5, 7, boisM, 14, 1.6, -9 - i * 7));
  const poteaux = inst(G(new THREE.CylinderGeometry(0.22, 0.22, 3, 6), 40), pbr("bois", 1, 1), true);
  for (let i = 0; i < 20; i++) { placer(poteaux, i * 2, 12.2, 0.1, -9 - i * 3.5); placer(poteaux, i * 2 + 1, 15.8, 0.1, -9 - i * 3.5); }
  const roue = new THREE.Group(); roue.position.set(14, 11, -80); scene.add(roue);
  { const m = mat("#e8e3d8", 0.6); roue.add(new THREE.Mesh(new THREE.TorusGeometry(9, 0.22, 8, 48), m)); roue.add(new THREE.Mesh(new THREE.TorusGeometry(5, 0.14, 6, 36), m));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 18, 0.12), m); sp.rotation.z = a; roue.add(sp); const g = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 1.3), mat(COUL[i % COUL.length], 0.6)); g.position.set(Math.cos(a) * 9, Math.sin(a) * 9, 0); g.userData.a = a; roue.add(g); }
    boite(roue, 1, 11, 1, m, -2.5, -5.5, 0); boite(roue, 1, 11, 1, m, 2.5, -5.5, 0); }
  const roueG = roue.children.filter((c) => c.userData.a !== undefined);

  // ---- promenade (garde-corps au premier plan) et palmiers
  boite(scene, 200, 1.1, 0.35, mat("#3a3f4a", 0.7), 0, 6.2, 56);
  for (let i = -14; i <= 14; i++) boite(scene, 0.25, 1.1, 0.25, mat("#2c303a", 0.8), i * 7, 5.6, 56);
  boite(scene, 200, 6, 4, pbr("stuc", 30, 2, { color: "#d9cfbc" }), 0, 3, 58);
  const palmes = [];
  const palmier = (x: number, z: number, h: number, s: number) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.32 * s, 0.55 * s, h, 8), pbr("bois", 1, 3, { color: "#b0906a" })); tr.position.y = h / 2; tr.castShadow = true; g.add(tr);
    for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.55 * s, 7 * s, 4).rotateZ(Math.PI / 2), mat("#3a8a3a", 0.9)); f.position.set(0, h, 0); const a = (i / 9) * Math.PI * 2; f.rotation.y = a; f.rotation.z = -0.5; f.translateX(3 * s); f.castShadow = true; g.add(f); }
    palmes.push(g); return g;
  };
  palmier(-20, 50, 11, 1.2); palmier(30, 46, 9, 1.05);

  // ---- parasols, serviettes
  const poteauP = inst(G(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 5), NPA), mat("#e8e0d0", 0.7), true);
  const toiles = inst(G(new THREE.ConeGeometry(1.35, 0.6, 10), NPA), new THREE.MeshStandardMaterial({ roughness: 0.8 }), true);
  const serv = inst(G(new THREE.BoxGeometry(1.8, 0.04, 0.8), NPA), new THREE.MeshStandardMaterial({ roughness: 1 }));
  const pp = Array.from({ length: NPA }, (_, i) => ({ x: -50 + hash(i * 3) * 100, z: -1 + hash(i * 7) * 50, c: COUL[i % COUL.length], f: 26 + hash(i * 11) * 7, tilt: (hash(i * 5) - 0.5) * 1.6 }));
  pp.forEach((p, i) => { toiles.setColorAt(i, new THREE.Color(p.c)); serv.setColorAt(i, new THREE.Color(COUL[(i * 3 + 2) % COUL.length])); });

  // ---- la foule : corps + têtes en instances
  const corps = inst(G(new THREE.CapsuleGeometry(0.3, 0.9, 3, 8), NP), new THREE.MeshStandardMaterial({ roughness: 0.9 }), true);
  const tetes = inst(G(new THREE.SphereGeometry(0.23, 10, 8), NP), new THREE.MeshStandardMaterial({ roughness: 0.9 }), true);
  const gens = Array.from({ length: NP }, (_, i) => ({ x: -52 + hash(i * 13) * 104, z: -3 + hash(i * 17) * 53, ox: (hash(i * 19) - 0.5) * 2, oz: (hash(i * 23) - 0.5) * 2, f: T.trompette + 1 + hash(i * 29) * 2.6, sx: (hash(i * 31) - 0.5) * 2, sz: (hash(i * 37) - 0.5) * 2, h: 0.85 + 0.25 * hash(i * 41) }));
  gens.forEach((p, i) => { corps.setColorAt(i, new THREE.Color(COUL[(i * 5) % COUL.length])); tetes.setColorAt(i, new THREE.Color(PEAU[i % PEAU.length])); });

  // ---- oiseaux
  const oiseaux = inst(G(new THREE.PlaneGeometry(1.6, 0.3), 50), new THREE.MeshBasicMaterial({ color: "#3a342e", side: THREE.DoubleSide }));

  // ---- fumée, flammes, poussière, fissures
  const poussiere = Array.from({ length: 22 }, (_, i) => { const s = sprite(smokeTex(i + 700), "#b89a72", false, 0); s.position.set(-42 + (hash(i) - 0.5) * 40, 0, -70 + (hash(i * 3) - 0.5) * 20); scene.add(s); return s; });
  const vapeur = Array.from({ length: 14 }, (_, i) => { const s = sprite(smokeTex(i + 900), "#f6e8d8", false, 0); s.position.set(-60 + i * 9, 0, -10 - hash(i) * 30); scene.add(s); return s; });
  const feux = Array.from({ length: 12 }, (_, i) => { const s = sprite(flameTex(i + 30), "#ffffff", false, 0); s.position.set(-40 + hash(i * 3) * 80, 0, 5 + hash(i * 7) * 42); scene.add(s); return s; });
  const fumees = Array.from({ length: 12 }, (_, i) => { const s = sprite(smokeTex(i + 1100), "#2a2420", false, 0); scene.add(s); return s; });
  const fissures = Array.from({ length: 14 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#2a1c10" })); m.position.set(-40 + hash(i * 3) * 80, 0.03, -2 + hash(i * 7) * 50); m.rotation.y = hash(i * 5) * 3; m.scale.set(1, 0.001, 1); scene.add(m); return m; });

  const cSky = new THREE.Color(), cB = new THREE.Color();
  const [S0, S1] = T.soleil, [M0, M1] = T.monts, [E0, E1] = T.mer, B0 = T.blanc[0], B1 = T.blanc[1];

  const update = (t: number) => {
    const sol = smooth(S0, S1, t), mons = smooth(M0, M1, t), mer_ = smooth(E0, E1, t), blanc = smooth(B0, B1, t), flashFin = smooth(T.trompette, T.trompette + 3, t);
    const apres = smooth(66, 78, t), seis = seg(t, T.seisme, T.seismeFin);
    // ciel + brume : jour doré → crépuscule violet → rougeoyant → gris poussiéreux
    cSky.setRGB(1, 1, 1).lerp(cB.set("#5a4e7c"), sol * 0.85).lerp(cB.set("#ff8a4a"), mer_ * 0.75 * (1 - flashFin)).lerp(cB.set("#7a6a5c"), apres * 0.8); cielM.color.copy(cSky);
    scene.fog.color.setRGB(0.89, 0.82, 0.71).lerp(cB.set("#5d4e6c"), sol * 0.75).lerp(cB.set("#d8602a"), mer_ * 0.55 * (1 - flashFin)).lerp(cB.set("#6a5c50"), apres * 0.85);
    etoilesM.opacity = smooth(S0 + 2, S1, t) * (1 - smooth(E0 - 2, E0 + 2, t)) * (1 - apres);
    // soleil enroulé : il rétrécit, rougit, s'éteint
    const sv = 1 - sol; soleilHalo.scale.setScalar(150 + 950 * sv); soleilHalo.material.opacity = 0.25 + 0.75 * sv; soleilHalo.material.color.set("#ffe6b0").lerp(cB.set("#a02a10"), sol);
    soleilDisque.scale.setScalar(40 + 300 * sv); soleilDisque.material.opacity = sv * (1 - blanc);
    sun.intensity = 2.6 * sv + 0.15; sun.color.set("#ffd79e").lerp(cB.set("#8a3a2a"), sol); hemi.intensity = 0.5 - 0.2 * sol + 0.5 * mer_ + 0.4 * blanc - 0.3 * apres; hemi.color.set("#cfe0f2").lerp(cB.set("#7a6aa8"), sol).lerp(cB.set("#ff9a5a"), mer_);
    scene.environmentIntensity = 0.55 * (1 - 0.5 * sol) + 0.3 * mer_;
    // mer : vagues plus fortes, couleur de braise
    merM.color.set("#1f7592").lerp(cB.set("#ff5a14"), mer_); merM.emissive.set("#0a3a4c").lerp(cB.set("#ff4a0a"), mer_); merM.emissiveIntensity = 0.12 + 1.3 * mer_ * (1 - smooth(T.trompette, T.trompette + 4, t));
    lueurMer.material.opacity = 0.85 * mer_ * (1 - smooth(T.trompette, T.trompette + 4, t));
    const p = mer.geometry.attributes.position, amp = 0.5 + 2.2 * mer_ + 1.4 * smooth(T.seisme, T.seisme + 4, t) * (1 - smooth(T.seismeFin, T.seismeFin + 6, t));
    for (let i = 0; i < p.count; i++) { const x = merBase[i * 3], z = merBase[i * 3 + 2]; p.setY(i, Math.sin(x * 0.05 + t * 1.6) * 0.18 * amp + Math.cos(z * 0.07 + t * 1.1) * 0.3 * amp); } p.needsUpdate = true;
    // montagnes : elles s'affaissent comme de la laine cardée (poussière brune qui s'étale)
    montTous.forEach(([m, h], i) => { m.material.color.copy(montCoul[i]); const k = mons * (0.85 + 0.1 * hash(i)); m.scale.y = h * (1 - 0.86 * k); m.material.color.lerp(cB.set("#a8906e"), k * 0.8); m.position.y = -0.1 * k * h * 0.5; });
    poussiere.forEach((s, i) => { const a = seg(t, M0 + (i % 6) * 0.35, M1 + 4), op = Math.sin(Math.PI * a) * 0.55; s.material.opacity = Math.max(0, op); s.position.y = 4 + a * 26 + (i % 5) * 2; s.scale.setScalar(26 + 60 * a); });
    // séisme : fissures, jetée qui s'effondre, roue qui s'incline, palmiers qui plient
    fissures.forEach((m, i) => { m.scale.y = 0.001 + 14 * smooth(T.seisme + 0.5 + hash(i) * 3, T.seisme + 6, t); });
    jetee.forEach((b, i) => { const k = smooth(T.seisme + 1.5 + i * 0.6, T.seisme + 5 + i * 0.6, t); b.rotation.x = (i % 2 ? 1 : -1) * 0.55 * k; b.rotation.z = 0.25 * k * (hash(i) - 0.5); b.position.y = 1.6 - 2.4 * k; });
    const kroue = smooth(T.seisme + 2, T.seisme + 10, t); roue.rotation.z = t * 0.06 + kroue * 0.7; roue.rotation.x = kroue * 0.25; roue.position.y = 11 - 4 * kroue; roueG.forEach((g) => g.rotation.z = -roue.rotation.z);
    palmes.forEach((g, i) => { g.rotation.z = (i ? -1 : 1) * (0.05 * Math.sin(t * 2) + 0.55 * smooth(T.seisme + 2, T.seisme + 8, t)); g.rotation.x = 0.08 * Math.sin(t * 1.3 + i); });
    // parasols
    pp.forEach((q, i) => { const k = smooth(q.f, q.f + 2.5, t), j = seis > 0 && seis < 0.5 ? Math.sin(t * 40 + i) * 0.04 : 0; placer(poteauP, i, q.x, 1.1 - 0.7 * k, q.z, 0, 0, q.tilt * k + j); placer(toiles, i, q.x + Math.sin(q.tilt * k) * 1.1, 2.3 - 1.5 * k, q.z, 0, 0, q.tilt * k + j, 1, 1 - 0.3 * k, 1); placer(serv, i, q.x + 1.6, 0.03, q.z + 0.9, 0, q.tilt); });
    poteauP.instanceMatrix.needsUpdate = toiles.instanceMatrix.needsUpdate = serv.instanceMatrix.needsUpdate = true;
    // foule : promenade lente, panique pendant le séisme, évanouissement à la Trompette
    const pan0 = T.seisme + 0.5;
    gens.forEach((g, i) => {
      const calme = Math.sin(t * 0.5 + i) * 0.6, panique = smooth(pan0, pan0 + 1, t) * (1 - smooth(T.trompette, T.trompette + 1, t));
      const px = g.x + g.ox * calme + g.sx * 10 * seg(t, pan0, T.trompette) * panique + Math.sin(t * 9 + i) * 0.25 * panique, pz = Math.min(53, Math.max(-3.2, g.z + g.oz * calme + g.sz * 8 * seg(t, pan0, T.trompette) * panique));
      const th = (Math.PI / 2) * smooth(g.f, g.f + 1.1, t), bounce = Math.abs(Math.sin(t * 6 + i)) * 0.15 * panique, hh = 0.9 * g.h;
      placer(corps, i, px, hh * Math.cos(th) + bounce, pz + hh * Math.sin(th), th, 0, 0, 1, g.h, 1);
      placer(tetes, i, px, 1.62 * g.h * Math.cos(th) + bounce, pz + 1.62 * g.h * Math.sin(th), 0, 0, 0);
    });
    corps.instanceMatrix.needsUpdate = tetes.instanceMatrix.needsUpdate = true;
    // oiseaux : planent, puis fuient
    for (let i = 0; i < 50; i++) { const a = t * (0.12 + 0.08 * hash(i)) + i * 1.7, fuite = smooth(T.seisme - 1, T.seisme + 3, t) * 120; placer(oiseaux, i, -40 + 80 * hash(i * 3) + Math.sin(a) * 14, 22 + 10 * hash(i * 5) + Math.sin(a * 3) * 1.2 + fuite * 0.4, -25 - 30 * hash(i * 7) - fuite, 0, 0, Math.sin(t * 9 + i) * 0.6, 1, 1, 1); } oiseaux.instanceMatrix.needsUpdate = true;
    // feux et fumée noire (après le hadith du feu), vapeur des mers qui bouillent
    feux.forEach((s, i) => { const a = smooth(T.feu + i * 0.5, T.feu + 3 + i * 0.5, t) * (1 - blanc); s.material.opacity = a; s.scale.set(4.5 + 1.8 * Math.sin(t * 8 + i), 9 + 2 * Math.sin(t * 6 + i * 2), 1); s.position.y = s.scale.y / 2; });
    fumees.forEach((s, i) => { const a = seg(t, T.feu + i * 0.4, T.feu + 30); const q = feux[i % 12].position; s.position.set(q.x + a * 6, 6 + a * 40, q.z - a * 6); s.scale.setScalar(10 + a * 50); s.material.opacity = 0.7 * Math.min(1, a * 8) * (1 - 0.5 * blanc); });
    vapeur.forEach((s, i) => { const a = seg(t, E0 + 0.5 + (i % 7) * 0.3, E1 + 8); s.position.y = 2 + a * 16; s.scale.setScalar(20 + a * 40); s.material.opacity = 0.5 * Math.sin(Math.PI * clamp01(a * 1.05)) * mer_; });
  };
  return { scene, update: (t: number) => update(t) };
}
