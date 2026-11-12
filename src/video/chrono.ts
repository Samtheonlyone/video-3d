// Chronologie : « ET SI la France n'avait pas colonisé l'Algérie ? » — Alger, juin 1830, vue d'Ali (pêcheur) avec sa petite sœur Yamina.
// Les scènes sont dramatisées ; les faits (flotte de plus de 500 navires devant Alger en juin 1830, capitulation le 5 juillet) sont réels.
// Repère : mètres. La mer est au nord (−Z), le quai de pierre à z = 28, la ville monte derrière (+Z).
// Ali part de (0, 0) dans sa barque, face à la flotte (orientation 0 = regarder vers −Z).
import { trajet, smooth, hit, PI, lerp, aim, seg, type V3 } from "../kit/outils";
import { creerCamera, vers, versPerso as versPersoBrut, devant, direction, type Regard } from "../kit/camera";
import { mainsCourse, blendMain, GESTES, type Main } from "../kit/mains";
import type { Effets } from "../kit/moteur";
import { LIGNES, FIN } from "./lignes";

export const EV = {
  canon: 2.3,       // coup de canon du navire de tête
  choc: 3.0,        // l'obus tombe près de la barque (BOUM avant 6 s)
  demiTour: 4.3,    // Ali se retourne vers Yamina
  obus2: 10.4,      // la barque de Hamid est touchée
  accoste: 24.4,    // la barque touche le quai
  chute: 39.8,      // Yamina tombe dans la ruelle
  fin: FIN.debut,   // cartes A / B
};
export const DUR = EV.fin + 4.2;

// ------------------------------------------------------------ la flotte : elle avance vers Alger, toujours plus près
export const ADV = (t: number) => (360 * t) / 66;
export const SHIP0: V3 = [60, 0, -520];
export const leadPos = (t: number): V3 => [SHIP0[0], 25, SHIP0[2] + ADV(t)];

// ------------------------------------------------------------ le sol : quai à 1,2 m, rampe vers la place à 9,2 m
export const SOL = 1.2;
export const alt = (z: number) => SOL * smooth(26, 28.5, z) + 8 * smooth(70, 98, z);
// versPerso du kit vise une hauteur absolue : on ajoute l altitude du sol sous le personnage
const versPerso = (M: (t: number) => any, dy = 1.0) => (t: number, P: V3) => { const m = M(t); return aim(P, [m.x, alt(m.z) + dy, m.z]); };
// vagues (la barque, Hamid et la mer suivent la même formule)
export const wv = (x: number, z: number, t: number) => 0.11 * Math.sin(0.33 * x + 0.9 * t) + 0.09 * Math.sin(0.25 * z - 1.1 * t + 1.7) + 0.05 * Math.sin(0.8 * x + 0.5 * z + 1.5 * t);

