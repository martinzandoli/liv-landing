"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, Headline } from "./motion";

const FAQ = [
  {
    q: "¿Qué es LIV?",
    a: "Un energy drink con gas, en lata sleek de aluminio de 355 mL. Cada lata tiene 100 mg de cafeína y 150 mg de L-teanina, sin azúcar y sin calorías.",
  },
  {
    q: "¿Cuánta cafeína tiene?",
    a: "100 mg por lata, más o menos lo que tiene una taza de café. No está recomendado para niñas, niños, personas embarazadas o en período de lactancia, ni para personas sensibles a la cafeína.",
  },
  {
    q: "¿Qué es la L-teanina?",
    a: "Un aminoácido que está naturalmente en las hojas de té, donde viene junto a la cafeína. En LIV la sumamos para acompañar a la cafeína: 150 mg de L-teanina por cada 100 mg de cafeína, para una energía más pareja y sin sacudón.",
  },
  {
    q: "¿Qué ingredientes tiene?",
    a: "Agua con gas, saborizante, ácido cítrico, cafeína y L-teanina. Nada más.",
  },
  {
    q: "¿Tiene azúcar o calorías?",
    a: "No. Cero azúcar y cero calorías.",
  },
  {
    q: "¿Va a haber más sabores?",
    a: "Sí. Sacamos uno a la vez y cada sabor sale después de la cata: si no pasa el corte, no sale. La lista de espera se entera primero.",
  },
  {
    q: "¿Cuándo sale?",
    a: "Estamos en la etapa final de desarrollo. Dejá tu email y te avisamos apenas esté disponible.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-5 py-24 md:px-8 md:py-36 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="rotulo text-muted">Preguntas</p>
          <Headline
            className="mt-4 text-[clamp(40px,5.6vw,76px)] font-extrabold leading-[0.95] tracking-[-0.035em]"
            parts={["Lo que", { t: "todos", it: true }, "preguntan."]}
          />
        </div>
        <div className="border-t border-ink">
          {FAQ.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-b border-ink/15">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                  >
                    <span className="text-[19px] font-semibold tracking-[-0.01em] md:text-[22px]">{q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className={
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[20px] font-light leading-none transition-colors duration-300 " +
                        (isOpen ? "border-ink bg-ink text-white" : "border-ink/25")
                      }
                      aria-hidden
                    >
                      +
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      key="a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[40rem] pb-7 text-[16px] leading-relaxed text-ink/65 md:text-[17px]">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
