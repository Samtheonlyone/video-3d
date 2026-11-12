// Caméra subjective (POV) : on est dans les yeux du héros.
// - La position suit le trajet du héros (avec le balancement du pas, calé sur la distance parcourue).
// - Le regard suit une liste de clés REGARDS : à l'instant t, on regarde telle cible, avec tel champ (fov).
//   Les cibles peuvent bouger (un personnage qui court) : elles sont recalculées à chaque instant.
// - Tout est lissé (moyenne gaussienne sur ±0,5 s) : pas d'à-coup, pas d'arrêt net.
// - Les secousses (explosion, chute) s'ajoutent par-dessus.
import { aim, clamp01, lerp, smooth, noise1, kick, PI, type V3, type Mover } from "./outils";

export type Cam = { px: number; py: number; pz: number; yaw: number; pitch: number; roll: number; fov: number };
export type Regard = { t: number; f: (t: number, P: V3) => { yaw: number; pitch: number }; fov: number };

// --- cibles toutes prêtes pour les clés de regard
// regarder un point fixe
export const vers = (x: number, y: number, z: number) => (_t: number, P: V3) => aim(P, [x, y, z]);
// regarder quelqu'un qui bouge (dy = hauteur visée : 1.0 = le corps, 1.5 = le visage d'un adulte)
export const versPerso = (M: (t: number) => Mover, dy = 1.0) => (t: number, P: V3) => { const m = M(t); return aim(P, [m.x, dy, m.z]); };
// regarder devant soi, le long de son propre trajet (pendant une course)
export const devant = (H: (t: number) => Mover, dy = 0, loin = 6) => (t: number, P: V3) => {
  const a = H(t + 0.3), b = H(t + 0.42), dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
  if (d < 1e-4) { const yaw = a.fac; return { yaw, pitch: Math.atan2(dy, loin) }; }
  return aim(P, [a.x + (dx / d) * loin, P[1] + dy, a.z + (dz / d) * loin]);
};
// regarder dans une direction (yaw en radians, pitch : négatif = vers le bas)
export const direction = (yaw: number, pitch = 0) => () => ({ yaw, pitch });

const unwrap = (a: number, ref: number) => { let d = a - ref; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; return ref + d; };
const ease = (u: number) => u * u * (3 - 2 * u);

export type OptionsCamera = {
  heros: (t: number) => Mover;          // trajet du héros
  regards: Regard[];                    // clés de regard, triées par t
  yeux?: (t: number) => number;         // hauteur des yeux (1.6 par défaut ; plus bas = accroupi)
  secousses?: [number, number, number][]; // [instant, force, amortissement]
  sigma?: (t: number) => number;        // lissage (0.2 s par défaut ; plus court pendant un choc)
};

export function creerCamera(o: OptionsCamera) {
  const yeux = o.yeux ?? (() => 1.6);
  const R = o.regards;
  const posAt = (t: number): V3 => { const L = o.heros(t); return [L.x, yeux(t), L.z]; };
  const rawLook = (t: number, P: V3) => {
    let i = 0; while (i < R.length - 2 && R[i + 1].t <= t) i++;
    const A = R[i], B = R[Math.min(i + 1, R.length - 1)], u = B.t > A.t ? clamp01((t - A.t) / (B.t - A.t)) : 0, e = 0.5 * u + 0.5 * ease(u);
    const a = A.f(t, P), b = B.f(t, P);
    return { yaw: lerp(a.yaw, unwrap(b.yaw, a.yaw), e), pitch: lerp(a.pitch, b.pitch, e), lf: lerp(Math.log(A.fov), Math.log(B.fov), e) };
  };
  const smoothLook = (t: number) => {
    const SIG = o.sigma ? o.sigma(t) : 0.2, N = 9, D = (SIG * 2.6) / N; let sw = 0, y = 0, p = 0, f = 0, ref: number | null = null;
    for (let k = -N; k <= N; k++) { const tt = t + k * D, r = rawLook(tt, posAt(tt)), yy: number = ref === null ? r.yaw : unwrap(r.yaw, ref); ref = yy; const w = Math.exp(-0.5 * ((k * D) / SIG) ** 2); sw += w; y += w * yy; p += w * r.pitch; f += w * r.lf; }
    return { yaw: y / sw, pitch: p / sw, fov: Math.exp(f / sw) };
  };
  return (t: number): Cam => {
    const L = o.heros(t), sp = L.sp, run = smooth(1.8, 3.2, sp), walk = smooth(0.2, 0.9, sp) * (1 - run);
    const step = (L.dist / lerp(0.66, 1.25, run)) * PI, bob = (Math.abs(Math.sin(step)) - 0.6) * (0.03 * walk + 0.075 * run);
    const P: V3 = [L.x + Math.sin(step) * 0.03 * run, yeux(t) + bob, L.z];
    const lk = smoothLook(t);
    let yaw = lk.yaw, pitch = lk.pitch, roll = 0;
    const fov = lk.fov, tele = clamp01(fov / 70), steady = 0.25 + 0.75 * tele; // au téléobjectif, on tremble moins
    yaw += Math.sin(step) * (0.006 * walk + 0.018 * run) * steady + noise1(t * 1.1) * 0.006 * tele + noise1(t * 0.37 + 9) * 0.004 * steady;
    pitch += (Math.abs(Math.sin(step)) - 0.6) * (0.01 * walk + 0.028 * run) * steady + noise1(t * 0.9 + 4) * 0.005 * tele;
    roll += Math.sin(step) * 0.022 * run + noise1(t * 0.7 + 2) * 0.005;
    const q = (o.secousses ?? []).reduce((s, [t0, k, d]) => s + kick(t, t0, k, d), 0), qk = q * (0.004 + 0.02 * tele);
    yaw += noise1(t * 23) * qk; pitch += noise1(t * 21 + 7) * qk; roll += noise1(t * 17 + 3) * qk * 1.2;
    return { px: P[0], py: P[1], pz: P[2], yaw, pitch, roll, fov };
  };
}

// Contrôle : rotation maximale de la caméra d'une image à l'autre (doit rester < 0,2 rad, sauf secousse voulue).
export const rotationMax = (camera: (t: number) => Cam, dur: number, fps = 30) => {
  let worst = 0, at = 0;
  for (let f = 1; f < dur * fps; f++) { const a = camera((f - 1) / fps), b = camera(f / fps); const d = Math.hypot(unwrap(b.yaw, a.yaw) - a.yaw, b.pitch - a.pitch); if (d > worst) { worst = d; at = f / fps; } }
  return { worst, at };
};
