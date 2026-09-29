"use client";

import { useEffect, useRef, useState } from "react";

/* Lata sleek 355 mL en 3D (three.js, carga diferida).
   - La etiqueta es la envolvente completa (frente + dorso) en /public/can.
   - `spin`: MotionValue opcional en radianes (por ejemplo, ligado al scroll).
   - Se puede girar arrastrando; con inercia. En pantalla fuera de vista no renderiza. */

const R = 2.9; // radio del cuerpo, en cm
const LABEL_ASPECT = 580 / 377; // alto / medio perímetro de la etiqueta
const H = LABEL_ASPECT * Math.PI * R; // alto de la zona impresa

export default function Can3D({
  spin,
  autoRotate = true,
  autoSpeed = 0.35,
  interactive = true,
  float = true,
  mate = false, // sin reflejos marcados: etiqueta satinada y luz difusa
  sway = 0, // balanceo suave alrededor del frente (radianes); reemplaza al giro continuo
  settle = false, // al soltarla después de arrastrar, vuelve sola al frente
  initialAngle = -0.35,
  label = "/can/etiqueta-raspberry-v2.jpg",
  className = "",
  ariaLabel = "Lata de LIV Raspberry, 355 mL, en 3D",
  onReady,
}) {
  const wrapRef = useRef(null);
  const [ready, setReady] = useState(false);
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
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // sin WebGL: queda la imagen de respaldo
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 0.8;
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .8s ease;touch-action:pan-y;" +
        (interactive ? "cursor:grab;" : "");
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(20, 1, 1, 200);

      /* Estudio para los reflejos: caja gris con softboxes verticales */
      const pmrem = new THREE.PMREMGenerator(renderer);
      const studio = new THREE.Scene();
      studio.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(40, 30, 40),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(0.34, 0.34, 0.35), side: THREE.BackSide })
        )
      );
      const softbox = (w, h, pos, intensity) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide })
        );
        m.position.set(...pos);
        m.lookAt(0, pos[1] * 0.2, 0);
        studio.add(m);
      };
      softbox(mate ? 8 : 1.6, 22, [-10, 1, 9], mate ? 4 : 34); // principal, izquierda al frente
      softbox(mate ? 6 : 1.0, 22, [12, 1, -2], mate ? 2.5 : 22); // recorte, derecha atrás
      softbox(7, 14, [8, 0, 12], 2.6); // relleno, derecha al frente
      softbox(16, 16, [0, 13, 0], 3.2); // cenital
      softbox(24, 8, [0, -11, 6], 1.1); // rebote del piso
      const envRT = pmrem.fromScene(studio, 0.03);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.8;

      /* Luz principal: da el degradé de volumen sobre la etiqueta */
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-6, 5, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.45);
      rim.position.set(7, 3, -5);
      scene.add(rim);

      /* Geometría */
      const can = new THREE.Group();
      scene.add(can);
      const yT = H / 2;
      const yB = -H / 2;

      const labelMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: mate ? 0.75 : 0.42,
        metalness: 0.0,
        clearcoat: mate ? 0 : 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 0.6,
      });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 192, 1, true, -Math.PI / 2, Math.PI * 2), labelMat);
      can.add(body);

      const metal = new THREE.MeshPhysicalMaterial({
        color: 0xeceef0,
        metalness: 1,
        roughness: mate ? 0.42 : 0.26,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide,
      });
      const metalDark = new THREE.MeshPhysicalMaterial({ color: 0xdcdde0, metalness: 1, roughness: 0.32, envMapIntensity: 1.4, side: THREE.DoubleSide });

      const V = (x, y) => new THREE.Vector2(x, y);
      const top = [
        V(R, yT),
        V(R - 0.004, yT + 0.1),
        V(R - 0.025, yT + 0.25),
        V(R - 0.08, yT + 0.43),
        V(R - 0.16, yT + 0.6),
        V(R - 0.235, yT + 0.75),
        V(R - 0.275, yT + 0.87),
        V(R - 0.28, yT + 0.97),
        V(R - 0.255, yT + 1.04),
        V(R - 0.232, yT + 1.11),
        V(R - 0.238, yT + 1.19),
        V(R - 0.275, yT + 1.235),
        V(R - 0.33, yT + 1.24),
        V(R - 0.37, yT + 1.21),
        V(R - 0.385, yT + 1.1),
        V(R - 0.4, yT + 0.99),
        V(R - 0.45, yT + 0.975),
        V(R - 0.5, yT + 1.0),
        V(R - 0.9, yT + 1.012),
        V(0, yT + 1.015),
      ];
      can.add(new THREE.Mesh(new THREE.LatheGeometry(top, 160), metal));

      const bottom = [
        V(0, yB - 0.32),
        V(1.2, yB - 0.4),
        V(1.9, yB - 0.58),
        V(2.2, yB - 0.7),
        V(2.3, yB - 0.74),
        V(2.42, yB - 0.72),
        V(2.62, yB - 0.55),
        V(2.8, yB - 0.3),
        V(2.88, yB - 0.12),
        V(R, yB),
      ];
      can.add(new THREE.Mesh(new THREE.LatheGeometry(bottom, 160), metalDark));

      /* Anilla y remache */
      const rounded = (s, x, y, w, h, r) => {
        s.moveTo(x + r, y);
        s.lineTo(x + w - r, y);
        s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + h - r);
        s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        s.lineTo(x + r, y + h);
        s.quadraticCurveTo(x, y + h, x, y + h - r);
        s.lineTo(x, y + r);
        s.quadraticCurveTo(x, y, x + r, y);
      };
      const tabShape = new THREE.Shape();
      rounded(tabShape, -0.62, -1.15, 1.24, 1.95, 0.5);
      const hole = new THREE.Path();
      rounded(hole, -0.4, -1.0, 0.8, 0.82, 0.34);
      tabShape.holes.push(hole);
      const tabGeo = new THREE.ExtrudeGeometry(tabShape, {
        depth: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.018,
        bevelSize: 0.03,
        bevelSegments: 3,
        curveSegments: 20,
      });
      tabGeo.rotateX(-Math.PI / 2);
      const tab = new THREE.Mesh(tabGeo, metal);
      tab.position.set(0, yT + 1.03, 0.15);
      can.add(tab);

      const score = new THREE.Shape();
      rounded(score, -0.55, 0.55, 1.1, 1.05, 0.5);
      const scoreIn = new THREE.Path();
      rounded(scoreIn, -0.49, 0.61, 0.98, 0.93, 0.45);
      score.holes.push(scoreIn);
      const scoreGeo = new THREE.ExtrudeGeometry(score, { depth: 0.012, bevelEnabled: false, curveSegments: 20 });
      scoreGeo.rotateX(-Math.PI / 2);
      const scoreMesh = new THREE.Mesh(scoreGeo, metalDark);
      scoreMesh.position.set(0, yT + 1.016, 0.35);
      can.add(scoreMesh);

      const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.06, 32), metal);
      rivet.position.set(0, yT + 1.05, 0);
      can.add(rivet);

      /* Sombra de contacto */
      const shadowTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const g = c.getContext("2d");
        const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
        grd.addColorStop(0, "rgba(0,0,0,0.55)");
        grd.addColorStop(0.35, "rgba(0,0,0,0.28)");
        grd.addColorStop(0.7, "rgba(0,0,0,0.06)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grd;
        g.fillRect(0, 0, 256, 256);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })();
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = yB - 0.76;
      scene.add(shadow);

      /* Etiqueta */
      const loader = new THREE.TextureLoader();
      loader.load(label, (tex) => {
        if (disposed) return tex.dispose();
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        labelMat.map = tex;
        labelMat.needsUpdate = true;
        renderer.render(scene, camera);
        canvas.style.opacity = "1";
        setReady(true);
        onReady?.();
      });

      /* Cámara: encuadra la lata entera según el tamaño del contenedor */
      const fit = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const fov = (camera.fov * Math.PI) / 180;
        const needH = H + 4.2;
        const needW = 2 * R + 3.2;
        const distH = needH / 2 / Math.tan(fov / 2);
        const distW = needW / 2 / (Math.tan(fov / 2) * camera.aspect);
        const d = Math.max(distH, distW);
        camera.position.set(0, d * 0.13, d);
        camera.lookAt(0, -0.2, 0);
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);

      /* Interacción */
      let angle = 0; // giro acumulado por arrastre; el reposo es initialAngle
      let velocity = 0;
      let dragging = false;
      let lastX = 0;
      let lastT = 0;
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

      const onDown = (e) => {
        dragging = true;
        lastX = e.clientX;
        lastT = performance.now();
        velocity = 0;
        canvas.setPointerCapture?.(e.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const onMove = (e) => {
        if (!dragging) return;
        const now = performance.now();
        const dx = e.clientX - lastX;
        const dt = Math.max((now - lastT) / 1000, 0.001);
        const d = dx * 0.012;
        angle += d;
        velocity = d / dt;
        lastX = e.clientX;
        lastT = now;
      };
      const onUp = (e) => {
        dragging = false;
        canvas.releasePointerCapture?.(e.pointerId);
        canvas.style.cursor = "grab";
      };
      const onHover = (e) => {
        const r = el.getBoundingClientRect();
        tilt.tx = ((e.clientY - r.top) / r.height - 0.5) * 0.12;
        tilt.ty = ((e.clientX - r.left) / r.width - 0.5) * 0.16;
      };
      if (interactive) {
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerup", onUp);
        canvas.addEventListener("pointercancel", onUp);
      }
      if (!reduce) window.addEventListener("pointermove", onHover, { passive: true });

      let last = performance.now();
      let t = 0;
      const frame = () => {
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        t += dt;
        if (!dragging) {
          angle += velocity * dt;
          velocity *= Math.pow(0.04, dt);
          if (settle && Math.abs(velocity) < 0.8) {
            // resorte hacia la vuelta completa más cercana: siempre termina de frente
            const target = Math.round(angle / (Math.PI * 2)) * Math.PI * 2;
            angle += (target - angle) * Math.min(1, dt * 2.2);
          }
          if (autoRotate && !reduce) angle += autoSpeed * dt;
        }
        const swing = sway && !reduce ? Math.sin(t * 0.7) * sway : 0;
        const ext = spinRef.current ? spinRef.current.get() : 0;
        can.rotation.y = initialAngle + angle + ext + swing;
        tilt.x += (tilt.tx - tilt.x) * Math.min(1, dt * 4);
        tilt.y += (tilt.ty - tilt.y) * Math.min(1, dt * 4);
        can.rotation.x = tilt.x;
        can.rotation.z = -tilt.y * 0.35;
        const bob = float && !reduce ? Math.sin(t * 1.2) * 0.18 : 0;
        can.position.y = bob;
        shadow.material.opacity = 1 - bob * 0.9;
        shadow.scale.setScalar(1 - bob * 0.12);
        renderer.render(scene, camera);
      };

      let running = false;
      const setRunning = (on) => {
        if (on === running) return;
        running = on;
        if (on) last = performance.now();
        renderer.setAnimationLoop(on ? frame : null);
      };
      const io = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting && !document.hidden), {
        rootMargin: "100px",
      });
      io.observe(el);
      const onVis = () => setRunning(!document.hidden && el.getBoundingClientRect().bottom > 0);
      document.addEventListener("visibilitychange", onVis);

      cleanup = () => {
        setRunning(false);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pointermove", onHover);
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            o.material.map?.dispose();
            o.material.dispose();
          }
        });
        studio.traverse((o) => {
          o.geometry?.dispose();
          o.material?.dispose();
        });
        envRT.dispose();
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  return (
    <div ref={wrapRef} role="img" aria-label={ariaLabel} className={"relative " + className} data-ready={ready ? "" : undefined}>
      {!ready && (
        <div aria-hidden className="absolute inset-0 grid place-items-center">
          <div className="h-[70%] w-[28%] animate-pulse rounded-[18%/6%] bg-black/[0.04]" />
        </div>
      )}
    </div>
  );
}
