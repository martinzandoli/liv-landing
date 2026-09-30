"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, Ficha, Headline, Reveal } from "./motion";

/* Lo que define a LIV: los dos activos y lo que no tiene. No es la lista de ingredientes
   (esa va completa en la lata). */
const CLAVES = [
  { n: "01", name: "Cafeína", d: "Bloquea la adenosina, la señal de cansancio que se acumula durante el día.", v: "100 mg" },
  { n: "02", name: "L-teanina", d: "Aminoácido natural del té verde, asociado a un estado de alerta relajado.", v: "200 mg" },
  { n: "03", name: "Azúcar", d: "Ni un gramo.", v: "0 g" },
  { n: "04", name: "Calorías", d: "Liviana en serio.", v: "0 kcal" },
];

export default function Formula() {
  const reduce = useReducedMotion();
  return (
    <section id="formula" className="bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 py-24 md:px-8 md:py-36 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="rotulo text-muted">Fórmula</p>
          <Headline
            className="mt-4 text-[clamp(40px,5.6vw,76px)] font-extrabold leading-[0.95] tracking-[-0.035em]"
            parts={["Dos activos,", { t: "cero", it: true }, "azúcar."]}
          />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-[26rem] text-[17px] leading-relaxed text-ink/65">
              Cafeína y L-⁠teanina en proporción 1:2, sin azúcar y sin calorías. Datos que se pueden verificar, no promesas.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10">
            <Ficha size="lg" items={[{ r: "Proporción", v: "1:2" }, { r: "Lata", v: 355, u: "mL" }]} />
          </Reveal>
        </div>

        <ol className="border-t border-ink">
          {CLAVES.map((x, i) => (
            <motion.li
              key={x.n}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.04 }}
              className="group relative border-b border-ink/15"
            >
              <div className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-y-100" />
              <div className="relative grid grid-cols-[40px_1fr_auto] items-baseline gap-x-4 px-1 py-6 transition-colors duration-500 group-hover:text-white md:grid-cols-[56px_1fr_auto] md:px-4 md:py-8">
                <span className="rotulo text-muted transition-colors duration-500 group-hover:text-white/60">{x.n}</span>
                <div>
                  <h3 className="text-[clamp(26px,3.4vw,44px)] font-bold leading-none tracking-[-0.03em]">{x.name}</h3>
                  <p className="mt-2 text-[15px] text-ink/60 transition-colors duration-500 group-hover:text-white/70">{x.d}</p>
                </div>
                <span className="text-right text-[clamp(18px,2vw,26px)] font-extrabold tabular-nums tracking-[-0.02em]">
                  {x.v}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
