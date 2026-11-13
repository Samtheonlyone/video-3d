# Tests documentés (documents fictifs uniquement)

Date : 2026-11-13. Environnement : conteneur cloud, Python 3.13.

| # | Scénario | Résultat | Preuve |
|---|---|---|---|
| T1 | Scoring de 6 prospects fictifs (`score_prospects.py`) | **Réussi** : 6 lues / 6 écrites, 2 lignes signalées « données manquantes », tri correct, scores recalculés à la main sur 3 lignes | `tests/fixtures/prospects-fictifs.csv` |
| T2 | Erreur : fichier d'entrée vide | **Réussi** : message clair, code 2, aucun fichier écrit | |
| T3 | Erreur : poids de l'ICP ≠ 100 | **Réussi** : refus avec message, code 2 | |
| T4 | Suivi : ajout, changement d'état, journal, tâche inexistante | **Réussi** : transitions correctes, journal JSONL (4 lignes), tâche #99 → erreur code 1 | |
| T5 | Génération du tableau de bord HTML | **Réussi** : fichier créé, colonne « À valider » présente | |


## Scénarios de bout en bout (`tests/scenarios.py`, 2026-11-13) : 7/7 réussis

Chaque scénario écrit un fichier, le **relit** et compare à une valeur calculée à part. Durée totale < 1 s, aucune intervention humaine.

| # | Scénario | Résultat |
|---|---|---|
| S1 | Excel : agrégation par secteur, total = 280, formule `SUM` présente | OK |
| S2 | Rapport Word : titre, tableau, chiffres relus identiques | OK |
| S3 | PowerPoint : 3 diapositives, contenu relu | OK |
| S4 | Classement de 4 documents par type : tous retrouvés, entrée vide, rien supprimé | OK |
| S5 | Plan de relances J0/J+4/J+9 pour les prospects ≥ 80, tous au statut « brouillon » | OK |
| S6 | Excel corrompu : échec explicite, fichier d'origine intact | OK |
| S7 | Détection d'un total incohérent injecté (+5) | OK (test faible, voir ci-dessous) |

### Ce que ces tests prouvent
Les bibliothèques et scripts du système lisent, calculent et écrivent correctement des fichiers Excel, Word et PowerPoint, gèrent un fichier corrompu sans l'abîmer, et ne suppriment rien.

### Ce qu'ils ne prouvent pas
- **Ils ne testent pas les agents ni les skills** : ce sont des scripts Python. Un agent qui rédige un mail ou analyse un marché reste à tester en session ouverte dans `stage-maurice/`.
- **S7 est faible** : il vérifie qu'un écart injecté est détectable par une expression régulière, pas que l'agent `controle-qualite` le détecterait.
- **Non testés (connecteurs indisponibles pendant cette session)** : recherche web (Firecrawl, Indeed), brouillon Gmail, écriture Google Sheets.

## Non testé (honnêteté)

- **Les 5 agents** : ils sont définis mais n'ont pas été invoqués. Les sous-agents d'un dossier de projet se chargent au démarrage d'une session ouverte dans `stage-maurice/`. À tester au prochain démarrage.
- **Skills installés** : lus, pas exécutés sur un cas réel.
- **Analyse Excel, présentation, recherche approfondie, brouillon Gmail** : à tester avec les agents (scénarios 1, 2, 4, 5, 6 de la mission).
- **Limite connue du scoring** : une taille manquante vaut 0 point mais n'élimine pas la ligne (ex. « Faux BTP » à 80). Le champ `donnees_manquantes` doit être lu avant de prioriser. Les poids sont des hypothèses.

Mesures : taux de réussite des tests scriptés 5/5 ; temps d'exécution < 1 s chacun ; aucune intervention humaine requise ; qualité = conforme aux attendus écrits avant exécution.
