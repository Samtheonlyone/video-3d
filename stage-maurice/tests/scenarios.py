#!/usr/bin/env python3
"""Scénarios de test de bout en bout sur données fictives (sans réseau, sans connecteur).
Usage : python3 tests/scenarios.py   (écrit dans tests/sorties/, affiche un bilan)
Chaque scénario écrit un fichier, le RELIT, et compare à une valeur attendue calculée indépendamment.
"""
import csv, shutil, sys, time
from pathlib import Path

import pandas as pd
from docx import Document
from openpyxl import Workbook, load_workbook
from pptx import Presentation

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / "tests" / "sorties"
SORTIE.mkdir(parents=True, exist_ok=True)
RES = []


def cas(nom):
    def deco(f):
        def run():
            t = time.time()
            try:
                f(); RES.append((nom, "OK", f"{time.time()-t:.2f}s", ""))
            except Exception as e:  # le test échoue franchement, jamais en silence
                RES.append((nom, "ÉCHEC", f"{time.time()-t:.2f}s", f"{type(e).__name__}: {e}"))
        return run
    return deco


# Données fictives : 8 offres d'emploi par secteur (valeurs choisies pour un total connu)
DONNEES = [("logistique", 40, 31), ("logistique", 25, 20), ("industrie", 60, 45), ("industrie", 15, 10),
           ("santé", 80, 70), ("santé", 20, 15), ("numérique", 35, 12), ("numérique", 5, 4)]
ATTENDU_TOTAL = sum(d[1] for d in DONNEES)            # 280
ATTENDU_PAR_SECTEUR = {"logistique": 65, "industrie": 75, "santé": 100, "numérique": 40}


@cas("S1 Analyse d'un fichier Excel (agrégation + formule + contrôle)")
def s1():
    wb = Workbook(); ws = wb.active; ws.title = "offres"
    ws.append(["secteur", "offres", "pourvues"])
    for d in DONNEES: ws.append(list(d))
    n = len(DONNEES) + 1
    ws.append(["TOTAL", f"=SUM(B2:B{n})", f"=SUM(C2:C{n})"])
    wb.save(SORTIE / "offres-fictives.xlsx")
    df = pd.read_excel(SORTIE / "offres-fictives.xlsx", sheet_name="offres")
    df = df[df["secteur"] != "TOTAL"]
    agg = df.groupby("secteur")["offres"].sum().to_dict()
    assert agg == ATTENDU_PAR_SECTEUR, agg
    assert int(df["offres"].sum()) == ATTENDU_TOTAL
    # La formule est bien présente dans le fichier (non évaluée par openpyxl : on vérifie le texte)
    assert load_workbook(SORTIE / "offres-fictives.xlsx")["offres"][f"B{n+1}"].value == f"=SUM(B2:B{n})"


@cas("S2 Rapport Word : titres, tableau, chiffres relus")
def s2():
    agg = pd.DataFrame(DONNEES, columns=["secteur", "offres", "pourvues"]).groupby("secteur").sum().reset_index()
    d = Document(); d.add_heading("Rapport fictif : offres par secteur", 1)
    d.add_paragraph(f"Total des offres analysées : {ATTENDU_TOTAL}. Source : données fictives de test.")
    t = d.add_table(rows=1, cols=3); t.rows[0].cells[0].text, t.rows[0].cells[1].text, t.rows[0].cells[2].text = "Secteur", "Offres", "Pourvues"
    for _, r in agg.iterrows():
        c = t.add_row().cells; c[0].text, c[1].text, c[2].text = r["secteur"], str(r["offres"]), str(r["pourvues"])
    d.save(SORTIE / "rapport-fictif.docx")
    lu = Document(SORTIE / "rapport-fictif.docx")
    assert any(p.text.startswith("Total des offres analysées : 280") for p in lu.paragraphs)
    lignes = {r.cells[0].text: int(r.cells[1].text) for r in lu.tables[0].rows[1:]}
    assert lignes == ATTENDU_PAR_SECTEUR, lignes


