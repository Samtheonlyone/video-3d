# Journal des installations (traçabilité)

Date : 2026-11-13. Installation faite dans `stage-maurice/.claude/skills/` (portée : ce projet uniquement, rien dans `~/.claude`).

| Source | Version (commit) | Licence | Ce qui a été installé | Ce qui a été exclu et pourquoi |
|---|---|---|---|---|
| github.com/coreyhaines31/marketingskills | `1f83744` | MIT | 14 skills : cold-email, prospecting, revops, copywriting, copy-editing, product-marketing, competitor-profiling, competitors, emails, marketing-plan, customer-research, social, lead-magnets, sales-enablement | 39 autres skills (SEO, CRO, ads, paywalls…) hors périmètre ; scripts `.github/`, `conversion-tracking` non copiés |
| github.com/zubair-trabzada/ai-sales-team-claude | `efef8b8` | MIT | 5 skills en Markdown : sales-icp, sales-qualify, sales-prep, sales-objections, sales-proposal ; 3 modèles dans `config/` | **Scripts Python exclus : `analyze_prospect.py` et `contact_finder.py` désactivent la vérification TLS** (`CERT_NONE`). Agents exclus (on utilise les nôtres). Skills `sales-prospect` et `sales-report-pdf` exclus (dépendent des scripts). |

Revue de code avant installation : motifs suspects (exec, curl|sh, exfiltration, injection) recherchés dans les 14 skills retenus : aucun dans les instructions des skills. Mentions de `curl` dans `social/references/listening.md` (exemples de lecture publique), à ne pas exécuter sans validation.

Rien n'a été installé ailleurs : pas de paquet pip/npm, pas de serveur, pas de connecteur ajouté.

## Pour retirer un skill
`rm -r .claude/skills/<nom>` puis mettre à jour ce fichier. (Le système n'efface rien lui-même.)

## Mettre à jour
Recloner la source dans un dossier isolé, relire le diff, recopier, noter le nouveau commit ici.
