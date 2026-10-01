"use client";

import { useEffect, useRef, useState } from "react";
import { Y_PISO, Y_TOP, crearEstudio, crearLata, crearSombra, liberar } from "./three/lata";

/* Escena 3D: la lata se inclina y sirve la soda en un vaso de vidrio.
   - `progreso`: MotionValue 0→1 (scroll suavizado) que recorre la coreografía.
   - `sonido`: motor de crearSonidoVertido() o null; recibe caudal y nivel en cada cuadro.
   Coreografía (por progreso): reposo → la lata sube y se inclina → sirve (el vaso se llena) →
   vuelve a su lugar → queda el vaso servido con burbujas. */

// Vaso (cm)
const GX = 3.4; // posición del vaso
const G_RB = 3.0; // radio exterior abajo
const G_RT = 3.45; // radio exterior arriba
const G_H = 10.6; // alto
const G_PARED = 0.17;
const G_BASE = 0.75; // espesor del fondo
const G_Y0 = Y_PISO; // apoyo
const G_TOP = G_Y0 + G_H;
const I_Y0 = G_Y0 + G_BASE; // fondo interior
const I_H = G_H - G_BASE - 0.15;
const radioInterior = (y) => G_RB - G_PARED + ((G_RT - G_RB) * (y - G_Y0)) / G_H;
const NIVEL_MAX = 0.84;

