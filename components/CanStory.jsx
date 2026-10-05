"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Headline } from "./motion";

// El fondo del video es el mismo gris de la sección; igual se difuminan los cuatro bordes para que no
// se note el corte en ninguna pantalla (cada navegador decodifica el color un poco distinto)
const BORDES = [
  "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
  "linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent)",
].join(", ");
const BORDES_SUAVES = {
  WebkitMaskImage: BORDES,
  maskImage: BORDES,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

/* Transición: el título y la lata con agua real fluyendo alrededor (video en loop, sin sonido).
   El video se reproduce sólo mientras está en pantalla; con "reducir movimiento" queda el póster. */
export default function CanStory() {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // entra un poco más grande y se asienta; al irse se aleja apenas
  const escala = useTransform(scrollYProgress, [0, 0.38, 0.62, 1], reduce ? [1, 1, 1, 1] : [1.14, 1, 1, 0.96]);
  const opacidad = useTransform(scrollYProgress, [0.05, 0.3], reduce ? [1, 1] : [0, 1]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;
    v.muted = true;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.1 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section id="lata" ref={ref} className="relative h-[180vh] bg-[#e9ebea]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Video: en apaisado ocupa la derecha y se funde con el fondo; en vertical, debajo del título */}
        <motion.div
          style={{ scale: escala, opacity: opacidad }}
          className="absolute inset-x-0 bottom-0 top-[34%] wide:inset-y-0 wide:left-[30%] wide:right-[-6%] wide:top-0"
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            style={BORDES_SUAVES}
            poster="/video/agua-v2-h.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            <source src="/video/agua-v2-h.mp4" type='video/mp4; codecs="avc1.640028"' />
            <source src="/video/agua-v2-h.webm" type='video/webm; codecs="vp9"' />
          </video>
        </motion.div>

        <div className="pointer-events-none relative mx-auto grid h-full w-full max-w-[1240px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)] px-5 pb-6 pt-[84px] md:px-8 md:pt-[96px] 2xl:max-w-[1560px] wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] wide:grid-rows-1 wide:gap-x-10 wide:pb-10">
          <div className="wide:self-center">
            <Headline
              className="text-[clamp(34px,min(10vw,6svh),56px)] font-extrabold leading-[0.95] tracking-[-0.035em] wide:text-[clamp(40px,min(5.6vw,10svh),112px)]"
              parts={["Todo lo que", { br: "hidden wide:block" }, "necesitás.", { br: true }, { t: "Nada", it: true }, "más."]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
