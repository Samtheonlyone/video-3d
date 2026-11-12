# Bibliothèque de références 3D — projet "ET SI… Alger 1830"

Recherche réelle (Firecrawl + fournisseurs Sketchfab/Poly Haven/ambientCG). Chaque lien a été consulté le 2026-11-12. Licences vérifiées.

## 0. Rappel des capacités réelles de l'outil (honnêteté)

- **Moteur de rendu** : three.js + Remotion (code). Rendu final dans GitHub Actions en **GL logiciel (CPU)** → budget polygones/textures limité.
- **Je PEUX importer** : modèles **GLB** (GLTFLoader), textures **PBR** (jpg/png), **HDRI** (.hdr). Déjà en place dans le projet.
- **Je NE PEUX PAS** : exécuter Blender ou Unreal Engine (aucun outil ici → référence seule) ; télécharger Mixamo en auto (login Adobe) ; générer des images par IA pour le rendu final.
- **Conclusion** : GTA V / UE5 photoréaliste = **hors de portée de cette stack**. Objectif réaliste = meilleurs modèles CC0 riggés + PBR + HDRI + post-traitement filmique.

Trois usages distincts (comme demandé) :
1. **Référence visuelle** (on regarde, on ne télécharge pas) : captures GTA V, tutos UE5.
2. **Ressource exploitable** (on télécharge et on importe en GLB/texture/HDRI) : Cinevva, Poly Haven, ambientCG.
3. **Technique** (on applique au code) : éclairage, étalonnage, post-traitement.

---

## 1. PERSONNAGES — GLB CC0 riggés + animés (EXPLOITABLE, téléchargement direct)

Source principale vérifiée : **Cinevva** (`app.cinevva.com/game-assets/free-3d-character-models`) — chaque modèle est un **GLB unique, CC0, sans compte**, squelette + clips d'animation inclus. Originaux : Quaternius, Kenney, KayLousberg, Polygonal Mind. Licence **CC0 1.0** (domaine public, usage commercial, aucune attribution requise).

Humains les plus réalistes (proportions humaines, à recolorer en civils 1830) :

| Modèle | Verts | Clips | Lien direct (GLB) |
|---|---|---|---|
| Casual_Female (femme moderne) | 6 624 | 17 | `https://cdn.cinevva.com/assets/packs/quaternius/ultimate-animated-characters/Casual_Female.glb?download=1` |
| Characters_Matt (homme) | 27 720 | 20 | `https://cdn.cinevva.com/assets/packs/quaternius/zombie-apocalypse-kit/Characters_Matt.glb?download=1` |
| Characters_Sam (homme) | 28 684 | 20 | `https://cdn.cinevva.com/assets/packs/quaternius/zombie-apocalypse-kit/Characters_Sam.glb?download=1` |
| Characters_Lis (femme) | 28 106 | 20 | `https://cdn.cinevva.com/assets/packs/quaternius/zombie-apocalypse-kit/Characters_Lis.glb?download=1` |
| Soldier_Male / Soldier_Female | 5 542 / 9 716 | 17 | `…/ultimate-animated-characters/Soldier_Male.glb?download=1` |
| Knight_Male / Knight_Golden_Female | 5 978 / 9 264 | 17 | `…/ultimate-animated-characters/Knight_Male.glb?download=1` |
| Kenney mini-characters (male-a…f, female-a…f) | ~1 300 | 32 | `…/kenney/mini-characters/character-male-a.glb?download=1` |

Clips typiques : Idle, Walk, Run, + variantes. Pilotables par `AnimationMixer.setTime(t)` (déterministe par image, déjà prouvé dans le projet).