// ------------------------------------------------------------ trajets [t, x, z]
const CLES_HEROS: number[][] = [
  [0, 0, 0], [3.9, 0, 0], [4.7, 0, 0.15], [6.0, 0, 2.4], [8.5, 0, 7.0], [11.0, 0, 11.6], [11.9, 0, 11.6], [15.2, 0, 11.6], [16.1, 0, 12.1],
  [20.0, 0, 18.4], [23.7, 0, 24.3], [24.5, 0, 24.5], [25.2, 0, 26.0], [26.2, 0, 29.6], [28.0, 0, 38.0], [30.0, 0, 47.0], [31.0, 0, 52.0],
  [34.3, 0, 66.0], [36.5, 0, 76.0], [38.5, 0, 82.5], [39.6, 0, 85.0], [40.5, 0, 85.8], [42.8, 0, 86.0], [49.5, 0, 96.5], [90, 0, 96.5],
];
export const heros = trajet(CLES_HEROS);
// Yamina : assise à l'avant de la barque (2 m devant Ali), puis court devant lui
export const yamina = trajet([
  ...CLES_HEROS.filter((k) => k[0] <= 24.5).map(([t, x, z]) => [t, x, z + 2.0]),
  [25.3, 0.2, 28.6], [26.2, 0.6, 32.0], [27.5, 0.7, 38.5], [29.0, 0.7, 46.0], [30.5, 0.7, 53.5], [31.0, 0.7, 56.0], [33.0, 0.7, 65.0], [34.3, 0.7, 70.5],
  [35.5, 0.6, 75.5], [37.0, 0.5, 81.5], [38.5, 0.5, 86.0], [39.7, 0.5, 88.2], [40.3, 0.5, 88.5], [42.3, 0.5, 88.5], [43.5, 0.9, 89.4], [49.5, 1.0, 98.4],
  [51.0, 1.0, 98.4], [51.5, 0.3, 99.4], [52.4, -1.5, 98.4], [53.2, -1.6, 98.0], [90, -1.6, 98.0],
]);
// Hamid : pêcheur voisin (tunique rouge). Sa barque est touchée, il tombe à l'eau, Ali le sauve, il descend sur le quai.
export const hamid = trajet([
  [0, 5.5, 12.0], [10.3, 5.5, 12.0], [11.0, 4.2, 12.4], [12.4, 2.4, 11.9], [14.5, 2.3, 11.8], [14.9, 1.7, 10.4], [15.4, 0.3, 9.9],
  [16.1, 0.3, 10.4], [20.0, 0.3, 16.7], [23.7, 0.3, 22.6], [24.5, 0.3, 22.8], [25.5, 0.3, 23.6], [26.5, -1.0, 28.4], [27.5, -3.0, 33.0],
  [29.0, -7.0, 38.5], [31.0, -14, 44], [33.0, -24, 50], [90, -40, 56],
]);
// foule qui fuit : jamais à moins de 1,5 m du trajet d'Ali
export const foule = [
  trajet([[0, -12, 40], [26.0, -12, 40], [27.5, -9, 43], [30, -3.5, 50], [31.5, -1.9, 54], [34, -1.8, 62], [38, -1.8, 74], [45, -1.8, 88], [50, -4, 104], [56, -8, 116], [90, -8, 120]]),
  trajet([[0, 10, 42], [26.5, 10, 42], [29, 5, 47], [31.8, 1.8, 56], [35, 1.8, 68], [39, 1.8, 80], [44, 1.8, 89], [48, 3, 100], [52, 7, 112], [90, 9, 125]]),
  trajet([[0, -18, 36], [25, -18, 36], [28, -15, 42], [33, -22, 47], [90, -30, 50]]),
  trajet([[0, 14, 34], [25.5, 14, 34], [29, 12, 44], [34, 24, 48], [90, 34, 50]]),
];
export const mule = trajet([[0, -8, 32], [24.8, -8, 32], [26, -8, 34], [29, -8, 44], [32, -9.5, 52], [90, -12, 60]]);
// le messager arrive de la place, passe à côté d'Ali (1,7 m) et file vers le port ; le garde arrive sur la place
export const messager = trajet([[0, 6, 134], [49, 6, 134], [52.5, 4.2, 118], [56.2, 1.7, 98.5], [58.5, 1.6, 88], [61, 1.2, 76], [90, 1.2, 40]]);
export const garde = trajet([[0, -4, 128], [56.5, -4, 126], [60.8, -2.2, 102.5], [90, -2.2, 102.5]]);

