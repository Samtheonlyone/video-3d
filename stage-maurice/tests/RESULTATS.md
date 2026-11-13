# Tests documentés (documents fictifs uniquement)

Date : 2026-11-13. Environnement : conteneur cloud, Python 3.13.

| # | Scénario | Résultat | Preuve |
|---|---|---|---|
| T1 | Scoring de 6 prospects fictifs (`score_prospects.py`) | **Réussi** : 6 lues / 6 écrites, 2 lignes signalées « données manquantes », tri correct, scores recalculés à la main sur 3 lignes | `tests/fixtures/prospects-fictifs.csv` |
| T2 | Erreur : fichier d'entrée vide | **Réussi** : message clair, code 2, aucun fichier écrit | |
| T3 | Erreur : poids de l'ICP ≠ 100 | **Réussi** : refus avec message, code 2 | |
| T4 | Suivi : ajout, changement d'état, journal, tâche inexistante | **Réussi** : transitions correctes, journal JSONL (4 lignes), tâche #99 → erreur code 1 | |
| T5 | Génération du tableau de bord HTML | **Réussi** : fichier créé, colonne « À valider » présente | |

## Non testé (honnêteté)

- **Les 5 agents** : ils sont définis mais n'ont pas été invoqués. Les sous-agents d'un dossier de projet se chargent au démarrage d'une session ouverte dans `stage-maurice/`. À tester au prochain démarrage.
- **Skills installés** : lus, pas exécutés sur un cas réel.
- **Analyse Excel, présentation, recherche approfondie, brouillon Gmail** : à tester avec les agents (scénarios 1, 2, 4, 5, 6 de la mission).
- **Limite connue du scoring** : une taille manquante vaut 0 point mais n'élimine pas la ligne (ex. « Faux BTP » à 80). Le champ `donnees_manquantes` doit être lu avant de prioriser. Les poids sont des hypothèses.

Mesures : taux de réussite des tests scriptés 5/5 ; temps d'exécution < 1 s chacun ; aucune intervention humaine requise ; qualité = conforme aux attendus écrits avant exécution.
