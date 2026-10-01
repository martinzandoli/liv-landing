"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import EnergiaTiempo from "./EnergiaTiempo";
import Logo from "./Logo";
import { Headline, Reveal } from "./motion";

/* La L-teanina en primer plano: dos círculos (áreas proporcionales a los mg) que se juntan con el scroll */
export default function Teanina() {
  const reduce = useReducedMotion();
  const diagrama = useRef(null);
  // La animación va atada al diagrama (no a toda la sección): se completa apenas está bien en pantalla
  const { scrollYProgress } = useScroll({ target: diagrama, offset: ["start 0.95", "start 0.45"] });
  const leftX = useTransform(scrollYProgress, [0, 1], reduce ? ["20%", "20%"] : ["-8%", "20%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], reduce ? ["-20%", "-20%"] : ["8%", "-20%"]);
  const logoOpacity = useTransform(scrollYProgress, [0.75, 1], [reduce ? 1 : 0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.75, 1], [reduce ? 1 : 0.6, 1]);

  return (
    <section id="teanina" className="bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-36">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="rotulo text-white/55">Por qué L-teanina</p>
            <Headline
              className="mt-4 text-[clamp(40px,5.4vw,76px)] font-extrabold leading-[0.95] tracking-[-0.035em]"
              parts={["La cafeína pone la energía. La L-teanina, la", { t: "calma.", it: true }]}
            />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-[30rem] text-pretty text-[18px] leading-relaxed text-white/70">
                Es lo que hace a LIV distinta de un energizante común: la L-⁠teanina, un aminoácido natural del té verde,
                acompaña a la cafeína para que la energía llegue con calma.
              </p>
            </Reveal>
          </div>

          {/* Diagrama: áreas proporcionales (200 mg = 2 × el área de 100 mg) */}
          <div ref={diagrama} className="relative mx-auto w-full max-w-[560px]">
            <div className="relative aspect-[1.25/1] w-full">
              <motion.div
                style={{ x: leftX }}
                className="absolute left-0 top-1/2 aspect-square w-[40%] -translate-y-1/2 rounded-full bg-white"
              />
              <motion.div
                style={{ x: rightX }}
                className="absolute right-0 top-1/2 aspect-square w-[56.6%] -translate-y-1/2 rounded-full bg-white mix-blend-difference"
              />
              <motion.div
                style={{ opacity: logoOpacity, scale: logoScale }}
                className="absolute left-[34.5%] top-1/2 w-[11%] -translate-y-1/2"
              >
                <Logo className="h-auto w-full text-white" />
              </motion.div>
            </div>
            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-6">
              <div>
                <p className="rotulo text-white/55">Cafeína</p>
                <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.02em] md:text-[44px]">
                  100<span className="ml-0.5 text-[0.45em] font-semibold">mg</span>
                </p>
              </div>
              <div className="pb-1 text-center">
                <p className="rotulo text-white/55">Proporción</p>
                <p className="mt-1 text-[22px] font-extrabold leading-none md:text-[26px]">1:2</p>
              </div>
              <div className="text-right">
                <p className="rotulo text-white/55">L-teanina</p>
                <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.02em] md:text-[44px]">
                  200<span className="ml-0.5 text-[0.45em] font-semibold">mg</span>
                </p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-white/45">El tamaño de cada círculo es proporcional a los miligramos por lata.</p>
          </div>
        </div>
        <EnergiaTiempo />
      </div>
    </section>
  );
}
