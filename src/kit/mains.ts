// Poses des mains POV (sans dessin : utilisable aussi par les scripts de vérification).
export type Main = { x: number; y: number; rot: number; open: number; show: number };
// pose de course par défaut (les mains pompent en bas de l'image) ; blendMain pour un geste (pousser une porte, se protéger)
export const mainsCourse = (dist: number, course: number): { L: Main; R: Main } => {
  const sw = Math.sin((dist / 1.25) * Math.PI);
  return { L: { x: 250 - 30 * sw, y: 1780 - 200 * Math.max(0, sw), rot: 18 + 10 * sw, open: 0.3, show: course }, R: { x: 830 - 30 * sw, y: 1780 - 200 * Math.max(0, -sw), rot: -18 + 10 * sw, open: 0.3, show: course } };
};
export const blendMain = (h: Main, x: number, y: number, rot: number, open: number, k: number) => { if (k <= 0) return; h.x += (x - h.x) * k; h.y += (y - h.y) * k; h.rot += (rot - h.rot) * k; h.open += (open - h.open) * k; h.show = Math.max(h.show, k); };
export const GESTES = {
  protege: { L: [360, 1100, 26, 0.9], R: [720, 1060, -30, 0.9] },   // bras devant le visage (explosion)
  pousse: { L: [430, 1190, 8, 0.95], R: [650, 1150, -6, 0.95] },    // pousse une porte
  tend: { L: [400, 1560, 14, 0.95], R: [720, 1520, -14, 0.95] },    // tend la main vers quelqu'un
} as const;
