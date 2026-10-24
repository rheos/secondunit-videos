// The brief's two typefaces, loaded through @remotion/google-fonts so the render waits for them.
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const ARCHIVO = loadArchivo("normal", {
  weights: ["500", "600", "800"],
  subsets: ["latin"],
}).fontFamily;

export const MONO = loadMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;
