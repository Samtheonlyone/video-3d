// @ts-nocheck
// Personnage : corps 3D articulé + tête dessinée qui reste face caméra. Voir LISEZ-MOI du kit pour la liste des réglages.
import { THREE, canvasTex, blob } from "./gfx";
import { headTex } from "./tete";
import type { FSpec } from "./tete";
export type { FSpec };
const memo = new Map<string, any>();
const cached = (k: string, f: () => any) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };

// géométries partagées
const geo = {
  torso: cached("g-torso", () => { const g = new THREE.CapsuleGeometry(0.16, 0.3, 8, 18); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 0.3, k = 0.84 + 0.3 * Math.min(1, Math.max(0, y / 0.6)); p.setX(i, p.getX(i) * k * 1.12); p.setZ(i, p.getZ(i) * (0.76 + 0.1 * k)); } g.computeVertexNormals(); return g; }),
  pelvis: cached("g-pelvis", () => { const g = new THREE.SphereGeometry(0.16, 16, 12); g.scale(1.0, 0.62, 0.74); return g; }),
  thigh: cached("g-thigh", () => new THREE.CylinderGeometry(0.074, 0.06, 0.44, 14).translate(0, -0.22, 0)),
  shin: cached("g-shin", () => new THREE.CylinderGeometry(0.058, 0.04, 0.4, 14).translate(0, -0.2, 0)),
  knee: cached("g-knee", () => new THREE.SphereGeometry(0.062, 12, 10)),
  uarm: cached("g-uarm", () => new THREE.CylinderGeometry(0.056, 0.047, 0.31, 14).translate(0, -0.155, 0)),
  farm: cached("g-farm", () => new THREE.CylinderGeometry(0.046, 0.036, 0.29, 14).translate(0, -0.145, 0)),
  joint: cached("g-joint", () => new THREE.SphereGeometry(0.058, 12, 10)),
  hand: cached("g-hand", () => { const g = new THREE.SphereGeometry(0.05, 12, 10); g.scale(0.85, 1.25, 0.65); return g; }),
  thumb: cached("g-thumb", () => { const g = new THREE.SphereGeometry(0.02, 8, 6); g.scale(0.9, 1.6, 0.9); return g; }),
  shoe: cached("g-shoe", () => { const g = new THREE.SphereGeometry(0.06, 14, 10); g.scale(0.95, 0.72, 2.2); return g; }),
  belt: cached("g-belt", () => new THREE.CylinderGeometry(0.157, 0.16, 0.035, 20)),
  box: cached("g-box", () => new THREE.BoxGeometry(1, 1, 1)),
};

const patTex = (shirt: string, pattern: string) => cached("pat|" + shirt + pattern, () => {
  const t = canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = shirt; g.fillRect(0, 0, w, h);
    if (pattern === "stripes") { g.fillStyle = "rgba(255,255,255,.32)"; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 7); }
    if (pattern === "plaid") { g.fillStyle = "rgba(0,0,0,.2)"; for (let y = 0; y < h; y += 16) g.fillRect(0, y + 2, w, 5); for (let x = 0; x < w; x += 16) g.fillRect(x + 2, 0, 5, h); }
    if (pattern === "camo") { const cs = ["#5a6238", "#3a3a26", "#7a6a46", "#2a2c1e"]; for (let i = 0; i < 26; i++) { g.fillStyle = cs[i % 4]; g.beginPath(); const x = ((i * 37) % 64), y = ((i * 23 + i * i * 7) % 64), r = 6 + (i % 5) * 2.4; g.ellipse(x, y, r, r * 0.6, i * 0.9, 0, 7); g.fill(); g.ellipse(x - 64, y, r, r * 0.6, i * 0.9, 0, 7); g.fill(); } }
    if (pattern === "dots") { g.fillStyle = "rgba(255,255,255,.34)"; for (let y = 8; y < h; y += 16) for (let x = 8 + ((y / 16) % 2) * 8; x < w; x += 16) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); } }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
});

