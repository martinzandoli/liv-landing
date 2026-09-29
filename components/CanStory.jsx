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
  { k: "Cafeína", v: "100 mg", d: "Bloquea la adenosina, la señal de cansancio que se acumula durante el día.", big: true },
  {
    k: "L-teanina",
    v: "200 mg",
    d: "Aminoácido natural del té verde. Va en proporción 1:2 con la cafeína, la misma que usan los estudios sobre esta combinación.",
    big: true,
  },
  { k: "Azúcar", v: "0 g · 0 kcal", d: "Cero azúcar y cero calorías." },
  { k: "Formato", v: "Sleek 355\u00a0mL", d: "Lata de aluminio, liviana y reciclable." },
];

/* Sección fija: la lata gira con el scroll y los datos aparecen de a uno */
export default function CanStory() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Frente → costado → dorso (tabla con la L-teanina) → costado → frente
  const raw = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [-0.25, 1.2, 3.1, 4.6, 6.2]);
  const spin = useSpring(raw, { stiffness: 70, damping: 22, mass: 0.6 });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStep(Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length * 0.999))));
  });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const s = STEPS[step];

  return (
    <section id="lata" ref={ref} className="relative bg-surface" style={{ height: `${STEPS.length * 85 + 60}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Grilla: en vertical se apilan título / lata / dato / progreso; apaisado, tres columnas */}
        <div className="mx-auto grid h-full w-full max-w-[1240px] grid-cols-1 2xl:max-w-[1560px] grid-rows-[auto_minmax(0,1fr)_auto_auto] px-5 pb-5 pt-[76px] md:px-8 md:pt-[88px] wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] wide:grid-rows-[minmax(0,1fr)_auto] wide:gap-x-8 wide:pb-7">
          <div className="wide:col-start-1 wide:row-start-1 wide:self-center">
            <Headline
              className="text-[clamp(28px,min(8.6vw,5.2svh),48px)] font-extrabold leading-[0.95] tracking-[-0.035em] wide:max-w-[6.6em] wide:text-[clamp(30px,min(4vw,7svh),84px)]"
              parts={["Todo lo que necesitás.", { t: "Nada", it: true }, "más."]}
            />
          </div>

          {/* Lata */}
          <div className="relative min-h-0 wide:col-start-2 wide:row-start-1">
            <div className="absolute inset-0">
              <Can3D spin={spin} autoRotate={false} interactive={false} float={false} initialAngle={0} className="h-full w-full" />
            </div>
          </div>

          {/* Dato activo: alto fijo en vertical para que la lata no salte entre pasos */}
          <div className="relative h-[10rem] md:h-[11rem] wide:col-start-3 wide:row-start-1 wide:h-auto wide:self-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-x-0 top-1 wide:static wide:max-w-[30rem]"
              >
                <p className="rotulo text-muted">
                  {String(step + 1).padStart(2, "0")} <span className="mx-1">/</span> {s.k}
                </p>
                <p
                  className={
                    "mt-2 font-extrabold leading-none tracking-[-0.03em] " +
                    (s.big
                      ? "text-[clamp(40px,min(12vw,6.8svh),64px)] wide:text-[clamp(44px,min(6vw,10svh),120px)]"
                      : "text-[clamp(28px,min(8vw,4.6svh),44px)] wide:text-[clamp(28px,min(3.8vw,6.5svh),72px)]")
                  }
                >
                  {s.v}
                </p>
                <p className="mt-2.5 max-w-[26rem] text-pretty text-[15px] leading-snug text-ink/65 md:text-[17px] wide:mt-3 wide:text-[clamp(15px,min(1.25vw,2.2svh),22px)]">
                  {s.d}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progreso */}
          <div className="flex items-center gap-4 pt-3 wide:col-span-3 wide:row-start-2 wide:pt-4">
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
      </div>
    </section>
  );
}
