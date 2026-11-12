// Son : voix (une par réplique) et bruitages. Les voix passent devant tout :
// les bruitages baissent à 30 % pendant chaque réplique, sauf les gros impacts.
import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import type { Ligne } from "./habillage";

// Une voix = un fichier public/voix/<id>.wav. La liste VOIX est écrite par le script « caler » (scripts/caler.mjs).
export type Voix = { id: string; at: number; d: number; vol?: number };
export const Voix: React.FC<{ voix: Voix[] }> = ({ voix }) => {
  const { fps } = useVideoConfig();
  return (<>{voix.map((v) => (<Sequence key={v.id} from={Math.round(v.at * fps)} durationInFrames={Math.ceil((v.d + 0.3) * fps)}><Audio src={staticFile(`voix/${v.id}.wav`)} volume={v.vol ?? 1} /></Sequence>))}</>);
};

// Un bruitage = [instant (s), fichier dans public/sfx (sans .wav), volume (nombre ou fonction du temps), boucle ?, durée ?]
export type Bruit = [number, string, number | ((t: number) => number), boolean?, number?];
export const Bruitages: React.FC<{ bruits: Bruit[]; lignes: Ligne[]; gain?: number; forts?: string[] }> = ({ bruits, lignes, gain = 0.5, forts = [] }) => {
  const { fps } = useVideoConfig();
  const duck = (t: number) => (lignes.some((l) => t >= l.t0 - 0.15 && t < l.t1 + 0.1) ? 0.3 : 1);
  return (<>{bruits.map(([at, nom, vol, boucle, duree], i) => (
    <Sequence key={i} from={Math.max(0, Math.round(at * fps))} durationInFrames={duree ? Math.round(duree * fps) : undefined}>
      <Audio src={staticFile(`sfx/${nom}.wav`)} loop={!!boucle} volume={(f: number) => { const t = at + f / fps; return gain * (typeof vol === "number" ? vol : vol(t)) * (forts.includes(nom) ? 1 : duck(t)); }} />
    </Sequence>))}</>);
};