// Lata
const REPOSO = { x: -4.1, y: 0, rz: 0 };
const INCLINACION = -1.86; // rad, ~107°: la boca queda apuntando al vaso

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const tramo = (p, a, b) => {
  const x = clamp01((p - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const lerp = (a, b, t) => a + (b - a) * t;

export default function PourScene({ progreso, sonido = null, className = "" }) {
  const wrapRef = useRef(null);
  const [lista, setLista] = useState(false);
  const progresoRef = useRef(progreso);
  progresoRef.current = progreso;
  const sonidoRef = useRef(sonido);
  sonidoRef.current = sonido;

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed || !wrapRef.current) return;
      const el = wrapRef.current;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 0.8;
      const canvas = renderer.domElement;
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .8s ease;";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      // el fondo es el color de la sección: el vidrio lo refracta
      const fondo = new THREE.Color("#f4f4f2");
      scene.background = fondo;
      renderer.setClearColor(fondo, 1);
      const camera = new THREE.PerspectiveCamera(24, 1, 1, 400);

      const estudio = crearEstudio(THREE, renderer);
      scene.environment = estudio.texture;
      scene.environmentIntensity = 0.8;
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-6, 9, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.5);
      rim.position.set(8, 4, -6);
      scene.add(rim);

      /* Lata (abierta, con la boca hacia el vaso) */
      const { group: lata, labelMat, bocaLocal } = crearLata(THREE, { boca: Math.PI / 2 });
      scene.add(lata);
      const sombraLata = crearSombra(THREE, 10, 0.5);
      sombraLata.position.y = Y_PISO + 0.01;
      scene.add(sombraLata);

      /* Vaso: una sola pieza torneada (pared exterior, borde redondeado, pared interior y fondo grueso) */
      const V = (x, y) => new THREE.Vector2(x, y);
      const perfil = [
        V(0.001, G_Y0),
        V(G_RB - 0.25, G_Y0),
        V(G_RB - 0.04, G_Y0 + 0.06),
        V(G_RB, G_Y0 + 0.3),
        V(G_RT, G_TOP - 0.06),
        V(G_RT - 0.03, G_TOP),
        V(G_RT - G_PARED + 0.03, G_TOP),
        V(G_RT - G_PARED, G_TOP - 0.06),
        V(radioInterior(I_Y0 + 0.3), I_Y0 + 0.3),
        V(radioInterior(I_Y0) - 0.15, I_Y0),
        V(0.001, I_Y0 - 0.05),
      ];
      const vidrio = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.02,
        transmission: 1,
        thickness: 0.45,
        ior: 1.5,
        specularIntensity: 1,
        envMapIntensity: 1.3,
        attenuationColor: new THREE.Color("#e9f2ef"),
        attenuationDistance: 6,
        side: THREE.DoubleSide,
      });
      const vaso = new THREE.Mesh(new THREE.LatheGeometry(perfil, 128), vidrio);
      vaso.position.x = GX;
      scene.add(vaso);
      const sombraVaso = crearSombra(THREE, 9.5, 0.32);
      sombraVaso.position.set(GX, Y_PISO + 0.005, 0);
      scene.add(sombraVaso);

      /* Soda: rosa frambuesa. Va en la pasada opaca (sin transmission) para que el vidrio, que sí es
         transmisivo, la refracte; el brillo y el degradé le dan aspecto de líquido. */
      const soda = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#ef9fb6"),
        metalness: 0,
        roughness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        sheen: 0.4,
        sheenColor: new THREE.Color("#ffd6e2"),
        envMapIntensity: 1.25,
        vertexColors: true,
      });
      // más saturada en los bordes y más clara al centro (como un líquido translúcido visto a través del vidrio)
      soda.onBeforeCompile = (sh) => {
        sh.fragmentShader = sh.fragmentShader.replace(
          "#include <normal_fragment_maps>",
          `#include <normal_fragment_maps>
           float borde = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 1.6);
           diffuseColor.rgb = mix(diffuseColor.rgb * 1.06, diffuseColor.rgb * vec3(0.8, 0.42, 0.55), borde);`
        );
      };
      // degradé vertical: más intenso abajo, más claro arriba
      const pintarDegrade = (geo, y0, y1) => {
        const pos = geo.attributes.position;
        const col = new Float32Array(pos.count * 3);
        const abajo = new THREE.Color("#d9577e");
        const arriba = new THREE.Color("#ffd3df");
        const c = new THREE.Color();
        for (let i = 0; i < pos.count; i++) {
          const k = clamp01((pos.getY(i) - y0) / Math.max(0.01, y1 - y0));
          c.copy(abajo).lerp(arriba, Math.pow(k, 0.8));
          col[i * 3] = c.r;
          col[i * 3 + 1] = c.g;
          col[i * 3 + 2] = c.b;
        }
        geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
        return geo;
      };
      const sodaChorro = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#f7bccc"),
        metalness: 0,
        roughness: 0.04,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        emissive: new THREE.Color("#7a1f3a"),
        emissiveIntensity: 0.08,
        envMapIntensity: 1.5,
      });
      const liquido = new THREE.Mesh(new THREE.BufferGeometry(), soda);
      liquido.position.x = GX;
      scene.add(liquido);
      let nivelGeo = -1;
      const armarLiquido = (nivel) => {
        if (Math.abs(nivel - nivelGeo) < 0.002) return;
        nivelGeo = nivel;
        liquido.geometry.dispose();
        if (nivel <= 0.001) {
          liquido.geometry = new THREE.BufferGeometry();
          return;
        }
        const yTop = I_Y0 + nivel * I_H;
        const r0 = radioInterior(I_Y0) - 0.17;
        const r1 = radioInterior(yTop) - 0.02;
        const pts = [V(0.001, I_Y0 + 0.01), V(r0, I_Y0 + 0.01), V(r0 + 0.12, I_Y0 + 0.2), V(r1, yTop - 0.05), V(r1 - 0.05, yTop), V(0.001, yTop)];
        liquido.geometry = pintarDegrade(new THREE.LatheGeometry(pts, 96), I_Y0, I_Y0 + NIVEL_MAX * I_H);
      };

      /* Espuma: capa fina y clara arriba del líquido */
      const espumaMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#fde9ef"), roughness: 0.75 });
      const espuma = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 96, 1, false), espumaMat);
      espuma.position.x = GX;
      espuma.visible = false;
      scene.add(espuma);

      /* Chorro: tubo que se recalcula cada cuadro, de la boca de la lata a la superficie */
      const chorro = new THREE.Mesh(new THREE.BufferGeometry(), sodaChorro);
      scene.add(chorro);

      /* Burbujas que suben dentro del vaso */
      const N_B = 220;
      // opacas: lo transparente no se ve a través del vidrio transmisivo
      const burbujaMat = new THREE.MeshStandardMaterial({ color: 0xfff6f8, metalness: 0.25, roughness: 0.12, envMapIntensity: 2.2 });
      const burbujas = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), burbujaMat, N_B);
      burbujas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(burbujas);
      // las burbujas suben pegadas a la pared (sobre todo la que mira a la cámara) y algunas en la superficie
      const anguloFrente = () => Math.PI * (0.08 + Math.random() * 0.84);
      const bState = Array.from({ length: N_B }, () => ({
        a: anguloFrente(),
        r: 1,
        y: Math.random(),
        v: 0.12 + Math.random() * 0.35,
        s: 0.025 + Math.random() * 0.05,
        w: Math.random() * 10,
      }));

      /* Salpicaduras en el punto donde pega el chorro */
      const N_G = 48;
      const gotas = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), sodaChorro, N_G);
      gotas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(gotas);
      const gState = Array.from({ length: N_G }, () => ({ vida: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), s: 0.04 }));

      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const sc = new THREE.Vector3();
      const pos = new THREE.Vector3();
      const cero = new THREE.Matrix4().makeScale(0, 0, 0);

      /* Etiqueta */
      new THREE.TextureLoader().load("/can/etiqueta-raspberry-v2.jpg", (tex) => {
        if (disposed) return tex.dispose();
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        labelMat.map = tex;
        labelMat.needsUpdate = true;
        canvas.style.opacity = "1";
        setLista(true);
      });

      /* Cámara: interpola entre el encuadre en reposo y el encuadre del vertido */
      let aspect = 1;
      const fit = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        aspect = w / h;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);

      const encuadrar = (cx, cy, ancho, alto) => {
        const fov = (camera.fov * Math.PI) / 180;
        const dH = alto / 2 / Math.tan(fov / 2);
        const dW = ancho / 2 / (Math.tan(fov / 2) * aspect);
        const dist = Math.max(dH, dW);
        camera.position.set(cx, cy + dist * 0.1, dist);
        camera.lookAt(cx, cy, 0);
      };

      const ejeZ = new THREE.Vector3(0, 0, 1);
      const bocaMundo = new THREE.Vector3();
      const ejeLata = new THREE.Vector3();
      let t = 0;
      let last = performance.now();
      let espumaAltura = 0;
      const esq = new THREE.Vector3();
      const ESQUINAS = [[-3, Y_PISO - 0.1], [3, Y_PISO - 0.1], [-3, Y_TOP + 1.3], [3, Y_TOP + 1.3]];
      const cam = { cx: 0, cy: 0, w: 16, h: 18, init: false };

      const frame = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        t += dt;
        const p = reduce ? 1 : clamp01(progresoRef.current ? progresoRef.current.get() : 0);

        // Coreografía
        const sube = tramo(p, 0.05, 0.18) * (1 - tramo(p, 0.88, 0.96)); // la lata se levanta
        const encima = tramo(p, 0.15, 0.31) * (1 - tramo(p, 0.8, 0.89)); // se pone sobre el vaso y se inclina
        const lleno = tramo(p, 0.32, 0.8); // cuánto se llenó
        const nivel = lleno * NIVEL_MAX;
        const caudal = tramo(p, 0.29, 0.34) * (1 - tramo(p, 0.74, 0.8));
        const inclinacion = Math.max(sube * 0.55, encima);
        const vuelve = tramo(p, 0.8, 0.95);

        // Pose de la lata: levantada → sobre el vaso, con la boca justo arriba del borde
        const rzElevada = -0.32 * sube;
        const rz = lerp(rzElevada, INCLINACION - 0.22 * lleno, encima);
        lata.rotation.set(0, 0, rz);
        const bocaRot = bocaLocal.clone().applyAxisAngle(ejeZ, rz);
        const objetivo = new THREE.Vector3(GX - 1.55, G_TOP + 2.1, 0.0);
        const poseVertido = objetivo.clone().sub(bocaRot);
        const elevadaX = REPOSO.x - 0.6 * sube;
        const elevadaY = REPOSO.y + 7.5 * sube;
        lata.position.set(lerp(elevadaX, poseVertido.x, encima), lerp(elevadaY, poseVertido.y, encima), 0);

        // Sombra de la lata: se achica y aclara cuando la lata se levanta
        sombraLata.position.x = lata.position.x;
        sombraLata.material.opacity = 1 - inclinacion * 0.85;
        sombraLata.scale.setScalar(1 + inclinacion * 0.6);

        // Líquido y espuma
        armarLiquido(nivel);
        const yTop = I_Y0 + nivel * I_H;
        espumaAltura = lerp(espumaAltura, caudal > 0.05 ? 0.35 : nivel > 0.05 ? 0.1 : 0, Math.min(1, dt * 1.5));
        if (nivel > 0.02) {
          const rEsp = radioInterior(yTop) - 0.04;
          espuma.visible = true;
          espuma.scale.set(rEsp, Math.max(0.02, espumaAltura), rEsp);
          espuma.position.y = yTop + espumaAltura / 2 - 0.02;
        } else espuma.visible = false;

        // Chorro
        chorro.geometry.dispose();
        bocaMundo.copy(bocaLocal).applyAxisAngle(ejeZ, rz).add(lata.position);
        // el chorro "cae" desde la boca al empezar y se corta desde arriba al terminar
        const cabeza = tramo(p, 0.285, 0.325);
        const cola = tramo(p, 0.765, 0.805);
        if (caudal > 0.01 && cabeza - cola > 0.01) {
          ejeLata.set(-Math.sin(rz), Math.cos(rz), 0); // hacia la tapa
          const p0 = bocaMundo.clone();
          const p1 = p0.clone().addScaledVector(ejeLata, 0.9).add(new THREE.Vector3(0.15, -0.2, 0));
          const destino = new THREE.Vector3(GX - 0.6, Math.max(yTop + espumaAltura * 0.5, I_Y0 + 0.05), 0);
          const curva = new THREE.QuadraticBezierCurve3(p0, p1, destino);
          const puntos = [];
          for (let i = 0; i <= 40; i++) {
            const u = lerp(cola, cabeza, i / 40);
            const pt = curva.getPoint(u);
            // el chorro tiembla un poco más abajo, donde ya no lo guía el borde de la lata
            const amp = 0.05 * u;
            pt.x += Math.sin(t * 23 + u * 14) * amp;
            pt.z += Math.cos(t * 19 + u * 11) * amp;
            puntos.push(pt);
          }
          const radio = 0.3 * (0.3 + 0.7 * caudal); // ~6 mm de diámetro a pleno caudal
          const camino = new THREE.CatmullRomCurve3(puntos);
          const SEG = 72, RAD = 12;
          const geo = new THREE.TubeGeometry(camino, SEG, radio, RAD, false);
          // Se afina al caer (acelera y por continuidad adelgaza) y muestra las ondulaciones de un chorro real
          const attr = geo.attributes.position;
          const c = new THREE.Vector3();
          for (let i = 0; i <= SEG; i++) {
            const v = i / SEG;
            const u = lerp(cola, cabeza, v);
            camino.getPointAt(v, c);
            const onda = 1 + Math.sin(u * 46 - t * 34) * 0.07 * u + Math.sin(u * 19 - t * 21) * 0.04;
            const punta = Math.min(1, (1 - v) * 18 + (cabeza >= 1 ? 1 : 0)); // la punta que cae es redondeada
            const f = (1.2 - 0.5 * Math.sqrt(u)) * onda * (0.35 + 0.65 * Math.sqrt(punta));
            for (let j = 0; j <= RAD; j++) {
              const k = i * (RAD + 1) + j;
              attr.setXYZ(k, c.x + (attr.getX(k) - c.x) * f, c.y + (attr.getY(k) - c.y) * f, c.z + (attr.getZ(k) - c.z) * f);
            }
          }
          chorro.geometry = geo;
          chorro.visible = true;
        } else {
          chorro.geometry = new THREE.BufferGeometry();
          chorro.visible = false;
        }

        // Burbujas: suben y se reinician en el fondo; con el chorro hay más cerca del impacto
        const altoLiq = nivel * I_H;
        for (let i = 0; i < N_B; i++) {
          const b = bState[i];
          b.y += (b.v * dt * (1 + caudal * 1.5)) / Math.max(altoLiq, 1) * 4;
          if (b.y > 1) {
            b.y = 0;
            b.a = anguloFrente();
          }
          const visible = altoLiq > 0.4 && i < N_B * Math.min(1, 0.3 + nivel * 1.2);
          if (!visible) {
            burbujas.setMatrixAt(i, cero);
            continue;
          }
          const y = I_Y0 + 0.15 + b.y * (altoLiq - 0.25);
          const rPared = radioInterior(y) - 0.07;
          const wob = Math.sin(t * 6 + b.w) * 0.015;
          pos.set(GX + Math.cos(b.a + wob) * rPared, y, Math.sin(b.a + wob) * rPared);
          const s = b.s * (0.7 + b.y * 0.6);
          sc.set(s, s, s);
          m4.compose(pos, q, sc);
          burbujas.setMatrixAt(i, m4);
        }
        burbujas.instanceMatrix.needsUpdate = true;

        // Salpicaduras
        const impacto = new THREE.Vector3(GX - 0.6, yTop + espumaAltura * 0.5, 0);
        for (let i = 0; i < N_G; i++) {
          const g = gState[i];
          if (g.vida <= 0 && caudal > 0.2 && cabeza >= 1 && cola <= 0 && Math.random() < caudal * 0.35) {
            g.vida = 0.25 + Math.random() * 0.3;
            g.p.copy(impacto);
            g.v.set((Math.random() - 0.5) * 3, 1.5 + Math.random() * 3.5, (Math.random() - 0.5) * 3);
            g.s = 0.025 + Math.random() * 0.05;
          }
          if (g.vida > 0) {
            g.vida -= dt;
            g.v.y -= 30 * dt;
            g.p.addScaledVector(g.v, dt);
            if (g.p.y < yTop) g.vida = 0;
            sc.setScalar(g.vida > 0 ? g.s : 0);
            m4.compose(g.p, q, sc);
            gotas.setMatrixAt(i, m4);
          } else gotas.setMatrixAt(i, cero);
        }
        gotas.instanceMatrix.needsUpdate = true;

        // Cámara: encuadra la lata y el vaso en todo momento (caja envolvente suavizada)
        let x0 = GX - G_RT, x1 = GX + G_RT, y0 = Y_PISO - 0.6, y1 = G_TOP;
        for (const [lx, ly] of ESQUINAS) {
          esq.set(lx, ly, 0).applyAxisAngle(ejeZ, rz).add(lata.position);
          x0 = Math.min(x0, esq.x); x1 = Math.max(x1, esq.x);
          y0 = Math.min(y0, esq.y); y1 = Math.max(y1, esq.y);
        }
        const k = cam.init ? Math.min(1, dt * 5) : 1;
        cam.init = true;
        cam.cx = lerp(cam.cx, (x0 + x1) / 2, k);
        cam.cy = lerp(cam.cy, (y0 + y1) / 2, k);
        cam.w = lerp(cam.w, (x1 - x0) * 1.12, k);
        cam.h = lerp(cam.h, (y1 - y0) * 1.14, k);
        encuadrar(cam.cx, cam.cy, cam.w, cam.h);

        // Sonido
        const s = sonidoRef.current;
        if (s) s.actualizar(caudal, nivel / NIVEL_MAX, nivel > 0.05 ? 0.35 + 0.65 * (1 - vuelve * 0.5) : 0);

        renderer.render(scene, camera);
      };

      let running = false;
      const setRunning = (on) => {
        if (on === running) return;
        running = on;
        if (on) last = performance.now();
        else sonidoRef.current?.actualizar(0, 0, 0);
        renderer.setAnimationLoop(on ? frame : null);
      };
      const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting && !document.hidden), { rootMargin: "80px" });
      io.observe(el);
      const onVis = () => setRunning(!document.hidden && el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < innerHeight);
      document.addEventListener("visibilitychange", onVis);

      // para revisar cuadros fijos desde herramientas de prueba
      window.__pour = { render: frame };

      cleanup = () => {
        setRunning(false);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        liberar(scene);
        estudio.dispose();
        renderer.dispose();
        canvas.remove();
        delete window.__pour;
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="La lata de LIV Raspberry se inclina y sirve la soda en un vaso de vidrio"
      className={"relative " + className}
      data-ready={lista ? "" : undefined}
    />
  );
}
