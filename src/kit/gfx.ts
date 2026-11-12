// @ts-nocheck
// Textures dessinées sur canvas (tout est fait en code : pas d'image à télécharger).
import * as THREE from "three";
import { hash } from "./outils";
export { THREE };

export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!; draw(g, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
};
const memo = new Map<string, any>();
export const cached = (k: string, f: () => any) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
// ombre douce sous les personnages
export const blob = () => cached("blob", () => canvasTex(128, 64, (g, w, h) => { const gr = g.createRadialGradient(64, 32, 4, 64, 32, 60); gr.addColorStop(0, "rgba(0,0,0,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
export const glowTex = () => canvasTex(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

export const smokeTex = (seed = 1) => canvasTex(256, 256, (g) => {
  for (let i = 0; i < 26; i++) {
    const a = hash(seed * 31 + i) * Math.PI * 2, r = hash(seed * 17 + i * 3) * 70;
    const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r, s = 34 + hash(seed + i * 5) * 46;
    const gr = g.createRadialGradient(x, y, 0, x, y, s);
    gr.addColorStop(0, "rgba(255,255,255,.2)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  }
});

export const flameTex = (seed: number) => canvasTex(192, 384, (g, w, h) => {
  g.filter = "blur(1.4px)";
  const tongues = 3 + Math.floor(hash(seed * 1.7) * 2);
  const draw = (cx: number, base: number, tip: number, bw: number, lean: number, c0: string, c1: string, c2: string) => {
    const gr = g.createLinearGradient(0, tip, 0, base);
    gr.addColorStop(0, c0); gr.addColorStop(0.45, c1); gr.addColorStop(1, c2);
    g.fillStyle = gr; g.beginPath(); g.moveTo(cx - bw, base);
    const wob = (k: number) => (hash(seed * 7.3 + k + cx) - 0.5) * bw * 0.7;
    g.bezierCurveTo(cx - bw * 1.25 + wob(1), base - (base - tip) * 0.35, cx - bw * 0.5 + wob(2), base - (base - tip) * 0.7, cx + lean, tip);
    g.bezierCurveTo(cx + bw * 0.55 + wob(3), base - (base - tip) * 0.65, cx + bw * 1.25 + wob(4), base - (base - tip) * 0.32, cx + bw, base);
    g.closePath(); g.fill();
  };
  for (let i = 0; i < tongues; i++) {
    const k = tongues === 1 ? 0 : i / (tongues - 1) - 0.5;
    const cx = w / 2 + k * 80 + (hash(seed + i) - 0.5) * 14, tip = 40 + hash(seed * 3 + i) * 120 + Math.abs(k) * 90, bw = 38 - Math.abs(k) * 12, lean = (hash(seed * 5 + i) - 0.5) * 50;
    draw(cx, h - 8, tip, bw, lean, "rgba(200,30,0,0)", "rgba(255,80,10,.85)", "rgba(255,110,25,.95)");
    draw(cx, h - 8, tip + 70, bw * 0.68, lean * 0.7, "rgba(255,140,20,0)", "rgba(255,160,40,.92)", "rgba(255,190,70,.98)");
    draw(cx, h - 8, tip + 150, bw * 0.36, lean * 0.4, "rgba(255,230,140,0)", "rgba(255,240,170,.95)", "rgba(255,252,225,1)");
  }
});

