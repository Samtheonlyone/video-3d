// Court-métrage « ET SI LE SIÈCLE NE S'ÉTAIT PAS EFFONDRÉ ? » — personnages cartoon avec émotions, voix ElevenLabs, décors.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import SCRIPT from "./script.json";

const DUR = 66; // secondes
type Emo = "calme" | "triste" | "grave" | "curieuse" | "inquiete" | "sourit";
const EMO: Record<string, Emo> = { z1: "curieuse", h1: "calme", z2: "calme", h2: "grave", z3: "inquiete", h3: "triste", z4: "calme", h4: "sourit" };
const PERSO: Record<string, "zoe" | "papi"> = { z1: "zoe", z2: "zoe", z3: "zoe", z4: "zoe", h1: "papi", h2: "papi", h3: "papi", h4: "papi" };

// Visage cartoon : grands yeux, sourcils et bouche qui réagissent à l'émotion et à la voix.
const Visage: React.FC<{ emo: Emo; parle: boolean; t: number; couleur: string; cheveux: string; lunettes?: boolean }> = ({ emo, parle, t, couleur, cheveux, lunettes }) => {
  const clign = (t % 3.2) > 3.05 ? 0.1 : 1; // clignement toutes les ~3 s
  const sourcilY = emo === "curieuse" ? -6 : emo === "grave" || emo === "triste" ? 2 : emo === "inquiete" ? -4 : 0;
  const sourcilRot = emo === "grave" ? 14 : emo === "inquiete" ? -10 : emo === "triste" ? -8 : 0;
  const ouv = parle ? 6 + 10 * Math.abs(Math.sin(t * 17)) : 0;
  const bouche = emo === "sourit" ? `M 38 56 Q 50 ${66 + ouv} 62 56` : emo === "triste" || emo === "grave" ? `M 38 64 Q 50 ${56 - ouv / 2} 62 64` : `M 40 60 Q 50 ${60 + ouv} 60 60`;
  return (
    <svg viewBox="0 0 100 100" width={300} height={300}>
      <ellipse cx="50" cy="50" rx="36" ry="38" fill={couleur} />
      <path d={`M 14 44 Q 16 10 50 10 Q 84 10 86 44 Q 78 26 50 24 Q 22 26 14 44`} fill={cheveux} />
      <g transform={`translate(0 ${sourcilY})`}>
        <path d={`M 26 36 L 42 ${36 + sourcilRot / 5}`} stroke="#2a1b10" strokeWidth="3" strokeLinecap="round" transform={`rotate(${-sourcilRot} 34 36)`} />
        <path d="M 58 36 L 74 36" stroke="#2a1b10" strokeWidth="3" strokeLinecap="round" transform={`rotate(${sourcilRot} 66 36)`} />
      </g>
      <ellipse cx="36" cy="48" rx="6" ry={6 * clign} fill="#fff" />
      <ellipse cx="64" cy="48" rx="6" ry={6 * clign} fill="#fff" />
      <circle cx="37" cy="49" r="3.4" fill="#2a1b10" />
      <circle cx="65" cy="49" r="3.4" fill="#2a1b10" />
      {lunettes && (<g fill="none" stroke="#333" strokeWidth="1.8"><circle cx="36" cy="48" r="8" /><circle cx="64" cy="48" r="8" /><path d="M 44 48 L 56 48" /></g>)}
      <path d={bouche} fill={parle || emo === "sourit" ? "#7a2a22" : "none"} stroke="#7a2a22" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

// Personnage complet : grosse tête (style Roblox) + corps simple, qui bouge un peu quand il parle.
const Personnage: React.FC<{ nom: "zoe" | "papi"; emo: Emo; parle: boolean; t: number; x: number }> = ({ nom, emo, parle, t, x }) => {
  const bob = parle ? Math.sin(t * 9) * 4 : Math.sin(t * 2) * 1.5;
  const zoe = nom === "zoe";
  return (
    <div style={{ position: "absolute", bottom: 360, left: x, transform: `translateY(${bob}px)`, width: 320, textAlign: "center" }}>
      <Visage emo={emo} parle={parle} t={t} couleur={zoe ? "#f1c49a" : "#d9a57a"} cheveux={zoe ? "#2b1a10" : "#b8b0a8"} lunettes={!zoe} />
      <div style={{ width: 170, height: 230, margin: "-18px auto 0", borderRadius: 60, background: zoe ? "#e6503a" : "#4a6b58" }} />
      <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 6 }}>
        <div style={{ width: 52, height: 170, borderRadius: 26, background: zoe ? "#2c3e7a" : "#2d3a30" }} />
        <div style={{ width: 52, height: 170, borderRadius: 26, background: zoe ? "#2c3e7a" : "#2d3a30" }} />
      </div>
    </div>
  );
};

