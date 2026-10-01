"use client";

import { useRef } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";
import CanAgua from "./CanAgua";
import OlaAgua from "./OlaAgua";
import { Headline } from "./motion";

const REPOSO = -0.2; // ángulo de la lata quieta (casi de frente)
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/* Transición entre secciones: los bordes entran como agua y la lata, fría, gira y despide gotas.
   Al entrar da dos vueltas y frena de frente; al salir vuelve a girar. */
export default function CanStory() {
  const ref = useRef(null);
  const slotRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const giro = useTransform(scrollYProgress, (p) => {
    const entra = 1 - (1 - clamp01((p - 0.08) / 0.37)) ** 2; // frena al llegar
    const sale = clamp01((p - 0.6) / 0.36) ** 2; // arranca al irse
    return REPOSO - Math.PI * 4 * (1 - entra) + Math.PI * 3 * sale;
  });
  const spin = useSpring(giro, { stiffness: 70, damping: 20, mass: 0.6 });

  return (
    <section id="lata" ref={ref} className="relative h-[200vh] bg-surface py-[56px] md:py-[72px]">
      <OlaAgua lado="arriba" className="absolute inset-x-0 top-0 z-10 h-[56px] md:h-[72px]" />

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <CanAgua spin={spin} slotRef={slotRef} className="h-full w-full" />
        </div>

        {/* En vertical: título arriba y lata abajo; apaisado: título a la izquierda y lata a la derecha */}
        <div className="pointer-events-none relative mx-auto grid h-full w-full max-w-[1240px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)] px-5 pb-6 pt-[84px] md:px-8 md:pt-[96px] 2xl:max-w-[1560px] wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] wide:grid-rows-1 wide:gap-x-10 wide:pb-10">
          <div className="wide:self-center">
            <Headline
              className="text-[clamp(34px,min(10vw,6svh),56px)] font-extrabold leading-[0.95] tracking-[-0.035em] wide:text-[clamp(40px,min(5.6vw,10svh),112px)]"
              parts={["Todo lo que", { br: "hidden wide:block" }, "necesitás.", { br: true }, { t: "Nada", it: true }, "más."]}
            />
          </div>
          <div ref={slotRef} className="min-h-0" />
        </div>
      </div>

      <OlaAgua lado="abajo" className="absolute inset-x-0 bottom-0 z-10 h-[56px] md:h-[72px]" />
    </section>
  );
}
