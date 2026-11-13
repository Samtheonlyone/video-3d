# Guide d'utilisation (pour Samaane)

## Démarrer
1. Ouvre Claude Code **dans le dossier `stage-maurice/`** (c'est là que se trouvent `CLAUDE.md`, les agents et les skills).
2. Donne une instruction normale : « Prépare-moi une liste de 20 entreprises logistiques en Auvergne-Rhône-Alpes qui recrutent et une séquence d'approche. » Le Manager délègue.

## Commandes
| Commande | Effet |
|---|---|
| `/prospect <objectif>` | liste sourcée, scoring, séquence en brouillon |
| `/rapport-hebdo` | rapport de la semaine à relire |
| `/prep-reunion <sujet>` | fiche de préparation d'une page |
| `/veille <thème>` | note de veille sourcée |
| `/statut` | ce qui attend ta validation, ce qui bloque |

## Ce que le système ne fera jamais seul
Envoyer un email, publier, partager un fichier, créer un événement d'agenda, dépenser des crédits, supprimer. Claude te demandera confirmation à chaque fois (réglé dans `.claude/settings.json`).

## Suivi
`python3 scripts/dashboard.py` puis ouvre `suivi/index.html` : à valider, bloqué, erreurs, en cours, terminé, temps gagné.

## Avant de t'en servir pour de vrai
- Remplis les « À CONFIRMER » de `.agents/product-marketing.md` avec ton tuteur.
- Ajuste `config/icp.json` (poids, secteurs) avec lui.
- Demande à Succexa ce qu'il est permis de traiter avec des outils d'IA (données internes, prospects).
- Fais valider la conformité de la prospection B2B vers la France.

## Limites actuelles
Voir `tests/RESULTATS.md` (agents non encore testés en session), `PHASE-B-C-RECHERCHE-SKILLS.md` (limites de la recherche) et `INSTALLATIONS.md` (ce qui a été exclu et pourquoi).

## Évolution prévue
1. Tester les 5 agents sur des scénarios fictifs (Excel, présentation, recherche, brouillon).
2. Déplacer ce dossier dans un dépôt privé dédié `stage-maurice`.
3. Remplacer les hypothèses par les vraies missions dès que le tuteur les confirme.
4. Ajouter une veille planifiée hebdomadaire.
