"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import GEO from "@/public/can/real/lata.json";

/* La lata de la foto oficial, girando (WebGL2, sin three.js).
   La foto se separó en capas (marketing/salida/lata-real): la lata sin anilla, la luz del estudio por
   columna, la etiqueta envolvente de 360° y la anilla en 3D por ángulo. El shader vuelve a envolver la
   etiqueta en el cilindro con la luz de la foto, así que en cualquier ángulo se ve como la foto.
   - `spin`: MotionValue opcional en radianes (por ejemplo, ligado al scroll).
   - Se gira arrastrando, con inercia; `settle` la devuelve al frente. Fuera de pantalla no dibuja.
   - Sin WebGL2 (o mientras carga) queda el póster: la misma lata de frente. */

const DIR = "/can/real/";
const [CX0, CY0, CX1, CY1] = GEO.caja;
const ANCHO = CX1 - CX0;
const ALTO = CY1 - CY0;
const TAU = Math.PI * 2;

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uFoto, uEtiq, uLuz, uAnilla;
uniform vec2 uLienzo;
uniform float uGiro;
uniform vec4 uCaja;   // x0, y0, ancho, alto de la lata en la foto
uniform vec4 uCil;    // cx, r, t0, bt
uniform vec4 uCil2;   // b0, bb, vt, vb
uniform vec2 uLuzG;   // primera columna, cantidad de columnas
uniform vec4 uTapa;   // cx, cy, arista0, arista1
uniform vec4 uAn;     // cuadros, columnas, ancho, alto
uniform vec2 uAtlas;
out vec4 color;
const float TAU = 6.28318530718;

