// Répliques : le texte vient de script.json, les durées réelles de calage.json (écrit par « npm run caler » une fois les voix générées).
// Sans voix, la durée est estimée (0,3 s par mot + 0,3 s) : on peut déjà régler l'image.
import SCRIPT from "./script.json";
import CALAGE from "./calage.json";
import type { Ligne } from "../kit/habillage";
import type { Voix } from "../kit/son";

type L = { id: string; voix: string; qui?: string; tag?: string; debut: number; max?: number; texte: string; dit: string };
const C = CALAGE as Record<string, { d: number; mots?: number[] }>;
// on ne compte que les vrais mots (pas « ! » ni « ? »)
const estime = (texte: string) => 0.3 * texte.split(" ").filter((w) => /[A-Za-zÀ-ÿ0-9]/.test(w)).length + 0.3;

export const TITRE: string = SCRIPT.titre;
export const SAISON: string = SCRIPT.saison;
export const FIN = SCRIPT.fin;
export const LIGNES: Ligne[] = (SCRIPT.lignes as L[]).map((l) => {
  const d = Math.min(C[l.id]?.d ?? estime(l.texte), l.max ?? 99);
  return { id: l.id, qui: l.qui, tag: l.tag, t0: l.debut, t1: l.debut + d, texte: l.texte, mots: C[l.id]?.mots?.map((m) => l.debut + m) };
});
export const VOIX: Voix[] = (SCRIPT.lignes as L[]).filter((l) => C[l.id]).map((l) => ({ id: l.id, at: l.debut, d: Math.min(C[l.id].d, l.max ?? 99) }));
// un personnage parle-t-il à l'instant t ? (pour animer sa bouche)
export const parle = (voix: string, t: number) => (SCRIPT.lignes as L[]).some((l) => l.voix === voix && LIGNES.find((x) => x.id === l.id && t >= x.t0 && t < x.t1));
