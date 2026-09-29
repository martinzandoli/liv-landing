"use client";

import { VelocityRow } from "./Marquee";
import { Headline, Reveal } from "./motion";

const FILA_1 = ["Me muevo", "Me cuido", "Disfruto", "Tengo buen gusto", "Entreno", "Trabajo", "Estudio"];
const FILA_2 = ["Esto me representa", "Pilates", "Running", "Funcional", "Yoga", "Oficina", "Me gusta este lifestyle"];

export default function Comunidad() {
  return (
    <section className="overflow-hidden bg-ink py-24 text-white md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <p className="rotulo text-white/55">Señal de identidad</p>
        <Headline
          className="mt-5 text-[clamp(52px,9.6vw,150px)] font-extrabold uppercase leading-[0.86] tracking-[-0.03em]"
          parts={["Soy parte", "de esto."]}
          stagger={0.09}
        />
      </div>

      <div className="mt-14 space-y-3 md:mt-20 md:space-y-4">
        <VelocityRow baseVelocity={-1.4}>
          {FILA_1.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </VelocityRow>
        <VelocityRow baseVelocity={1.4}>
          {FILA_2.map((t) => (
            <Chip key={t} alt>
              {t}
            </Chip>
          ))}
        </VelocityRow>
      </div>

      <div className="mx-auto mt-14 flex max-w-[1240px] flex-wrap items-end justify-between gap-8 px-5 md:mt-20 md:px-8">
        <Reveal>
          <p className="max-w-[34rem] text-[18px] leading-relaxed text-white/70 md:text-[20px]">
            Es lo que dice una LIV en la mano: que te movés, que te cuidás y que lo disfrutás. Si te sentís parte, sumate a la lista y
            enterate primero.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <a
            href="#lista"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[15px] font-semibold text-ink transition-transform duration-300 hover:scale-[1.03]"
          >
            Quiero ser parte
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Chip({ children, alt = false }) {
  return (
    <span
      className={
        "mx-1.5 inline-flex items-center rounded-full px-6 py-3 text-[clamp(18px,2.2vw,30px)] font-semibold tracking-[-0.01em] md:mx-2 md:px-8 md:py-4 " +
        (alt ? "border border-white/30 text-white" : "bg-white text-ink")
      }
    >
      {children}
    </span>
  );
}
