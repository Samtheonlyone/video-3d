# Ma vidéo : ET SI la France n'avait pas colonisé l'Algérie ? (Alger, 1830)
Étape en cours : 7 (rendu final détails décor en cours : out/rendu9.log puis out/son6.log)

- [x] 1. Installation
- [x] 2. Idée : flotte française devant Alger (juin 1830), Ali pêcheur + sa sœur Yamina, dilemme alerter / sauver Yamina
- [x] 3. Script (src/video/script.json, 35 répliques)
- [x] 4. Construction : lieu, flotte et choc, personnages, caméra, habillage (verifier : rien à corriger, 70,8 s)
- [x] 5. Voix ElevenLabs v3 avec émotions : héros MARAAAA, Yamina Caroline, Hamid Ilan, garde Nicolas Petit, messager Paul K ; narrateur edge-tts
- [x] 6. Sons CC0 Openverse : foule, mer, canon, planches, pas
- [~] 7. Rendu final : rendu sans voix lancé (out/video.mp4), puis upload Drive

## À garder en tête
- Corrigé : la caméra visait le sol sur la place (versPerso sans altitude).
- Flotte au début : lisible mais un peu « blob » blanc, halo de soleil à droite. À améliorer si retour.

- Passe réalisme : ciel HDRI réel, textures photo CC0 (Poly Haven), mer avec reflets, navires galbés, mains POV ombrées, vêtements d'époque.
- Il veut : le plus réaliste possible (référence GTA), voix avec émotion, carte blanche pour faire sans s'arrêter.

- Passe détails (soir du 11/11) : façades avec portes cintrées et fenêtres à volets, tonneaux/caisses/linge/auvents/lanternes dans la ruelle et sur le quai. GTAO testé puis retiré (il rend les sprites de fumée en carrés opaques).
- Personnages : pas de modèle humain d'époque libre trouvé (Soldier/Michelle de three.js sont modernes) → gardés stylisés.
- Version précédente sauvegardée : out/video_finale_realiste1.mp4
