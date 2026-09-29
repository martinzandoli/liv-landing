"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { LOGO_PATH } from "./Logo";
import { EASE, Reveal } from "./motion";

/* Tonos de exploración del manual de marca: cada sabor cambia solo su tono y su fondo */
const PROXIMOS = [
  { tone: "#A2490F", cream: "#FDF6EC" },
  { tone: "#2C3A76", cream: "#F2F3FA" },
  { tone: "#5A2B70", cream: "#F8F2FA" },
  { tone: "#1E6560", cream: "#EFF7F5" },
];

export default function Sabores() {
  const reduce = useReducedMotion();
  return (
    <section id="sabores" className="bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-36">
        <p className="rotulo text-muted">Sabores</p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
          <RaspberryCard />
          <Reveal delay={0.1} className="h-full">
            <div className="flex h-full flex-col justify-between gap-8 rounded-[6px] bg-surface p-7 md:p-8">
              <p className="rotulo text-muted">Próximos sabores</p>
              <div className="grid flex-1 grid-cols-4 gap-2 lg:grid-cols-2 lg:gap-3">
                {PROXIMOS.map((s, i) => (
                  <motion.div
                    key={s.tone}
                    initial={reduce ? false : { opacity: 0, y: 30, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.08 }}
                    className="group grid place-items-center rounded-[6px] py-5 lg:py-6"
                    style={{ background: s.cream }}
                  >
                    <MiniCan
                      tone={s.tone}
                      cream={s.cream}
                      className="h-28 w-auto transition-transform duration-500 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:-translate-y-2 group-hover:rotate-[-4deg] sm:h-36 lg:h-40"
                    />
                  </motion.div>
                ))}
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
            src="/can/lata-raspberry-mate-v2.png"
            alt="Lata de LIV Raspberry, 355 mL"
            fill
            sizes="(min-width: 1024px) 26vw, 50vw"
            className="object-contain"
          />
        </motion.div>
      </div>

      <div className="relative z-10 order-1 flex flex-col justify-between gap-10 p-7 sm:h-full sm:min-h-[inherit] sm:w-[62%] md:p-10">
        <h3 className="it text-[clamp(52px,6.4vw,100px)] leading-[0.9] tracking-[-0.03em]">Raspberry</h3>
        <p className="text-[26px] font-extrabold leading-none tracking-[-0.02em] md:text-[30px]">Frambuesa</p>
      </div>
    </motion.article>
  );
}

/* Lata en miniatura (SVG) con la estructura de la etiqueta y el color del sabor */
function MiniCan({ tone, cream, className = "" }) {
  const id = tone.slice(1);
  return (
    <svg viewBox="0 0 64 160" className={className} aria-hidden>
      <defs>
        <linearGradient id={`al-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8f8f94" />
          <stop offset="0.3" stopColor="#ececef" />
          <stop offset="0.62" stopColor="#c6c6ca" />
          <stop offset="1" stopColor="#86868b" />
        </linearGradient>
        <linearGradient id={`sh-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.16" />
          <stop offset="0.22" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0.03" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="10" y="0" width="44" height="5" rx="2" fill={`url(#al-${id})`} />
      <path d="M8 5 H56 L59 13 H5 Z" fill={`url(#al-${id})`} />
      <rect x="5" y="13" width="54" height="136" fill={cream} />
      <rect x="5" y="15" width="54" height="7" fill={tone} />
      <svg x="17" y="30" width="30" height="80" viewBox="0 0 163 435">
        <g transform="translate(0 435) rotate(-90)">
          <path fillRule="evenodd" d={LOGO_PATH} fill={tone} />
        </g>
      </svg>
      <rect x="5" y="124" width="54" height="23" fill={tone} />
      <text x="32" y="140.5" textAnchor="middle" fill={cream} className="font-serif italic" fontSize="13">
        ?
      </text>
      <rect x="5" y="13" width="54" height="136" fill={`url(#sh-${id})`} />
      <path d="M5 149 H59 L56 156 Q32 161 8 156 Z" fill={`url(#al-${id})`} />
    </svg>
  );
}
