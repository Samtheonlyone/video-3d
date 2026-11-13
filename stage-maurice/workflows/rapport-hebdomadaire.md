# Workflow : rapport hebdomadaire

Agent responsable : gestion-projet. Déclencheur : `/rapport-hebdo` (chaque vendredi).

1. Lire `suivi/taches.json` et `logs/activite.jsonl` de la semaine ; lister `documents/sortant/` modifiés (gestion-projet).
2. Calculer chiffres : tâches terminées, prospects ajoutés/scorés/contactés (si suivis), temps gagné déclaré (data-crm).
3. Rédiger : réalisé, en cours, bloqué (avec raison), apprentissages, prochaines actions, besoins du tuteur (redaction).
4. Contrôle : chaque chiffre est retrouvable dans les fichiers de suivi ; pas d'avancement inventé (controle-qualite).
5. Enregistrer `rapports/AAAA-Wss_rapport-hebdo.md`, marquer la tâche `a_valider`.
6. **Humain** : Samaane relit, complète avec son vécu, envoie lui-même au tuteur.

Automatisé : 1-5. Humain : 6. Résultat : rapport d'une page relu en moins de 5 minutes.
