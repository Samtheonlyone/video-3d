// Miniature TikTok 3:4 (1080 × 1440) : la vraie scène 3D à un instant choisi, avec une caméra libre, et un habillage qui claque.
// Usage dans Root.tsx : <Composition id="Miniature" component={…} width={1080} height={1440} durationInFrames={1} fps={30} />
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { creerMoteur, type Effets, type Monde } from "./moteur";
import type { Cam } from "./camera";
import { fontFamily, ROUGE, JAUNE, BLEU } from "./habillage";

const COUL: Record<string, string> = { R: ROUGE, B: BLEU, Y: JAUNE };
const Mots: React.FC<{ texte: string }> = ({ texte }) => (<>{texte.split(" ").map((w, i) => { const m = /^([RBY])\|(.*)$/.exec(w); return <span key={i} style={{ color: m ? COUL[m[1]] : undefined }}>{(m ? m[2] : w) + " "}</span>; })}</>);
// contour noir par 4 ombres décalées (un contour « text-stroke » dessine des traits à l'intérieur des lettres)
const contour = (e: number, halo: string) => `${e}px ${e}px 0 #000, -${e}px ${e}px 0 #000, ${e}px -${e}px 0 #000, -${e}px -${e}px 0 #000, 0 0 40px ${halo}, 0 0 80px ${halo}`;

export type OptionsMiniature = {
  monde: (renderer: any) => Monde;
  camera: (t: number) => Cam;
  effets?: (t: number) => Effets;
  t: number;                  // instant de la scène où la menace est la plus LISIBLE (pas seulement spectaculaire)
  cam?: number[];             // caméra libre [x, y, z, yaw, pitch, fov] ; sinon la caméra de la vidéo
  petit?: string;             // « LA », « LE », « LES »
  titre: string;              // le gros titre (2 à 3 mots)
  accroche?: string;          // 2 lignes sur le dilemme, avec R| Y| B|
  saison?: string;
  halo?: string;              // couleur propre à la vidéo (vert, bleu, orange, doré)
};

export const Miniature: React.FC<{ o: OptionsMiniature }> = ({ o }) => {
  const cv = useRef<HTMLCanvasElement>(null), out = useRef<HTMLCanvasElement>(null);
  const handle = useMemo(() => delayRender("miniature"), []);
  useLayoutEffect(() => {
    const cam = o.cam ? (): Cam => ({ px: o.cam![0], py: o.cam![1], pz: o.cam![2], yaw: o.cam![3], pitch: o.cam![4], roll: 0, fov: o.cam![5] }) : o.camera;
    // pas de flash ni de poussière sur une miniature : elle doit être nette
    const eff = (t: number) => ({ ...(o.effets ? o.effets(t) : {}), flash: 0, poussiere: 0, ca: 0 });
    creerMoteur(cv.current!, out.current!, { monde: o.monde, camera: cam, effets: eff }).render(o.t);
    continueRender(handle);
  }, []);
  const halo = o.halo ?? "#ff7a2a";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <canvas ref={cv} width={1080} height={1920} style={{ position: "absolute", visibility: "hidden" }} />
      {/* la scène 1080×1920 recadrée au centre (240 px en haut et en bas), plus contrastée : l'étalonnage délave */}
      <canvas ref={out} width={1080} height={1920} style={{ position: "absolute", left: 0, top: -240, filter: "contrast(1.18) saturate(1.35)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,.6) 100%)" }} />
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "8px 28px", background: ROUGE, borderRadius: 10, fontFamily, fontWeight: 900, fontSize: 54, letterSpacing: 4, color: "#fff", transform: "rotate(-2deg)" }}>ET SI…</div></div>
      <div style={{ position: "absolute", top: 170, left: 30, right: 30, textAlign: "center", fontFamily, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 0.95 }}>
        {o.petit && <div style={{ fontSize: 70, marginBottom: 14, textShadow: contour(4, halo) }}>{o.petit}</div>}
        <div style={{ fontSize: 150, textShadow: contour(6, halo) }}>{o.titre}</div></div>
      {o.accroche && <div style={{ position: "absolute", bottom: 150, left: 40, right: 40, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.08, color: "#fff", textTransform: "uppercase", textShadow: contour(4, "rgba(0,0,0,.6)") }}>
        {o.accroche.split(/\n|\\n/).map((ligne, i) => <div key={i}><Mots texte={ligne} /></div>)}</div>}
      {o.saison && <div style={{ position: "absolute", bottom: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "6px 26px", border: `5px solid ${ROUGE}`, borderRadius: 10, background: "rgba(40,6,4,.75)", fontFamily, fontWeight: 900, fontSize: 40, letterSpacing: 4, color: ROUGE }}>{o.saison}</div></div>}
    </AbsoluteFill>
  );
};
