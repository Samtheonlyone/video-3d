import React from "react";
import { Composition } from "remotion";
import { FPS } from "./kit/outils";
import { Exemple } from "./exemple/Exemple";
import { DUR as DUR_EXEMPLE } from "./exemple/chrono";
import { MiniatureExemple } from "./exemple/Miniature";
import { Video } from "./video/Video";
import { DUR as DUR_VIDEO } from "./video/chrono";
import { Guerres } from "./guerres/Guerres";
import { Film } from "./film/Film";
import { Fin } from "./fin/Fin";

// Une composition par vidéo. Format TikTok : 1080 × 1920, 30 images/s.
// « Exemple » sert à tester l'installation et à montrer comment on se sert du kit.
export const Root: React.FC = () => (
  <>
    <Composition id="Exemple" component={Exemple} durationInFrames={Math.round(DUR_EXEMPLE * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="MiniatureExemple" component={MiniatureExemple} durationInFrames={1} fps={FPS} width={1080} height={1440} />
    <Composition id="Film" component={Film} durationInFrames={66 * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="Fin" component={Fin} durationInFrames={88 * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="Guerres" component={Guerres} durationInFrames={75 * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="Video" component={Video} durationInFrames={Math.round(DUR_VIDEO * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