void main() {
  vec2 q = vec2(gl_FragCoord.x, uLienzo.y - gl_FragCoord.y) / uLienzo;
  vec4 base = texture(uFoto, q);              // premultiplicada
  vec2 p = uCaja.xy + q * uCaja.zw - 0.5;     // píxel de la foto
  vec3 rgb = base.rgb;

  // cuerpo: etiqueta envuelta en el cilindro con la luz de la foto (foto = etiqueta * D + Sp)
  float u = (p.x - uCil.x) / uCil.y;
  float uc = clamp(u, -0.999999, 0.999999);
  float c = sqrt(1.0 - uc * uc);
  float top = uCil.z - uCil.w * (1.0 - c);
  float bot = uCil2.x - uCil2.y * (1.0 - c);
  float v = (p.y - top) / (bot - top);
  float s = asin(uc) / TAU + 0.5 + uGiro / TAU;
  vec3 A = texture(uEtiq, vec2(s, v)).rgb;
  float lx = (p.x - uLuzG.x + 0.5) / uLuzG.y;
  float t = (v - uCil2.z) / (uCil2.w - uCil2.z);
  vec3 D = mix(texture(uLuz, vec2(lx, 0.125)).rgb, texture(uLuz, vec2(lx, 0.375)).rgb, t) * 2.0;
  vec3 Sp = mix(texture(uLuz, vec2(lx, 0.625)).rgb, texture(uLuz, vec2(lx, 0.875)).rgb, t) - 0.5;
  vec3 col = clamp(A * D + Sp, 0.0, 1.0);
  float w = max(fwidth(p.y), 1.0);
  float m = clamp((p.y - top) / w + 0.5, 0.0, 1.0) * clamp((bot - p.y) / w + 0.5, 0.0, 1.0)
          * clamp((0.992 - abs(u)) / 0.012, 0.0, 1.0);
  rgb = mix(rgb, col * base.a, m);

  // anilla: dos cuadros vecinos del atlas 3D, tapada por el borde delantero de la tapa
  float f = mod(uGiro / TAU * uAn.x, uAn.x);
  float k0 = floor(f);
  float k1 = mod(k0 + 1.0, uAn.x);
  float tt = f - k0;
  vec2 ij = vec2(p.x - uTapa.x, p.y - uTapa.y) + uAn.zw * 0.5 + 0.5;
  if (ij.x > 0.5 && ij.y > 0.5 && ij.x < uAn.z - 0.5 && ij.y < uAn.w - 0.5) {
    vec2 c0 = vec2(mod(k0, uAn.y), floor(k0 / uAn.y)) * uAn.zw;
    vec2 c1 = vec2(mod(k1, uAn.y), floor(k1 / uAn.y)) * uAn.zw;
    vec4 a = mix(texture(uAnilla, (c0 + ij) / uAtlas), texture(uAnilla, (c1 + ij) / uAtlas), tt);
    float arista = uTapa.z - uTapa.w * (p.x - uCil.x) * (p.x - uCil.x);
    float visible = 1.0 - clamp(p.y - arista + 0.5, 0.0, 1.0);
    rgb = rgb * (1.0 - a.a * visible) + a.rgb * visible;
  }
  color = vec4(rgb, base.a);
}`;

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function textura(gl, img, { repetir = false, mip = true, premult = false, aniso } = {}) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premult);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repetir ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  if (mip) gl.generateMipmap(gl.TEXTURE_2D);
  if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  return tex;
}

function compilar(gl) {
  const sh = (tipo, src) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  return prog;
}

export default function LataReal({
  spin,
  interactive = true,
  float = true,
  sway = 0, // balanceo suave alrededor del frente (radianes)
  settle = false, // al soltarla después de arrastrar, vuelve sola al frente
  initialAngle = 0,
  priority = false,
  sizes = "(min-width: 1024px) 24vw, 40vw",
  className = "",
  ariaLabel = "Lata de LIV Raspberry, 355 mL",
}) {
  const wrapRef = useRef(null);
  const lataRef = useRef(null);
  const lienzoRef = useRef(null);
  const spinRef = useRef(spin);
  spinRef.current = spin;
  const [lista, setLista] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const lata = lataRef.current;
    const canvas = lienzoRef.current;
    if (!wrap || !lata || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return; // queda el póster

    let vivo = true;
    let raf = 0;
    let corriendo = false;
    let dibujar = () => {};
    const limpieza = [];

    (async () => {
      let imgs;
      try {
        imgs = await Promise.all(["lata-foto.webp", "lata-etiqueta.webp", "lata-luz.png", "lata-anilla.webp"].map((f) => cargarImagen(DIR + f)));
      } catch {
        return;
      }
      if (!vivo) return;
      let prog;
      try {
        prog = compilar(gl);
      } catch (e) {
        console.error(e);
        return;
      }
      gl.useProgram(prog);
      const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
      const [foto, etiq, luz, anilla] = imgs;
      const texs = [
        textura(gl, foto, { premult: true }),
        textura(gl, etiq, { repetir: true, aniso }),
        textura(gl, luz, { mip: false }),
        textura(gl, anilla, { premult: true }),
      ];
      ["uFoto", "uEtiq", "uLuz", "uAnilla"].forEach((n, i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texs[i]);
        gl.uniform1i(gl.getUniformLocation(prog, n), i);
      });
      const U = (n) => gl.getUniformLocation(prog, n);
      const g = GEO;
      gl.uniform4f(U("uCaja"), CX0, CY0, ANCHO, ALTO);
      gl.uniform4f(U("uCil"), g.cx, g.r, g.t0, g.bt);
      gl.uniform4f(U("uCil2"), g.b0, g.bb, g.vt, g.vb);
      gl.uniform2f(U("uLuzG"), g.x0luz, g.nluz);
      gl.uniform4f(U("uTapa"), g.tapa.cx, g.tapa.cy, g.tapa.arista[0], g.tapa.arista[1]);
      gl.uniform4f(U("uAn"), g.anilla.n, g.anilla.cols, g.anilla.w, g.anilla.h);
      gl.uniform2f(U("uAtlas"), anilla.naturalWidth, anilla.naturalHeight);
      const uLienzo = U("uLienzo");
      const uGiro = U("uGiro");

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      let ultimo = null;
      dibujar = (giro, forzar = false) => {
        if (!forzar && ultimo !== null && Math.abs(giro - ultimo) < 1e-5) return;
        ultimo = giro;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uLienzo, canvas.width, canvas.height);
        gl.uniform1f(uGiro, giro);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const medir = () => {
        const r = lata.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.round(r.width * dpr));
        const h = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          dibujar(ultimo ?? initialAngle, true);
        }
      };
      medir();
      const ro = new ResizeObserver(medir);
      ro.observe(lata);
      limpieza.push(() => ro.disconnect());

      /* Interacción: mismo comportamiento que tenía la lata 3D */
      let angulo = 0;
      let vel = 0;
      let arrastrando = false;
      let lastX = 0;
      let lastT = 0;
      const incl = { x: 0, y: 0, tx: 0, ty: 0 };
      const onDown = (e) => {
        arrastrando = true;
        lastX = e.clientX;
        lastT = performance.now();
        vel = 0;
        wrap.setPointerCapture?.(e.pointerId);
        wrap.style.cursor = "grabbing";
      };
      const onMove = (e) => {
        if (!arrastrando) return;
        const now = performance.now();
        const dt = Math.max((now - lastT) / 1000, 0.001);
        const d = (e.clientX - lastX) * 0.012;
        angulo -= d; // arrastrar a la derecha trae a la vista el costado izquierdo
        vel = -d / dt;
        lastX = e.clientX;
        lastT = now;
      };
      const onUp = (e) => {
        arrastrando = false;
        wrap.releasePointerCapture?.(e.pointerId);
        wrap.style.cursor = "grab";
      };
      const onHover = (e) => {
        const r = wrap.getBoundingClientRect();
        incl.tx = ((e.clientY - r.top) / r.height - 0.5) * 2;
        incl.ty = ((e.clientX - r.left) / r.width - 0.5) * 2;
      };
      if (interactive) {
        wrap.addEventListener("pointerdown", onDown);
        wrap.addEventListener("pointermove", onMove);
        wrap.addEventListener("pointerup", onUp);
        wrap.addEventListener("pointercancel", onUp);
        limpieza.push(() => {
          wrap.removeEventListener("pointerdown", onDown);
          wrap.removeEventListener("pointermove", onMove);
          wrap.removeEventListener("pointerup", onUp);
          wrap.removeEventListener("pointercancel", onUp);
        });
      }
      if (!reduce) {
        window.addEventListener("pointermove", onHover, { passive: true });
        limpieza.push(() => window.removeEventListener("pointermove", onHover));
      }

      let last = performance.now();
      let t = 0;
      const cuadro = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        t += dt;
        if (!arrastrando) {
          angulo += vel * dt;
          vel *= Math.pow(0.04, dt);
          if (settle && Math.abs(vel) < 0.8) {
            const objetivo = Math.round(angulo / TAU) * TAU; // siempre termina de frente
            angulo += (objetivo - angulo) * Math.min(1, dt * 2.2);
          }
        }
        const vaiven = sway && !reduce ? Math.sin(t * 0.7) * sway : 0;
        const ext = spinRef.current ? spinRef.current.get() : 0;
        dibujar(initialAngle + angulo + ext + vaiven);
        // flotación e inclinación leves (la foto es plana: se mueve el conjunto, no la cámara)
        incl.x += (incl.tx - incl.x) * Math.min(1, dt * 4);
        incl.y += (incl.ty - incl.y) * Math.min(1, dt * 4);
        const bob = float && !reduce ? Math.sin(t * 1.2) : 0;
        lata.style.transform = `translate3d(0, ${(bob * -1.1).toFixed(3)}%, 0) rotate(${(incl.y * 1.6).toFixed(3)}deg)`;
        wrap.style.setProperty("--sombra", (1 - bob * 0.08).toFixed(3));
        raf = requestAnimationFrame(cuadro);
      };
      const setCorriendo = (on) => {
        if (on === corriendo) return;
        corriendo = on;
        if (on) {
          last = performance.now();
          raf = requestAnimationFrame(cuadro);
        } else cancelAnimationFrame(raf);
      };
      const io = new IntersectionObserver(([en]) => setCorriendo(en.isIntersecting && !document.hidden), { rootMargin: "100px" });
      io.observe(wrap);
      const onVis = () => setCorriendo(!document.hidden && wrap.getBoundingClientRect().bottom > 0);
      document.addEventListener("visibilitychange", onVis);
      limpieza.push(() => {
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        setCorriendo(false);
        texs.forEach((tx) => gl.deleteTexture(tx));
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
      });

      dibujar(initialAngle, true);
      setLista(true);
    })();

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      limpieza.forEach((f) => f());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={ariaLabel}
      className={"relative grid place-items-center [container-type:size] " + className}
      style={{ cursor: interactive ? "grab" : undefined, touchAction: "pan-y" }}
    >
      {/* caja de la lata: "contain" dentro del contenedor, con la proporción de la foto */}
      <div className="relative" style={{ aspectRatio: `${ANCHO} / ${ALTO}`, width: `min(100cqw, ${(100 * ANCHO) / ALTO}cqh)` }}>
        {/* sombra en el piso */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[97.5%] h-[5%] w-[92%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.32),rgba(0,0,0,0.12)_55%,transparent)] blur-[6px]"
          style={{ transform: "translateX(-50%) scaleX(var(--sombra, 1))" }}
        />
        <div ref={lataRef} className="absolute inset-0 will-change-transform">
          <Image
            src={DIR + "lata-frente.webp"}
            alt=""
            fill
            priority={priority}
            sizes={sizes}
            draggable={false}
            className={"select-none object-contain transition-opacity duration-500 " + (lista ? "opacity-0" : "opacity-100")}
          />
          <canvas
            ref={lienzoRef}
            aria-hidden
            className={"absolute inset-0 h-full w-full transition-opacity duration-500 " + (lista ? "opacity-100" : "opacity-0")}
          />
        </div>
      </div>
    </div>
  );
}
