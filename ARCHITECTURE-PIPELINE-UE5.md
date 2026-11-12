# Architecture de production — vidéos historiques 3D (Blender + Unreal Engine 5)

Recherche consultée le 2026-11-12. Prix et licences vérifiés aux sources citées. Estimations marquées **(estimé)**.

## 0. Ce que je peux et ne peux pas faire

- **Je ne peux pas exécuter Blender ni Unreal Engine.** Aucun outil ici. Je peux écrire les scripts (Python Blender, Python/Blueprint UE) et les documents ; c'est toi (ou un poste GPU) qui lances le logiciel.
- Le pipeline ci-dessous est donc un **plan que tu exécutes**, avec mes scripts et ma vérification sur images.

## 1. Licences et coûts (vérifiés)

| Outil | Licence | Coût | Source |
|---|---|---|---|
| **Unreal Engine 5** | Gratuit jusqu'à **1 M$ de revenus bruts** par produit ; **5 %** au-delà | 0 € (usage perso/petite prod) | unrealengine.com/license |
| **MetaHuman** (humains réalistes) | Inclus dans la licence UE ; gratuit sous 1 M$ de revenus | 0 € | metahuman.com/license |
| **Blender** | GPL, gratuit, usage commercial libre | 0 € | blender.org |
| **Mixamo** (animations humaines) | Gratuit, **compte Adobe requis** | 0 € | mixamo.com |
| **Poly Haven** (HDRI, props, PBR) | **CC0**, usage commercial libre, sans attribution | 0 € | polyhaven.com/license |
| **ambientCG** (PBR) | **CC0** | 0 € | ambientcg.com |
| **Fab** (marketplace Epic) | Chaque asset a sa licence ; beaucoup gratuits, d'autres payants | variable | fab.com (non vérifié asset par asset) |

**Coût logiciel réel : 0 €** tant que les revenus restent sous 1 M$. Le seul "vrai" coût est le matériel.

## 2. Matériel nécessaire (vérifié officiel Epic)

Lumen (éclairage global) et Nanite (géométrie virtualisée) exigent :
- Windows 10 build 1909.1350+ ou Windows 11, **DirectX 12**, **SM6 activé**.
- GPU : **NVIDIA RTX 2000+**, **AMD RX 6000+** ou **Intel Arc A-series+**.
- Pilotes graphiques à jour.

Configuration conseillée **(estimé, pour un rendu confortable)** : GPU RTX 3080 12 Go minimum, idéalement RTX 4090 24 Go ; 32 Go RAM ; SSD NVMe 1 To+ (UE5 + assets = 100 Go+).

**Ton PC actuel (3,8 Go RAM, Intel UHD) : insuffisant.** UE5 ne tourne pas dessus.

## 3. Options de travail gratuites ou à bas coût

- **Gratuit (sans GPU)** : modélisation Blender sur CPU (lent mais possible) ; UE5 **ne tourne pas** sans GPU compatible Lumen → pas de rendu UE gratuit local.
- **Cloud GPU à la demande** (vérifié, prix/heure) :
  - RunPod RTX 4090 : **0,34 – 0,69 $/h** ; A100 80 Go : **1,19 – 1,79 $/h** (runpod.io/pricing, promptquorum 2026).
  - Vast.ai RTX 4090 : **0,08 – 0,59 $/h** (variable, moins fiable).
  - Lambda A100 : 1,99 – 2,79 $/h (très fiable).
- **Point bloquant** : RunPod fonctionne en conteneurs **Linux**. L'éditeur UE5 demande une **session Windows avec bureau**. Il faut une **VM Windows à GPU** (Azure NV, AWS g5, ou similaire). **Tarif Windows non vérifié** — à confirmer avant de dépenser.
- **Estimation budget (estimé)** : 20 à 40 h de cloud GPU RTX 4090 à ~0,5 $/h ≈ **10 à 25 $** pour une première vidéo ; plus si l'éditeur Windows coûte plus cher.