// ------------------------------------------------------------ caméra : clés de regard
const REGARDS: Regard[] = [
  { t: 0.0, f: vers(0, 80, -620), fov: 74 },                          // image 1 : la flotte à l'horizon + le titre
  { t: 1.5, f: vers(30, 50, -600), fov: 70 },
  { t: 1.9, f: (t, P) => aim(P, leadPos(t)), fov: 38 },                // zoom bref sur le navire de tête
  { t: 2.6, f: (t, P) => aim(P, leadPos(t)), fov: 42 },
  { t: 2.95, f: vers(6, 3, -18), fov: 62 },                            // l'obus tombe près de la barque
  { t: 3.7, f: vers(6, 5, -18), fov: 66 },
  { t: 4.3, f: direction(PI / 2, -0.12), fov: 86 },                    // demi-tour par la gauche
  { t: 5.0, f: versPerso(yamina, 0.75), fov: 60 },                     // Yamina, assise à l'avant
  { t: 5.9, f: versPerso(yamina, 0.75), fov: 58 },
  { t: 6.8, f: devant(heros, -0.1), fov: 72 },
  { t: 9.5, f: devant(heros, -0.1), fov: 72 },
  { t: 10.15, f: versPerso(hamid, 0.7), fov: 52 },                     // la barque de Hamid
  { t: 12.5, f: versPerso(hamid, 0.6), fov: 52 },
  { t: 14.6, f: versPerso(hamid, 0.7), fov: 56 },
  { t: 15.6, f: devant(heros, -0.1), fov: 74 },
  { t: 16.6, f: devant(heros, -0.05), fov: 74 },
  { t: 17.4, f: direction(1.5 * PI, -0.02), fov: 80 },                 // regard par-dessus l'épaule droite : la flotte
  { t: 18.2, f: (t, P) => aim(P, leadPos(t)), fov: 44 },
  { t: 19.6, f: (t, P) => aim(P, leadPos(t)), fov: 46 },
  { t: 20.4, f: direction(1.5 * PI, -0.02), fov: 80 },
  { t: 21.2, f: devant(heros, -0.1), fov: 74 },
  { t: 24.0, f: devant(heros, -0.1), fov: 72 },
  { t: 25.0, f: vers(0, 3.5, 40), fov: 72 },                           // on grimpe sur le quai
  { t: 26.4, f: devant(heros, -0.12), fov: 80 },
  { t: 30.5, f: devant(heros, -0.12), fov: 82 },
  { t: 33.2, f: devant(heros, -0.18), fov: 80 },
  { t: 38.5, f: devant(heros, -0.12), fov: 78 },
  { t: 39.3, f: versPerso(yamina, 0.5), fov: 64 },                     // Yamina tombe
  { t: 41.4, f: versPerso(yamina, 0.45), fov: 62 },
  { t: 42.6, f: versPerso(yamina, 0.9), fov: 60 },
  { t: 43.6, f: devant(heros, -0.1), fov: 70 },
  { t: 49.4, f: devant(heros, -0.05), fov: 72 },
  { t: 50.3, f: direction(1.5 * PI, -0.04), fov: 78 },                 // on se retourne vers la baie
  { t: 51.3, f: vers(0, 20, -330), fov: 56 },
  { t: 55.0, f: vers(0, 18, -300), fov: 54 },                          // la flotte, vue depuis la place
  { t: 56.9, f: versPerso(messager, 1.1), fov: 58 },                   // le messager file vers le port
  { t: 57.6, f: versPerso(messager, 1.1), fov: 56 },
  { t: 58.2, f: versPerso(yamina, 0.8), fov: 52 },
  { t: 59.5, f: versPerso(yamina, 0.8), fov: 50 },
  { t: 60.4, f: versPerso(garde, 1.3), fov: 54 },                      // le garde : le dilemme tombe
  { t: 62.2, f: versPerso(garde, 1.3), fov: 52 },
  { t: 62.8, f: versPerso(yamina, 0.75), fov: 46 },                    // il pense à voix haute
  { t: 64.0, f: versPerso(yamina, 0.75), fov: 44 },
  { t: 65.0, f: vers(0, 18, -300), fov: 54 },
  { t: 90, f: vers(0, 18, -290), fov: 52 },
];
export const SECOUSSES: [number, number, number][] = [[EV.choc, 1.2, 1.8], [EV.choc + 0.45, 0.4, 3], [EV.obus2, 0.8, 2.5], [EV.accoste, 0.25, 4], [EV.chute, 0.12, 5]];
// ----- hauteur des yeux : assis dans la barque, puis debout sur le quai, sur la rampe, saut de la charrette, accroupi près de Yamina
const saut = (t: number) => 0.5 * Math.sin(PI * seg(t, 34.0, 34.7));
const accroupi = (t: number) => 0.35 * smooth(40.4, 40.9, t) * (1 - smooth(41.8, 42.4, t));
export const yeux = (t: number) => {
  const mer = 1.15 + 0.05 * Math.sin(1.9 * t + 0.5) + 0.03 * Math.sin(3.1 * t), terre = 1.6 + alt(heros(t).z) + saut(t) - accroupi(t);
  return lerp(mer, terre, smooth(24.4, 25.9, t));
};
export const camera = creerCamera({ heros, regards: REGARDS, secousses: SECOUSSES, yeux, sigma: (t) => (Math.abs(t - EV.choc) < 0.6 || Math.abs(t - EV.obus2) < 0.5 ? 0.09 : 0.2) });

