"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Logo from "./Logo";
import { EASE, Headline, Reveal } from "./motion";

const PUNTOS = [
  { r: "Del té", t: "Es el aminoácido característico de las hojas de té, donde ya viene junto a la cafeína." },
  { r: "En equipo", t: "En LIV van juntas: 150 mg de L-teanina por cada 100 mg de cafeína." },
  { r: "Sin sacudón", t: "La cafeína pone la energía; la L-teanina la acompaña para que se sienta más pareja." },
];

/* La L-teanina en primer plano: dos círculos (áreas proporcionales a los mg) que se juntan con el scroll */
export default function Teanina() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "center 0.5"] });
  const leftX = useTransform(scrollYProgress, [0, 1], reduce ? ["18%", "18%"] : ["-6%", "18%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], reduce ? ["-14%", "-14%"] : ["10%", "-14%"]);
  const logoOpacity = useTransform(scrollYProgress, [0.75, 1], [reduce ? 1 : 0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.75, 1], [reduce ? 1 : 0.6, 1]);

  return (
    <section ref={ref} id="teanina" className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-14 px-5 py-24 md:px-8 md:py-36 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="rotulo text-white/55">Por qué L-teanina</p>
          <Headline
            className="mt-4 text-[clamp(40px,5.4vw,76px)] font-extrabold leading-[0.95] tracking-[-0.035em]"
            parts={["La cafeína pone la energía. La L-teanina, la", { t: "calma.", it: true }]}
          />
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-[30rem] text-[18px] leading-relaxed text-white/70">
              Es el ingrediente que hace a LIV distinta de un energizante común. Un aminoácido que está naturalmente en el té, sumado en
              serio: 150 mg por lata.
            </p>
          </Reveal>
          <ul className="mt-10 border-t border-white">
            {PUNTOS.map((p, i) => (
              <motion.li
                key={p.r}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.08 }}
                className="grid grid-cols-[120px_1fr] gap-4 border-b border-white/15 py-5 md:grid-cols-[150px_1fr]"
              >
                <span className="rotulo pt-1 text-white">{p.r}</span>
                <span className="text-[16px] leading-relaxed text-white/70">{p.t}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Diagrama: áreas proporcionales (150 mg = 1,5 × el área de 100 mg) */}
        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="relative aspect-[1.25/1] w-full">
            <motion.div
              style={{ x: leftX }}
              className="absolute left-0 top-1/2 aspect-square w-[46%] -translate-y-1/2 rounded-full bg-white"
            />
            <motion.div
              style={{ x: rightX }}
              className="absolute right-0 top-1/2 aspect-square w-[56.3%] -translate-y-1/2 rounded-full bg-white mix-blend-difference"
            />
            <motion.div
              style={{ opacity: logoOpacity, scale: logoScale }}
              className="absolute left-[38.5%] top-1/2 w-[13%] -translate-y-1/2"
            >
              <Logo className="h-auto w-full text-white" />
            </motion.div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="rotulo text-white/55">Cafeína</p>
              <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.02em] md:text-[44px]">
                100<span className="ml-0.5 text-[0.45em] font-semibold">mg</span>
              </p>
            </div>
            <div className="text-right">
              <p className="rotulo text-white/55">L-teanina</p>
              <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.02em] md:text-[44px]">
                150<span className="ml-0.5 text-[0.45em] font-semibold">mg</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-white/45">El tamaño de cada círculo es proporcional a los miligramos por lata.</p>
        </div>
      </div>
    </section>
  );
}
