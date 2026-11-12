// La vidéo complète : la 3D (moteur) + l'habillage 2D + le son.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { creerMoteur } from "../kit/moteur";
import { Hud, Accroche, Saison, SousTitres, Compteur, Fin, Mains } from "../kit/habillage";
import { Voix, Bruitages, type Bruit } from "../kit/son";
import { creerMonde, FICHIERS } from "./decor";
import { chargerAssets } from "../kit/assets";
import { camera, effets, mains, distanceFlotte, COMPTEUR, HUD, EV, DUR } from "./chrono";
import { LIGNES, VOIX, TITRE, SAISON, FIN } from "./lignes";

// bruitages Openverse (CC0), voir public/sfx
const BRUITS: Bruit[] = [
  [0, "ville", (t) => (t < EV.choc ? 0.5 : 0.25), true, DUR],          // foule du port en boucle
  [0, "mer", 0.35, true, DUR],                                          // clapot de la baie
  [EV.choc - 0.05, "explosion", 1],                                     // premier coup de canon
  [EV.choc + 0.3, "debris", 0.7],                                       // planches cassées
  [EV.obus2, "explosion", 0.6],                                         // second tir
  [EV.accoste, "debris", 0.5],                                          // choc contre le quai
  [EV.accoste + 0.5, "pas1", 0.6, true, EV.chute - EV.accoste],        // course dans la ruelle
];
const FORTS = ["explosion", "debris"];
const MANCHE: [string, string, string] = ["#d8cfb8", "#e8e0cc", "#b8ad94"]; // manches de tunique claire d'Ali

export const Video: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const cv = useRef<HTMLCanvasElement>(null), out = useRef<HTMLCanvasElement>(null), eng = useRef<ReturnType<typeof creerMoteur> | null>(null);
  const handle = useMemo(() => delayRender("image 3D"), [frame]);
  useLayoutEffect(() => {
    let vivant = true;
    chargerAssets(FICHIERS).then(() => {
      if (!vivant) { continueRender(handle); return; }
      if (!eng.current) eng.current = creerMoteur(cv.current!, out.current!, { monde: creerMonde, camera, effets });
      eng.current.render(t); continueRender(handle);
    }, (e) => { console.error("assets", e); continueRender(handle); });
    return () => { vivant = false; };
  }, [frame]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <canvas ref={cv} width={1080} height={1920} style={{ position: "absolute", inset: 0, visibility: "hidden" }} />
      <canvas ref={out} width={1080} height={1920} style={{ position: "absolute", inset: 0 }} />
      <Mains t={t} mains={mains} manche={MANCHE} />
      <Hud t={t} texte={HUD(t)} />
      <Saison t={t} texte={SAISON} />
      <Accroche t={t} texte={TITRE} />
      <Compteur t={t} debut={COMPTEUR.debut} fin={COMPTEUR.fin} distance={distanceFlotte(t)} texte={(d) => `FLOTTE À ${d} M`} />
      <Fin t={t} o={FIN} />
      {t < FIN.debut + 0.2 && <SousTitres t={t} lignes={LIGNES} />}
      <Voix voix={VOIX} />
      <Bruitages bruits={BRUITS} lignes={LIGNES} forts={FORTS} />
    </AbsoluteFill>
  );
};
