// La vidéo complète : la 3D (moteur) + l'habillage 2D + le son.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { creerMoteur } from "../kit/moteur";
import { Hud, Accroche, Saison, SousTitres, Compteur, Fin, Mains } from "../kit/habillage";
import { Voix, Bruitages, type Bruit } from "../kit/son";
import { creerMonde } from "./decor";
import { camera, effets, mains, distanceFeu, COMPTEUR, HUD, EV } from "./chrono";
import { LIGNES, VOIX, TITRE, SAISON, FIN } from "./lignes";

// Bruitages : [instant, fichier de public/sfx (sans .wav), volume, boucle ?, durée ?]. Vide tant qu'on n'a pas téléchargé les sons.
// Exemple : [EV.impact, "explosion", 1], [0, "ville", 0.4, true, EV.impact + 1]
const BRUITS: Bruit[] = [];
const FORTS = ["explosion"]; // ces sons-là ne baissent pas sous les voix

const MANCHE: [string, string, string] = ["#2f7a3e", "#3d9450", "#24602f"]; // sweat vert du héros

export const Exemple: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const cv = useRef<HTMLCanvasElement>(null), out = useRef<HTMLCanvasElement>(null), eng = useRef<ReturnType<typeof creerMoteur> | null>(null);
  const handle = useMemo(() => delayRender("image 3D"), [frame]);
  useLayoutEffect(() => {
    if (!eng.current) eng.current = creerMoteur(cv.current!, out.current!, { monde: creerMonde, camera, effets });
    eng.current.render(t); continueRender(handle);
  }, [frame]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <canvas ref={cv} width={1080} height={1920} style={{ position: "absolute", inset: 0, visibility: "hidden" }} />
      <canvas ref={out} width={1080} height={1920} style={{ position: "absolute", inset: 0 }} />
      <Mains t={t} mains={mains} manche={MANCHE} luminosite={1 - 0.15 * Math.min(1, Math.max(0, (t - EV.impact) / 5))} />
      <Hud t={t} texte={HUD(t)} />
      <Saison t={t} texte={SAISON} />
      <Accroche t={t} texte={TITRE} />
      <Compteur t={t} debut={COMPTEUR.debut} fin={COMPTEUR.fin} distance={distanceFeu(t)} texte={(d) => `FEU À ${d} M`} />
      <Fin t={t} o={FIN} />
      {t < FIN.debut + 0.2 && <SousTitres t={t} lignes={LIGNES} />}
      <Voix voix={VOIX} />
      <Bruitages bruits={BRUITS} lignes={LIGNES} forts={FORTS} />
    </AbsoluteFill>
  );
};
