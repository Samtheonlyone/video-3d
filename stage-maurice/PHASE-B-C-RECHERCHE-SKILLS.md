# Stage Succexa (Maurice) — Phases B & C : recherche et classement

Date : 2026-11-13. Statut : **recherche uniquement, rien n'est installé.**

## 0. Honnêteté méthodologique

- Profondeur de lecture : **L1** = fiche de liste / README seul ; **L2** = extrait réel du SKILL.md ou README détaillé (structure, commandes, dépendances).
- Les notes /100 sont mon jugement sur ces lectures. Aucun skill n'a été exécuté : la colonne « Fiabilité » reflète popularité, licence, fraîcheur, pas un test.
- Avant toute installation : lecture complète du SKILL.md et des scripts (un skill peut exécuter du code). Source du risque : avertissement dans les READMEs eux-mêmes.
- Barème : pertinence 30 / exécution réelle 20 / gain de temps 15 / fiabilité 15 / compatibilité 10 / maintenance 10.

## 1. Contexte Succexa utilisé pour la pertinence

Source : mails Gmail (candidature, échanges avec le CEO), site succexa.mu.
- Succexa Ltd (fondée en 2015, Ebène) : sourcing et chasse de têtes, « pas une société de recrutement classique », forte approche coût bas. Groupe : Succexa, Axero, Valtima.
- Projet 2027 : **pénétrer le marché français** (signer des contrats en France).
- Mission annoncée par le CEO (exercice d'évaluation) : analyse du marché français du recrutement, stratégie de prospection B2B, liste de 20 prospects, séquences de prospection (email, LinkedIn, téléphone, relances).
- Mission convention : « Prospection commerciale et communication marketing digitale ».
- Période : 15 février au 5 juin 2027.
- **À confirmer** : la conversation « stage à l'étranger » n'a pas été lue (inaccessible). Les missions ci-dessous sont reconstituées.

## 2. Skills déjà disponibles (aucune installation)

| # | Skill | Source | Lu | Pertinence stage | Note | Reco |
|---|---|---|---|---|---|---|
| 1 | pptx | Anthropic (Apache 2.0 depuis 6 nov.) | L2 | Présentations d'analyse marché, propositions | 90 | Indispensable |
| 2 | marketing:email-sequence | plugin marketing (installé) | L1 | Séquences email/relances, timing, exit conditions | 90 | Indispensable |
| 3 | xlsx | Anthropic | L2 | Tracker de prospects, scoring, reporting | 90 | Indispensable |
| 4 | docx | Anthropic | L2 | Rapports, propositions, comptes rendus | 88 | Indispensable |
| 5 | deep-research (synced) | compte claude.ai | L1 | Étude secteurs qui recrutent, concurrents | 88 | Indispensable |
| 6 | google-workspace (synced) | compte claude.ai | L1 | Gmail/Drive/Sheets/Calendar | 86 | Très utile |
| 7 | marketing:competitive-brief | plugin marketing | L1 | Concurrents de Succexa en France (cabinets, jobboards) | 85 | Très utile |
| 8 | pdf | Anthropic | L2 | Extraire portfolio, rapports, convention | 85 | Très utile |
| 9 | marketing:campaign-plan | plugin marketing | L1 | Plan de campagne France, calendrier | 84 | Très utile |
| 10 | marketing:draft-content | plugin marketing | L1 | Posts LinkedIn, newsletters, contenu | 84 | Très utile |
| 11 | skill-creator | Anthropic | L2 | Créer nos skills « Succexa » | 82 | Très utile |
| 12 | productivity:task-management | plugin productivity | L1 | TASKS.md partagé | 80 | Utile |
| 13 | productivity:memory-management | plugin productivity | L1 | Mémoire de projet (jargon, contacts) | 78 | Utile |
| 14 | data:analyze / create-viz | plugin data | L1 | Reporting chiffré, graphiques | 74 | Utile |
| 15 | marketing:brand-review | plugin marketing | L1 | Contrôle ton/marque, claims | 72 | Utile |
| 16 | marketing:seo-audit | plugin marketing | L1 | Si audit site Succexa demandé | 70 | Facultatif |

## 3. Skills à installer (candidats externes)

| # | Skill | Dépôt | Lu | Fonctions réelles (d'après doc) | Coût / dépendances | Risques | Note | Reco |
|---|---|---|---|---|---|---|---|---|
| 17 | **marketingskills** (Corey Haines) — sous-ensemble : cold-email, prospecting, revops, copywriting, product-marketing | github.com/coreyhaines31/marketingskills | L2 | 53 skills ; cold-email (214 lignes) renvoie vers `prospecting` (liste, signaux, enrichissement, vérification) et `revops` (scoring, pipeline). MIT, ~60k étoiles, très actif (54 commits en nov. 2026). | Gratuit. Install : `npx skills add` ou plugin. | Pensé SaaS/US : adapter au recrutement et à la France. Chevauche le plugin marketing : n'installer que 4-5 skills. | 86 | Très utile |
| 18 | **Lead Research Assistant** | ComposioHQ/awesome-claude-skills (entrée liste) | L1 | Identifie et qualifie des leads, cherche des entreprises cibles, propose des stratégies d'approche. | Gratuit ; s'appuie sur recherche web. | Qualité non vérifiée (fiche seule). | 80 | Très utile |
| 19 | **ai-sales-team-claude** | github.com/zubair-trabzada/ai-sales-team-claude | L2 | 14 skills + 5 sous-agents : audit prospect, qualification BANT/MEDDIC, décideurs, séquences, prép. RDV, rapport PDF. MIT. Python : reportlab, bs4, requests. | Gratuit. | Récent (mars 2026), faible historique, scripts de scraping à auditer. Cadre vente SaaS plus que chasse de têtes. | 76 | Très utile (à tester d'abord) |
| 20 | doc-coauthoring | anthropics/skills | L1 | Co-rédaction structurée de documents | Gratuit | — | 70 | Utile |
| 21 | Content Research Writer | ComposioHQ list | L1 | Rédaction avec recherche, citations, feedback par section | Gratuit | Fiche seule | 70 | Utile |
| 22 | File Organizer | ComposioHQ list | L1 | Classement de dossiers, doublons | Gratuit | Opérations sur fichiers : validation avant suppression | 66 | Facultatif |
| 23 | CSV Data Summarizer | ComposioHQ list | L1 | Résumé auto de CSV avec visuels | Gratuit | Redondant avec data:analyze | 62 | Facultatif |
| 24 | internal-comms | anthropics/skills | L1 | Rapports d'état, newsletters, FAQ | Gratuit | — | 62 | Facultatif |
| 25 | Meeting Insights Analyzer | ComposioHQ list | L1 | Analyse de transcriptions de réunions | Gratuit | Données sensibles : local seulement | 60 | Facultatif |
| 26 | louisblythe/Sales-Skills | github.com/louisblythe/Sales-Skills | L1 | ~42 skills de vente (outbound, follow-up, sequences) | Gratuit | Doublon avec #17 et #19 | 58 | Éliminé (doublon) |
| 27 | borghei cold-email | github.com/borghei/Claude-Skills | L2 | Cold email avec conformité GDPR/CAN-SPAM | Gratuit | Doublon avec #17 ; l'angle GDPR est utile à relire | 60 | Éliminé (doublon), s'en inspirer |
| 28 | alirezarezvani/claude-skills | github.com/alirezarezvani/claude-skills | L1 | 220+ skills dont growth, launch, cold-email | MIT | Trop volumineux, bruit | 50 | Éliminé |
| 29 | n8n-skills | ComposioHQ list | L1 | Piloter des workflows n8n | n8n à héberger | Lourd, non nécessaire au départ | 50 | Facultatif (plus tard) |
| 30 | Playwright Browser Automation | lackeyjb/playwright-skill | L1 | Automatisation navigateur | Playwright déjà présent | Surtout orienté tests web | 55 | Facultatif |
| 31 | Septim Agents Pack | ComposioHQ list | L1 | 10 sous-agents nommés | — | Non vérifié, on conçoit les nôtres | 40 | Éliminé |
| 32 | loki-mode | travisvn list | L1 | « 37 agents autonomes » | — | Marketing, risque et autonomie non maîtrisée | 15 | Inutile |

Total évalué : 32. Indispensables / très utiles : 11 (n° 1-11) + 17-19. Complémentaires : 20 environ.

## 4. Outils complémentaires (catégories distinctes)

| Catégorie | Outil | État | Utilité | Coût |
|---|---|---|---|---|
| MCP (connecté) | Gmail | OK | Brouillons de mails, lecture. **Envoi : validation humaine** | Gratuit |
| MCP (connecté) | Google Sheets / Drive / Docs / Slides / Calendar | OK | CRM léger (Sheets), documents, planning | Gratuit |
| MCP (connecté) | Firecrawl (scrape, search, agent, people_company_*) | OK | Recherche d'entreprises françaises, veille, enrichissement | **Crédits** (à vérifier le solde via credit_usage) |
| MCP (connecté) | Indeed | OK | Offres et entreprises qui recrutent en France (signal de prospection) | Gratuit |
| MCP (connecté) | Canva, Gamma, Figma | OK | Visuels et présentations | Selon plan |
| MCP (connecté) | Metricool, vidIQ, Orshot | OK | Planification de contenu social | Selon plan |
| MCP (en échec) | HubSpot, Notion, Asana, Slack, ClickUp… | Proxy 403 | CRM / tâches | À réparer côté utilisateur |
| Alexandria (via Firecrawl) | leadsforge `people/search` (gratuit) et `email-find` (10 crédits) ; getleadsio `enrich-person` (5 crédits) | Disponible | Trouver décideurs et emails pro | **Payant au crédit**, ne pas lancer sans validation |
| Logiciel externe | LibreOffice, pandoc | Présents | Conversion de documents | Gratuit |
| Bibliothèque | Python 3.13 (openpyxl, reportlab, etc. à vérifier) | Présent | Scripts de traitement | Gratuit |
| Logiciel externe | Playwright + Chromium | Présent | Automatisation navigateur | Gratuit |
| Absent | tesseract (OCR), n8n | Non installés | OCR de scans, workflows no-code | Gratuit / auto-hébergé : pas nécessaires au départ |

## 5. Points de conformité à vérifier (non juridique)

- Prospection B2B en France depuis Maurice : droit d'opposition, information sur l'origine des données, pertinence du ciblage (RGPD / CNIL). **À faire valider par Succexa**, je ne donne pas d'avis juridique.
- Pas de scraping massif de profils LinkedIn (CGU). Préférer les sources publiques et les API autorisées.
- Aucune donnée interne Succexa vers un service externe sans accord écrit.

## 6. Architecture multi-agents proposée (6 agents, pas 8)

| Agent | Rôle réel pour Succexa | Skills / outils | Peut faire seul | Validation humaine |
|---|---|---|---|---|
| **Manager** | Reçoit l'instruction, découpe, délègue, assemble, vérifie | tous | Orchestration | Décisions, envois |
| **Prospection & Recherche** | Marché FR du recrutement, secteurs porteurs, 20+ prospects, fiches entreprise | deep-research, prospecting, Lead Research, Firecrawl, Indeed | Recherche, scoring, fiches | Achat de crédits enrichissement |
| **Rédaction** | Emails, séquences, posts LinkedIn, présentations, comptes rendus | email-sequence, copywriting, docx, pptx | Brouillons | **Tout envoi / publication** |
| **Data & CRM** | Tracker Sheets, scoring, reporting hebdo | xlsx, Sheets, data:analyze | Calculs, graphiques | Suppressions |
| **Contrôle qualité & conformité** | Vérifie sources, chiffres, ton, RGPD, cohérence | brand-review, checklists | Relecture | Cas litigieux |
| **Gestion de projet** | Planning, échéances, rappels, point hebdo avec tuteur (+ rôle administratif) | task-management, Calendar | Planification | Engagements externes |

Implémentation native Claude Code : `.claude/agents/*.md` (sous-agents), `.claude/skills/`, `CLAUDE.md`, commandes `/prospect`, `/rapport-hebdo`, hooks pour logs. Pas de développement inutile.

## 7. Workflows type (premières versions à construire)

1. **Prospection France** : cadrage ICP → secteurs → liste 20 entreprises → fiches → décideurs → séquence email/LinkedIn/téléphone → brouillons → *validation* → suivi.
2. **Rapport hebdomadaire** : récupérer tracker + agenda → extraire chiffres → analyser → rédiger → contrôle qualité → *validation* → envoi manuel.
3. **Veille marché** : requêtes planifiées Firecrawl/Indeed → synthèse → alertes.
4. **Préparation de réunion** : fiche prospect/contexte + ordre du jour.
5. **Contenu social** : idées → visuels (Canva/Orshot) → brouillon → *validation* → publication manuelle.

## 8. Supervision

Fichier `suivi/TABLEAU-DE-BORD.md` mis à jour par le Manager + tracker Google Sheets (en cours, bloqué, à valider, terminé, temps gagné) + une page HTML locale générée à partir du Sheets. Pas de serveur à maintenir.

## 9. Limites actuelles

- Conversation « stage à l'étranger » non lue ; missions reconstituées.
- Ton PC est hors service : tout vit dans le cloud (dépôt Git + Claude Code web). Un conteneur est éphémère : **il faut un dépôt pour persister**.
- Aucun skill externe testé.
- Plusieurs connecteurs (HubSpot, Notion…) en échec réseau.
