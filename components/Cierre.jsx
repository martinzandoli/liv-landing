"use client";

import SignupForm from "./SignupForm";
import { NAV, enlace } from "./Header";
import { Headline, Reveal } from "./motion";

export default function Cierre({ base = "" }) {
  return (
    <footer className="overflow-hidden bg-white text-ink">
      <section id="lista" className="mx-auto max-w-[1240px] px-5 pb-20 pt-24 md:px-8 md:pb-28 md:pt-36">
        <p className="rotulo text-muted">Lista de espera</p>
        <Headline
          className="mt-5 text-[clamp(56px,10vw,152px)] font-extrabold leading-[0.88] tracking-[-0.045em]"
          parts={["Sumate a la", { t: "lista.", it: true }]}
        />
        <div className="mt-10 grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_auto]">
          <Reveal>
            <SignupForm cta="Avisame" hint="Te escribimos una vez, cuando salga Raspberry. Nada más." />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[20rem] text-[15px] leading-relaxed text-ink/55 md:text-right">
              Estamos en la etapa final de desarrollo. La lista se entera primero.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="grid grid-cols-2 gap-8 border-t border-ink/10 py-10 text-[14px] md:grid-cols-4">
          <div>
            <p className="rotulo text-ink/45">Secciones</p>
            <ul className="mt-4 space-y-2">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <a href={enlace(href, base)} className="text-ink/70 transition-colors hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo text-ink/45">LIV</p>
            <ul className="mt-4 space-y-2 text-ink/70">
              <li>Energy drink con gas</li>
              <li>Lata sleek 355 mL</li>
              <li>Hecho en Argentina</li>
            </ul>
          </div>
          <div className="col-span-2">
            <p className="rotulo text-ink/45">Importante</p>
            <p className="mt-4 max-w-[30rem] leading-relaxed text-ink/60">
              Contiene cafeína (100 mg por lata). No recomendado para niñas, niños, personas embarazadas o en período de lactancia, ni
              personas sensibles a la cafeína.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 py-6 text-[12px] text-ink/45">
          <span>© {new Date().getFullYear()} LIV</span>
          <span className="rotulo">Disciplina × disfrute</span>
        </div>
      </div>
    </footer>
  );
}