## 4. Architecture technique

```
[Blender]  modèles persos + vêtements + props  →  export FBX/glTF
     │                                           (Mixamo : animations → FBX)
     ▼
[Unreal Engine 5]  import, rig, Sequencer, Lumen, Nanite, MetaHuman
     │  - environnements (Poly Haven + modèles Blender)
     │  - éclairage : HDRI Poly Haven + soleil + Lumen
     │  - caméra & séquence : Sequencer (keyframes)
     ▼
[Movie Render Queue]  export image par image 1080×1920 (9:16)
     │                  (MRQ : rendu hors-ligne, qualité maximale)
     ▼
[FFmpeg]  assemblage MP4 + son (ElevenLabs voix, bruitages)
```

**Rendu vertical 9:16 :** la Movie Render Queue d'UE5 exporte des images à la résolution de ton choix ; on règle la résolution 1080×1920 directement (cadre vertical dans Sequencer). Source : documentation Epic MRQ.

## 5. Personnages cohérents d'une scène à l'autre

- **Un seul fichier source par personnage** (Blender → FBX), référencé dans UE par un **Skeletal Mesh** unique.
- **MetaHuman** pour les visages réalistes : une identité créée une fois dans MetaHuman Creator, réutilisée partout.
- **Mêmes vêtements** = même Skeletal Mesh + mêmes matériaux PBR (pas de recréation par scène).
- **Versionnement** : garder les `.blend` et projets UE dans git (dépôt privé) pour retrouver la version exacte d'un personnage.

## 6. Animations, expressions, déplacements, dialogues

- **Corps** : Mixamo (locomotion, poses) → retargeting vers le squelette UE (IK Retargeter UE5).
- **Déplacements** : Sequencer + Animation Blueprints (locomotion blending idle/marche/course).
- **Visages** : MetaHuman Animator (capture vidéo ou audio → expressions) ; contrôles faciaux via Control Rig.
- **Dialogues** : voix ElevenLabs (déjà en place) synchronisées sur les clips faciaux ; sous-titres mot à mot (Whisper, déjà dans le projet).

## 7. Points de risque (honnêteté)

1. **Temps de rendu inconnu** : un rendu Lumen 1080×1920 image par image peut durer plusieurs secondes par image. 2 124 images (70 s à 30 fps) = plusieurs heures à plusieurs jours selon le GPU **(estimé, à mesurer sur ton premier plan test)**.
2. **Courbe d'apprentissage** : UE5 + Blender + MetaHuman = plusieurs semaines à maîtriser correctement.
3. **Licences assets** : vérifier chaque asset Fab ; Mixamo requiert Adobe ; GitHub varie par dépôt.
4. **Aucun rendu UE réalisé à ce jour** dans ce projet : ce document est un plan, pas un résultat.

## 8. Prochaines étapes concrètes (ordre)

1. Choisir la machine : PC avec RTX 3080+ **ou** VM Windows cloud GPU (confirmer le prix).
2. Installer Epic Games Launcher + UE 5 (version stable récente), activer SM6.
3. Test : importer un MetaHuman de démo + un environnement Poly Haven, rendre 1 image 1080×1920 avec MRQ et mesurer le temps.
4. Si le temps par image est acceptable, valider la direction artistique avec toi, puis produire.

## 9. Sources

- Licence UE : https://www.unrealengine.com/license
- Licence MetaHuman : https://www.metahuman.com/license
- Specs matérielles UE5 : https://dev.epicgames.com/documentation/unreal-engine/hardware-and-software-specifications-for-unreal-engine
- Movie Render Queue : https://dev.epicgames.com/documentation/unreal-engine/rendering-high-quality-frames-with-movie-render-queue-in-unreal-engine
- Prix RunPod : https://www.runpod.io/pricing
- Prix cloud GPU comparatif : https://www.promptquorum.com/local-llms/cloud-gpu-rental-comparison-2026
- Poly Haven (CC0) : https://polyhaven.com/license
