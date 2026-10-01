"use client";

import { useEffect, useRef, useState } from "react";
import { H, R, Y_PISO, crearEstudio, crearLata, crearSombra, liberar } from "./three/lata";

/* Lata sleek 355 mL en 3D (three.js, carga diferida).
   - La etiqueta es la envolvente completa (frente + dorso) en /public/can.
   - `spin`: MotionValue opcional en radianes (por ejemplo, ligado al scroll).
   - Se puede girar arrastrando; con inercia. En pantalla fuera de vista no renderiza. */


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

      const estudio = crearEstudio(THREE, renderer, { mate });
      scene.environment = estudio.texture;
      scene.environmentIntensity = 0.8;

      /* Luz principal: da el degradé de volumen sobre la etiqueta */
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-6, 5, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.45);
      rim.position.set(7, 3, -5);
      scene.add(rim);

      /* Lata y sombra */
      const { group: can, labelMat } = crearLata(THREE, { mate });
      scene.add(can);
      const shadow = crearSombra(THREE);
      shadow.position.y = Y_PISO;
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
