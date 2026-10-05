"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import LataReal from "./LataReal";
import SignupForm from "./SignupForm";
import Logo from "./Logo";
import { EASE, Ficha, Reveal } from "./motion";

const RING = "ENERGÍA · FOCO · CALMA · ";
const RING_LEN = 2 * Math.PI * 182; // perímetro del círculo del anillo

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const spin = useTransform(scrollYProgress, [0, 1], [0, 3.2]);
  const stageY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const ringScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.18]);

  return (
    <section ref={ref} id="top" className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 px-5 pb-16 pt-10 md:px-8 lg:min-h-[calc(100svh-110px)] lg:grid-cols-[1.08fr_0.92fr] lg:grid-rows-[1fr_auto] lg:gap-x-10 lg:pb-20 lg:pt-12">
        {/* Titular */}
        <div className="flex flex-col justify-end lg:pb-2">
          <Reveal immediate delay={0.05} y={12}>
            <p className="rotulo text-muted">
              Energy drink <span className="mx-1.5">·</span> 355 mL
            </p>
          </Reveal>
          {/* ENERGÍA / LIV + IANA: el logo arma la palabra "liviana" */}
          <h1 aria-label="Energía liviana" className="mt-5 uppercase leading-none">
            <span aria-hidden className="block overflow-hidden pt-[0.14em]">
              <motion.span
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                className="block text-[clamp(50px,8vw,114px)] font-extrabold tracking-[-0.03em]"
              >
                Energía
              </motion.span>
            </span>
            <span aria-hidden className="mt-[0.06em] block overflow-hidden pb-[0.06em] text-[clamp(52px,8.4vw,120px)]">
              <motion.span
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.27 }}
                className="inline-block"
              >
                <Logo title="" className="mr-[0.06em] inline-block h-[0.72em] w-auto align-baseline" />
              </motion.span>
              <motion.span
                initial={reduce ? false : { y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.39 }}
                className="inline-block font-extralight tracking-[-0.02em]"
              >
                iana
              </motion.span>
            </span>
          </h1>
        </div>

        {/* Lata */}
        <motion.div
          style={{ y: stageY }}
          className="relative mx-auto my-6 aspect-[4/5] w-full max-w-[460px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:my-0 lg:aspect-auto lg:h-full lg:max-w-none"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            style={{ scale: ringScale }}
            className="absolute left-1/2 top-1/2 aspect-square w-[96%] max-w-[640px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="absolute inset-[9%] rounded-full bg-surface" />
            <svg viewBox="0 0 400 400" className="spin-slow absolute inset-0 h-full w-full text-ink/55" aria-hidden>
              <defs>
                <path id="ring" d="M200,200 m-182,0 a182,182 0 1,1 364,0 a182,182 0 1,1 -364,0" />
              </defs>
              <text className="fill-current text-[13.2px] font-semibold tracking-[0.34em]">
                <textPath href="#ring" textLength={RING_LEN} lengthAdjust="spacing">
                  {RING.repeat(4)}
                </textPath>
              </text>
            </svg>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.45 }}
            className="absolute inset-x-0 bottom-[9%] top-[4%]"
          >
            <LataReal spin={spin} className="h-full w-full" sway={0.3} settle priority sizes="(min-width: 1024px) 22vw, 45vw" />
          </motion.div>
          <p className="rotulo pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-muted/80">
            ← Arrastrá para girar →
          </p>
        </motion.div>

        {/* Bajada, formulario y ficha */}
        <div className="lg:col-start-1 lg:row-start-2">
          <Reveal immediate delay={0.55} className="mt-8 lg:mt-10">
            <p className="max-w-[30rem] text-pretty text-[18px] leading-relaxed text-ink/70 md:text-[19px]">
              Cero azúcar y cero calorías. Todo lo que necesitás para tu día.
            </p>
          </Reveal>
          <Reveal immediate delay={0.65} className="mt-7">
            <SignupForm />
          </Reveal>
          <Reveal immediate delay={0.8} className="mt-8">
            <Ficha
              items={[
                { r: "Cafeína", v: 100, u: "mg" },
                { r: "L-teanina", v: 200, u: "mg" },
                { r: "Azúcar", v: 0, u: "g" },
                { r: "Kcal", v: 0 },
              ]}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
