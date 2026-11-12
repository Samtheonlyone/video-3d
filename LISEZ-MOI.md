# Pack « Vidéos 3D POV » : mode d'emploi

Ce pack contient :
- **`Guide-videos-3d-pov.pdf`** : le guide illustré (installer, lancer, suivre les étapes, dire ce qu'on veut changer, donner des photos de référence) ;
- **`video-3d-pov/`** : le skill qui t'accompagne étape par étape dans Claude Code ;
- **`projet-video-3d/`** : le projet de départ (moteur 3D, personnages, caméra, sous-titres, cartes A/B, scripts de voix et de son) avec un exemple.

## Ce qu'il te faut
- Un ordinateur **Windows ou Mac** (une carte graphique aide pour le rendu), environ 2 Go libres.
- **Claude Code** : il faut un abonnement Claude payant (Pro ou plus). Application de bureau Claude (onglet « Code ») ou Claude Code dans un terminal.
- Pour les voix, au choix : Voicebox (gratuit), ElevenLabs (compte en ligne) ou tes propres enregistrements. Le skill t'explique chacun.

## Installation
1. **Décompresse le pack** où tu veux, par exemple dans Documents.
2. **Ouvre le dossier du pack dans Claude Code** (application de bureau : onglet Code → choisir le dossier ; terminal : `cd` dans le dossier, puis `claude`) et écris : **« Installe le skill video-3d-pov »**. Claude le copie tout seul au bon endroit.
   (À la main si tu préfères : copie `video-3d-pov` dans `C:\Users\<ton nom>\.claude\skills\` sur Windows, ou `~/.claude/skills/` sur Mac.)
3. **Ouvre une nouvelle session sur le dossier `projet-video-3d`** : le skill n'est chargé qu'au démarrage d'une session.
4. Écris : **« On fait une vidéo 3D »** (ou `/video-3d-pov`).

Claude vérifie ce qui manque (Node.js, les modules), l'installe avec ton accord, et te montre une première image. Ensuite il te guide : idée → script → construction → voix → sons → rendu.

## Bon à savoir
- Le projet contient un exemple (une météorite dans une rue) qui sert à vérifier que tout marche. Ta vidéo, Claude la crée de zéro pour ton idée : n'importe quel lieu, n'importe quelle catastrophe.
- Le rendu final est l'étape la plus longue : il tourne tout seul, laisse l'ordinateur branché.
- Claude ne peut pas **écouter** le son : il le mesure. Écoute toujours ta vidéo avant de la publier.
- Ne colle jamais une clé API dans le chat : mets-la directement dans `voix.config.json`.

## Licences
- Le code du projet est à toi pour faire tes vidéos, y compris des vidéos monétisées. Merci de ne pas revendre ni partager le pack.
- **Remotion** (le moteur vidéo) est gratuit pour les particuliers et les petites structures. Vérifie les conditions sur https://www.remotion.dev/license si tu travailles pour une entreprise.
- three.js : licence MIT. Voicebox : licence MIT. ElevenLabs : vérifie que ton forfait autorise l'usage commercial.
- Sons Openverse : CC0 = libre ; CC BY = crédite l'auteur dans ta description.
- Ne clone que ta propre voix, ou une voix dont tu as l'accord.
