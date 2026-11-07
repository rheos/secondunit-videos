// The floor grid, painted by a fragment shader on one plane instead of GL lines.
//
// Why not GridHelper: the cloud render draws WebGL through SwiftShader (no GPU on the runner), and SwiftShader drops
// the long lines that run in depth toward the vanishing point while keeping the cross lines, so draft d2 came back
// with parallel stripes where the page on a Mac shows a grid (checked 2026-11-06, design/grid-test.html under
// `chrome --headless --use-angle=swiftshader`). A shader grid is a textured plane: every rasterizer draws it the same.
//
// The lines are one pixel wide with fwidth anti-aliasing, so they thin out smoothly toward the horizon instead of
// aliasing, and the scene fog (three's own chunks) fades them to the background past its near distance.
import * as THREE from "three";

// pattern: "square" (cell = the side) or "hex" (cell = a hexagon's width flat to flat, pointy ends along z).
export function gridFloor({ size = 120, cell = 0.5, color = "#4a5c82", opacity = 0.88, y = 0, pattern = "square" } = {}) {
  const mat = new THREE.ShaderMaterial({
    defines: pattern === "hex" ? { HEX: 1 } : {},
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      color: { value: new THREE.Color(color) }, opacity: { value: opacity }, cell: { value: cell },
    }]),
    vertexShader: `
      #include <common>
      #include <fog_pars_vertex>
      varying vec2 vXZ;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vXZ = wp.xz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <fog_pars_fragment>
      uniform vec3 color; uniform float opacity; uniform float cell;
      varying vec2 vXZ;
      #ifdef HEX
      // hex tiling with width 1 flat to flat: distance from the nearest edge, 0 on an edge, 0.5 at a centre
      float hexEdge(vec2 p) {
        vec2 r = vec2(1.0, 1.7320508), h = r * 0.5;
        vec2 a = mod(p, r) - h, b = mod(p - h, r) - h;
        vec2 g = dot(a, a) < dot(b, b) ? a : b;
        g = abs(g);
        return 0.5 - max(dot(g, normalize(vec2(1.0, 1.7320508))), g.x);
      }
      #endif
      void main() {
        vec2 q = vXZ / cell;
        #ifdef HEX
        float px = max(fwidth(q.x), fwidth(q.y));       // one pixel in cell units, the longer axis
        float line = 1.0 - min(hexEdge(q) / px, 1.0);
        #else
        vec2 d = abs(fract(q - 0.5) - 0.5) / fwidth(q); // pixels to the nearest line on each axis
        float line = 1.0 - min(min(d.x, d.y), 1.0);
        #endif
        if (line <= 0.0) discard;
        gl_FragColor = vec4(color, opacity * line);
        #include <fog_fragment>
        #ifdef USE_FOG
        gl_FragColor.a *= 1.0 - fogFactor; // a fogged line fades out instead of painting the fog colour
        #endif
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.renderOrder = -10;
  return mesh;
}
