// Chronologie de la vidéo : instants clés, trajets, regards de la caméra, mains, effets, compte à rebours.
// TOUT est fonction du temps t (secondes). Pour décaler une action, on change un nombre ici.
// Repère : le héros part de (x 1, z 0) et regarde vers -Z (orientation 0). La rue suit l'axe Z. Unités = mètres.
import { trajet, smooth, hit, PI, lerp, aim, type V3 } from "../kit/outils";
import { creerCamera, vers, versPerso, devant, direction, type Regard } from "../kit/camera";
import { mainsCourse, blendMain, GESTES, type Main } from "../kit/mains";
import type { Effets } from "../kit/moteur";
import { LIGNES, FIN } from "./lignes";

// ------------------------------------------------------------ instants clés
export const EV = {
  impact: 3.0,      // la météorite touche le bout de la rue (BOUM vers 3 s, jamais après 6 s)
  demiTour: 4.1,    // on se retourne pour fuir
  chute: 12.4,      // Zoé tombe
  maman: 13.3,      // Maman apparaît devant la maison bleue
  fin: FIN.debut,   // cartes A / B (moins de 10 s après le dilemme)
};
export const DUR = EV.fin + 4.2; // durée totale (s)

// ------------------------------------------------------------ la météorite
export const IMPACT: V3 = [0, 0, -75];
const DEPART: V3 = [70, 260, -300];
export const meteorite = (t: number): V3 => { const u = Math.pow(Math.min(1, Math.max(0, (t + 1) / (EV.impact + 1))), 2); return [lerp(DEPART[0], IMPACT[0], u), lerp(DEPART[1], IMPACT[1], u), lerp(DEPART[2], IMPACT[2], u)]; };
// le front du feu avance vers nous après l'impact
// il ralentit en approchant pour ne jamais dépasser le héros (il reste au moins 6 m derrière lui)
export const front = (t: number) => { const f = IMPACT[2] + 5 + 6.5 * Math.max(0, t - EV.impact), lim = 27; return f < lim - 8 ? f : lim - 8 * Math.exp(-(f - (lim - 8)) / 8); };

// ------------------------------------------------------------ trajets [t, x, z]
export const heros = trajet([
  [0, 1, 0], [2.9, 1, -3.4], [3.2, 1, -3.55], [3.9, 1, -3.55], [4.4, 1.1, -3.1],
  [5.2, 1.4, -0.6], [6.5, 1.6, 4.0], [8.5, 1.8, 13], [12.0, 1.9, 29.5], [12.8, 1.9, 32.4], [13.3, 1.9, 33.2], [40, 1.9, 33.2],
]);
export const zoe = trajet([
  [0, -0.8, -3.6], [2.9, -0.8, -7.0], [3.9, -0.8, -7.0], [4.3, -0.6, -6.4], [5.0, -1.3, -1.5], [5.8, -1.2, 3.0], [6.5, -0.6, 7.0], [7.5, 0.6, 12.5],
  [8.5, 0.9, 17.0], [12.0, 1.0, 33.0], [12.45, 1.0, 35.3], [40, 1.0, 35.6],
]);
export const maman = trajet([[0, 8.2, 42.0], [EV.maman - 0.5, 8.2, 42.0], [EV.maman + 0.3, 6.2, 40.6], [40, 6.2, 40.6]]);
// voisins qui fuient au loin
export const voisins = [
  trajet([[0, -8, -20], [EV.impact + 0.6, -8, -20], [EV.impact + 1.4, -4, -16], [EV.impact + 9, -3, 26], [40, -3, 26]]),
  trajet([[0, 8, -30], [EV.impact + 0.8, 8, -30], [EV.impact + 1.6, 3.5, -26], [EV.impact + 10, 2.5, 14], [40, 2.5, 14]]),
  trajet([[0, -3, -48], [EV.impact + 0.3, -3, -48], [EV.impact + 1.0, -2, -44], [EV.impact + 11, 0, 4], [40, 0, 4]]),
];

