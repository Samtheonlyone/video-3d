import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle"); // indispensable pour la 3D (WebGL) pendant le rendu
Config.setConcurrency(2);
