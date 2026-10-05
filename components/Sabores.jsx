"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { whatsapp } from "@/lib/contacto";
import { EASE, Reveal } from "./motion";

// Para proponer el próximo sabor por WhatsApp (todavía no hay un segundo sabor definido)
const PROPONER = whatsapp("Hola LIV, el próximo sabor tendría que ser: ");

export default function Sabores() {
  const reduce = useReducedMotion();
  return (
    <section id="sabores" className="bg-surface">
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-36">
        <p className="rotulo text-muted">Sabores</p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
          <RaspberryCard />
          <Reveal delay={0.1} className="h-full">
            <div className="flex h-full flex-col gap-8 rounded-[6px] bg-white p-7 md:p-8">
              <p className="rotulo text-muted">Lo que viene</p>
              <div className="grid flex-1 place-items-center py-2">
                <LataPorVenir reduce={reduce} className="h-48 sm:h-56 lg:h-60" />
              </div>
              <div>
                <h3 className="text-[clamp(30px,3vw,40px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
                  ¿Qué sabor <span className="it font-normal">sigue?</span>
                </h3>
                <p className="mt-4 max-w-[26rem] text-[15.5px] leading-relaxed text-ink/65">
                  Raspberry es el primero y, por ahora, el único. El próximo todavía no está decidido: contanos cuál te gustaría probar.
                </p>
                <a
                  href={PROPONER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-[14px] font-semibold transition-colors duration-300 hover:bg-ink hover:text-white"
                >
                  Proponé un sabor
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function RaspberryCard() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 18 });
  const tx = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 18 });

  function onMove(e) {
    if (reduce) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="relative flex flex-col overflow-hidden rounded-[6px] bg-rasp-cream text-rasp sm:block sm:min-h-[560px] md:min-h-[600px]"
      style={{ perspective: 1000 }}
    >
      {/* Lata: ocupa la mitad derecha, con un círculo bordó detrás */}
      <div className="relative order-2 h-[420px] w-full sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[44%]">
        <motion.div
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          className="absolute left-1/2 top-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rasp sm:w-[118%]"
        />
        <div aria-hidden className="absolute bottom-[4%] left-1/2 h-[5%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[rgba(40,5,20,0.35)] blur-xl" />
        <motion.div style={{ rotateX: rx, rotateY: ry, x: tx }} className="absolute inset-x-0 inset-y-[6%]">
          <Image
            src="/can/real/lata-frente.webp"
            alt="Lata de LIV Raspberry, 355 mL"
            fill
            sizes="(min-width: 1024px) 26vw, 50vw"
            className="object-contain"
          />
        </motion.div>
      </div>

      <div className="relative z-10 order-1 flex flex-col justify-between gap-10 p-7 sm:h-full sm:min-h-[inherit] sm:w-[62%] md:p-10">
        <h3 className="it text-[clamp(52px,6.4vw,100px)] leading-[0.9] tracking-[-0.03em]">Raspberry</h3>
        <div className="flex flex-col items-start gap-6">
          <p className="text-[26px] font-extrabold leading-none tracking-[-0.02em] md:text-[30px]">Frambuesa</p>
          <a
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-full bg-rasp px-6 py-3 text-[14px] font-semibold text-rasp-cream transition-transform duration-300 hover:scale-[1.03]"
          >
            Ver los packs <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </motion.article>
  );
}

/* Lata "por venir": la lata real en blanco, sin etiqueta impresa, con un signo de pregunta.
   No anticipa ningún sabor. */
function LataPorVenir({ reduce, className = "" }) {
  return (
    <motion.div
      aria-hidden
      className={"relative aspect-[538/1396] " + className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/can/real/lata-blanca.webp" alt="" fill sizes="120px" className="object-contain" />
        <span className="it absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 text-[clamp(44px,4vw,60px)] leading-none text-ink/70">
          ?
        </span>
      </motion.div>
      <div className="absolute -bottom-[3%] left-1/2 h-[4%] w-[90%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.22),transparent)] blur-[3px]" />
    </motion.div>
  );
}
