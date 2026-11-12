// @ts-nocheck
// Formes de base pour construire n'importe quel décor : matériaux, boîtes, objets, sprites, objets répétés (instances),
// et une rangée de bâtiments de fond. On construit chaque lieu à partir de ça, en code, pour l'idée de la vidéo.
import { THREE, canvasTex } from "./gfx";
import { hash } from "./outils";

// matériau mat (pas brillant) ; r = rugosité (0 brillant → 1 mat)
export const mat = (c: string, r = 0.85, o: any = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.02, ...o });
// boîte de taille (w, h, d) centrée en (x, y, z)
export const boite = (p, w, h, d, m, x, y, z, ombre = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = ombre; o.receiveShadow = true; p.add(o); return o; };
// n'importe quelle géométrie posée en (x, y, z)
export const objet = (p, g, m, x, y, z, ombre = true) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = ombre; o.receiveShadow = true; p.add(o); return o; };
// sprite : image plate toujours face caméra (feu, fumée, lueur, nuage, foule lointaine)
export const sprite = (map, color = "#ffffff", additif = false, opacite = 1) => new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, depthWrite: false, opacity: opacite, blending: additif ? THREE.AdditiveBlending : THREE.NormalBlending, fog: !additif }));
// beaucoup d'objets identiques pour le prix d'un : place(i, obj3D) règle position / rotation / taille de l'objet i
export const instances = (p, g, m, n: number, place: (i: number, o: any) => void, ombre = true) => {
  const im = new THREE.InstancedMesh(g, m, n), d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { d.position.set(0, 0, 0); d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1); place(i, d); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
  im.castShadow = ombre; im.receiveShadow = true; p.add(im); return im;
};
// texture de façade d'immeuble (fenêtres en grille, quelques-unes allumées) : pour les fonds de ville
export const facadeImmeuble = (mur = "#b8b0a4", seed = 1, etages = 8, colonnes = 5) => canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = mur; g.fillRect(0, 0, w, h);
  const fw = w / colonnes, fh = h / etages;
  for (let e = 0; e < etages; e++) for (let c = 0; c < colonnes; c++) {
    const allume = hash(seed * 31 + e * 7 + c) > 0.82;
    g.fillStyle = allume ? "#e8c890" : hash(seed + e + c * 3) > 0.5 ? "#4a5866" : "#3a4652";
    g.fillRect(c * fw + fw * 0.2, e * fh + fh * 0.22, fw * 0.6, fh * 0.56);
  }
  g.fillStyle = "rgba(0,0,0,.15)"; for (let e = 1; e < etages; e++) g.fillRect(0, e * fh - 2, w, 3);
});
// une rangée d'immeubles de fond (silhouette de ville) le long d'une ligne, de x0 à x1 à la profondeur z (ou l'inverse avec axe "z")
export const ligneImmeubles = (p, o: { de: number; a: number; fixe: number; axe?: "x" | "z"; hMin?: number; hMax?: number; seed?: number; murs?: string[] }) => {
  const murs = o.murs ?? ["#b8b0a4", "#a8a29a", "#c4b8a8", "#9aa0a8", "#b0a090", "#c8c0b4"];
  const g = new THREE.Group(); p.add(g); let pos = o.de, i = 0;
  while (pos < o.a) {
    const w = 14 + 14 * hash((o.seed ?? 1) * 13 + i), h = (o.hMin ?? 18) + ((o.hMax ?? 55) - (o.hMin ?? 18)) * hash((o.seed ?? 1) * 7 + i * 3), d = 14;
    const tex = facadeImmeuble(murs[i % murs.length], (o.seed ?? 1) * 100 + i, Math.round(h / 3.2), Math.round(w / 3.5));
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), plain = mat(murs[i % murs.length]);
    const b = new THREE.Mesh(new THREE.BoxGeometry(o.axe === "z" ? d : w, h, o.axe === "z" ? w : d), [m, m, plain, plain, m, m]);
    if (o.axe === "z") b.position.set(o.fixe, h / 2, pos + w / 2); else b.position.set(pos + w / 2, h / 2, o.fixe);
    g.add(b); pos += w + 2 + 6 * hash(i * 5 + 2); i++;
  }
  return g;
};
