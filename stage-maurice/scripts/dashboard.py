#!/usr/bin/env python3
"""Génère suivi/index.html (autonome, sans serveur) depuis suivi/taches.json et logs/activite.jsonl.
Usage : python3 scripts/dashboard.py   puis ouvrir suivi/index.html
"""
import html, json, sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
TACHES = RACINE / "suivi" / "taches.json"
JOURNAL = RACINE / "logs" / "activite.jsonl"
SORTIE = RACINE / "suivi" / "index.html"
COLONNES = [("a_valider", "À valider par moi"), ("bloque", "Bloquées"), ("erreur", "Erreurs"),
            ("en_cours", "En cours"), ("a_faire", "À faire"), ("termine", "Terminées")]


def esc(x):
    return html.escape(str(x))


def main():
    taches = json.loads(TACHES.read_text(encoding="utf-8"))["taches"] if TACHES.exists() else []
    evenements = []
    if JOURNAL.exists():
        for ligne in JOURNAL.read_text(encoding="utf-8").splitlines():
            try:
                evenements.append(json.loads(ligne))
            except json.JSONDecodeError:
                pass
    minutes = sum(t.get("minutes_gagnees", 0) for t in taches if t["etat"] == "termine")
    kpis = "".join(f'<div class="kpi"><b>{sum(1 for t in taches if t["etat"] == k)}</b><span>{esc(lib)}</span></div>'
                   for k, lib in COLONNES)
    blocs = []
    for k, lib in COLONNES:
        lignes = [t for t in taches if t["etat"] == k]
        if not lignes:
            continue
        items = "".join(
            f'<li><span class="id">#{t["id"]}</span> {esc(t["titre"])}'
            f'<small>{esc(t["agent"])}{" · " + esc(t["note"]) if t.get("note") else ""}</small></li>' for t in lignes)
        blocs.append(f'<section class="{k}"><h2>{esc(lib)}</h2><ul>{items}</ul></section>')
    recents = "".join(f'<li><time>{esc(e["ts"][:16].replace("T", " "))}</time> {esc(e["evenement"])} '
                      f'{esc({k: v for k, v in e.items() if k not in ("ts", "evenement")})}</li>' for e in evenements[-15:][::-1])
    page = f"""<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tableau de bord stage</title><style>
:root{{--bg:#f6f7f9;--card:#fff;--tx:#1b1f24;--mut:#667085;--bd:#e3e6eb;--ac:#2457d6;--warn:#b54708;--bad:#b42318;--ok:#067647}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0f1318;--card:#171c23;--tx:#e8ebf0;--mut:#9aa4b2;--bd:#262d38;--ac:#7aa2ff;--warn:#f79009;--bad:#f97066;--ok:#47cd89}}}}
body{{margin:0;background:var(--bg);color:var(--tx);font:15px/1.5 system-ui,sans-serif}}main{{max-width:900px;margin:0 auto;padding:24px 16px}}
h1{{font-size:22px;margin:0 0 4px}}p.sub{{color:var(--mut);margin:0 0 20px}}.kpis{{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:20px}}
.kpi{{background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:12px}}.kpi b{{display:block;font-size:24px}}.kpi span{{color:var(--mut);font-size:12px}}
section{{background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:4px 16px 12px;margin-bottom:12px}}section h2{{font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:var(--mut)}}
section.a_valider{{border-left:4px solid var(--warn)}}section.bloque,section.erreur{{border-left:4px solid var(--bad)}}section.termine{{border-left:4px solid var(--ok)}}
ul{{list-style:none;margin:0;padding:0}}li{{padding:6px 0;border-top:1px solid var(--bd)}}li:first-child{{border-top:0}}small{{display:block;color:var(--mut)}}.id{{color:var(--ac);font-weight:600}}time{{color:var(--mut)}}
</style></head><body><main><h1>Tableau de bord — stage Succexa</h1>
<p class="sub">Temps gagné estimé (tâches terminées) : <b>{minutes} min</b> · {len(taches)} tâches</p>
<div class="kpis">{kpis}</div>{"".join(blocs) or "<p>Aucune tâche enregistrée.</p>"}
<section><h2>Activité récente</h2><ul>{recents or "<li>Aucune activité.</li>"}</ul></section></main></body></html>"""
    SORTIE.write_text(page, encoding="utf-8")
    print(f"Écrit {SORTIE.relative_to(RACINE)} ({len(taches)} tâches)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
