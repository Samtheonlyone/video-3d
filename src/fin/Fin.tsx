// « Et si la fin du monde arrivait comme dans le Coran ? » : 3D en plan fixe (plage) + habillage sobre façon « neal.fun » + voix off + bruitages.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { creerMoteur } from "../kit/moteur";
import { Voix, Bruitages, type Bruit } from "../kit/son";
import { smooth } from "../kit/outils";
import { creerMonde, camera, effets, FICHIERS, T } from "./decor";
import { chargerAssets } from "../kit/assets";
import { LIGNES, VOIX } from "./lignes";
import { loadFont as chargerArabe } from "@remotion/google-fonts/AmiriQuran";
const { fontFamily: ARABE } = chargerArabe("normal", { weights: ["400"], subsets: ["arabic"] });

const SERIF = "Georgia, 'Times New Roman', serif";
const BRUITS: Bruit[] = [
  [0, "ville", (t) => 0.5 * (1 - smooth(25, 27, t)) + 0.2 * smooth(25, 27, t) * (1 - smooth(56, 57, t)), true, 57.5],
  [0, "mer", (t) => 0.3 + 0.5 * smooth(50, 55, t) * (1 - smooth(57, 58, t)), true, 58],
  [58.5, "mer", 0.12, true, 26],
  [25.5, "explosion", 0.55], [26.5, "debris", 0.8], [29.5, "debris", 0.9], [33, "debris", 0.6], [36, "debris", 0.7], [38.5, "debris", 0.5],
  [19.7, "debris", 0.5], [21.5, "debris", 0.45], [43, "explosion", 0.4], [46, "debris", 0.5],
  [T.trompette - 0.1, "explosion", 1], [T.trompette + 0.1, "explosion", 1],
];
// HUD : [début, fin, étiquette, valeur, texte arabe (versets d'Uthmani, tanzil/alquran.cloud ; hadiths : sunnah.com)]
const BK = "HADITH · SAHIH AL-BUKHARI";
const HUD: [number, number, string, string, string][] = [
  [10.3, 19, "SOURATE 81 · AT-TAKWIR", "81 : 1-2", "إِذَا الشَّمْسُ كُوِّرَتْ\nوَإِذَا النُّجُومُ انْكَدَرَتْ"],
  [19.2, 25, "SOURATE 101 · AL-QARI'A", "101 : 5", "وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنْفُوشِ"],
  [25.5, 34.7, BK, "n° 1036", "… وَتَكْثُرَ الزَّلَازِلُ …"],
  [35.3, 41, "SOURATE 99 · AZ-ZALZALA", "99 : 1", "إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا"],
  [41.6, 49.1, BK, "n° 7118", "… تَخْرُجَ نَارٌ مِنْ أَرْضِ الْحِجَازِ …"],
  [50.2, 55.2, "SOURATE 81 · AT-TAKWIR", "81 : 6", "وَإِذَا الْبِحَارُ سُجِّرَتْ"],
  [56.5, 64.2, "SOURATE 39 · AZ-ZUMAR", "39 : 68", "وَنُفِخَ فِي الصُّورِ فَصَعِقَ مَنْ فِي السَّمَاوَاتِ وَمَنْ فِي الْأَرْضِ إِلَّا مَنْ شَاءَ اللَّهُ"],
  [66, 75.8, BK, "n° 4814", "… بَيْنَ النَّفْخَتَيْنِ أَرْبَعُونَ …"],
];
const capitale = (s: string) => { const m = s.toLowerCase(); return m.charAt(0).toUpperCase() + m.slice(1).replace(/\bsourate\b/g, "Sourate"); };

export const Fin: React.FC = () => {
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
  const ligne = LIGNES.find((l) => t >= l.t0 - 0.1 && t < l.t1 + 0.4);
  const op = (a: number, b: number) => Math.min(smooth(a, a + 0.5, t), 1 - smooth(b - 0.5, b, t));
  const hud = HUD.find(([a, b]) => t >= a && t < b);
  const titre = 1 - smooth(5.2, 6.2, t), noir = smooth(T.noir[0], T.noir[1], t);
  const ombre = "0 2px 14px rgba(0,0,0,.65)";
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: SERIF, color: "#fbf5e6" }}>
      <canvas ref={cv} width={1080} height={1920} style={{ position: "absolute", inset: 0, visibility: "hidden" }} />
      <canvas ref={out} width={1080} height={1920} style={{ position: "absolute", inset: 0 }} />
      {titre > 0.01 && <div style={{ position: "absolute", top: 230, left: 80, right: 80, textAlign: "center", fontSize: 76, lineHeight: 1.15, opacity: titre, textShadow: ombre }}>
        <span style={{ background: "radial-gradient(closest-side, rgba(20,14,10,.55), rgba(20,14,10,0))", padding: "40px 60px", display: "inline-block" }}>Et si la fin du monde arrivait comme dans le Coran ?</span></div>}
      {hud && <div style={{ position: "absolute", left: 60, top: 540, opacity: op(hud[0], hud[1]), textShadow: ombre }}>
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 24, letterSpacing: "0.22em", opacity: 0.85 }}>{hud[2]}</div>
        <div style={{ fontSize: 78, lineHeight: 1.1 }}>{hud[3]}</div></div>}
      {hud && <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 760, textAlign: "center", fontFamily: ARABE, fontSize: hud[4].length > 60 ? 62 : 84, lineHeight: 1.7, color: "#f5d28a", opacity: op(hud[0], hud[1]), whiteSpace: "pre-line", textShadow: ombre }}>{hud[4]}</div>}
      {ligne && t < T.noir[0] && <div style={{ position: "absolute", left: 70, right: 70, top: 1430, textAlign: "center", fontStyle: "italic", fontSize: 54, lineHeight: 1.25, opacity: Math.min(smooth(ligne.t0 - 0.1, ligne.t0 + 0.3, t), 1 - smooth(ligne.t1, ligne.t1 + 0.4, t)), textShadow: ombre }}>{capitale(ligne.texte)}</div>}
      <div style={{ position: "absolute", inset: 0, background: "#0d0d12", opacity: noir, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 90, textAlign: "center" }}>
        <div style={{ fontSize: 66, lineHeight: 1.2, opacity: smooth(86, 87, t) }}>Et si la fin du monde arrivait comme dans le Coran ?</div>
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 28, letterSpacing: "0.14em", opacity: 0.65 * smooth(87, 88, t), marginTop: 50, lineHeight: 1.5, textTransform: "uppercase" }}>Récit de croyance musulmane, présenté avec respect.<br />Sourates 81, 101, 99, 39 · Sahih al-Bukhari 1036, 7118, 4814 · traductions approximatives</div>
      </div>
      <Voix voix={VOIX} />
      <Bruitages bruits={BRUITS} lignes={LIGNES} forts={["explosion", "debris"]} />
    </AbsoluteFill>
  );
};
