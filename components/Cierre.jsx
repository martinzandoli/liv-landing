"use client";

import SignupForm from "./SignupForm";
import { NAV, enlace } from "./Header";
import { Headline, Reveal } from "./motion";
import { REDES, WHATSAPP, IconoWhatsApp } from "./Redes";

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
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-ink/10 py-10 text-[14px] md:grid-cols-[1fr_1fr_1.1fr_1.5fr]">
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
          <div>
            <p className="rotulo text-ink/45">Seguinos</p>
            <ul className="mt-4 space-y-2.5">
              {REDES.map(({ red, usuario, href, Icono }) => (
                <li key={red}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${red}: ${usuario}`}
                    className="group inline-flex items-center gap-3 text-ink/70 transition-colors hover:text-ink"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                      <Icono className="h-[15px] w-[15px]" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold leading-tight text-ink">{red}</span>
                      <span className="block text-[12.5px] leading-tight text-ink/55">{usuario}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="rotulo text-ink/45">Escribinos</p>
            <a
              href={WHATSAPP.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex max-w-[24rem] items-center gap-4 rounded-[6px] bg-ink p-4 pr-5 text-white transition-transform duration-300 hover:scale-[1.02]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink">
                <IconoWhatsApp className="h-[22px] w-[22px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">WhatsApp</span>
                <span className="block whitespace-nowrap text-[17px] font-bold tabular-nums tracking-[-0.01em]">{WHATSAPP.numero}</span>
              </span>
              <span aria-hidden className="ml-auto text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
            <p className="mt-3 text-[13px] leading-relaxed text-ink/55">Pedidos, dudas o propuestas: respondemos por acá.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-3 border-t border-ink/10 py-8 md:grid-cols-[auto_1fr] md:gap-10">
          <p className="rotulo text-ink/45">Importante</p>
          <p className="max-w-[46rem] text-[13px] leading-relaxed text-ink/60">
            Contiene cafeína (100 mg por lata). No recomendado para niñas, niños, personas embarazadas o en período de lactancia, ni
            personas sensibles a la cafeína.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 py-6 text-[12px] text-ink/45">
          <span>© {new Date().getFullYear()} LIV</span>
          <div className="flex items-center gap-1">
            {REDES.map(({ red, href, Icono }) => (
              <a
                key={red}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={red}
                className="grid h-9 w-9 place-items-center rounded-full text-ink/55 transition-colors hover:text-ink"
              >
                <Icono className="h-[15px] w-[15px]" />
              </a>
            ))}
            <a
              href={WHATSAPP.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-full text-ink/55 transition-colors hover:text-ink"
            >
              <IconoWhatsApp className="h-[16px] w-[16px]" />
            </a>
          </div>
          <span className="rotulo">Disciplina × disfrute</span>
        </div>
      </div>
    </footer>
  );
}
