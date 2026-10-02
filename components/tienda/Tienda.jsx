"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { precioArs } from "@/lib/catalogo";
import SignupForm from "../SignupForm";
import { EASE, Headline, Reveal } from "../motion";
import { Cantidad, useCarrito } from "./Carrito";

export default function Tienda({ packs }) {
  const [sel, setSel] = useState("x12");
  const arriba = useRef(null);
  const pack = packs.find((p) => p.id === sel) || packs[0];

  const elegir = (id) => {
    setSel(id);
    const y = arriba.current.getBoundingClientRect().top + window.scrollY - 90;
    window.__lenis ? window.__lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <main>
      <Configurador ref={arriba} packs={packs} pack={pack} sel={sel} setSel={setSel} />
      <Packs packs={packs} sel={sel} elegir={elegir} />
    </main>
  );
}

function Configurador({ ref, packs, pack, sel, setSel }) {
  return (
    <section ref={ref} id="packs" className="bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-5 pb-20 pt-8 md:px-8 md:pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pb-28">
        {/* Foto: el pack elegido o la lata sola */}
        <Galeria pack={pack} />

        {/* Elección */}
        <div>
          <Reveal immediate y={12}>
            <p className="rotulo text-muted">Tienda</p>
          </Reveal>
          <Headline
            as="h1"
            immediate
            className="mt-4 text-[clamp(48px,6.4vw,92px)] font-extrabold leading-[0.92] tracking-[-0.04em]"
            parts={["Elegí tu", { t: "pack.", it: true }]}
          />

          <fieldset className="mt-9">
            <legend className="rotulo text-muted">Pack</legend>
            <div role="radiogroup" aria-label="Elegí el pack" className="mt-3 grid grid-cols-2 gap-2.5">
              {packs.map((p) => {
                const activo = p.id === sel;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setSel(p.id)}
                    className={
                      "flex flex-col items-start rounded-[10px] border-[1.5px] px-4 py-4 text-left transition-colors duration-300 " +
                      (activo ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-ink/50")
                    }
                  >
                    <span className="text-[28px] font-extrabold leading-none tracking-[-0.03em] md:text-[32px]">x{p.latas}</span>
                    <span className={"mt-2 text-[13px] font-semibold " + (activo ? "text-white" : "text-ink")}>{p.latas} latas</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Compra pack={pack} />

          <p className="mt-8 text-[13px] leading-relaxed text-muted">
            Pagás con tarjeta de crédito o débito, billetera virtual o transferencia. Contiene cafeína (100 mg por lata). No recomendado
            para niñas, niños, personas embarazadas o en período de lactancia, ni personas sensibles a la cafeína.
          </p>
        </div>
      </div>
    </section>
  );
}

function Galeria({ pack }) {
  const reduce = useReducedMotion();
  const [vista, setVista] = useState("pack");
  // al cambiar de pack se vuelve a mostrar el pack
  useEffect(() => setVista("pack"), [pack.id]);
  const fotos = {
    pack: { src: pack.img, alt: `${pack.nombre} de LIV Raspberry: ${pack.latas} latas` },
    lata: { src: "/tienda/lata-v5.jpg", alt: "Lata de LIV Raspberry de 355 mL" },
  };
  const foto = fotos[vista];
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="relative aspect-[16/13] overflow-hidden rounded-[6px] bg-surface">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={foto.src}
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 1.02, y: -12 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-x-0 bottom-0 top-[9%]"
          >
            <Image src={foto.src} alt={foto.alt} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-contain" />
          </motion.div>
        </AnimatePresence>
        {!pack.disponible && (
          <span className="absolute right-5 top-4 inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-semibold text-white md:right-6 md:top-5">
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Próximamente
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-3" role="group" aria-label="Fotos">
        {Object.entries(fotos).map(([k, f]) => (
          <button
            key={k}
            type="button"
            onClick={() => setVista(k)}
            aria-pressed={vista === k}
            aria-label={k === "pack" ? "Ver el pack" : "Ver la lata"}
            className={
              "relative h-20 w-24 overflow-hidden rounded-[6px] bg-surface outline-offset-2 transition-[outline-color] md:h-24 md:w-28 " +
              (vista === k ? "outline outline-[1.5px] outline-ink" : "outline outline-[1.5px] outline-transparent hover:outline-ink/30")
            }
          >
            <Image src={f.src} alt="" fill sizes="112px" className="object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Compra({ pack }) {
  const c = useCarrito();
  const [cantidad, setCantidad] = useState(1);

  if (!pack.disponible) {
    return (
      <div className="mt-8 rounded-[10px] bg-surface p-6 md:p-7">
        <p className="text-[22px] font-extrabold tracking-[-0.02em]">Sale pronto.</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink/65">
          Estamos en la etapa final de desarrollo. Dejanos tu email y te avisamos primero, con precio y fecha.
        </p>
        <SignupForm className="mt-5" cta="Avisame" hint="Te escribimos una vez, cuando salga. Nada más." />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          {pack.precioLista && <p className="text-[15px] text-muted line-through tabular-nums">{precioArs(pack.precioLista)}</p>}
          <p className="text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">{precioArs(pack.precio)}</p>
          <p className="mt-2 text-[14px] text-muted tabular-nums">{precioArs(Math.round(pack.precio / pack.latas))} por lata</p>
        </div>
        <Cantidad valor={cantidad} onChange={(n) => setCantidad(Math.max(1, Math.min(20, n)))} />
      </div>
      <button
        type="button"
        onClick={() => c.agregar(pack.id, cantidad)}
        className="mt-6 w-full rounded-full bg-ink py-4 text-[15px] font-semibold text-white transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
      >
        Agregar al carrito · {precioArs(pack.precio * cantidad)}
      </button>
    </div>
  );
}

function Packs({ packs, sel, elegir }) {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="titulo-packs" className="bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-32">
        <p className="rotulo text-white/55">LIV Raspberry</p>
        <Headline
          id="titulo-packs"
          className="mt-4 text-[clamp(40px,5vw,72px)] font-extrabold leading-[0.95] tracking-[-0.04em]"
          parts={["Dos packs,", "una", { t: "lata.", it: true }]}
        />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {packs.map((p, i) => (
            <motion.article
              key={p.id}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              className="group flex flex-col overflow-hidden rounded-[6px] bg-white text-ink"
            >
              <div className="relative aspect-[16/13] bg-surface">
                <Image
                  src={p.img}
                  alt={`${p.nombre}: ${p.latas} latas de LIV Raspberry`}
                  fill
                  sizes="(min-width: 768px) 400px, 100vw"
                  className="object-contain transition-transform duration-700 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-5 p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[28px] font-extrabold leading-none tracking-[-0.03em]">{p.nombre}</h3>
                    <p className="mt-2 text-[14px] text-muted">
                      {p.latas} latas
                    </p>
                  </div>
                  <p className="text-right text-[15px] font-semibold tabular-nums">{p.disponible ? precioArs(p.precio) : "Próximamente"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => elegir(p.id)}
                  aria-pressed={p.id === sel}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-ink py-3 text-[14px] font-semibold transition-colors duration-300 hover:bg-ink hover:text-white"
                >
                  {p.id === sel ? "Elegido" : "Elegir este pack"} <span aria-hidden>→</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