Autres sources vérifiées (personnages) :
- **Grab3D** `grab3d.com/free-rigged-3d-models` — CC0, FBX/GLB/.blend, sans compte.
- **Reallusion CC Character Base** `reallusion.com/character-creator/free-3d-character-base.html` — 5 bases riggées, **gratuit, EULA usage commercial** (pas CC0 : lire l'EULA). Plus réaliste anatomiquement, mais FBX → conversion GLB nécessaire.
- **Ready Player Me** — avatars GLB gratuits, mais pour les animer il faut un aller-retour FBX/Mixamo/Blender (pas direct ici).
- **Mixamo** `mixamo.com` — humains réalistes + mocap, **login Adobe requis** → tu dois télécharger toi-même (je ne peux pas l'automatiser).

Limite honnête : tous ces humains CC0 sont **stylisés** (pas de visages photoréalistes). Les seuls réalistes (Reallusion, Mixamo) demandent une action manuelle de ta part.

## 2. ENVIRONNEMENT / PROPS — GLB CC0 (EXPLOITABLE)

**Poly Haven** (`polyhaven.com`, **CC0 1.0**, usage commercial, GLB) — vérifié :
- Cannon 01 (41 444 tris) `polyhaven.com/a/cannon_01` — pour la flotte française.
- Wooden Barrels 01 (33 142) `polyhaven.com/a/wooden_barrels_01`, Wooden Crate 01 (6 576) `…/wooden_crate_01`, Wooden Crate 02 (5 176).
- Treasure Chest, Propane Tank (props de quai).

À explorer (mêmes liens Poly Haven /models) : jarres, tonneaux, charrettes, murs. Budget CPU : rester < ~30k tris par prop instancié.

## 3. TEXTURES PBR + HDRI (EXPLOITABLE)

**HDRI** (Poly Haven, CC0, .hdr — ciel + éclairage d'ambiance) pour le lever du jour sur Alger :
- Spruit Sunrise `polyhaven.com/a/spruit_sunrise`
- Umhlanga Sunrise `polyhaven.com/a/umhlanga_sunrise`
- Venice Sunset `polyhaven.com/a/venice_sunset`
- Belfast Sunset Pure Sky `polyhaven.com/a/belfast_sunset_puresky`

**Textures PBR** :
- **Poly Haven** (CC0) et **ambientCG** `ambientcg.com` (CC0) — crépi/stuc blanc, pavés, bois, pierre. Déjà utilisé dans le projet (white_stucco, cobblestone, clay_plaster, brown_planks).
- **CGBookcase** `cgbookcase.com` (CC0) — textures 4K supplémentaires.

## 4. GITHUB — projets exploitables (étudiés, licences vérifiées)

- **nafisrayan/3d-game-template-ultimate** — three.js, **blending Mixamo Idle/Walk/Run synchronisé** (utilise Soldier.glb). Directement pertinent pour mon système perso3d. Licence : voir repo.
- **icurtis1/character-controller-sample-project** — R3F + Rapier + postprocessing (**MIT**). Référence contrôleur + effets.
- **footprintarts/threejs_fps_2.0** — three.js, GLTF loader + AnimationMixer (**MIT**).
- **sketchpunklabs/ossos** — bibliothèque web de **skinning + animation + retargeting IK**, open source. Avancé (retargeter des anims entre squelettes).

## 5. RÉFÉRENCES TECHNIQUES AAA (référence seule — PAS importable)

- GTA V / GTA VI : stylisé, **brumeux + bloom**, saturé **teal/orange/or**, contre-jours de coucher de soleil (analyse Digital Foundry, déjà appliquée dans l'étalonnage actuel).
- Gnomon "Real-Time Character & Environment Lighting" (UE5) `thegnomonworkshop.com` — workflow éclairage ciné.
- Épic / UE5 doc `dev.epicgames.com/documentation` — Lumen, Nanite, MetaHuman (pour comprendre, pas reproductible ici).

Techniques applicables à MON moteur (déjà en place ou à renforcer) :
- Éclairage : HDRI (IBL) + soleil directionnel doré rasant + fill hémisphérique chaud.
- Post : unsharp (netteté), contraste filmique en S, split-tone teal/or, bloom large seuil bas, brume (fog) pour la perspective aérienne.
- Matières : PBR (normal + roughness) partout, pas de blanc pur.

---

## 6. Plan d'exploitation concret (prochaines étapes)

1. **Prototype** : remplacer Yamina par **Casual_Female** (femme, recolorée robe) et un homme par **Characters_Matt**, rendre 1 image test.
2. **Props** : importer Cannon 01 sur les navires, Wooden Barrels sur le quai.
3. **HDRI** : tester Spruit Sunrise comme ciel/éclairage.
4. **Validation** par toi avant la production complète.

> Toutes les ressources listées sont **CC0** sauf : Reallusion (EULA commercial), Mixamo (compte requis), GitHub (licence par repo, MIT pour ceux cités). Aucune ressource GTA V propriétaire n'est récupérée — GTA sert de **référence esthétique** uniquement.
