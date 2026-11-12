// Habillage 2D posé par-dessus la 3D : HUD, titre d'accroche, carte « Saison • Épisode », sous-titres mot par mot,
// compte à rebours de la menace, mains POV, cartes A/B et appels à l'action. Mêmes courbes et durées partout.
import React from "react";
import { loadFont } from "@remotion/google-fonts/RobotoCondensed";
import { smooth, easeOut, seg, hash } from "./outils";

export const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin", "latin-ext"] });
// Palette : le rouge est réservé au danger, au badge, à la carte A ; bleu = les proches ; jaune = l'émotion
export const ROUGE = "#e0372b", BLEU = "#4a8fe0", JAUNE = "#f5c518", BLANC = "#f4f1ea", CREME = "#f4efe3", ENCRE = "#150f1a";
const COUL: Record<string, string> = { R: ROUGE, B: BLEU, Y: JAUNE };

// Colore les mots : « LE R|FEU ! » → FEU en rouge. R| rouge, B| bleu, Y| jaune.
const Mots: React.FC<{ texte: string }> = ({ texte }) => (<>{texte.split(" ").map((w, i) => { const m = /^([RBY])\|(.*)$/.exec(w); return <span key={i} style={{ color: m ? COUL[m[1]] : undefined }}>{(m ? m[2] : w) + " "}</span>; })}</>);

// ---------------------------------------------------------------- HUD (haut gauche) + badge (haut droite)
export const Hud: React.FC<{ t: number; texte: string; badge?: string }> = ({ t, texte, badge = "ET SI" }) => {
  const dot = 0.6 + 0.4 * Math.sin(t * 6);
  return (<>
    <div style={{ position: "absolute", left: 54, top: 150, display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 14, background: "rgba(14,16,20,.58)", fontFamily, fontWeight: 700, fontSize: 32, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: ROUGE, opacity: dot, boxShadow: `0 0 12px ${ROUGE}` }} />{texte}</div>
    {badge && <div style={{ position: "absolute", right: 54, top: 150, padding: "8px 22px", border: `4px solid ${ROUGE}`, borderRadius: 8, background: "rgba(0,0,0,.25)", fontFamily, fontWeight: 900, fontSize: 38, letterSpacing: 3, color: ROUGE }}>{badge}</div>}
  </>);
};

// ---------------------------------------------------------------- grand titre d'accroche, lisible dès l'image 1
export const Accroche: React.FC<{ t: number; texte: string; fin?: number; top?: number }> = ({ t, texte, fin = 2.2, top = 720 }) => {
  const a = 1 - smooth(fin - 0.2, fin + 0.05, t); if (a <= 0.001) return null;
  const sc = 1 + 0.025 * Math.sin(t * 5);
  return (<div style={{ position: "absolute", left: 36, right: 36, top, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${sc}) rotate(-2deg)` }}>
    <div style={{ padding: "16px 30px 20px", background: "rgba(14,8,10,.8)", border: `6px solid ${ROUGE}`, borderRadius: 16, fontFamily, fontWeight: 900, fontSize: 68, lineHeight: 1.04, letterSpacing: 2, color: "#fff", textAlign: "center", textTransform: "uppercase", boxShadow: "0 18px 40px rgba(0,0,0,.6)" }}>
      <Mots texte={texte} /></div></div>);
};

// ---------------------------------------------------------------- carte « SAISON 1 • ÉPISODE N » (claque à l'image 1)
export const Saison: React.FC<{ t: number; texte: string }> = ({ t, texte }) => {
  const a = 1 - smooth(2.9, 3.2, t); if (a <= 0.001) return null;
  const k = easeOut((t - 0.05) / 0.3), sc = 1.25 - 0.25 * k;
  return (<div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${sc}) rotate(${-2 * (1 - k)}deg)` }}>
    <div style={{ padding: "6px 30px", border: `5px solid ${ROUGE}`, borderRadius: 10, background: "rgba(40,6,4,.68)", fontFamily, fontWeight: 900, fontSize: 46, letterSpacing: 4, color: ROUGE, textTransform: "uppercase" }}>{texte}</div></div>);
};

