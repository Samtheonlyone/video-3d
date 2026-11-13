// Vidéo « ET SI IL N'Y AVAIT PAS EU DE GUERRES MONDIALES ? » — version Remotion (texte + fondu, sans 3D).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const INK = "#f2ead8", ACCENT = "#c9452f", DIM = "#8a7f6c";
const SERIF = "Georgia, 'Times New Roman', serif", SANS = "Arial, sans-serif";

type Scene = { start: number; dur: number; render: () => React.ReactNode };

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: SANS, fontSize: 34, letterSpacing: "0.25em", color: ACCENT, textTransform: "uppercase", marginBottom: 40 }}>{children}</div>
);

const SCENES: Scene[] = [
  { start: 0, dur: 6, render: () => (<><Tag>Histoire alternative</Tag><div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.08 }}>ET SI IL N'Y AVAIT<br />PAS EU DE GUERRES<br />MONDIALES ?</div></>) },
  { start: 6, dur: 8, render: () => (<><Tag>28 juin 1914</Tag><div style={{ fontSize: 92, fontWeight: 700 }}>Sarajevo.</div><div style={{ fontSize: 54, lineHeight: 1.35, marginTop: 44 }}>L'archiduc François-Ferdinand est assassiné. En quelques semaines, les alliances entraînent l'Europe dans la guerre.</div></>) },
  { start: 14, dur: 8, render: () => (<><Tag>1914 – 1918</Tag><div style={{ fontSize: 210, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>≈ 17 M</div><div style={{ fontSize: 54, marginTop: 44 }}>morts pendant la Première Guerre mondiale</div><div style={{ fontSize: 40, color: DIM, marginTop: 36, fontFamily: SANS }}>Versailles (1919) humilie l'Allemagne : le terreau de la suite.</div></>) },
  { start: 22, dur: 8, render: () => (<><Tag>1929 – 1939</Tag><div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.08 }}>Crise économique,<br />fascismes, réarmement.</div><div style={{ fontSize: 54, lineHeight: 1.35, marginTop: 44 }}>En Allemagne, en Italie, au Japon : des régimes militaires et nationalistes prennent le pouvoir.</div></>) },
  { start: 30, dur: 10, render: () => (<><Tag>1939 – 1945</Tag><div style={{ fontSize: 210, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>70 à 85 M</div><div style={{ fontSize: 54, marginTop: 44 }}>morts pendant la Seconde Guerre mondiale</div><div style={{ fontSize: 40, color: DIM, marginTop: 36, fontFamily: SANS }}>Shoah : environ six millions de Juifs assassinés.</div></>) },
  { start: 40, dur: 12, render: () => (<><Tag>Hypothèse · fiction spéculative</Tag><div style={{ border: `3px solid ${ACCENT}`, padding: "36px 40px", fontSize: 50, lineHeight: 1.35 }}>Sans ces deux guerres : pas de Shoah de masse, pas de fascisme militaire conquérant, pas de bombardement atomique sur le Japon.<br /><br />Ce que l'histoire aurait pris d'autres chemins n'est pas connu.</div></>) },
  { start: 52, dur: 10, render: () => (<><Tag>6 août 1945 · 8 h 15 · Hiroshima</Tag><div style={{ fontSize: 92, fontWeight: 700 }}>« Little Boy »</div><div style={{ fontSize: 54, lineHeight: 1.35, marginTop: 44 }}>Bombe à l'uranium larguée par le B-29 Enola Gay. Environ 100 000 à 150 000 morts à la fin de 1945, selon les estimations.</div></>) },
  { start: 62, dur: 6, render: () => (<><Tag>9 août 1945 · Nagasaki</Tag><div style={{ fontSize: 92, fontWeight: 700 }}>« Fat Man »</div><div style={{ fontSize: 54, lineHeight: 1.35, marginTop: 44 }}>Bombe au plutonium. Environ 70 000 morts selon les estimations de fin 1945.</div><div style={{ fontSize: 40, color: DIM, marginTop: 36, fontFamily: SANS }}>Capitulation du Japon : 15 août 1945.</div></>) },
  { start: 68, dur: 6, render: () => (<><Tag>Sans ces guerres</Tag><div style={{ fontSize: 54, lineHeight: 1.35 }}>Pas d'ONU née en 1945, pas de guerre froide sous cette forme, pas de course aux armements nucléaires telle qu'elle a eu lieu.</div></>) },
  { start: 74, dur: 1, render: () => (<div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.08 }}>Le XXe siècle<br />a payé le prix.</div>) },
];

const SceneView: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps - s.start;
  const op = interpolate(t, [0, 0.5, s.dur - 0.4, s.dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(t, [0, 0.5], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: op, transform: `translateY(${y}px)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 90px", textAlign: "center", color: INK, fontFamily: SERIF }}>{s.render()}</AbsoluteFill>;
};

export const Guerres: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0b09" }}>
    {SCENES.map((s, i) => <SceneView key={i} s={s} />)}
    <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, fontFamily: SANS, fontSize: 28, color: DIM, textAlign: "center" }}>Chiffres : estimations historiques · Scénario alternatif = hypothèse</div>
  </AbsoluteFill>
);
