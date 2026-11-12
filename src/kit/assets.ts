// @ts-nocheck
// Fichiers réels (photos CC0 Poly Haven, ciel HDRI) chargés une seule fois avant la première image.
// La vidéo appelle chargerAssets(liste) puis lit ASSETS[nom] dans son décor.
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";

export const ASSETS: Record<string, any> = {};
let promesse: Promise<void> | null = null;

// liste : { nom: "assets/fichier.jpg" } ; .hdr = ciel HDR, *_diff / ciel.jpg = couleurs (sRGB), le reste = données (normales, rugosité)
export const chargerAssets = (liste: Record<string, string>) => (promesse ??= Promise.all(Object.entries(liste).map(([nom, f]) => new Promise<void>((ok, ko) => {
  const url = staticFile(f);
  if (f.endsWith(".glb")) new GLTFLoader().load(url, (g) => { ASSETS[nom] = g; ok(); }, undefined, ko); // modèle 3D riggé + animations
  else if (f.endsWith(".hdr")) new RGBELoader().load(url, (t) => { t.mapping = THREE.EquirectangularReflectionMapping; ASSETS[nom] = t; ok(); }, undefined, ko);
  else new THREE.TextureLoader().load(url, (t) => {
    if (/diff|ciel/.test(f)) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; ASSETS[nom] = t; ok();
  }, undefined, ko);
}))).then(() => undefined));

// copie d'une texture chargée avec sa propre répétition (une même photo sert à plusieurs surfaces)
export const tex = (nom: string, rx = 1, ry = 1) => { const t = ASSETS[nom].clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return t; };
// matériau photo complet (couleur + relief + rugosité) d'un jeu Poly Haven
export const pbr = (jeu: string, rx: number, ry: number, o: any = {}) => new THREE.MeshStandardMaterial({
  map: tex(jeu + "_diff", rx, ry), normalMap: tex(jeu + "_nor", rx, ry), roughnessMap: tex(jeu + "_rough", rx, ry),
  roughness: 1, metalness: 0, normalScale: new THREE.Vector2(0.9, 0.9), ...o,
});