// ---------------------------------------------------------------- sous-titres mot par mot
export type Ligne = { id: string; qui?: string; tag?: string; t0: number; t1: number; texte: string; mots?: number[] };
export const SousTitres: React.FC<{ t: number; lignes: Ligne[] }> = ({ t, lignes }) => {
  const line = lignes.find((l) => t >= l.t0 && t < l.t1 + 0.15); if (!line) return null;
  const words = line.texte.split(" ").filter(Boolean), n = words.length, span = (line.t1 - line.t0) * 0.82;
  const out = 1 - smooth(line.t1, line.t1 + 0.15, t);
  return (<div style={{ position: "absolute", left: 60, right: 60, top: 1180, height: 260, display: "flex", flexDirection: "column", alignItems: "center" }}>
    {line.qui && <div style={{ fontFamily, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: BLEU, marginBottom: 6, textShadow: "0 3px 10px #000", opacity: out }}>{line.qui} {line.tag && <span style={{ opacity: 0.6, fontSize: 28 }}>{line.tag}</span>}</div>}
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px", fontFamily, fontWeight: 700, fontSize: 82, lineHeight: 1.1, color: BLANC, textTransform: "uppercase", textShadow: "0 4px 0 rgba(0,0,0,.55), 0 0 22px rgba(0,0,0,.95), 0 0 6px #000" }}>
      {words.map((w0, i) => {
        const m = /^([RBY])\|(.*)$/.exec(w0), w = m ? m[2] : w0;
        const at = line.mots?.[i] ?? line.t0 + (i / n) * span; // instant exact du mot s'il est connu (Whisper), sinon réparti
        if (t < at) return <span key={i} style={{ opacity: 0 }}>{w}</span>;
        const k = easeOut(seg(t, at, at + 0.14));
        return <span key={i} style={{ color: m ? COUL[m[1]] : BLANC, opacity: out, transform: `scale(${0.72 + 0.28 * k}) translateY(${(1 - k) * 14}px)`, display: "inline-block" }}>{w}</span>;
      })}</div></div>);
};

// ---------------------------------------------------------------- compte à rebours de la menace (ne fait que baisser)
export const Compteur: React.FC<{ t: number; debut: number; fin: number; distance: number; texte: (d: number) => string }> = ({ t, debut, fin, distance, texte }) => {
  if (t < debut || t > fin || distance < 0) return null;
  const k = easeOut((t - debut) / 0.25), near = 1 - Math.min(1, distance / 12), pulse = 0.6 + 0.4 * Math.max(0, Math.sin((t - debut) * (5 + 10 * near)));
  const d = distance > 20 ? Math.round(distance / 5) * 5 : Math.max(1, Math.round(distance)); // arrondi à 5 m au-dessus de 20 m
  return (<div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", opacity: Math.min(1, k * 2), transform: `scale(${(2 - k) * (1 + 0.04 * near * Math.sin(t * 14))})` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 34px", background: `rgba(160,40,10,${0.75 + 0.15 * pulse})`, border: "4px solid #ffe0c8", borderRadius: 10, fontFamily, fontWeight: 900, fontSize: 56, letterSpacing: 4, color: "#fff", boxShadow: `0 0 ${20 + 30 * near * pulse}px rgba(255,110,30,.6)` }}>
      <svg width={50} height={50} viewBox="0 0 100 100"><path d="M50 6 L96 90 H4 Z" fill="#fff" /><rect x={45} y={36} width={10} height={30} rx={4} fill="#a0280a" /><circle cx={50} cy={76} r={6} fill="#a0280a" /></svg>{texte(d)}</div></div>);
};