// décor de face du torse : col, cravate, écharpe, revers de veste, boutons (plan à plat devant la poitrine)
const frontTex = (s: FSpec) => cached(["f", s.shirt, s.collar, s.tie, s.scarf, s.jacket, s.epaulettes].join("|"), () => canvasTex(128, 256, (g) => {
  if (s.jacket) { g.fillStyle = s.jacket; g.beginPath(); g.moveTo(6, 0); g.lineTo(0, 256); g.lineTo(50, 256); g.lineTo(64, 70); g.closePath(); g.fill(); g.beginPath(); g.moveTo(122, 0); g.lineTo(128, 256); g.lineTo(78, 256); g.lineTo(64, 70); g.closePath(); g.fill(); }
  if (s.collar) { g.fillStyle = s.collar; g.beginPath(); g.moveTo(22, 0); g.lineTo(64, 52); g.lineTo(106, 0); g.lineTo(100, 0); g.lineTo(64, 70); g.lineTo(28, 0); g.closePath(); g.fill(); }
  if (s.tie) { g.fillStyle = s.tie; g.beginPath(); g.moveTo(56, 44); g.lineTo(72, 44); g.lineTo(78, 190); g.lineTo(64, 214); g.lineTo(50, 190); g.closePath(); g.fill(); }
  if (s.scarf) { g.fillStyle = s.scarf; g.beginPath(); g.moveTo(6, 0); g.quadraticCurveTo(64, 60, 122, 0); g.lineTo(112, 30); g.quadraticCurveTo(64, 84, 16, 30); g.closePath(); g.fill(); }
  if (!s.tie && !s.scarf && !s.jacket) { g.fillStyle = "rgba(255,255,255,.35)"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(64, 60 + i * 40, 4, 0, 7); g.fill(); } }
  g.fillStyle = "rgba(0,0,0,.1)"; g.fillRect(62, 0, 3, 256);
}));
// sac de randonnée (épisode 3) : rabat, poche, sangles de compression
const hikeTex = (c: string) => cached("hike|" + c, () => canvasTex(64, 96, (g, w, h) => { g.fillStyle = c; g.fillRect(2, 2, w - 4, h - 4); g.fillStyle = "rgba(0,0,0,.28)"; g.fillRect(2, 2, w - 4, 22); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(10, 46, w - 20, 34); g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; g.strokeRect(10, 46, w - 20, 34); g.fillStyle = "#1e1e22"; g.fillRect(14, 2, 5, h - 4); g.fillRect(w - 19, 2, 5, h - 4); g.fillRect(2, 36, w - 4, 4); g.fillStyle = "#c8c8c0"; g.fillRect(w / 2 - 4, 22, 8, 6); }));
const packTex = () => cached("packTex", () => canvasTex(64, 96, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#6c7c46"); gr.addColorStop(1, "#46552c"); g.fillStyle = gr; g.fillRect(2, 2, w - 4, h - 4); g.fillStyle = "#e0802a"; g.fillRect(8, 2, 8, h - 4); g.fillRect(w - 16, 2, 8, h - 4); g.fillRect(2, 30, w - 4, 6); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(2, h - 14, w - 4, 12); }));

export const mkFlat = (parent: any, spec: FSpec) => {
  const root = new THREE.Group(); parent.add(root);
  const flip = new THREE.Group(); root.add(flip); flip.scale.setScalar(spec.scale ?? 1);
  const mats: any[] = [];
  const lam = (hex: string, k = 0.3) => { const base = new THREE.Color(hex); const m = new THREE.MeshStandardMaterial({ color: base.clone(), roughness: 0.82, metalness: 0, emissive: base.clone(), emissiveIntensity: k * 0.3 }); mats.push({ m, base, plain: false }); return m; }; // tissu mat éclairé par le ciel
  const lamTex = (map: any, hex: string, k = 0.3) => { const base = new THREE.Color("#ffffff"); const m = new THREE.MeshStandardMaterial({ map, color: base.clone(), roughness: 0.82, metalness: 0, emissive: new THREE.Color(hex), emissiveIntensity: k * 0.3 }); mats.push({ m, base, plain: true, emi: new THREE.Color(hex) }); return m; };
  const mesh = (g: any, m: any, parentG: any, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); parentG.add(o); return o; };
  const sleeve = spec.shirt2 ?? spec.shirt, skin = spec.skin, pants = spec.pants, shoes = spec.shoes ?? "#25232b";
  const body = new THREE.Group(); flip.add(body);
  const hipH = spec.legs === false ? 0 : 0.8; body.position.y = hipH;
  const shadowP = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: blob(), transparent: true, depthWrite: false, opacity: 0.55, fog: false })); shadowP.rotation.x = -Math.PI / 2; shadowP.position.y = 0.012; root.add(shadowP); shadowP.visible = spec.legs !== false;
  const wid = (spec.female ? 0.92 : 1) * (spec.build ?? 1);
  // jambes
  const legs: any = {};
  const pantsM = lam(pants, 0.26), shoeM = lam(shoes, 0.2), skinM = lam(skin, 0.32);
  if (spec.legs !== false) {
    mesh(geo.pelvis, pantsM, body, 0, 0.0, 0).scale.x = wid;
    const mk = (sx: number) => { const th = new THREE.Group(); th.position.set(sx * 0.088 * wid, 0, 0); body.add(th); mesh(geo.thigh, pantsM, th); const sh = new THREE.Group(); sh.position.y = -0.43; th.add(sh); mesh(geo.knee, pantsM, th, 0, -0.43, 0); mesh(geo.shin, pantsM, sh); mesh(geo.shoe, shoeM, sh, 0, -0.385, -0.06); return { th, sh }; };
    legs.n = mk(1); legs.f = mk(-1);
  }
  // torse
  const tg = new THREE.Group(); body.add(tg);
  const shirtM = spec.pattern ? lamTex(patTex(spec.shirt, spec.pattern), spec.shirt, 0.3) : lam(spec.shirt, 0.3);
  const torso = mesh(geo.torso, shirtM, tg, 0, 0.3, 0); torso.scale.x = wid;
  const beltM = lam(spec.legs === false ? spec.shirt : "#1c1c22", 0.2); mesh(geo.belt, beltM, tg, 0, 0.03, 0).scale.set(wid * 1.14, 1, 0.78);
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.2 * wid, 0.4), new THREE.MeshBasicMaterial({ map: frontTex(spec), transparent: true, alphaTest: 0.04, fog: false })); decal.position.set(0, 0.32, -0.123); decal.rotation.y = Math.PI; decal.material.polygonOffset = true; decal.material.polygonOffsetFactor = -2; tg.add(decal); mats.push({ m: decal.material, base: new THREE.Color("#ffffff"), basic: true });
  if (spec.epaulettes) [-1, 1].forEach((sx) => { const e = mesh(geo.box, lam("#d4af37", 0.5), tg, sx * 0.17 * wid, 0.52, 0); e.scale.set(0.1, 0.018, 0.12); e.rotation.z = -sx * 0.25; });
  // bras
  const mkArm = (sx: number) => {
    const ua = new THREE.Group(); ua.position.set(sx * 0.2 * wid, 0.5, 0); tg.add(ua);
    mesh(geo.joint, lam(sleeve, 0.3), ua); mesh(geo.uarm, lam(sleeve, 0.3), ua);
    const fa = new THREE.Group(); fa.position.y = -0.3; ua.add(fa);
    mesh(geo.joint, lam(sleeve, 0.3), fa).scale.setScalar(0.82); mesh(geo.farm, lam(sleeve, 0.3), fa);
    mesh(geo.box, lam(sleeve, 0.14), fa, 0, -0.285, 0).scale.set(0.088, 0.022, 0.088);
    const hm = spec.glove ? lam(spec.glove, 0.2) : skinM; mesh(geo.hand, hm, fa, 0, -0.345, -0.005); mesh(geo.thumb, hm, fa, sx * -0.034, -0.322, -0.03);
    return { ua, fa, sx };
  };
  const armN = mkArm(1), armF = mkArm(-1);
  // tête dessinée : plan face caméra, ancré au cou
  const headG = new THREE.Group(); headG.position.set(0, 0.52, 0); tg.add(headG);
  const HS = (spec.headScale ?? 1) * 0.5;
  const hgeo = new THREE.PlaneGeometry(HS * (256 / 320), HS); hgeo.translate(0, 0.36 * HS, 0);
  const hmat = new THREE.MeshBasicMaterial({ map: headTex(spec, "front", "neutral", false), transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, fog: false }); mats.push({ m: hmat, base: new THREE.Color("#ffffff"), basic: true });
  const headM = new THREE.Mesh(hgeo, hmat); headG.add(headM); headM.position.z = 0.0;
  const neck = mesh(new THREE.CylinderGeometry(0.048, 0.056, 0.1, 12), lam(skin, 0.25), tg, 0, 0.56, 0);
  // parachute dorsal + sangles
  const packBox = mesh(geo.box, lamTex(spec.packCol ? hikeTex(spec.packCol) : packTex(), spec.packCol ?? "#46552c", 0.35), tg, 0, 0.3, 0.17); packBox.scale.set(0.3, 0.42, 0.14); packBox.visible = false;
  if (spec.packCol) { packBox.scale.set(0.32, 0.5, 0.2); packBox.position.set(0, 0.32, 0.2); }
  const strapM = lam(spec.packCol ? "#1e1e22" : "#e0802a", 0.4); const straps = [-1, 1].map((sx) => { const s = mesh(geo.box, strapM, tg, sx * 0.07, 0.32, -0.125); s.scale.set(0.03, 0.4, 0.014); s.visible = false; return s; });
  const phone = mesh(geo.box, lam("#15161a", 0.2), armN.fa, 0, -0.36, -0.07); phone.scale.set(0.07, 0.14, 0.012); phone.visible = false;

  let view = "front", expr = "neutral", blink = false, curKey = "";
  const refresh = () => { const key = view + expr + blink; if (key === curKey) return; curKey = key; hmat.map = headTex(spec, view, expr, blink); hmat.needsUpdate = true; };
  const state: any = { J: {} };
  const pose = (J: any) => { state.J = J; };
  const setFace = (e: string, b = false) => { expr = e; blink = b; };
  const orient = (camYaw: number, facingYaw: number) => {
    const J = state.J;
    let rho = facingYaw - camYaw; while (rho > Math.PI) rho -= 2 * Math.PI; while (rho < -Math.PI) rho += 2 * Math.PI;
    const a = Math.abs(rho);
    view = a < 0.55 ? "back" : a < 2.1 ? "side" : a < 2.7 ? "three" : "front";
    const side = rho > 0 ? -1 : 1;
    root.rotation.y = facingYaw;
    flip.scale.setScalar(spec.scale ?? 1);
    const bob = J.bob ?? 0, breath = 1 + 0.01 * Math.sin((J.t ?? 0) * 2);
    body.position.set(J.sx ?? 0, (J.hipY ?? hipH) + bob, 0); tg.rotation.set(-(J.lean ?? 0), J.twist ?? 0, 0); tg.scale.y = breath;
    if (legs.n) { legs.n.th.rotation.x = J.t1 ?? 0; legs.n.sh.rotation.x = -(J.k1 ?? 0); legs.f.th.rotation.x = J.t2 ?? 0; legs.f.sh.rotation.x = -(J.k2 ?? 0); legs.n.th.rotation.z = -0.03 + (J.lz ?? 0); legs.f.th.rotation.z = 0.03 - (J.lz ?? 0); }
    armN.ua.rotation.set(J.a1 ?? 0.05, 0, -0.08 + (J.az ?? 0)); armN.fa.rotation.x = J.e1 ?? 0.1; armF.ua.rotation.set(J.a2 ?? 0.05, 0, 0.08 - (J.az ?? 0)); armF.fa.rotation.x = J.e2 ?? 0.1;
    // la tête reste face caméra
    headG.rotation.set(0, camYaw - facingYaw - (J.twist ?? 0), -(J.hp ?? 0) * 0.0 + (J.hr ?? 0)); headG.position.y = 0.52 + (J.neck ?? 0);
    headM.scale.x = view === "side" || view === "three" ? side : 1;
    headM.rotation.z = -(J.hp ?? 0) * 0.35 * (view === "side" || view === "three" ? side : 0);
    headG.position.z = -(J.hp ?? 0) * 0.04;
    phone.visible = !!J.phone;
    packBox.visible = !!J.pack; straps.forEach((s) => { s.visible = !!J.pack; });
    flip.rotation.x = -(J.lie ?? 0) * 1.5;
    refresh();
  };
  const tint = (r: number, g: number, b: number) => mats.forEach(({ m, base, basic, plain, emi }) => { const c = new THREE.Color(r, g, b); m.color.copy(base).multiply(c); if (!basic) { if (plain) m.emissive.copy(emi).multiply(c); else m.emissive.copy(m.color); } });
  // tête tournée vers la caméra même quand le corps est couché (chute libre) : à appeler après orient()
  const _q = new THREE.Quaternion();
  const billboard = (camQ: any) => { root.updateMatrixWorld(true); tg.getWorldQuaternion(_q); headG.quaternion.copy(_q.invert().multiply(camQ)); };
  return { root, flip, pose, setFace, orient, tint, billboard, headG };
};

