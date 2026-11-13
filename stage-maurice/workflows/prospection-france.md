# Workflow : prospection France

Agent responsable : Manager. Déclencheur : `/prospect <objectif>`.

| # | Étape | Agent | Outils | Automatisation | Sortie |
|---|---|---|---|---|---|
| 1 | Cadrer l'objectif et vérifier `config/icp.json` | manager | lecture | totale | objectif écrit en 3 lignes |
| 2 | Créer la tâche de suivi | gestion-projet | `scripts/tache.py` | totale | tâche #n |
| 3 | Rechercher entreprises et signaux | prospection-recherche | Firecrawl, Indeed, web | totale (gratuit) | `documents/sortant/prospects-<sujet>.csv` + sources |
| 4 | Vérifier les sources (échantillon) | controle-qualite | web | totale | rapport de contrôle |
| 5 | Scorer | data-crm | `scripts/score_prospects.py` | totale | `*-classes.csv` |
| 6 | **Décision humaine** : valider les cibles, accepter ou non un coût d'enrichissement | Samaane | | humaine | feu vert |
| 7 | Enrichir décideurs (optionnel, payant) | prospection-recherche | Alexandria (demande) | partielle | contacts sourcés |
| 8 | Rédiger séquence (email J0, relance J+4, J+9, LinkedIn manuel) en brouillon | redaction | `cold-email` | totale (brouillon) | `documents/sortant/sequence-<sujet>.md` |
| 9 | Contrôle qualité et conformité (origine des données, opt-out, ton) | controle-qualite | | totale | verdict |
| 10 | **Décision humaine** : valider, envoyer soi-même ou autoriser l'envoi | Samaane | Gmail | humaine | envoi |
| 11 | Mettre à jour le pipeline | data-crm | Sheets | partielle | statuts |

Totalement automatisé : 1-5, 8-9. Partiel : 7, 11. Humain obligatoire : 6, 10.
Résultat final : une liste scorée et sourcée, une séquence relue, prête à valider.