// ------------------------------------------------------------ mains POV
export const rame = (t: number) => smooth(4.8, 5.4, t) * (1 - smooth(11.0, 11.4, t)) + smooth(15.8, 16.3, t) * (1 - smooth(23.8, 24.3, t));
export const mains = (t: number): { L: Main; R: Main } => {
  const H = heros(t), course = smooth(1.8, 3.2, H.sp), r = rame(t), h = mainsCourse(H.dist, Math.max(course, Math.min(1, r)));
  if (r > 0 && course < 0.5) { h.L.y += 90 * r; h.R.y += 90 * r; h.L.rot *= 0.5; h.R.rot *= 0.5; }
  const prot = smooth(EV.choc, EV.choc + 0.1, t) * (1 - smooth(EV.choc + 0.6, EV.choc + 0.9, t));
  const tend = smooth(11.9, 12.4, t) * (1 - smooth(14.4, 14.9, t)) + smooth(40.9, 41.3, t) * (1 - smooth(43.3, 43.8, t)) + smooth(61.6, 62.2, t) * (1 - smooth(66.4, 66.8, t));
  for (const [nom, k] of [["protege", prot], ["tend", Math.min(1, tend)]] as const) { const g = GESTES[nom]; blendMain(h.L, g.L[0], g.L[1], g.L[2], g.L[3], k); blendMain(h.R, g.R[0], g.R[1], g.R[2], g.R[3], k); }
  return h;
};

// ------------------------------------------------------------ effets d'image
export const effets = (t: number): Effets => ({
  flash: 0.22 * Math.pow(hit(t, EV.choc, 0.25), 1.3) + 0.12 * hit(t, EV.canon, 0.2) + 0.15 * hit(t, EV.obus2, 0.25),
  ca: 0.007 * hit(t, EV.choc, 0.9) + 0.005 * hit(t, EV.obus2, 0.7),
  poussiere: 0.05 * hit(t, EV.choc, 1.5),
  rouge: 0.1 * smooth(30, 60, t),
  chaud: 0.55,
  vignette: 0.34 + 0.1 * smooth(30, 62, t),
  bloom: 0.34 + 0.2 * hit(t, EV.choc, 0.5) + 0.1 * hit(t, EV.canon, 0.3),
});

// ------------------------------------------------------------ compte à rebours « FLOTTE À X M » (ne fait que baisser)
export const distanceFlotte = (t: number) => heros(t).z - leadPos(t)[2];
export const COMPTEUR = { debut: 6.0, fin: EV.fin };
export const HUD = (t: number) => (t < EV.accoste ? "JUIN 1830 • BAIE D'ALGER" : t < 49.5 ? "JUIN 1830 • PORT ET CASBAH" : t < 57 ? "HAUTEURS D'ALGER • JUIN 1830" : "ALGER CAPITULERA LE 5 JUILLET 1830");
export { LIGNES };
// pour « npm run verifier »
export const CHOC = EV.choc;
export const PERSONNAGES = { yamina, hamid, foule1: foule[0], foule2: foule[1], foule3: foule[2], foule4: foule[3], mule, messager, garde };
