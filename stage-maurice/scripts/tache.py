#!/usr/bin/env python3
"""Suivi des tâches : ajouter, mettre à jour, lister. Écrit suivi/taches.json et logs/activite.jsonl.

Usage :
  python3 scripts/tache.py ajouter "Analyse du marché FR" --agent prospection-recherche [--minutes-gagnees 90]
  python3 scripts/tache.py etat 3 a_valider [--note "livrable dans documents/sortant/..."]
  python3 scripts/tache.py lister [--etat bloque]
États : a_faire, en_cours, a_valider, bloque, termine, erreur
"""
import argparse, json, sys
from datetime import datetime, timezone
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
FICHIER = RACINE / "suivi" / "taches.json"
JOURNAL = RACINE / "logs" / "activite.jsonl"
ETATS = ["a_faire", "en_cours", "a_valider", "bloque", "termine", "erreur"]


def maintenant():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def charger():
    if FICHIER.exists():
        return json.loads(FICHIER.read_text(encoding="utf-8"))
    return {"taches": []}


def sauver(data):
    FICHIER.parent.mkdir(parents=True, exist_ok=True)
    FICHIER.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def journal(evenement, **champs):
    JOURNAL.parent.mkdir(parents=True, exist_ok=True)
    with JOURNAL.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"ts": maintenant(), "evenement": evenement, **champs}, ensure_ascii=False) + "\n")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)
    a = sp.add_parser("ajouter"); a.add_argument("titre"); a.add_argument("--agent", default="manager")
    a.add_argument("--minutes-gagnees", type=int, default=0)
    e = sp.add_parser("etat"); e.add_argument("id", type=int); e.add_argument("etat", choices=ETATS)
    e.add_argument("--note", default=""); e.add_argument("--minutes-gagnees", type=int)
    l = sp.add_parser("lister"); l.add_argument("--etat", choices=ETATS)
    args = p.parse_args(argv)

    data = charger()
    taches = data["taches"]
    if args.cmd == "ajouter":
        nid = max([t["id"] for t in taches], default=0) + 1
        t = {"id": nid, "titre": args.titre, "agent": args.agent, "etat": "a_faire",
             "cree": maintenant(), "maj": maintenant(), "note": "", "minutes_gagnees": args.minutes_gagnees}
        taches.append(t); sauver(data); journal("tache_ajoutee", id=nid, titre=args.titre, agent=args.agent)
        print(f"Tâche #{nid} ajoutée")
    elif args.cmd == "etat":
        t = next((t for t in taches if t["id"] == args.id), None)
        if t is None:
            print(f"Tâche #{args.id} introuvable", file=sys.stderr); return 1
        ancien = t["etat"]; t["etat"] = args.etat; t["maj"] = maintenant()
        if args.note: t["note"] = args.note
        if args.minutes_gagnees is not None: t["minutes_gagnees"] = args.minutes_gagnees
        sauver(data); journal("tache_etat", id=t["id"], de=ancien, vers=args.etat, note=args.note)
        print(f"Tâche #{t['id']} : {ancien} → {args.etat}")
    else:
        for t in taches:
            if args.etat is None or t["etat"] == args.etat:
                print(f"#{t['id']:>3} [{t['etat']:<9}] {t['agent']:<22} {t['titre']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
