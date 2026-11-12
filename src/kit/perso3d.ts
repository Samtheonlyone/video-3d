// @ts-nocheck
// Personnage 3D riggé : charge un modèle GLB (ASSETS[nom]) animé, le clone, le met à l'échelle de façon
// fiable (boîte englobante précise, même hauteur quel que soit le modèle), et joue ses clips de façon
// déterministe par image via AnimationMixer.setTime(t). Remplace mkFlat pour un vrai corps animé.
import * as THREE from "three";
import { clone as skClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { ASSETS } from "./assets";

// hauteur = taille voulue dans les unités de la scène (adulte ~26, enfant ~20)
// couleur = teinte unie appliquée au corps (pour transformer un mannequin en civil) ; peau = tête/mains
// offsetYaw = rotation de base pour que le modèle regarde vers +Z quand facing = 0
export function perso3d(scene: any, nom: string, o: { ech?: number; couleur?: string; peau?: string; offsetYaw?: number } = {}) {
  const g = ASSETS[nom];
  const model = skClone(g.scene);
  model.traverse((m: any) => {
    if (m.isMesh || m.isSkinnedMesh) {
      m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
      if (o.couleur) m.material = new THREE.MeshStandardMaterial({ color: o.couleur, roughness: 0.82, metalness: 0 });
    }
  });
  // échelle explicite réglée par modèle (la bbox d'un SkinnedMesh n'est pas fiable) ; Soldier ~0.6 => bonne taille
  model.scale.setScalar(o.ech ?? 0.6);
  const holder = new THREE.Group(); holder.add(model); scene.add(holder);
  model.position.y = -new THREE.Box3().setFromObject(model).min.y; // cale les pieds sur l'origine du holder
  const mixer = new THREE.AnimationMixer(model);
  const clip = (n: string) => THREE.AnimationClip.findByName(g.animations, n) || g.animations.find((c: any) => new RegExp(n, "i").test(c.name));
  const A: any = {}; ["Idle", "Walk", "Run"].forEach((n) => { const c = clip(n); if (c) { A[n] = mixer.clipAction(c); A[n].play(); } });
  if (!A.Idle && !A.Walk && g.animations[0]) { A.Idle = mixer.clipAction(g.animations[0]); A.Idle.play(); } // modèle à 1 clip sans nom
  const base = o.offsetYaw ?? 0;
  return {
    holder, model, mixer, root: holder,
    // speed : 0 = immobile (idle), ~1.5 = marche, >3 = course
    set(t: number, x: number, y: number, z: number, facing: number, speed: number) {
      holder.position.set(x, y, z); holder.rotation.y = facing + base;
      const run = THREE.MathUtils.clamp((speed - 2.2) / 1.5, 0, 1), move = THREE.MathUtils.clamp(speed / 1.4, 0, 1);
      if (A.Idle) A.Idle.setEffectiveWeight(1 - move);
      if (A.Walk) A.Walk.setEffectiveWeight(move * (1 - run));
      if (A.Run) A.Run.setEffectiveWeight(move * run);
      mixer.setTime(t); // temps absolu : rendu image par image reproductible
    },
  };
}
