"use client";

import { useEffect, useRef, useState } from "react";
import { R, Y_BOT, Y_PISO, Y_TOP, crearEstudio, crearLata, crearSombra, liberar } from "./three/lata";

/* Lata fría que gira con el scroll y despide agua (three.js, carga diferida).
   - Condensación: gotas de agua sobre la lata (refractan la etiqueta), algunas con chorreadura.
   - Al girar rápido, el agua sale despedida en tangente, como de una lata recién sacada del hielo.
   - El lienzo ocupa todo el contenedor (las gotas vuelan por toda la pantalla) y la lata se
     encuadra en `slotRef`. `spin`: MotionValue en radianes; 0 = de frente. */

const FONDO = "#f4f4f2"; // el de la sección: el agua refracta lo que tiene detrás
const ALTO_LATA = Y_TOP + 1.3 - (Y_PISO - 0.5);
const CY = (Y_TOP + 1.3 + Y_PISO - 0.5) / 2;
const N_VUELO = 300;
const H_UTIL = Y_TOP - Y_BOT;

const azar = (a, b) => a + Math.random() * (b - a);

/* Gotas de condensación sobre el cilindro, en coordenadas (ángulo, altura). Sin superposiciones;
   las chorreaduras "barren" las gotitas que había en su camino. */
