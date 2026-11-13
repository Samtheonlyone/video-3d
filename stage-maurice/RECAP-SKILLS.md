# Récapitulatif des skills : quand les utiliser, et pourquoi

Lecture : « Situation » = le moment précis où tu (ou un agent) l'appelles. « Utilité » = ce que ça t'apporte pour le stage chez Succexa. Les situations sont des exemples cohérents avec la mission supposée (marché français, prospection B2B, contenu) ; à ajuster quand les vraies missions seront confirmées.

## A. Skills installés dans le projet (19)

### Prospection et vente
| Skill | Situation précise | Utilité pour toi |
|---|---|---|
| `prospecting` | Le tuteur demande « trouve-moi 20 entreprises françaises à approcher ». | Méthode complète : définir la cible, repérer les signaux d'achat, vérifier les emails, respecter la conformité. Interdit de scraper LinkedIn, ce qui te protège. |
| `sales-icp` | Début de mission : « qui est le client idéal de Succexa en France ? » | Construit le profil client idéal, ses contre-exemples, une grille de scoring et des personas (DRH, dirigeant). Base de tout le reste. |
| `sales-qualify` | Tu as une liste de 30 entreprises et il faut décider lesquelles appeler d'abord. | Note chaque prospect (BANT/MEDDIC) et justifie. Évite de perdre du temps sur de mauvaises cibles. |
| `cold-email` | Tu dois écrire le premier email à un DRH que tu ne connais pas. | Mails courts, relances, délivrabilité, arrêt de la séquence quand quelqu'un répond. Évite les formules « IA » qui nuisent aux réponses. |
| `sales-prep` | Réunion ou appel demain avec un prospect, ou ton point avec le tuteur. | Fiche d'une page : contexte de l'entreprise, interlocuteur, questions à poser, points de vigilance. |
| `sales-objections` | Un prospect répond « on a déjà un cabinet » ou « envoyez-moi une brochure ». | 15 objections classiques et des réponses structurées. Utile avant tes premiers appels. |
| `sales-proposal` | Un prospect intéressé demande une offre. | Structure de proposition commerciale (résumé, situation, solution, périmètre, planning). Tu prépares, le tuteur chiffre et valide. |
| `sales-enablement` | Le tuteur veut une plaquette de présentation, un script d'appel ou une fiche concurrent. | Supports de vente : one-pager, trames d'appel, battle cards. |
| `revops` | Il faut organiser le pipeline : qu'est-ce qu'un « lead chaud » ? | Définit les étapes du pipeline, les règles de transmission et de scoring. Sert à construire ton tracker. |

### Rédaction et contenu
| Skill | Situation précise | Utilité pour toi |
|---|---|---|
| `emails` | Un prospect a répondu ; il faut une suite de mails automatisés d'accueil/nurturing. | Séquences d'emails non-froids (suivi, entretien de la relation). |
| `copywriting` | Rédiger le texte d'une page « Succexa pour les entreprises françaises » ou une annonce. | Textes qui commencent par le bon message, avec des affirmations défendables (ne promet que ce qui est prouvable). |
| `copy-editing` | Le tuteur t'a envoyé un texte à relire ou tu as un brouillon à resserrer. | Corrige sans tout réécrire, retire les tournures « générées par IA ». |
| `social` | Calendrier de posts LinkedIn pour la marque employeur ou pour Succexa. | Posts, carrousels, scripts vidéo, calendrier. Vu ton portfolio vidéo, c'est un point fort. |
| `lead-magnets` | Idée de contenu à offrir contre un email (guide « recruter en 2027 », checklist). | Choisir quoi donner, comment le protéger par formulaire, comment le suivre. |

### Stratégie et analyse
| Skill | Situation précise | Utilité pour toi |
|---|---|---|
| `product-marketing` | Au tout début : poser positionnement, cible, ton de Succexa. | Crée et tient à jour `.agents/product-marketing.md`, lu automatiquement par les autres skills. |
| `competitor-profiling` | « Qui sont les concurrents de Succexa en France ? » | Profils datés avec faits séparés des interprétations. |
| `competitors` | Rédiger une page « Succexa vs un cabinet classique ». | Formats de comparaison, ce qu'on a le droit de dire d'un concurrent. |
| `customer-research` | Interroger des DRH ou analyser des avis pour comprendre leurs problèmes de recrutement. | Interviews, enquêtes, synthèse. Sert à nourrir tes messages. |
| `marketing-plan` | Plan de lancement du marché français sur 16 semaines. | Canaux, budget, priorités, calendrier. Utile pour structurer ton rapport de stage aussi. |

## B. Skills déjà dans ton compte (pas installés par moi)

| Skill | Situation précise | Utilité pour toi |
|---|---|---|
| `pptx` | Présentation de ton analyse du marché français (celle que le CEO a demandée au départ). | Crée et modifie des PowerPoint. |
| `docx` | Compte rendu, proposition, rapport. | Word avec mise en forme et commentaires. |
| `xlsx` | Tracker de prospects, tableaux, graphiques. | Excel avec formules ; complète `score_prospects.py`. |
| `pdf` | Extraire du texte d'un portfolio, d'un rapport sectoriel ou de ta convention. | Lire, fusionner, remplir des PDF. |
| `deep-research` | Étude longue : « quels secteurs recrutent le plus en France ? » | Recherche multi-sources avec synthèse ; à faire relire par `controle-qualite`. |
| `google-workspace` | Lire Gmail, Agenda, Sheets, Drive d'un coup. | Relie le système à tes outils ; l'envoi reste soumis à ta validation. |
| Plugin `marketing` : `email-sequence`, `competitive-brief`, `campaign-plan`, `draft-content`, `brand-review`, `seo-audit` | Séquences complètes, brief concurrentiel, plan de campagne, relecture de ton de marque, audit SEO du site. | Recoupent en partie les skills installés ; à utiliser quand tu veux un livrable tout fait. |
| Plugin `productivity` : `task-management`, `memory-management` | Garder une liste de tâches et le jargon de Succexa. | Mémoire de l'entreprise (noms, sigles) pour ne pas tout réexpliquer. |
| Plugin `data` : `analyze`, `create-viz` | Un fichier de chiffres à analyser ou graphique à produire. | Analyse et visualisation propres. |
| `skill-creator` | Une tâche se répète plus de trois fois. | Transforme ta façon de faire en skill. |

## C. Pour quelle situation prendre quoi (raccourci)

| Si tu dois… | Utilise |
|---|---|
| comprendre qui cibler | `sales-icp` → `prospecting` → `sales-qualify` |
| écrire à un inconnu | `cold-email` (+ `copy-editing` pour relire) |
| préparer un appel ou une réunion | `sales-prep` + `sales-objections` |
| rendre un livrable au tuteur | `pptx` / `docx`, puis `controle-qualite` |
| suivre ton activité | `revops` + `xlsx` + `scripts/dashboard.py` |
| publier du contenu | `social` + `copywriting` (publication = ta validation) |

## D. Limites honnêtes
- Ces skills viennent de dépôts publics écrits pour des contextes plutôt anglo-saxons et logiciels : les adapter au recrutement et au français est du travail, pas automatique.
- Aucun n'a encore été exécuté sur un cas réel de Succexa.
- Les skills ne remplacent pas la validation de ton tuteur ni l'avis juridique sur la prospection vers la France.