// Décors dessinés (dégradés + formes) : salon de 2045, ciel de 1945.
const Decor: React.FC<{ t: number }> = ({ t }) => {
  const flash = interpolate(t, [23, 23.5, 25, 27], [0, 1, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inSalon = t < 23 || t > 33;
  return (
    <AbsoluteFill>
      {inSalon ? (
        <AbsoluteFill style={{ background: "linear-gradient(180deg,#2a1d16 0%,#7a4a2e 60%,#c58b56 100%)" }}>
          <div style={{ position: "absolute", top: 180, left: 140, width: 800, height: 520, borderRadius: 12, background: "linear-gradient(180deg,#9fd3ee,#f6d8a4)", boxShadow: "inset 0 0 60px #0006" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 150, background: "linear-gradient(#5b4a3a,#3a2e24)" }} />
          </div>
          <div style={{ position: "absolute", top: 760, left: 0, right: 0, height: 900, background: "#5a3b26" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: "#0b0a10" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 60%, rgba(255,240,200,${flash}) 0%, rgba(255,140,60,${flash * 0.6}) 30%, #0b0a10 70%)` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 420, background: "linear-gradient(transparent,#1a1410)" }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const lignes = SCRIPT.lignes as { id: string; voix: string; debut: number; texte: string; dit: string; }[];
  const fin = interpolate(t, [60, 62, 64, 66], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // personnage qui parle à cet instant
  const actif = lignes.find((l) => t >= l.debut && t < l.debut + 6);
  const parle = (nom: "zoe" | "papi") => !!actif && PERSO[actif.id] === nom && t >= actif.debut && t <= actif.debut + 3.5;
  const emo = (nom: "zoe" | "papi"): Emo => (actif && PERSO[actif.id] === nom ? EMO[actif.id] : "calme");
  const sous = actif && actif.voix !== "narrateur" ? actif : null;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: "Arial, sans-serif", color: "#fff" }}>
      <Decor t={t} />
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontSize: 34, letterSpacing: "0.2em", color: "#e0a060" }}>{SCRIPT.saison}</div>
      <Personnage nom="zoe" emo={emo("zoe")} parle={parle("zoe")} t={t} x={120} />
      <Personnage nom="papi" emo={emo("papi")} parle={parle("papi")} t={t} x={640} />
      {/* sous-titre du narrateur : texte de la ligne en cours */}
      {actif && (
        <div style={{ position: "absolute", bottom: 1260, left: 60, right: 60, textAlign: "center", fontSize: 58, fontWeight: 700, lineHeight: 1.2, textShadow: "0 4px 18px #000" }}>
          {actif.texte}
        </div>
      )}
      {sous && (
        <div style={{ position: "absolute", top: 120, left: 60, right: 60, textAlign: "center", fontSize: 30, color: "#e0a060", letterSpacing: "0.1em", fontWeight: 700 }}>
          {sous.voix === "zoe" ? "LINA" : "GRAND-PÈRE"}
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: fin }} />
      {lignes.map((l) => (
        <Sequence key={l.id} from={Math.round(l.debut * fps)} durationInFrames={Math.round(6 * fps)}>
          <Audio src={staticFile(`voix/${l.id}.wav`)} />
        </Sequence>
      ))}
      {t > 62 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fin }}>
          <div style={{ fontSize: 70, fontWeight: 700, textAlign: "center", lineHeight: 1.1 }}>Fiction.<br />Le passé a coûté très cher.</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const DUREE_FILM = DUR;
