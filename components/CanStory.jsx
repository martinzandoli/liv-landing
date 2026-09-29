"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Can3D from "./Can3D";
import { EASE, Headline } from "./motion";

const STEPS = [
  { k: "Con gas", v: "Burbuja fina", d: "Para tomarla bien fría, a cualquier hora del día.", side: "left" },
  { k: "Cafeína", v: "100 mg", d: "Más o menos lo que tiene una taza de café.", side: "right" },
  { k: "L-teanina", v: "150 mg", d: "El aminoácido del té que acompaña a la cafeína, para una energía más calma.", side: "left" },
  { k: "Azúcar", v: "0 g · 0 kcal", d: "Cero azúcar y cero calorías.", side: "right" },
  { k: "Formato", v: "Sleek 355\u00a0mL", d: "Lata de aluminio, liviana y reciclable.", side: "left" },
];

/* Sección fija: la lata gira con el scroll y los datos aparecen de a uno */
export default function CanStory() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Frente → costado → dorso (ingredientes) → costado → frente
  const raw = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [-0.25, 0.7, 2.6, 3.4, 5.2, 6.2]);
  const spin = useSpring(raw, { stiffness: 70, damping: 22, mass: 0.6 });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStep(Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length * 0.999))));
  });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const s = STEPS[step];

  return (
    <section id="lata" ref={ref} className="relative bg-surface" style={{ height: `${STEPS.length * 85 + 60}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 pt-20 md:absolute md:inset-x-0 md:top-0 md:px-8 md:pt-24">
          <p className="rotulo text-muted">La lata</p>
          <Headline
            className="mt-3 max-w-[12ch] text-[clamp(36px,4.8vw,68px)] font-extrabold leading-[0.95] tracking-[-0.035em]"
            parts={["Todo lo que necesitás.", { t: "Nada", it: true }, "más."]}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1240px] flex-1 px-5 md:px-8">
          {/* Lata al centro */}
          <div className="absolute inset-x-0 bottom-[22%] top-0 md:bottom-2 md:left-[16%] md:right-0 md:top-16">
            <Can3D spin={spin} autoRotate={false} interactive={false} initialAngle={0} className="h-full w-full" />
          </div>

          {/* Dato activo */}
          <div className="pointer-events-none absolute inset-x-5 bottom-8 md:inset-x-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease: EASE }}
                className={
                  "max-w-[340px] md:max-w-[300px] lg:max-w-[340px] " +
                  (s.side === "right" ? "md:ml-auto md:text-right" : "")
                }
              >
                <p className="rotulo text-muted">
                  {String(step + 1).padStart(2, "0")} <span className="mx-1">/</span> {s.k}
                </p>
                <p className="mt-2 text-[clamp(34px,4.4vw,60px)] font-extrabold leading-none tracking-[-0.03em]">{s.v}</p>
                <p className="mt-3 text-[16px] leading-snug text-ink/65 md:text-[17px]">{s.d}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progreso */}
        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-4 px-5 pb-6 md:px-8 md:pb-8">
          <div className="relative h-px flex-1 bg-ink/15">
            <motion.div style={{ width: bar }} className="absolute inset-y-0 left-0 bg-ink" />
          </div>
          <ol className="flex gap-3">
            {STEPS.map((x, i) => (
              <li
                key={x.k}
                className={"h-1.5 w-1.5 rounded-full transition-colors duration-300 " + (i <= step ? "bg-ink" : "bg-ink/20")}
              >
                <span className="sr-only">{x.k}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
