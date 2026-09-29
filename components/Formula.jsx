"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, Ficha, Headline, Reveal } from "./motion";

const INGREDIENTES = [
  { n: "01", name: "Agua con gas", d: "La base. Burbuja fina, para tomarla bien fría.", v: "Base" },
  { n: "02", name: "Saborizante", d: "Frambuesa: seca, fresca, nada empalagosa.", v: "Raspberry" },
  { n: "03", name: "Ácido cítrico", d: "El punto ácido que la hace refrescante.", v: "Cítrico" },
  { n: "04", name: "Cafeína", d: "Más o menos lo que tiene una taza de café.", v: "100 mg" },
  { n: "05", name: "L-teanina", d: "El aminoácido del té. Acompaña a la cafeína para que la energía llegue sin sacudón.", v: "150 mg" },
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
            parts={["Cinco ingredientes. Los", { t: "contamos", it: true }, "todos."]}
          />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-[26rem] text-[17px] leading-relaxed text-ink/65">
              Sin letra chica: esto es todo lo que tiene una lata de LIV. Datos que se pueden verificar, no promesas.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10">
            <Ficha size="lg" items={[{ r: "Azúcar", v: 0, u: "g" }, { r: "Kcal", v: 0 }, { r: "Lata", v: 355, u: "mL" }]} />
          </Reveal>
        </div>

        <ol className="border-t border-ink">
          {INGREDIENTES.map((x, i) => (
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
                  {x.v === "Raspberry" ? <span className="it font-normal">{x.v}</span> : x.v}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