export const SEATED2 = { hipY: 0.0, a1: 0.3, e1: 0.6, a2: 0.3, e2: 0.6, lean: 0.02 };
export const STAND2 = { a1: 0.05, e1: 0.1, a2: 0.05, e2: 0.1 };

// ------------------------------------------------------------------ démarche et poses
// fk : hauteur de hanche selon l'angle de la cuisse (a) et du genou (k)
const fk = (a: number, k: number) => 0.43 * Math.cos(a) + 0.4 * Math.cos(a - k);
const n1 = (x: number) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f), h = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }; return (h(i) + (h(i + 1) - h(i)) * u) * 2 - 1; };
// pose de marche / course / arrêt. La phase suit la distance parcourue : les pieds ne glissent pas.
export const gait = (mode: string, dist: number, t: number, i = 0) => {
  const J: any = { t }, PI = Math.PI;
  if (mode === "walk") { const ph = (dist / 0.5) * PI, A = 0.34, s = Math.sin(ph), c = Math.cos(ph);
    J.t1 = A * s; J.t2 = -A * s; J.k1 = 0.1 + 0.72 * Math.pow(Math.max(0, c), 1.6) + 0.12 * Math.max(0, -s); J.k2 = 0.1 + 0.72 * Math.pow(Math.max(0, -c), 1.6) + 0.12 * Math.max(0, s);
    J.a1 = -0.3 * s + 0.05; J.a2 = 0.3 * s + 0.05; J.e1 = 0.28 + 0.12 * Math.max(0, -s); J.e2 = 0.28 + 0.12 * Math.max(0, s); J.lean = 0.05; J.twist = 0.06 * s; J.bob = 0.016 * Math.abs(c);
  } else if (mode === "run") { const ph = (dist / 0.9) * PI, A = 0.66, s = Math.sin(ph), c = Math.cos(ph);
    J.t1 = A * s + 0.12; J.t2 = -A * s + 0.12; J.k1 = 0.35 + 1.45 * Math.pow(Math.max(0, c), 1.2); J.k2 = 0.35 + 1.45 * Math.pow(Math.max(0, -c), 1.2);
    J.a1 = -0.85 * s + 0.25; J.a2 = 0.85 * s + 0.25; J.e1 = 1.45 + 0.25 * s; J.e2 = 1.45 - 0.25 * s; J.az = 0.1 + 0.1 * Math.abs(n1(t * 3 + i)); J.lean = 0.2; J.twist = 0.14 * s; J.bob = 0.05 * Math.abs(s);
  } else { J.t1 = 0.04; J.t2 = -0.04; J.k1 = 0.08; J.k2 = 0.08; J.a1 = 0.06; J.a2 = 0.06; J.e1 = 0.25; J.e2 = 0.25; J.lean = 0.02 + 0.01 * Math.sin(t * 1.3 + i); J.bob = 0; }
  J.hipY = Math.max(fk(J.t1, J.k1), fk(J.t2, J.k2)) - 0.03 + (J.bob ?? 0); J.bob = 0; return J;
};
// mélange une pose vers une autre (k de 0 à 1)
export const blend = (J: any, k: number, o: any) => { if (k <= 0) return J; for (const key in o) J[key] = (J[key] ?? 0) + (o[key] - (J[key] ?? 0)) * Math.min(1, k); return J; };
// poses toutes prêtes (on les mélange avec blend)
export const POSES = {
  accroupi: { t1: 1.35, k1: 2.1, t2: 1.25, k2: 2.1, lean: 0.75, a1: 2.7, e1: 2.3, a2: 2.7, e2: 2.3, hipY: 0.42 }, // se protège la tête
  aGenoux: { t1: 1.35, k1: 1.9, t2: 0.1, k2: 1.55, lean: 0.2, hipY: 0.5 },
  assis: { t1: 1.45, t2: 1.4, k1: 1.5, k2: 1.45, hipY: 0.08, a1: 0.25, a2: 0.25, e1: 0.6, e2: 0.6, lean: 0.05 },
  brasLeves: { a1: 2.6, e1: 0.3, a2: 2.6, e2: 0.3 },
  montre: { a1: 1.5, e1: 0.1 },             // montre quelque chose du bras droit
  appelle: { a2: 2.4, e2: 0.6 },            // fait signe
  choc: { lean: -0.12, a1: 0.9, e1: 1.6, a2: 0.9, e2: 1.6 },
};
// clignement d'yeux régulier, différent pour chaque personnage (s)
export const blinkAt = (t: number, s: number) => (t * 0.31 + s) % 1 > 0.965;
