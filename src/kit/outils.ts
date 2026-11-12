// Outils de temps et de trajet. Tout dépend seulement du temps t (en secondes) : la vidéo se rend image par image,
// donc JAMAIS de Math.random() : utiliser hash(n), qui donne toujours le même nombre pour le même n.
export const FPS = 30;
export const PI = Math.PI;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// passe doucement de 0 (avant a) à 1 (après b)
export const smooth = (a: number, b: number, x: number) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp01(k), 3);
export const easeIn = (k: number) => Math.pow(clamp01(k), 2);
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise1 = (x: number) => { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
// secousse qui s'amortit : force k à l'instant t0
export const kick = (t: number, t0: number, k: number, dec = 6) => (t < t0 ? 0 : k * Math.exp(-(t - t0) * dec));
// un coup bref (0 → 1 → 0 sur d secondes après t0)
export const hit = (t: number, t0: number, d: number) => (t >= t0 ? Math.max(0, 1 - (t - t0) / d) : 0);

export type V3 = [number, number, number];
// angles (yaw, pitch) pour regarder du point p vers le point q. Orientation 0 = regarder vers -Z.
export const aim = (p: number[], q: number[]) => { const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2]; return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) }; };
// orientation d'un personnage qui avance de (dx, dz)
export const along = (dx: number, dz: number) => Math.atan2(-dx, -dz);

// courbe lisse qui passe par des points [t, valeur] sans dépasser (pas de rebond)
export const mono = (P: [number, number][]) => {
  const n = P.length, d: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((P[i + 1][1] - P[i][1]) / (P[i + 1][0] - P[i][0]));
  m.push(d[0]); for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2); m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return (x: number) => {
    if (x <= P[0][0]) return P[0][1];
    if (x >= P[n - 1][0]) return P[n - 1][1];
    let i = 0; while (x > P[i + 1][0]) i++;
    const h = P[i + 1][0] - P[i][0], u = (x - P[i][0]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * P[i][1] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * P[i + 1][1] + (u3 - u2) * h * m[i + 1];
  };
};

// Trajet au sol à partir de clés [t, x, z]. Renvoie à chaque instant : position, orientation, vitesse, distance parcourue,
// et le mode (stand / walk / run) déduit de la vitesse. C'est ce qui pilote la démarche des personnages et le pas de la caméra.
export type Mover = { x: number; z: number; fac: number; mode: string; sp: number; dist: number };
export const trajet = (K: number[][], fixedFac?: number, tMax = 200) => {
  const fx = mono(K.map((k) => [k[0], k[1]] as [number, number])), fz = mono(K.map((k) => [k[0], k[2]] as [number, number]));
  const tr = (t: number) => [fx(t), fz(t)];
  const D: number[] = [0]; for (let i = 1; i <= tMax * 60; i++) { const a = tr((i - 1) / 60), b = tr(i / 60); D.push(D[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  let lastFac = fixedFac ?? 0;
  const facAt: number[] = []; for (let i = 0; i <= tMax * 30; i++) { const t = i / 30, a = tr(t - 0.04), b = tr(t + 0.04), dx = b[0] - a[0], dz = b[1] - a[1]; if (Math.hypot(dx, dz) > 0.01) lastFac = along(dx, dz); facAt.push(fixedFac ?? lastFac); }
  return (t: number): Mover => {
    const [x, z] = tr(t), [x1, z1] = tr(t + 0.04), [x0, z0] = tr(t - 0.04), sp = Math.hypot(x1 - x0, z1 - z0) / 0.08;
    const f = clamp01((t * 60) / (D.length - 1)) * (D.length - 1), i = Math.min(D.length - 2, Math.floor(f)), dist = lerp(D[i], D[i + 1], f - i);
    const fac = facAt[Math.max(0, Math.min(facAt.length - 1, Math.round(t * 30)))];
    return { x, z, fac, mode: sp > 2.0 ? "run" : sp > 0.25 ? "walk" : "stand", sp, dist };
  };
};