function sembrarCondensacion() {
  const gotas = [];
  const chorros = [];
  const libre = (th, y, r, sep = 0.03) => {
    for (const c of chorros) {
      const dx = Math.abs(((th - c.th + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * R;
      if (dx < c.ancho + r && y > c.y - r && y < c.y + c.largo + r) return false;
    }
    for (const g of gotas) {
      const dx = Math.abs(((th - g.th + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * R;
      const dy = y - g.y;
      if (dx * dx + dy * dy < (r + g.r + sep) ** 2) return false;
    }
    return true;
  };
  // chorreaduras: una gota grande abajo y el rastro que dejó al bajar
  for (let i = 0; i < 9; i++) {
    const th = (i / 9) * Math.PI * 2 + azar(-0.25, 0.25);
    const r = azar(0.22, 0.3);
    const y = azar(Y_BOT + 0.6, Y_BOT + H_UTIL * 0.55);
    chorros.push({ th, y, r, largo: azar(1.6, 4.2), ancho: r * 0.42 });
  }
  const tamanos = [
    [34, 0.21, 0.29],
    [200, 0.12, 0.2],
    [1100, 0.055, 0.11],
  ];
  for (const [n, r0, r1] of tamanos) {
    let puestos = 0;
    for (let k = 0; k < n * 6 && puestos < n; k++) {
      const r = azar(r0, r1);
      const th = Math.random() * Math.PI * 2;
      const y = azar(Y_BOT + 0.15 + r, Y_TOP - 0.1 - r);
      if (!libre(th, y, r)) continue;
      gotas.push({ th, y, r, alarg: azar(1, 1.22) });
      puestos++;
    }
  }
  return { gotas, chorros };
}
export default function CanAgua({ spin, slotRef, className = "", ariaLabel = "Lata de LIV Raspberry fría, girando" }) {
  const wrapRef = useRef(null);
  const [lista, setLista] = useState(false);
  const spinRef = useRef(spin);
  spinRef.current = spin;

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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 0.8;
      if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = 0.75;
      const canvas = renderer.domElement;
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .8s ease;";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const fondo = new THREE.Color(FONDO);
      scene.background = fondo;
      const camera = new THREE.PerspectiveCamera(20, 1, 1, 400);

      const estudio = crearEstudio(THREE, renderer);
      scene.environment = estudio.texture;
      scene.environmentIntensity = 0.8;
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-6, 5, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.45);
      rim.position.set(7, 3, -5);
      scene.add(rim);

      // La lata cuelga de un pivote: el pivote se inclina, la lata gira sobre su eje
      const pivote = new THREE.Group();
      scene.add(pivote);
      const { group: lata, labelMat } = crearLata(THREE);
      pivote.add(lata);
      const sombra = crearSombra(THREE, 10, 0.5);
      sombra.position.y = Y_PISO - 0.5;
      scene.add(sombra);

      /* Agua: líquido transparente (índice 1,33) que refracta lo que tiene detrás. Para que se lea como
         agua y no como vidrio se suman tres cosas que se ven en cualquier foto de gotas:
         - el contorno oscuro (cerca del borde la gota refracta lo que la rodea, no lo que tiene detrás),
         - la cáustica: la luz que entra por un lado se concentra del lado opuesto, cerca del borde,
         - un brillo chico y muy intenso de la luz principal. */
      const luzVista = { value: new THREE.Vector3() };
      const agua = (espesor, oscuro, caustica) => {
        const m = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0,
          roughness: 0.02,
          transmission: 1,
          thickness: espesor,
          ior: 1.33,
          specularIntensity: 1,
          envMapIntensity: 0.9,
          attenuationColor: new THREE.Color("#e6f3f8"),
          attenuationDistance: 5,
        });
        m.onBeforeCompile = (sh) => {
          sh.uniforms.uLuz = luzVista;
          sh.fragmentShader =
            `uniform vec3 uLuz;\n` +
            sh.fragmentShader.replace(
              "totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );",
              `vec3 vd = normalize( vViewPosition );
               float borde = 1.0 - saturate( abs( dot( normal, vd ) ) );
               vec3 trans = transmitted.rgb * mix( 1.0, ${oscuro.toFixed(2)}, smoothstep( 0.42, 0.9, borde ) );
               // la mitad de arriba muestra, invertido, lo que hay abajo (más oscuro)
               trans *= 1.0 - 0.3 * smoothstep( 0.05, 0.7, normal.y ) * smoothstep( 0.12, 0.55, borde );
               float lado = saturate( dot( normalize( normal.xy + 1e-5 ), -normalize( uLuz.xy ) ) );
               trans += ${caustica.toFixed(2)} * pow( lado, 2.5 ) * smoothstep( 0.18, 0.5, borde ) * ( 1.0 - smoothstep( 0.62, 0.9, borde ) );
               float rl = saturate( dot( reflect( -vd, normal ), uLuz ) );
               trans += pow( rl, 500.0 ) * 7.0 + pow( rl, 40.0 ) * 0.18;
               totalDiffuse = mix( totalDiffuse, trans, material.transmission );`
            );
        };
        return m;
      };

      /* Condensación: medias gotas pegadas a la etiqueta (hijas de la lata: giran con ella) */
      const { gotas, chorros } = sembrarCondensacion();
      const media = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      media.rotateX(Math.PI / 2); // el domo mira a +z
      const nCond = gotas.length + chorros.length * 2;
      const cond = new THREE.InstancedMesh(media, agua(0.2, 0.32, 0.3), nCond);
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const sc = new THREE.Vector3();
      const pos = new THREE.Vector3();
      const zLocal = new THREE.Vector3(0, 0, 1);
      const normal = new THREE.Vector3();
      let k = 0;
      const ponerSobreLata = (th, y, ancho, alto, alturaDomo) => {
        normal.set(Math.sin(th), 0, Math.cos(th));
        q.setFromUnitVectors(zLocal, normal);
        pos.set(R * normal.x, y, R * normal.z);
        sc.set(ancho, alto, alturaDomo);
        m4.compose(pos, q, sc);
        cond.setMatrixAt(k++, m4);
      };
      for (const g of gotas) ponerSobreLata(g.th, g.y, g.r, g.r * g.alarg, g.r * 0.55);
      for (const c of chorros) {
        ponerSobreLata(c.th, c.y, c.r, c.r * 1.25, c.r * 0.62); // la gota que baja, más pesada abajo
        ponerSobreLata(c.th, c.y + c.largo / 2 + c.r * 0.5, c.ancho, c.largo / 2, c.ancho * 0.35); // el rastro
      }
      cond.instanceMatrix.needsUpdate = true;
      lata.add(cond);

      /* Agua despedida al girar */
      const vuelo = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), agua(0.45, 0.1, 0.45), N_VUELO);
      vuelo.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      vuelo.frustumCulled = false;
      scene.add(vuelo);
      const cero = new THREE.Matrix4().makeScale(0, 0, 0);
      for (let i = 0; i < N_VUELO; i++) vuelo.setMatrixAt(i, cero);
      const gotasVuelo = Array.from({ length: N_VUELO }, () => ({ vida: 0, max: 1, r: 0.05, p: new THREE.Vector3(), v: new THREE.Vector3() }));
      let libre = 0;

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

      /* Cámara: la lata ocupa el hueco `slotRef`; el resto del lienzo queda para el agua que vuela */
      const fit = () => {
        const W = el.clientWidth || 1;
        const Hh = el.clientHeight || 1;
        renderer.setSize(W, Hh, false);
        const caja = el.getBoundingClientRect();
        const s = slotRef?.current?.getBoundingClientRect();
        const slot = s && s.width > 0 && s.height > 0
          ? { cx: s.left - caja.left + s.width / 2, cy: s.top - caja.top + s.height / 2, w: s.width, h: s.height }
          : { cx: W / 2, cy: Hh / 2, w: W, h: Hh };
        camera.aspect = W / Hh;
        const tan = Math.tan((camera.fov * Math.PI) / 360);
        const visH = Math.max((ALTO_LATA * Hh) / (slot.h * 0.86), ((2 * R + 1.4) * W) / (slot.w * 0.86) / camera.aspect);
        const d = visH / 2 / tan;
        camera.position.set(0, CY + d * 0.07, d);
        camera.lookAt(0, CY, 0);
        camera.setViewOffset(W, Hh, -(slot.cx - W / 2), -(slot.cy - Hh / 2), W, Hh);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        luzVista.value.copy(key.position).normalize().transformDirection(camera.matrixWorldInverse);
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);
      if (slotRef?.current) ro.observe(slotRef.current);

      let t = 0;
      let last = performance.now();
      let giroPrevio = null;
      let w = 0; // velocidad angular suavizada (rad/s)
      let acumulado = 0;

      const lanzar = () => {
        const g = gotasVuelo[libre];
        libre = (libre + 1) % N_VUELO;
        const sentido = Math.sign(w) || 1;
        const vel = Math.min(Math.abs(w), 9) * R;
        // sale de un punto de la superficie, en tangente al giro, con un poco de componente hacia afuera
        const a = Math.random() * Math.PI * 2;
        const y = azar(Y_BOT + 0.3, Y_TOP - 0.2);
        normal.set(Math.sin(a), 0, Math.cos(a));
        const local = new THREE.Vector3(normal.x * (R + 0.05), y, normal.z * (R + 0.05));
        g.p.copy(local).applyMatrix4(pivote.matrixWorld);
        const tangente = new THREE.Vector3(normal.z, 0, -normal.x).multiplyScalar(sentido);
        g.v.copy(tangente).multiplyScalar(vel * azar(1.1, 1.9)).addScaledVector(normal, vel * azar(0.15, 0.45));
        g.v.y += azar(-1, 3);
        g.v.applyAxisAngle(zLocal, pivote.rotation.z);
        g.r = 0.05 + Math.pow(Math.random(), 2.4) * 0.26;
        g.max = azar(1.4, 2.6);
        g.vida = g.max;
      };

      const dirV = new THREE.Vector3();
      const frame = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        t += dt;

        const giro = reduce ? -0.2 : spinRef.current ? spinRef.current.get() : -0.2;
        if (giroPrevio !== null && dt > 0) w += ((giro - giroPrevio) / dt - w) * Math.min(1, dt * 12);
        giroPrevio = giro;
        lata.rotation.y = giro;
        // se inclina apenas con la velocidad del giro y flota
        const inclinacion = Math.max(-0.14, Math.min(0.14, -w * 0.012));
        pivote.rotation.z += (inclinacion - pivote.rotation.z) * Math.min(1, dt * 4);
        pivote.position.y = reduce ? 0 : Math.sin(t * 1.1) * 0.16;
        sombra.material.opacity = 1 - pivote.position.y * 0.9;
        pivote.updateMatrixWorld();

        // agua despedida: cuanto más rápido gira, más agua (cámara lenta: gravedad suave)
        if (!reduce) {
          acumulado += Math.min(240, Math.max(0, Math.abs(w) - 1.4) * 38) * dt;
          while (acumulado >= 1) {
            acumulado -= 1;
            lanzar();
          }
        }
        for (let i = 0; i < N_VUELO; i++) {
          const g = gotasVuelo[i];
          if (g.vida <= 0) continue;
          g.vida -= dt;
          g.v.y -= 22 * dt;
          g.v.multiplyScalar(Math.pow(0.82, dt)); // el aire las frena
          g.p.addScaledVector(g.v, dt);
          if (g.vida <= 0) {
            vuelo.setMatrixAt(i, cero);
            continue;
          }
          const vida = g.vida / g.max;
          const s = g.r * Math.min(1, vida * 4) * Math.min(1, (g.max - g.vida) * 12);
          const rapidez = g.v.length();
          dirV.copy(g.v).divideScalar(rapidez || 1);
          q.setFromUnitVectors(zLocal, dirV);
          sc.set(s, s, s * (1 + Math.min(rapidez * 0.05, 1.4))); // se estiran en la dirección en que vuelan
          m4.compose(g.p, q, sc);
          vuelo.setMatrixAt(i, m4);
        }
        vuelo.instanceMatrix.needsUpdate = true;

        renderer.render(scene, camera);
      };

      let running = false;
      const setRunning = (on) => {
        if (on === running) return;
        running = on;
        if (on) {
          last = performance.now();
          giroPrevio = null;
        }
        renderer.setAnimationLoop(on ? frame : null);
      };
      const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting && !document.hidden), { rootMargin: "120px" });
      io.observe(el);
      const onVis = () => {
        const r = el.getBoundingClientRect();
        setRunning(!document.hidden && r.bottom > 0 && r.top < innerHeight);
      };
      document.addEventListener("visibilitychange", onVis);

      cleanup = () => {
        setRunning(false);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        liberar(scene);
        estudio.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={wrapRef} role="img" aria-label={ariaLabel} className={"relative " + className} data-ready={lista ? "" : undefined} />;
}