@cas("S3 Présentation PowerPoint : 3 diapositives, contenu relu")
def s3():
    p = Presentation()
    s = p.slides.add_slide(p.slide_layouts[0]); s.shapes.title.text = "Marché du recrutement (fictif)"
    s = p.slides.add_slide(p.slide_layouts[1]); s.shapes.title.text = "Secteurs"
    s.placeholders[1].text = "\n".join(f"{k} : {v} offres" for k, v in ATTENDU_PAR_SECTEUR.items())
    s = p.slides.add_slide(p.slide_layouts[1]); s.shapes.title.text = "Limites"; s.placeholders[1].text = "Données fictives, non vérifiées"
    p.save(SORTIE / "presentation-fictive.pptx")
    lu = Presentation(SORTIE / "presentation-fictive.pptx")
    assert len(lu.slides) == 3 and "santé : 100 offres" in lu.slides[1].placeholders[1].text


@cas("S4 Classement de documents (déplacement, jamais de suppression)")
def s4():
    ent = SORTIE / "entrant-test"; cor = SORTIE / "corbeille-test"; rg = SORTIE / "classes-test"
    for d in (ent, cor, rg): shutil.rmtree(d, ignore_errors=True); d.mkdir(parents=True)
    noms = ["Facture ACME.pdf", "compte rendu final(2).docx", "rapport.xlsx", "notes.txt"]
    for n in noms: (ent / n).write_text("fictif")
    for f in list(ent.iterdir()):
        dest = rg / f.suffix.lstrip(".").lower(); dest.mkdir(exist_ok=True); shutil.move(str(f), dest / f.name)
    arrives = sorted(p.name for p in rg.rglob("*") if p.is_file())
    assert sorted(noms) == arrives and not list(ent.iterdir()), arrives


@cas("S5 Tâche répétitive : 3 relances J+4/J+9 générées depuis un CSV")
def s5():
    csv_in = SORTIE / "classes.csv"
    if not csv_in.exists():
        raise FileNotFoundError("lancer d'abord score_prospects.py (T1)")
    top = [r for r in csv.DictReader(open(csv_in, encoding="utf-8")) if float(r["score"]) >= 80]
    sortie = SORTIE / "plan-relances.csv"
    with open(sortie, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["entreprise", "etape", "delai_jours", "statut"])
        for r in top:
            for etape, jours in (("email 1", 0), ("relance 1", 4), ("relance 2", 9)): w.writerow([r["entreprise"], etape, jours, "brouillon"])
    lignes = list(csv.DictReader(open(sortie, encoding="utf-8")))
    assert len(lignes) == len(top) * 3 and all(l["statut"] == "brouillon" for l in lignes)  # aucun envoi


@cas("S6 Gestion d'erreur : fichier Excel corrompu → échec explicite, original intact")
def s6():
    bad = SORTIE / "corrompu.xlsx"; bad.write_bytes(b"ceci n'est pas un xlsx")
    avant = bad.read_bytes()
    try:
        pd.read_excel(bad); raise AssertionError("aurait dû échouer")
    except AssertionError:
        raise
    except Exception:
        pass
    assert bad.read_bytes() == avant


@cas("S7 Contrôle qualité : détection d'un chiffre incohérent injecté")
def s7():
    texte = f"Total des offres : {ATTENDU_TOTAL + 5}. Santé : 100."
    import re
    annonce = int(re.search(r"Total des offres : (\d+)", texte).group(1))
    assert annonce != ATTENDU_TOTAL  # le contrôle repère l'écart
    écart = annonce - ATTENDU_TOTAL; assert écart == 5


if __name__ == "__main__":
    for f in (s1, s2, s3, s4, s5, s6, s7): f()
    for nom, st, t, msg in RES: print(f"[{st:5}] {nom} ({t}) {msg}")
    ok = sum(1 for r in RES if r[1] == "OK"); print(f"\n{ok}/{len(RES)} réussis")
    sys.exit(0 if ok == len(RES) else 1)
