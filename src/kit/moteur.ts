// @ts-nocheck
// Moteur de rendu : three.js + effets (bloom léger, aberration chromatique aux chocs, étalonnage, vignette, grain, flash)
// + flou de mouvement (plusieurs sous-images par image quand la caméra bouge vite).
// La vidéo n'appelle que creerMoteur(...).render(t).
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { FPS } from "./outils";
import type { Cam } from "./camera";

const W = 1080, H = 1920;
const Fin = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uCA: { value: 0 }, uFlash: { value: 0 }, uVig: { value: 0.4 }, uChaud: { value: 0 }, uRouge: { value: 0 }, uPoussiere: { value: 0 }, uDesat: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime,uCA,uFlash,uVig,uChaud,uRouge,uPoussiere,uDesat; varying vec2 vUv;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    void main(){
      vec2 px = vec2(1.0/1080.0, 1.0/1920.0);
      vec2 c = vUv - 0.5; vec2 ca = c * uCA;
      vec3 col = vec3(texture2D(tDiffuse, vUv + ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - ca).b);
      // netteté (unsharp mask, 4 voisins) : fait ressortir les arêtes et la matière, perçu comme plus réel
      vec3 blur = (texture2D(tDiffuse, vUv + vec2(px.x,0.0)).rgb + texture2D(tDiffuse, vUv - vec2(px.x,0.0)).rgb + texture2D(tDiffuse, vUv + vec2(0.0,px.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0,px.y)).rgb) * 0.25;
      col += (col - blur) * 0.4;
      col = (col - 0.06) * 1.12 + 0.06;                                         // contraste filmique (pivot gris moyen)
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(lum), col, 1.14);                                          // saturation (look « jeu vidéo »)
      col += vec3(-0.016, 0.002, 0.024) * (1.0 - smoothstep(0.0, 0.5, lum)) + vec3(0.024, 0.009, -0.018) * smoothstep(0.5, 1.0, lum); // split-tone teal/orange : ombres froides, lumières chaudes
      col *= mix(vec3(1.0), vec3(1.07, 1.0, 0.9), uChaud);                      // lumière chaude (soleil, feu)
      float l = dot(col, vec3(0.3,0.59,0.11));
      col = mix(col, vec3(l*1.18, l*0.86, l*0.74), uRouge);                     // ambiance rouge sale (danger)
      col = mix(col, vec3(l), uDesat);                                          // couleurs qui s'éteignent
      col = mix(col, vec3(0.6,0.55,0.5), uPoussiere);                           // nuage de poussière
      float r = length(c * vec2(1.0, 0.78)); col *= mix(1.0 - uVig, 1.0, smoothstep(0.85, 0.2, r)); // vignette
      col += (h21(vUv * vec2(1080.0,1920.0) + fract(uTime) * 91.7) - 0.5) * 0.03; // grain
      col = mix(col, vec3(1.0, 0.96, 0.88), clamp(uFlash, 0.0, 1.0));           // flash
      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`,
};

// Réglages d'effets à l'instant t (tous facultatifs) : la vidéo les calcule dans sa fonction effets(t).
export type Effets = { flash?: number; ca?: number; vignette?: number; chaud?: number; rouge?: number; poussiere?: number; desat?: number; exposition?: number; bloom?: number };

export type Monde = { scene: any; update: (t: number, cam: any, c: Cam) => void };

export function creerMoteur(canvas: HTMLCanvasElement, out: HTMLCanvasElement, o: { monde: (renderer: any) => Monde; camera: (t: number) => Cam; effets?: (t: number) => Effets }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const world = o.monde(renderer);
  const cam = new THREE.PerspectiveCamera(70, W / H, 0.06, 5000); cam.rotation.order = "YXZ";
  const composer = new EffectComposer(renderer); composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(world.scene, cam));
  // passe anti-NaN : un seul pixel invalide ferait de grands rectangles noirs dans le bloom
  composer.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: Fin.vertexShader,
    fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); if (isnan(c.r) || isnan(c.g) || isnan(c.b) || isinf(c.r) || isinf(c.g) || isinf(c.b)) c = vec4(0.0); gl_FragColor = vec4(max(c.rgb, 0.0), 1.0); }` }));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.35, 0.5, 0.88); composer.addPass(bloom);
  const fin = new ShaderPass(Fin); composer.addPass(fin); composer.addPass(new OutputPass());
  const octx = out.getContext("2d")!;

  const renderOne = (t: number) => {
    const c = o.camera(t);
    // caméra tenue à la main : micro-tremblement organique (respiration + pas), amplitude faible, pour casser le rail trop lisse
    const sh = (c as any).hand ?? 1, b = t * 1.9, p = t * 3.7;
    const shX = (Math.sin(b) + 0.5 * Math.sin(b * 2.3 + 1)) * 0.003 * sh + Math.sin(p) * 0.0018 * sh;
    const shY = (Math.cos(b * 0.8 + 2) + 0.5 * Math.sin(b * 1.7)) * 0.0028 * sh + Math.cos(p * 1.1) * 0.0016 * sh;
    cam.position.set(c.px + Math.sin(b * 0.9) * 0.02 * sh, c.py + Math.sin(b * 1.3 + 1) * 0.02 * sh, c.pz); cam.rotation.set(c.pitch + shY, c.yaw + shX, c.roll + Math.sin(b * 0.7) * 0.0025 * sh); cam.fov = c.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    world.update(t, cam, c);
    const e = o.effets ? o.effets(t) : {}, u = fin.uniforms;
    u.uTime.value = t * 1.7; u.uCA.value = 0.0012 + (e.ca ?? 0); u.uFlash.value = e.flash ?? 0; u.uVig.value = e.vignette ?? 0.36;
    u.uChaud.value = e.chaud ?? 0.3; u.uRouge.value = e.rouge ?? 0; u.uPoussiere.value = e.poussiere ?? 0; u.uDesat.value = e.desat ?? 0;
    renderer.toneMappingExposure = (e.exposition ?? 1.0) * 0.8; // ciel HDRI + soleil : on baisse un peu pour ne pas brûler les murs blancs
    bloom.strength = e.bloom ?? 0.34;
    composer.render();
  };
  return {
    render(t: number) {
      // flou de mouvement : 3, 5 ou 7 sous-images selon la vitesse de la caméra
      const c0 = o.camera(t), c1 = o.camera(Math.max(0, t - 1 / FPS));
      const speed = (Math.abs(c0.yaw - c1.yaw) + Math.abs(c0.pitch - c1.pitch)) * (70 / c0.fov) + Math.hypot(c0.px - c1.px, c0.pz - c1.pz) * 0.02;
      const N = speed > 0.12 ? 7 : speed > 0.05 ? 5 : 3, shutter = 0.3 / FPS;
      for (let k = 0; k < N; k++) { const tk = Math.max(0, t + (k / (N - 1) - 0.5) * shutter); renderOne(tk); octx.globalAlpha = 1 / (k + 1); octx.drawImage(canvas, 0, 0); }
      octx.globalAlpha = 1;
    },
  };
}
