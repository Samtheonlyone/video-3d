// @ts-nocheck
// Tête dessinée des personnages : visage, cheveux, expressions, vues (face, trois-quarts, profil, dos). Ne pas modifier sauf pour ajouter un style.
import { THREE, canvasTex } from "./gfx";
const memo = new Map<string, any>();
const cached = (k: string, f: () => any) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
const rgb = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixHex = (a: string, b: string, k: number) => { const A = rgb(a), Bc = rgb(b); const h = (v: number) => Math.round(v).toString(16).padStart(2, "0"); return "#" + [0, 1, 2].map((i) => h(A[i] + (Bc[i] - A[i]) * k)).join(""); };
export const shade = (h: string, k: number) => { const [r, g, b] = rgb(h); const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${c(r)},${c(g)},${c(b)})`; };
const mixc = (h: string, k: number) => { const [r, g, b] = rgb(h); const c = (v: number) => Math.max(0, Math.min(255, Math.round(k > 1 ? v + (255 - v) * (k - 1) : v * k))); return `rgb(${c(r)},${c(g)},${c(b)})`; };

export type FSpec = { skin: string; hair: string; hairStyle?: string; shirt: string; shirt2?: string; pants: string; shoes?: string; kid?: boolean; female?: boolean; glasses?: boolean; stubble?: boolean; scale?: number; headScale?: number; collar?: string; tie?: string; scarf?: string; pattern?: string; headset?: boolean; blood?: boolean; epaulettes?: boolean; jacket?: string; build?: number; bear?: boolean; iris?: string; brow?: string; wrinkle?: boolean; legs?: boolean; hat?: string; beard?: boolean; packCol?: string; glove?: string; mask?: string; maskUp?: boolean; bandana?: string; tricorn?: string; patch?: boolean; scar?: boolean; earring?: boolean };

// ------------------------------------------------------------------ tête
export const headTex = (s: FSpec, view: string, expr: string, blink: boolean) => cached(["h", s.headset, s.blood, s.skin, s.hair, s.hairStyle, s.female, s.kid, s.glasses, s.stubble, s.iris, s.brow, s.wrinkle, s.hat, s.beard, s.mask, s.maskUp, s.bandana, s.tricorn, s.patch, s.scar, s.earring, view, expr, blink].join("|"), () => canvasTex(256, 320, (g) => {
  const zomb = expr === "zombie"; const skin = zomb ? mixHex(s.skin, "#8e9a86", 0.6) : s.skin, ink = "#2a1810", hs = s.hairStyle ?? "short", hair = s.hair, brow = s.brow ?? hair;
  const scared = expr === "scared" || expr === "shock" || expr === "zombie", worried = expr === "worried", talk = expr === "talk" || expr === "talkw" || expr === "roar", smile = expr === "smile";
  const skinGrad = (cx: number, cy: number, rx: number, ry: number) => { const gr = g.createRadialGradient(cx - rx * 0.25, cy - ry * 0.3, 8, cx, cy, Math.max(rx, ry) * 1.05); gr.addColorStop(0, mixc(skin, 1.12)); gr.addColorStop(0.7, skin); gr.addColorStop(1, shade(skin, 0.86)); return gr; };
  const ear = (x: number, y: number, r = 17) => { g.fillStyle = shade(skin, 0.93); g.beginPath(); g.ellipse(x, y, r * 0.8, r * 1.15, 0, 0, 7); g.fill(); g.fillStyle = shade(skin, 0.74); g.beginPath(); g.ellipse(x + (x < 128 ? 2 : -2), y + 1, r * 0.4, r * 0.72, 0, 0, 7); g.fill(); };
  // cou
  g.fillStyle = shade(skin, 0.84); g.beginPath(); g.moveTo(102, 214); g.lineTo(154, 214); g.lineTo(158, 276); g.lineTo(98, 276); g.closePath(); g.fill();
  g.fillStyle = shade(skin, 0.7); g.globalAlpha = 0.5; g.beginPath(); g.ellipse(128, 238, 40, 14, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  const hairFill = (path: () => void, hl = true) => { const gr = g.createLinearGradient(40, 30, 220, 200); gr.addColorStop(0, mixc(hair, 1.25)); gr.addColorStop(0.5, hair); gr.addColorStop(1, shade(hair, 0.7)); g.fillStyle = gr; path(); g.fill(); g.save(); path(); g.clip(); g.strokeStyle = shade(hair, 0.62); g.globalAlpha = 0.35; g.lineWidth = 1.6; for (let i = 0; i < 22; i++) { const x = 40 + i * 9.5; g.beginPath(); g.moveTo(x, 20); g.quadraticCurveTo(x + (i % 2 ? 10 : -8), 80, x + (i % 3 - 1) * 14, 170); g.stroke(); } g.restore(); g.globalAlpha = 1; };
  const eye = (cx: number, cy: number, rx: number, ry: number, look = 0) => {
    const open = blink ? 0.12 : scared ? 1.3 : worried ? 1.1 : smile ? 0.78 : 1;
    const ryy = Math.max(2, ry * open);
    if (zomb) { g.fillStyle = "rgba(70,30,40,.35)"; g.beginPath(); g.ellipse(cx, cy + 3, rx * 1.35, ryy * 1.25, 0, 0, 7); g.fill(); g.fillStyle = "#ece6c8"; g.beginPath(); g.ellipse(cx, cy, rx, ryy, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(190,40,40,.55)"; g.lineWidth = 1.4; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx + (k % 2 ? rx : -rx) * 0.95, cy + (k - 1.5) * 3); g.lineTo(cx + (k % 2 ? rx : -rx) * 0.35, cy + (k - 1.5) * 2); g.stroke(); } g.fillStyle = "#b8b4a0"; g.beginPath(); g.arc(cx + look, cy + 1, 2.4, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 3.4; g.beginPath(); g.ellipse(cx, cy, rx, ryy, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); return; }
    g.fillStyle = "#fbf8f2"; g.beginPath(); g.ellipse(cx, cy, rx, ryy, 0, 0, 7); g.fill();
    if (!blink) { const ir = Math.min(ryy * 0.92, rx * 0.62); g.fillStyle = s.iris ?? "#4a3524"; g.beginPath(); g.arc(cx + look, cy + 1, ir, 0, 7); g.fill(); g.fillStyle = "#17100c"; g.beginPath(); g.arc(cx + look, cy + 1, ir * 0.5, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(cx + look + ir * 0.35, cy - ir * 0.3, ir * 0.22, 0, 7); g.fill(); }
    g.strokeStyle = ink; g.lineWidth = s.female || s.kid ? 4.4 : 3.4; g.lineCap = "round"; g.beginPath(); if (blink) { g.moveTo(cx - rx, cy); g.quadraticCurveTo(cx, cy + 5, cx + rx, cy); } else g.ellipse(cx, cy, rx, ryy, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    if (s.female || s.kid) { g.lineWidth = 2.6; g.beginPath(); g.moveTo(cx + rx - 2, cy - ryy * 0.5); g.lineTo(cx + rx + 5, cy - ryy * 0.9); g.stroke(); }
  };
  const browF = (x0: number, y0: number, x1: number, y1: number, arch: number) => { g.strokeStyle = brow; g.lineWidth = s.female || s.kid ? 6 : 8.5; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - arch, x1, y1); g.stroke(); };
  const mouth = (cx: number, cy: number, w: number, side = 0) => {
    g.strokeStyle = ink; g.lineWidth = 4.2; g.lineCap = "round";
    if (zomb) { g.fillStyle = "#2a0a08"; g.beginPath(); g.ellipse(cx, cy + 8, w * 0.5, w * 0.5, 0, 0, 7); g.fill(); g.fillStyle = "#d8d0b0"; g.fillRect(cx - w * 0.36, cy - 3, w * 0.72, 6); g.fillRect(cx - w * 0.3, cy + 22, w * 0.6, 5); g.fillStyle = "rgba(150,14,14,.9)"; g.beginPath(); g.ellipse(cx, cy + 32, w * 0.4, 9, 0, 0, 7); g.fill(); g.fillRect(cx - w * 0.22, cy + 30, 6, 22); g.fillRect(cx + w * 0.12, cy + 30, 5, 16); return; }
    if (scared) { g.fillStyle = "#47150f"; g.beginPath(); g.ellipse(cx, cy + 8, w * 0.52, w * 0.62, 0, 0, 7); g.fill(); g.fillStyle = "#e0746a"; g.beginPath(); g.ellipse(cx, cy + 19, w * 0.34, 7, 0, 0, 7); g.fill(); }
    else if (talk) { g.fillStyle = "#47150f"; g.beginPath(); g.ellipse(cx, cy + 4, w * 0.4, expr === "talkw" ? w * 0.4 : w * 0.3, 0, 0, 7); g.fill(); g.fillStyle = "#fbf8f2"; g.fillRect(cx - w * 0.28, cy - 6, w * 0.56, 5); g.fillStyle = "#e0746a"; g.beginPath(); g.ellipse(cx, cy + 12, w * 0.24, 5, 0, 0, 7); g.fill(); }
    else if (smile) { g.fillStyle = "#fbf8f2"; g.beginPath(); g.moveTo(cx - w * 0.5, cy - 2); g.quadraticCurveTo(cx, cy + w * 0.6, cx + w * 0.5, cy - 2); g.quadraticCurveTo(cx, cy + 4, cx - w * 0.5, cy - 2); g.fill(); g.beginPath(); g.moveTo(cx - w * 0.52, cy - 3); g.quadraticCurveTo(cx, cy + w * 0.64, cx + w * 0.52, cy - 3); g.stroke(); }
    else if (worried) { g.beginPath(); g.moveTo(cx - w * 0.45, cy + 5); g.quadraticCurveTo(cx, cy - 8, cx + w * 0.45, cy + 5); g.stroke(); }
    else { g.beginPath(); g.moveTo(cx - w * 0.42, cy); g.quadraticCurveTo(cx, cy + 6, cx + w * 0.42, cy); g.stroke(); }
  };
  const stubble = (cx: number, cy: number, w: number, h: number) => { g.fillStyle = "rgba(48,34,28,.38)"; for (let i = 0; i < 300; i++) { const a = (i * 2.399) % 6.283, r = (((i * 37) % 100) / 100); const x = cx + Math.cos(a) * w * r, y = cy + Math.abs(Math.sin(a)) * h * r; g.fillRect(x, y, 2.2, 2.2); } };

  if (view === "back") {
    ear(48, 156); ear(208, 156);
    g.fillStyle = skinGrad(128, 150, 74, 90); g.beginPath(); g.ellipse(128, 150, 74, 90, 0, 0, 7); g.fill();
    if (hs === "bald") { g.fillStyle = shade(skin, 0.9); g.beginPath(); g.ellipse(128, 120, 50, 40, 0, 0, 7); g.fill(); }
    else {
      hairFill(() => { g.beginPath(); g.moveTo(52, 170); g.bezierCurveTo(40, 80, 96, 40, 128, 40); g.bezierCurveTo(166, 40, 218, 82, 204, 172); g.bezierCurveTo(200, 214, 176, 226, 128, 228); g.bezierCurveTo(80, 226, 56, 214, 52, 170); g.closePath(); });
      if (hs === "long") hairFill(() => { g.beginPath(); g.moveTo(46, 150); g.lineTo(52, 292); g.bezierCurveTo(100, 306, 156, 306, 204, 292); g.lineTo(210, 150); g.bezierCurveTo(200, 230, 56, 230, 46, 150); g.closePath(); });
      if (hs === "bun") { hairFill(() => { g.beginPath(); g.arc(128, 34, 36, 0, 7); g.closePath(); }); }
      g.fillStyle = "rgba(255,255,255,.2)"; g.beginPath(); g.ellipse(100, 92, 22, 34, -0.6, 0, 7); g.fill();
    }
  } else if (view === "front") {
    ear(54, 156); ear(202, 156);
    g.fillStyle = skinGrad(128, 150, 74, 90); g.beginPath(); g.moveTo(128, 56); g.bezierCurveTo(186, 56, 204, 108, 200, 160); g.bezierCurveTo(196, 214, 162, 240, 128, 240); g.bezierCurveTo(94, 240, 60, 214, 56, 160); g.bezierCurveTo(52, 108, 70, 56, 128, 56); g.fill();
    if (s.kid || s.female) { g.fillStyle = "rgba(235,110,95,.28)"; g.beginPath(); g.ellipse(80, 190, 20, 11, 0, 0, 7); g.ellipse(176, 190, 20, 11, 0, 0, 7); g.fill(); } else { g.fillStyle = "rgba(220,110,90,.16)"; g.beginPath(); g.ellipse(80, 190, 18, 10, 0, 0, 7); g.ellipse(176, 190, 18, 10, 0, 0, 7); g.fill(); }
    if (s.stubble) stubble(128, 176, 62, 56);
    if (hs !== "bald") {
      if (hs === "long") { hairFill(() => { g.beginPath(); g.moveTo(52, 150); g.lineTo(46, 300); g.bezierCurveTo(70, 310, 92, 300, 96, 286); g.lineTo(80, 150); g.closePath(); }); hairFill(() => { g.beginPath(); g.moveTo(204, 150); g.lineTo(210, 300); g.bezierCurveTo(186, 310, 164, 300, 160, 286); g.lineTo(176, 150); g.closePath(); }); }
      if (hs === "pigtails") { for (const sx of [-1, 1]) { hairFill(() => { g.beginPath(); g.ellipse(128 + sx * 96, 214, 30, 62, sx * 0.25, 0, 7); g.closePath(); }); g.fillStyle = "#e6527a"; g.beginPath(); g.ellipse(128 + sx * 84, 150, 12, 9, 0, 0, 7); g.fill(); } }
      hairFill(() => { g.beginPath(); g.moveTo(52, 156); g.bezierCurveTo(42, 70, 96, 36, 132, 36); g.bezierCurveTo(176, 36, 218, 72, 204, 156); g.bezierCurveTo(198, 118, 176, 98, 134, 100); g.bezierCurveTo(100, 100, 68, 114, 52, 156); g.closePath(); });
      if (hs === "bun") hairFill(() => { g.beginPath(); g.arc(128, 30, 30, 0, 7); g.closePath(); });
      if (s.kid) hairFill(() => { g.beginPath(); g.moveTo(120, 100); g.quadraticCurveTo(100, 140, 66, 150); g.lineTo(60, 110); g.closePath(); });
      g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(100, 70, 24, 10, -0.4, 0, 7); g.fill();
    }
    const ey = 158, ex = 36;
    eye(128 - ex, ey, s.kid ? 17 : 14.5, s.kid ? 15 : 11.5); eye(128 + ex, ey, s.kid ? 17 : 14.5, s.kid ? 15 : 11.5);
    const by = 132; if (scared) { browF(78, by - 4, 112, by - 12, 10); browF(144, by - 12, 178, by - 4, 10); } else if (worried) { browF(78, by + 2, 112, by - 12, 4); browF(144, by - 12, 178, by + 2, 4); } else { browF(78, by, 112, by - 3, 5); browF(144, by - 3, 178, by, 5); }
    g.fillStyle = "rgba(140,70,50,.32)"; g.beginPath(); g.ellipse(131, 190, 12, 9, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.22)"; g.beginPath(); g.ellipse(125, 178, 4.5, 9, -0.1, 0, 7); g.fill();
    g.strokeStyle = "rgba(100,50,35,.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(120, 196); g.quadraticCurveTo(128, 201, 138, 196); g.stroke();
    mouth(128, 216, 44);
    if (s.wrinkle) { g.strokeStyle = "rgba(90,50,30,.3)"; g.lineWidth = 3; g.beginPath(); g.moveTo(72, 178); g.quadraticCurveTo(80, 200, 94, 212); g.moveTo(184, 178); g.quadraticCurveTo(176, 200, 162, 212); g.stroke(); }
    if (s.glasses) { g.strokeStyle = "#241a16"; g.lineWidth = 4.2; g.beginPath(); g.roundRect(70, ey - 24, 52, 40, 13); g.roundRect(134, ey - 24, 52, 40, 13); g.stroke(); g.beginPath(); g.moveTo(122, ey - 10); g.quadraticCurveTo(128, ey - 15, 134, ey - 10); g.stroke(); g.fillStyle = "rgba(190,215,240,.13)"; g.fillRect(72, ey - 22, 48, 36); g.fillRect(136, ey - 22, 48, 36); }
  } else if (view === "three") {
    // trois-quarts : visage tourné vers la droite (l'oreille est à gauche, le nez dépasse à droite)
    ear(66, 158);
    g.fillStyle = skinGrad(128, 150, 74, 90); g.beginPath(); g.moveTo(112, 56); g.bezierCurveTo(176, 52, 202, 100, 200, 150); g.lineTo(212, 178); g.lineTo(198, 186); g.bezierCurveTo(198, 226, 160, 242, 124, 240); g.bezierCurveTo(84, 236, 56, 208, 58, 160); g.bezierCurveTo(56, 100, 72, 60, 112, 56); g.fill();
    if (s.kid || s.female) { g.fillStyle = "rgba(235,110,95,.28)"; g.beginPath(); g.ellipse(168, 194, 18, 10, 0, 0, 7); g.fill(); }
    if (s.stubble) stubble(140, 178, 54, 52);
    if (hs !== "bald") {
      if (hs === "long") hairFill(() => { g.beginPath(); g.moveTo(58, 150); g.lineTo(54, 300); g.bezierCurveTo(100, 312, 140, 302, 140, 286); g.lineTo(122, 150); g.closePath(); });
      if (hs === "pigtails") { hairFill(() => { g.beginPath(); g.ellipse(52, 214, 30, 60, 0.25, 0, 7); g.closePath(); }); g.fillStyle = "#e6527a"; g.beginPath(); g.ellipse(58, 150, 12, 9, 0, 0, 7); g.fill(); }
      hairFill(() => { g.beginPath(); g.moveTo(56, 164); g.bezierCurveTo(40, 70, 100, 34, 140, 36); g.bezierCurveTo(186, 38, 214, 76, 204, 134); g.bezierCurveTo(190, 112, 164, 96, 136, 100); g.bezierCurveTo(108, 104, 86, 124, 80, 164); g.closePath(); });
      if (hs === "bun") hairFill(() => { g.beginPath(); g.arc(100, 32, 28, 0, 7); g.closePath(); });
      g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(112, 66, 24, 9, -0.3, 0, 7); g.fill();
    }
    eye(112, 160, s.kid ? 14 : 12, s.kid ? 14 : 10.5, 2); eye(166, 160, s.kid ? 11 : 9, s.kid ? 14 : 10.5, 3);
    const by = 134; if (scared) { browF(92, by - 4, 128, by - 12, 10); browF(154, by - 10, 182, by - 4, 8); } else if (worried) { browF(92, by + 2, 128, by - 12, 4); browF(154, by - 10, 182, by + 2, 4); } else { browF(92, by, 128, by - 3, 5); browF(154, by - 3, 182, by, 5); }
    g.fillStyle = "rgba(140,70,50,.34)"; g.beginPath(); g.ellipse(176, 194, 10, 8, 0, 0, 7); g.fill();
    mouth(150, 220, 30);
    if (s.glasses) { g.strokeStyle = "#241a16"; g.lineWidth = 4; g.beginPath(); g.roundRect(88, 138, 48, 38, 12); g.roundRect(146, 138, 40, 38, 12); g.stroke(); g.beginPath(); g.moveTo(136, 150); g.lineTo(146, 150); g.stroke(); g.beginPath(); g.moveTo(88, 150); g.lineTo(62, 148); g.stroke(); g.fillStyle = "rgba(190,215,240,.13)"; g.fillRect(90, 140, 44, 34); g.fillRect(148, 140, 36, 34); }
  } else { // profil, regard vers la droite
    ear(108, 160);
    g.fillStyle = skinGrad(128, 150, 74, 90); g.beginPath(); g.moveTo(96, 54); g.bezierCurveTo(168, 48, 192, 100, 190, 138); g.lineTo(206, 172); g.lineTo(190, 182); g.lineTo(194, 200); g.bezierCurveTo(196, 214, 184, 220, 176, 224); g.bezierCurveTo(168, 244, 140, 246, 116, 238); g.bezierCurveTo(70, 226, 50, 190, 52, 150); g.bezierCurveTo(52, 96, 68, 58, 96, 54); g.fill();
    if (s.stubble) stubble(150, 196, 40, 42);
    if (hs !== "bald") {
      if (hs === "long") hairFill(() => { g.beginPath(); g.moveTo(52, 150); g.lineTo(48, 300); g.bezierCurveTo(100, 312, 130, 302, 132, 286); g.lineTo(118, 160); g.closePath(); });
      if (hs === "pigtails") { hairFill(() => { g.beginPath(); g.ellipse(62, 220, 32, 58, 0.2, 0, 7); g.closePath(); }); g.fillStyle = "#e6527a"; g.beginPath(); g.ellipse(70, 150, 12, 9, 0, 0, 7); g.fill(); }
      hairFill(() => { g.beginPath(); g.moveTo(52, 190); g.bezierCurveTo(32, 80, 90, 30, 134, 36); g.bezierCurveTo(182, 40, 206, 78, 192, 124); g.bezierCurveTo(176, 102, 150, 94, 128, 100); g.bezierCurveTo(108, 108, 100, 140, 102, 186); g.closePath(); });
      if (hs === "bun") hairFill(() => { g.beginPath(); g.arc(88, 34, 28, 0, 7); g.closePath(); });
      g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(110, 64, 22, 8, -0.3, 0, 7); g.fill();
    }
    eye(166, 154, s.kid ? 12 : 10.5, s.kid ? 14 : 10.5, 3);
    const by = 130; if (scared) browF(146, by - 8, 184, by - 2, 9); else if (worried) browF(146, by + 2, 184, by - 8, 4); else browF(146, by - 2, 184, by, 5);
    g.fillStyle = "rgba(140,70,50,.3)"; g.beginPath(); g.ellipse(198, 176, 8, 6, 0, 0, 7); g.fill();
    g.strokeStyle = ink; g.lineWidth = 4; g.lineCap = "round";
    if (scared || talk) { g.fillStyle = "#47150f"; g.beginPath(); g.ellipse(184, 214, 10, scared ? 14 : 9, 0, 0, 7); g.fill(); } else if (smile) { g.beginPath(); g.moveTo(176, 210); g.quadraticCurveTo(190, 220, 196, 206); g.stroke(); } else { g.beginPath(); g.moveTo(178, 212); g.lineTo(194, 208); g.stroke(); }
    if (s.glasses) { g.strokeStyle = "#241a16"; g.lineWidth = 4; g.beginPath(); g.roundRect(144, 132, 42, 38, 12); g.stroke(); g.beginPath(); g.moveTo(144, 148); g.lineTo(110, 146); g.stroke(); g.fillStyle = "rgba(190,215,240,.13)"; g.fillRect(146, 134, 38, 34); }
  }
  if (zomb && view !== "back") { g.strokeStyle = "rgba(70,40,70,.42)"; g.lineWidth = 2; const ox = view === "front" ? 0 : 18; for (let k = 0; k < 7; k++) { const x0 = 70 + ox + ((k * 37) % 120), y0 = 100 + ((k * 53) % 110); g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 10, y0 + 12, x0 + (k % 2 ? 16 : -12), y0 + 26); g.stroke(); } if (view === "side") { g.fillStyle = "#2a0a08"; g.beginPath(); g.ellipse(184, 216, 12, 16, 0, 0, 7); g.fill(); g.fillStyle = "rgba(150,14,14,.9)"; g.fillRect(178, 228, 6, 20); } }
  if (s.blood && view !== "back") { g.fillStyle = "rgba(170,20,20,.85)"; g.beginPath(); g.moveTo(view === "front" ? 150 : 170, 92); g.quadraticCurveTo(view === "front" ? 160 : 182, 130, view === "front" ? 148 : 176, 168); g.quadraticCurveTo(view === "front" ? 140 : 168, 130, view === "front" ? 138 : 164, 94); g.closePath(); g.fill(); g.fillStyle = "rgba(140,16,16,.7)"; g.beginPath(); g.ellipse(view === "front" ? 150 : 172, 96, 14, 8, 0, 0, 7); g.fill(); }
  // cagoule (épisode 8) : tricot sombre qui couvre la tête, une bande pour les yeux et un trou pour la bouche ; maskUp = roulée en bonnet
  if (s.mask) {
    const knit = (path: () => void) => { g.fillStyle = s.mask!; path(); g.fill("evenodd"); g.save(); path(); g.clip("evenodd"); g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 2; for (let y = 20; y < 300; y += 7) { g.beginPath(); g.moveTo(20, y); g.lineTo(240, y + 3); g.stroke(); } g.strokeStyle = "rgba(0,0,0,.25)"; for (let x = 30; x < 240; x += 9) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x + 4, 300); g.stroke(); } const gr = g.createRadialGradient(100, 90, 10, 128, 150, 130); gr.addColorStop(0, "rgba(255,255,255,.1)"); gr.addColorStop(1, "rgba(0,0,0,.3)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 320); g.restore(); };
    if (s.maskUp) knit(() => { g.beginPath(); g.moveTo(46, 112); g.bezierCurveTo(40, 40, 96, 22, 128, 22); g.bezierCurveTo(160, 22, 216, 40, 210, 112); g.lineTo(46, 112); g.closePath(); g.rect(42, 98, 172, 22); });
    else if (view === "back") knit(() => { g.beginPath(); g.ellipse(128, 142, 84, 104, 0, 0, 7); g.rect(98, 236, 60, 44); });
    else if (view === "front") knit(() => { g.beginPath(); g.ellipse(128, 142, 84, 104, 0, 0, 7); g.roundRect(70, 136, 116, 44, 20); g.ellipse(128, 219, 25, 17, 0, 0, 7); });
    else if (view === "three") knit(() => { g.beginPath(); g.ellipse(132, 144, 84, 104, 0, 0, 7); g.roundRect(92, 138, 98, 42, 18); g.ellipse(150, 222, 19, 15, 0, 0, 7); });
    else knit(() => { g.beginPath(); g.ellipse(128, 144, 86, 104, 0, 0, 7); g.roundRect(146, 133, 46, 42, 16); g.ellipse(185, 214, 14, 14, 0, 0, 7); });
    if (!s.maskUp && view !== "back") { g.fillStyle = s.mask!; g.fillRect(98, 240, 60, 40); }
  }
  if (s.hat) { g.fillStyle = s.hat; g.beginPath(); g.ellipse(128, 70, 84, 38, 0, Math.PI, 0); g.fill(); g.fillRect(40, 66, 176, 12); }
  // pirates (épisode 10) : regard méchant, rictus, cicatrice, bandeau sur l'œil, boucle d'oreille, foulard noué ou tricorne
  if (view !== "back") {
    const F = view === "front", T = view === "three";
    if (expr === "angry" || expr === "roar") { g.strokeStyle = shade(brow, 0.6); g.lineWidth = 12; g.lineCap = "round"; g.beginPath();
      if (F) { g.moveTo(74, 124); g.lineTo(114, 142); g.moveTo(142, 142); g.lineTo(182, 124); } else if (T) { g.moveTo(88, 126); g.lineTo(128, 144); g.moveTo(152, 144); g.lineTo(186, 126); } else { g.moveTo(144, 140); g.lineTo(186, 124); } g.stroke();
      g.strokeStyle = "rgba(60,25,15,.45)"; g.lineWidth = 3; g.beginPath(); if (F) { g.moveTo(122, 120); g.lineTo(126, 138); g.moveTo(134, 120); g.lineTo(130, 138); } else if (T) { g.moveTo(138, 120); g.lineTo(140, 138); } g.stroke(); }
    if (expr === "angry") { const [cx, cy, w] = F ? [128, 216, 46] : T ? [150, 220, 32] : [186, 212, 20]; g.fillStyle = "#3a0e0a"; g.beginPath(); g.ellipse(cx, cy + 2, w * 0.5, w * 0.22, 0, 0, 7); g.fill();
      g.fillStyle = "#efe6c8"; g.fillRect(cx - w * 0.4, cy - 6, w * 0.8, 5); g.fillRect(cx - w * 0.3, cy + 5, w * 0.6, 4); g.fillStyle = "#c8a030"; g.fillRect(cx + w * 0.08, cy - 6, w * 0.14, 5);
      g.strokeStyle = "#2a1008"; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - w * 0.55, cy + 8); g.lineTo(cx - w * 0.45, cy); g.moveTo(cx + w * 0.55, cy + 8); g.lineTo(cx + w * 0.45, cy); g.stroke(); }
    if (s.scar) { g.strokeStyle = "rgba(120,40,30,.85)"; g.lineWidth = 4; g.beginPath(); const x0 = F ? 78 : T ? 98 : 150; g.moveTo(x0, 150); g.lineTo(x0 + 18, 204); g.stroke(); g.lineWidth = 2; for (let k = 0; k < 4; k++) { const y = 160 + k * 12, x = x0 + (y - 150) * 0.33; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y + 2); g.stroke(); } }
    if (s.patch) { const [px, py, r] = F ? [164, 158, 21] : T ? [166, 160, 17] : [166, 154, 15]; g.strokeStyle = "#141010"; g.lineWidth = 5; g.beginPath(); g.moveTo(px - r, py - 6); g.lineTo(F ? 52 : T ? 66 : 120, py - 34); g.moveTo(px + r - 2, py - 8); g.lineTo(F ? 204 : T ? 206 : 200, py - 26); g.stroke();
      g.fillStyle = "#141010"; g.beginPath(); g.ellipse(px, py + 2, r, r * 0.85, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.ellipse(px - r * 0.3, py - r * 0.25, r * 0.35, r * 0.2, -0.4, 0, 7); g.fill(); }
    if (s.earring) { g.strokeStyle = "#e0b030"; g.lineWidth = 4; g.beginPath(); g.arc(F ? 50 : T ? 64 : 94, F ? 196 : 194, 9, 0, 7); g.stroke(); }
  }
  if (s.bandana) { g.fillStyle = s.bandana; g.beginPath(); g.ellipse(128, 104, 86, 70, 0, Math.PI, 0); g.lineTo(214, 112); g.lineTo(42, 112); g.closePath(); g.fill();
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(42, 104, 172, 9); g.fillStyle = "rgba(255,255,255,.55)"; for (let k = 0; k < 16; k++) { g.beginPath(); g.arc(60 + ((k * 41) % 140), 52 + ((k * 23) % 52), 4, 0, 7); g.fill(); }
    if (view !== "front") { g.fillStyle = s.bandana; const kx = view === "back" ? 128 : 54; g.beginPath(); g.ellipse(kx, 104, 12, 10, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(kx, 106); g.lineTo(kx - 24, 160); g.lineTo(kx - 8, 158); g.closePath(); g.moveTo(kx + 2, 106); g.lineTo(kx + 10, 166); g.lineTo(kx + 20, 160); g.closePath(); g.fill(); } }
  if (s.tricorn) { const c = s.tricorn; g.fillStyle = c; g.beginPath(); g.ellipse(128, 70, 66, 50, 0, Math.PI, 0); g.fill();
    g.beginPath(); g.moveTo(14, 64); g.quadraticCurveTo(40, 112, 128, 104); g.quadraticCurveTo(216, 112, 242, 64); g.quadraticCurveTo(200, 86, 128, 80); g.quadraticCurveTo(56, 86, 14, 64); g.fill();
    g.beginPath(); g.moveTo(14, 64); g.quadraticCurveTo(50, 40, 70, 74); g.lineTo(186, 74); g.quadraticCurveTo(206, 40, 242, 64); g.quadraticCurveTo(200, 88, 128, 84); g.quadraticCurveTo(56, 88, 14, 64); g.fill();
    g.strokeStyle = "#d8b048"; g.lineWidth = 4; g.beginPath(); g.moveTo(14, 64); g.quadraticCurveTo(40, 112, 128, 104); g.quadraticCurveTo(216, 112, 242, 64); g.stroke();
    if (view !== "back") { g.fillStyle = "#ece6d6"; g.beginPath(); g.arc(128, 54, 11, 0, 7); g.fill(); g.fillRect(118, 62, 20, 8); g.fillStyle = c; g.beginPath(); g.arc(124, 53, 3.5, 0, 7); g.arc(132, 53, 3.5, 0, 7); g.fill(); } }
  if (s.headset) { g.strokeStyle = "#1e2026"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); if (view === "front" || view === "back") { g.arc(128, 150, 84, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); for (const x of [46, 210]) { g.fillStyle = "#2a2d36"; g.beginPath(); g.ellipse(x, 160, 17, 26, 0, 0, 7); g.fill(); } if (view === "front") { g.lineWidth = 5; g.beginPath(); g.moveTo(46, 182); g.quadraticCurveTo(70, 232, 112, 218); g.stroke(); g.fillStyle = "#14161a"; g.beginPath(); g.ellipse(114, 218, 9, 6, 0, 0, 7); g.fill(); } } else { g.arc(120, 150, 84, Math.PI * 1.15, Math.PI * 1.9); g.stroke(); g.fillStyle = "#2a2d36"; g.beginPath(); g.ellipse(112, 162, 20, 28, 0, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = "#1e2026"; g.beginPath(); g.moveTo(104, 186); g.quadraticCurveTo(130, 238, 176, 224); g.stroke(); g.fillStyle = "#14161a"; g.beginPath(); g.ellipse(178, 224, 9, 6, 0, 0, 7); g.fill(); } }
}));

