"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Logo from "./Logo";
import SignupForm from "./SignupForm";
import { NAV } from "./Header";
import { Headline, Reveal } from "./motion";

export default function Cierre() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const logoY = useTransform(scrollYProgress, [0.4, 1], [reduce ? "0%" : "35%", "0%"]);

  return (
    <footer ref={ref} className="overflow-hidden bg-ink text-white">
      <section id="lista" className="mx-auto max-w-[1240px] px-5 pb-20 pt-24 md:px-8 md:pb-28 md:pt-36">
        <p className="rotulo text-white/55">Lista de espera</p>
        <Headline
          className="mt-5 text-[clamp(56px,10vw,152px)] font-extrabold leading-[0.88] tracking-[-0.045em]"
          parts={["Sumate a la", { t: "lista.", it: true }]}
        />
        <div className="mt-10 grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_auto]">
          <Reveal>
            <SignupForm dark cta="Avisame" hint="Te escribimos una vez, cuando salga Raspberry. Nada más." />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[20rem] text-[15px] leading-relaxed text-white/55 md:text-right">
              Estamos en la etapa final de desarrollo. La lista se entera primero.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="grid grid-cols-2 gap-8 border-t border-white/15 py-10 text-[14px] md:grid-cols-4">
          <div>
            <p className="rotulo text-white/45">Secciones</p>
            <ul className="mt-4 space-y-2">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-white/75 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo text-white/45">LIV</p>
            <ul className="mt-4 space-y-2 text-white/75">
              <li>Energy drink con gas</li>
              <li>Lata sleek 355 mL</li>
              <li>Hecho en Argentina</li>
            </ul>
          </div>
          <div className="col-span-2">
            <p className="rotulo text-white/45">Importante</p>
            <p className="mt-4 max-w-[30rem] leading-relaxed text-white/60">
              Contiene cafeína (100 mg por lata). No recomendado para niñas, niños, personas embarazadas o en período de lactancia, ni
              personas sensibles a la cafeína.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1240px] px-5 md:px-8">
        <motion.div style={{ y: logoY }} className="pb-2 pt-4">
          <Logo className="h-auto w-full text-white" />
        </motion.div>
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[12px] text-white/45 md:px-8">
        <span>© {new Date().getFullYear()} LIV</span>
        <span className="rotulo">Disciplina × disfrute</span>
      </div>
    </footer>
  );
}
