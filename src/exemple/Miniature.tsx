// Miniature de l'exemple : Zoé qui court vers nous, le feu et la fumée de la météorite derrière elle.
import React from "react";
import { Miniature } from "../kit/miniature";
import { creerMonde } from "./decor";
import { camera, effets } from "./chrono";

export const MiniatureExemple: React.FC = () => (
  <Miniature o={{ monde: creerMonde, camera, effets, t: 11.6,
    cam: [2.6, 1.15, 38.5, 0.12, 0.1, 50], // caméra basse devant Zoé, qui regarde vers la fumée (vers -Z)
    petit: "LA", titre: "MÉTÉORITE", accroche: "TA Y|PETITE SŒUR…\nOU R|MAMAN ?", saison: "SAISON 1 • ÉPISODE 1", halo: "#ff7a2a" }} />
);