// ---------------------------------------------------------------- fin : cartes A/B + pastilles, par-dessus la scène qui continue
const Carte: React.FC<{ t: number; at: number; x: number; lettre: string; label: string; color: string; tilt: number }> = ({ t, at, x, lettre, label, color, tilt }) => {
  if (t < at) return null;
  const k = easeOut((t - at) / 0.22), sc = 2.4 - 1.4 * k + 0.04 * Math.sin((t - at) * 1.8);
  return (<div style={{ position: "absolute", left: x - 235, top: 560, width: 470, transform: `scale(${sc}) rotate(${tilt * k}deg)`, opacity: Math.min(1, k * 2) }}>
    <div style={{ background: CREME, border: `7px solid ${ENCRE}`, borderRadius: 26, boxShadow: `0 0 0 10px ${color}, 0 26px 40px rgba(0,0,0,.6)`, padding: "26px 20px 30px", textAlign: "center", fontFamily }}>
      <div style={{ width: 150, height: 150, margin: "0 auto 14px", borderRadius: 75, background: color, border: `6px solid ${ENCRE}`, color: "#fff", fontWeight: 900, fontSize: 120, lineHeight: "140px" }}>{lettre}</div>
      <div style={{ fontWeight: 900, fontSize: 52, letterSpacing: 2, color: ENCRE, lineHeight: 1.05, textTransform: "uppercase" }}>{label}</div></div></div>);
};
const Pastille: React.FC<{ t: number; at: number; top: number; children: any; size?: number }> = ({ t, at, top, children, size = 62 }) => {
  if (t < at) return null; const k = easeOut((t - at) / 0.25), pulse = 1 + 0.035 * Math.sin(t * 6);
  return (<div style={{ position: "absolute", left: 30, right: 30, top, display: "flex", justifyContent: "center", transform: `scale(${(1.6 - 0.6 * k) * pulse})`, opacity: Math.min(1, k * 2) }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 36px", background: CREME, border: `6px solid ${ENCRE}`, borderRadius: 60, fontFamily, fontWeight: 900, fontSize: size, letterSpacing: 2, color: ENCRE, textAlign: "center", lineHeight: 1.1, boxShadow: "0 14px 30px rgba(0,0,0,.55)" }}>{children}</div></div>);
};
export type OptionsFin = { debut: number; choixA: string; choixB: string; envoie?: string };
// Chronologie de la fin (à partir de debut) : A à +0,05 s, B à +0,5, « ÉCRIS A OU B » à +0,9, « ENVOIE ÇA » à +1,2, « ABONNE-TOI » à +2,6
export const Fin: React.FC<{ t: number; o: OptionsFin }> = ({ t, o }) => {
  if (t < o.debut) return null; const d = o.debut, dim = smooth(d, d + 0.6, t);
  return (<div style={{ position: "absolute", inset: 0 }}>
    <div style={{ position: "absolute", inset: 0, background: `rgba(10,6,14,${0.42 * dim})` }} />
    <Carte t={t} at={d + 0.05} x={270} lettre="A" label={o.choixA} color={ROUGE} tilt={-3} />
    <Carte t={t} at={d + 0.5} x={810} lettre="B" label={o.choixB} color={BLEU} tilt={3} />
    <Pastille t={t} at={d + 0.9} top={1250}>
      <svg width={58} height={52} viewBox="0 0 58 52"><path d="M6 4 H52 Q56 4 56 8 V32 Q56 36 52 36 H24 L12 48 V36 H6 Q2 36 2 32 V8 Q2 4 6 4 Z" fill={ENCRE} /><circle cx={18} cy={20} r={4} fill={CREME} /><circle cx={29} cy={20} r={4} fill={CREME} /><circle cx={40} cy={20} r={4} fill={CREME} /></svg>
      <span>ÉCRIS <span style={{ color: ROUGE }}>A</span> OU <span style={{ color: BLEU }}>B</span></span></Pastille>
    {o.envoie && <Pastille t={t} at={d + 1.2} top={1430} size={50}>
      <svg width={54} height={54} viewBox="0 0 54 54"><path d="M4 26 L50 4 L36 50 L26 30 Z" fill={ENCRE} /><path d="M26 30 L50 4" stroke={CREME} strokeWidth={4} /></svg>
      <span><Mots texte={o.envoie} /></span></Pastille>}
    <Pastille t={t} at={d + 2.6} top={1610} size={50}>
      <svg width={50} height={56} viewBox="0 0 86 96" style={{ transform: `rotate(${12 * Math.sin((t - d - 2.6) * 9) * Math.exp(-Math.max(0, t - d - 3.1) * 1.5)}deg)`, transformOrigin: "43px 8px" }}><path d="M43 6 C24 6 15 21 15 38 V58 L6 72 H80 L71 58 V38 C71 21 62 6 43 6 Z" fill={ROUGE} /><circle cx={43} cy={84} r={10} fill={ROUGE} /></svg>
      <span><span style={{ color: ROUGE }}>ABONNE-TOI</span> POUR LA SUITE</span></Pastille>
  </div>);
};

// ---------------------------------------------------------------- mains POV (dessin plat, manche du héros)
import type { Main } from "./mains";
export type { Main };
const SKIN: [string, string, string] = ["#d6a679", "#b98458", "#e6bb90"];
// doigts et main ombrés (dégradés de peau, phalanges, ongles) pour un rendu moins « dessin animé »
const Doigt: React.FC<{ x: number; ang: number; len: number; sk: [string, string, string]; id: string }> = ({ x, ang, len, sk, id }) => (
  <g transform={`translate(${x} -118) rotate(${ang})`}>
    <rect x={-19} y={-len} width={38} height={len + 12} rx={19} fill={`url(#doigt${id})`} />
    <path d={`M -12 ${-len * 0.42} q 12 5 24 0`} stroke={sk[1]} strokeWidth={2.2} fill="none" opacity={0.45} />
    <path d={`M -11 ${-len * 0.72} q 11 4 22 0`} stroke={sk[1]} strokeWidth={1.8} fill="none" opacity={0.35} />
    <rect x={-11} y={-len + 4} width={22} height={17} rx={8} fill="#f1d3c0" opacity={0.75} />
    <rect x={-9} y={-len + 5} width={8} height={6} rx={3} fill="#ffffff" opacity={0.35} /></g>);
const UneMain: React.FC<{ p: Main; side: 1 | -1; blur: number; manche: [string, string, string]; peau: [string, string, string] }> = ({ p, side, blur, manche, peau }) => {
  const o = p.open, fan = (i: number) => (i - 1.5) * (4 + 20 * o), lens = [88, 108, 100, 78].map((l) => l * (0.62 + 0.38 * o)), xs = [-54, -18, 18, 54];
  const id = side > 0 ? "R" : "L", lit = side > 0 ? [peau[2], peau[0], peau[1]] : [peau[1], peau[0], peau[2]];
  return (<g transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`} style={{ filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
    <defs>
      <linearGradient id={`manche${id}`} x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={manche[side > 0 ? 2 : 1]} /><stop offset="0.45" stopColor={manche[0]} /><stop offset="1" stopColor={manche[side > 0 ? 1 : 2]} /></linearGradient>
      <linearGradient id={`peau${id}`} x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={lit[0]} /><stop offset="0.5" stopColor={lit[1]} /><stop offset="1" stopColor={lit[2]} /></linearGradient>
      <linearGradient id={`doigt${id}`} x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor={lit[0]} /><stop offset="0.55" stopColor={lit[1]} /><stop offset="1" stopColor={lit[2]} /></linearGradient>
      <radialGradient id={`dos${id}`} cx="0.5" cy="0.35" r="0.6"><stop offset="0" stopColor="#ffffff" stopOpacity="0.18" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
    </defs>
    <path d="M -78 20 L 78 20 L 128 1500 L -128 1500 Z" fill={`url(#manche${id})`} />
    {[-40, 8, 46].map((x, k) => <path key={k} d={`M ${x} ${60 + k * 30} q ${side * 14} 160 ${side * 6} 360 q ${-side * 10} 200 ${side * 18} 420`} stroke="#000" strokeOpacity={0.09} strokeWidth={9} fill="none" />)}
    <path d="M -80 18 L 80 18 L 84 78 L -84 78 Z" fill={manche[2]} />
    <path d="M -84 74 L 84 74 L 84 82 L -84 82 Z" fill="#000" opacity={0.12} />
    <path d="M -70 20 C -82 -30 -80 -96 -60 -126 L 60 -126 C 80 -96 82 -30 70 20 Z" fill={`url(#peau${id})`} />
    <path d="M -70 20 C -82 -30 -80 -96 -60 -126 L 60 -126 C 80 -96 82 -30 70 20 Z" fill={`url(#dos${id})`} />
    {[-36, 0, 36].map((x, k) => <path key={k} d={`M ${x} -10 q 3 -50 ${x * 0.15} -100`} stroke={peau[1]} strokeWidth={4} strokeOpacity={0.22} fill="none" />)}
    {[0, 1, 2, 3].map((i) => <Doigt key={i} x={xs[i]} ang={fan(i)} len={lens[i]} sk={peau} id={id} />)}
    <g transform={`translate(${-side * 68} -34) rotate(${-side * (38 + 28 * o)})`}><rect x={-20} y={-84 * (0.6 + 0.4 * o)} width={40} height={84 * (0.6 + 0.4 * o) + 14} rx={20} fill={`url(#doigt${id})`} />
      <rect x={-12} y={-84 * (0.6 + 0.4 * o) + 4} width={22} height={18} rx={8} fill="#f1d3c0" opacity={0.7} /></g>
  </g>);
};
// mains(t) donne la pose des deux mains ; on compare avec t - 1 image pour le flou de mouvement
export const Mains: React.FC<{ t: number; mains: (t: number) => { L: Main; R: Main }; manche: [string, string, string]; peau?: [string, string, string]; luminosite?: number }> = ({ t, mains, manche, peau = SKIN, luminosite = 1 }) => {
  const h = mains(t), p = mains(Math.max(0, t - 1 / 30)), bl = (a: Main, b: Main) => Math.min(14, Math.hypot(a.x - b.x, a.y - b.y) * 0.3);
  return (<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, filter: `brightness(${luminosite}) drop-shadow(0 10px 18px rgba(0,0,0,.45))` }}>
    {h.L.show > 0.01 && <g opacity={Math.min(1, h.L.show * 1.5)}><UneMain p={h.L} side={-1} blur={bl(h.L, p.L)} manche={manche} peau={peau} /></g>}
    {h.R.show > 0.01 && <g opacity={Math.min(1, h.R.show * 1.5)}><UneMain p={h.R} side={1} blur={bl(h.R, p.R)} manche={manche} peau={peau} /></g>}
  </svg>);
};
export { mainsCourse, blendMain, GESTES } from "./mains";
export { hash };
