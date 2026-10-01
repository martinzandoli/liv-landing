"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useScroll, useVelocity } from "framer-motion";

/* Borde de agua entre secciones: la sección vecina (negra) entra como una superficie de agua que
   ondula sola y se agita más cuanto más rápido se scrollea. `lado`: "arriba" o "abajo". */

const ANCHO = 1000;
const ALTO = 100;
const N = 60;

export default function OlaAgua({ lado = "arriba", className = "" }) {
  const ref = useRef(null);
  const frente = useRef(null);
  const fondo = useRef(null);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocidad = useVelocity(scrollY);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const arriba = lado === "arriba";
    let t = Math.random() * 10;
    let last = performance.now();
    let agitacion = 0;
    let raf = 0;

    // suma de ondas de distinto largo que viajan en sentidos opuestos: así se mueve el agua de verdad
    const camino = (fase, base, amp) => {
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * ANCHO;
        const y =
          base +
          amp *
            (Math.sin(x * 0.0072 + t * 0.9 + fase) * 0.5 +
              Math.sin(x * 0.0185 - t * 1.6 + fase * 1.7) * 0.32 +
              Math.sin(x * 0.043 + t * 2.7 + fase * 0.6) * 0.18);
        pts.push([x, y]);
      }
      const borde = arriba ? 0 : ALTO;
      let d = `M0,${borde} L0,${pts[0][1].toFixed(2)}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        d += ` Q${x0.toFixed(1)},${y0.toFixed(2)} ${((x0 + x1) / 2).toFixed(1)},${((y0 + y1) / 2).toFixed(2)}`;
      }
      d += ` L${ANCHO},${pts[N][1].toFixed(2)} L${ANCHO},${borde} Z`;
      return d;
    };

    const dibujar = () => {
      const amp = 9 + agitacion * 26;
      const base = arriba ? 42 : 58;
      frente.current?.setAttribute("d", camino(0, base, amp));
      fondo.current?.setAttribute("d", camino(2.1, base + (arriba ? 12 : -12), amp * 1.15));
    };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const objetivo = Math.min(1, Math.abs(velocidad.get()) / 2200);
      // se agita rápido y se calma despacio
      agitacion += (objetivo - agitacion) * Math.min(1, dt * (objetivo > agitacion ? 6 : 1.2));
      t += dt * (1 + agitacion * 2.5);
      dibujar();
      raf = requestAnimationFrame(loop);
    };

    dibujar();
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [lado, reduce, velocidad]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="none"
      aria-hidden
      className={"pointer-events-none block w-full fill-ink " + className}
    >
      <path ref={fondo} opacity="0.14" />
      <path ref={frente} />
    </svg>
  );
}
