#!/usr/bin/env python3
"""Score des prospects selon config/icp.json. Ne fait aucun appel réseau.

Usage : python3 scripts/score_prospects.py prospects.csv --icp config/icp.json --sortie classes.csv
Colonnes lues : entreprise, secteur, taille_salaries, region, signal, poste_decideur (autres colonnes conservées).
Score 0-100 = somme pondérée de critères (poids dans l'ICP). Les lignes incomplètes sont signalées, jamais devinées.
"""
import argparse, csv, json, sys
from pathlib import Path


def charger_icp(chemin):
    return json.loads(Path(chemin).read_text(encoding="utf-8"))


def score_ligne(l, icp):
    p = icp["poids"]; detail = {}; manques = []
    secteur = (l.get("secteur") or "").strip().lower()
    if not secteur: manques.append("secteur")
    detail["secteur"] = p["secteur"] if secteur in [s.lower() for s in icp["secteurs_prioritaires"]] else (
        p["secteur"] * 0.4 if secteur in [s.lower() for s in icp.get("secteurs_secondaires", [])] else 0)
    try:
        n = int(float(l.get("taille_salaries", "")))
        lo, hi = icp["taille_salaries"]
        detail["taille"] = p["taille"] if lo <= n <= hi else (p["taille"] * 0.4 if lo * 0.5 <= n <= hi * 2 else 0)
    except ValueError:
        manques.append("taille_salaries"); detail["taille"] = 0
    signal = (l.get("signal") or "").strip().lower()
    if not signal: manques.append("signal")
    detail["signal"] = p["signal"] if any(s.lower() in signal for s in icp["signaux"]) else 0
    poste = (l.get("poste_decideur") or "").strip().lower()
    if not poste: manques.append("poste_decideur")
    detail["decideur"] = p["decideur"] if any(s.lower() in poste for s in icp["decideurs"]) else 0
    region = (l.get("region") or "").strip().lower()
    detail["region"] = p["region"] if region and region in [r.lower() for r in icp.get("regions", [])] else 0
    return round(sum(detail.values()), 1), detail, manques


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("entree"); ap.add_argument("--icp", default="config/icp.json"); ap.add_argument("--sortie", required=True)
    a = ap.parse_args(argv)
    icp = charger_icp(a.icp)
    if abs(sum(icp["poids"].values()) - 100) > 1e-6:
        print("Erreur : la somme des poids de l'ICP doit valoir 100", file=sys.stderr); return 2
    with open(a.entree, newline="", encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    if not lignes:
        print("Erreur : fichier d'entrée vide", file=sys.stderr); return 2
    res = []
    for l in lignes:
        s, d, m = score_ligne(l, icp)
        res.append({**l, "score": s, "details": json.dumps(d, ensure_ascii=False), "donnees_manquantes": ";".join(m)})
    res.sort(key=lambda r: r["score"], reverse=True)
    with open(a.sortie, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0].keys())); w.writeheader(); w.writerows(res)
    incompl = sum(1 for r in res if r["donnees_manquantes"])
    print(f"{len(res)} lignes lues, {len(res)} écrites, {incompl} avec données manquantes → {a.sortie}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
