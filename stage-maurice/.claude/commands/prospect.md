---
description: Lance un workflow de prospection France (recherche, scoring, séquence en brouillon)
argument-hint: <secteur ou région ou objectif>
---

Objectif de prospection : $ARGUMENTS

Suis `workflows/prospection-france.md` étape par étape. Résumé :
1. `gestion-projet` crée la tâche (`scripts/tache.py ajouter`).
2. `prospection-recherche` produit la liste de prospects sourcée dans `documents/sortant/`.
3. `data-crm` score la liste avec `scripts/score_prospects.py`.
4. `redaction` prépare une séquence en **brouillon** pour les 5 premiers prospects.
5. `controle-qualite` relit tout.
6. Mets la tâche à l'état `a_valider`, régénère le tableau de bord et présente à Samaane : ce qui est prêt, ce qui est « À CONFIRMER », le coût éventuel de crédits.
N'envoie rien.