// ------------------------------------------------------------ caméra : clés de regard (cible + champ)
// fov 70 = normal ; 35–40 = zoom ; 80–88 = grand angle pendant une course ou un demi-tour
const REGARDS: Regard[] = [
  { t: 0.0, f: vers(30, 120, -260), fov: 72 },                     // image 1 : la rue ET la météorite dans le ciel
  { t: 1.0, f: (t, P) => aim(P, meteorite(t)), fov: 40 }, // zoom bref sur la météorite
  { t: 1.8, f: (t, P) => aim(P, meteorite(t)), fov: 44 },
  { t: 2.4, f: vers(0, 30, -120), fov: 64 },
  { t: 2.95, f: vers(IMPACT[0], 8, IMPACT[2]), fov: 60 },          // l'impact
  { t: 3.6, f: vers(IMPACT[0], 14, IMPACT[2]), fov: 66 },
  { t: 4.15, f: direction(PI / 2, -0.3), fov: 86 },                // demi-tour : toujours par la même épaule
  { t: 4.7, f: devant(heros, -0.15), fov: 80 },
  { t: 11.6, f: devant(heros, -0.15), fov: 76 },
  { t: 12.2, f: versPerso(zoe, 0.5), fov: 62 },                    // Zoé tombe
  { t: 12.9, f: versPerso(zoe, 0.45), fov: 62 },                   // (clé répétée = on TIENT le regard sur elle)
  { t: 13.5, f: versPerso(maman, 1.3), fov: 56 },                  // Maman devant la maison
  { t: 14.6, f: versPerso(maman, 1.3), fov: 56 },
  { t: 15.2, f: versPerso(zoe, 0.45), fov: 64 },                   // retour sur Zoé : le dilemme
  { t: 30, f: versPerso(zoe, 0.45), fov: 60 },
];
export const SECOUSSES: [number, number, number][] = [[EV.impact, 1.2, 1.8], [EV.impact + 0.45, 0.4, 3], [EV.chute, 0.12, 5]];
// lissage plus court juste au moment du choc (sinon la caméra « anticipe » l'explosion)
export const camera = creerCamera({ heros, regards: REGARDS, secousses: SECOUSSES, sigma: (t) => (Math.abs(t - EV.impact) < 0.6 ? 0.09 : 0.2) });

// ------------------------------------------------------------ mains POV
export const mains = (t: number): { L: Main; R: Main } => {
  const H = heros(t), course = smooth(1.8, 3.2, H.sp), h = mainsCourse(H.dist, course);
  const prot = smooth(EV.impact, EV.impact + 0.1, t) * (1 - smooth(EV.impact + 0.6, EV.impact + 0.9, t));
  const tend = smooth(15.2, 15.6, t);
  for (const [nom, k] of [["protege", prot], ["tend", tend]] as const) { const g = GESTES[nom]; blendMain(h.L, g.L[0], g.L[1], g.L[2], g.L[3], k); blendMain(h.R, g.R[0], g.R[1], g.R[2], g.R[3], k); }
  return h;
};

// ------------------------------------------------------------ effets d'image
export const effets = (t: number): Effets => ({
  flash: 0.4 * Math.pow(hit(t, EV.impact, 0.3), 1.3),
  ca: 0.008 * hit(t, EV.impact, 0.9),
  poussiere: 0.18 * smooth(EV.impact + 0.1, EV.impact + 0.4, t) * (1 - smooth(EV.impact + 1.5, EV.impact + 4, t)),
  rouge: 0.12 * smooth(EV.impact, EV.impact + 6, t),
  chaud: 0.5,
  vignette: 0.34 + 0.1 * smooth(EV.impact, EV.impact + 6, t),
  bloom: 0.34 + 0.2 * hit(t, EV.impact, 0.5),
});

// ------------------------------------------------------------ compte à rebours « FEU À X M » (ne fait que baisser)
export const distanceFeu = (t: number) => heros(t).z - front(t);
export const COMPTEUR = { debut: 6.0, fin: EV.fin };
export const HUD = (t: number) => `JOUR 1 • 17:42 • ${t < EV.maman ? "RUE DES TILLEULS" : "MAISON BLEUE"}`;
export { LIGNES };
// pour « npm run verifier » : l'instant du choc et les personnages à garder à plus de 1,5 m de la caméra
export const CHOC = EV.impact;
export const PERSONNAGES = { zoe, maman, voisin1: voisins[0], voisin2: voisins[1], voisin3: voisins[2] };
