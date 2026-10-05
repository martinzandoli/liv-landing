"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, Headline, Reveal } from "./motion";

const PUNTOS = [
  {
    rotulo: "El problema",
    titulo: "Energía que después se cobra.",
    texto:
      "Los energizantes de siempre suben de golpe y después te bajan. Mucha azúcar, latas que gritan y una idea de energía pensada para el exceso, no para un día normal.",
  },
  {
    rotulo: "El objetivo",
    titulo: "Energía para tu día real.",
    texto:
      "Acompañarte en la oficina, el entrenamiento, el estudio o lo que tengas por delante. Cafeína con L-⁠teanina para que la energía llegue con calma, sin azúcar y sin calorías.",
  },
  {
    rotulo: "Por qué lo hacemos",
    titulo: "Disciplina y disfrute van juntos.",
    texto:
      "Creemos que cuidarte no tiene que ser aburrido ni extremo. Queremos que elegir bien sea simple, rico y algo que te dé gusto llevar en la mano.",
  },
];

/* Qué es LIV: el problema que vimos, qué viene a hacer y por qué lo hacemos */
export default function QueEsLiv() {
  const reduce = useReducedMotion();
  return (
    <section id="que-es" className="bg-white text-ink">
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-36">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="rotulo text-muted">Qué es LIV</p>
            <Headline
              className="mt-5 text-[clamp(44px,5.6vw,84px)] font-extrabold leading-[0.93] tracking-[-0.04em]"
              parts={["Hicimos el energizante que", { t: "queríamos", it: true }, "tomar."]}
            />
            <Reveal delay={0.15}>
              <p className="mt-7 max-w-[30rem] text-pretty text-[18px] leading-relaxed text-ink/65 md:text-[19px]">
                LIV es una marca argentina que nace de una pregunta simple: ¿por qué tomar energía tenía que ser sinónimo de azúcar,
                picos y bajones?
              </p>
            </Reveal>
          </div>

          <ol className="flex flex-col">
            {PUNTOS.map((p, i) => (
              <li key={p.rotulo} className="relative pb-12 pt-8 last:pb-0 md:pb-16 md:pt-10">
                <motion.span
                  aria-hidden
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 1.1, ease: EASE }}
                  className="absolute inset-x-0 top-0 h-px origin-left bg-ink/15"
                />
                <Reveal y={22}>
                  <div className="grid grid-cols-[52px_1fr] gap-x-5 md:grid-cols-[84px_1fr] md:gap-x-8">
                    <span className="it text-[clamp(40px,4.4vw,64px)] leading-[0.8] text-ink/25">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="rotulo text-muted">{p.rotulo}</p>
                      <h3 className="mt-3 text-[clamp(26px,2.6vw,36px)] font-extrabold leading-[1.02] tracking-[-0.03em]">{p.titulo}</h3>
                      <p className="mt-4 max-w-[32rem] text-pretty text-[16.5px] leading-relaxed text-ink/65">{p.texto}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-ink pt-10 md:mt-28 md:flex-row md:items-end md:justify-between md:pt-12">
          <Headline
            as="p"
            className="text-[clamp(38px,6.4vw,96px)] font-extrabold leading-[0.92] tracking-[-0.04em]"
            parts={["Energía es ritmo,", { br: "hidden md:block" }, "no", { t: "volumen.", it: true }]}
          />
          <p className="rotulo shrink-0 text-muted md:pb-3">
            Disciplina <span className="cross mx-1 text-[13px]">×</span> disfrute
          </p>
        </div>
      </div>
    </section>
  );
}
