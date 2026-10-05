"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Headline } from "./motion";

const MOMENTOS = [
  { hora: "15:00", lugar: "Oficina", img: "/media/oficina-v3.jpg", pos: "60% 50%" },
  { hora: "18:30", lugar: "Pre-gym", img: "/media/pregym-v3.jpg", pos: "50% 30%" },
  { hora: "19:15", lugar: "Entrenamiento", img: "/media/gimnasio-v3.jpg", pos: "50% 50%" },
  { hora: "Sábado", lugar: "En casa", img: "/media/bodegon-v3.jpg", pos: "45% 60%" },
];

/* Galería horizontal que avanza con el scroll vertical */
export default function Momentos() {
  const ref = useRef(null);
  const track = useRef(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const x = useSpring(xRaw, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section
      id="momentos"
      ref={ref}
      className="relative bg-white text-ink"
      style={{ height: reduce ? "auto" : `calc(100svh + ${dist}px)` }}
    >
      <div
        className={
          reduce
            ? "overflow-x-auto py-20"
            : "sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden"
        }
      >
        <motion.div ref={track} style={{ x: reduce ? 0 : x }} className="flex w-max items-stretch gap-5 px-5 md:gap-7 md:px-8">
          {/* Portada */}
          <div className="flex w-[82vw] shrink-0 flex-col justify-between py-2 sm:w-[60vw] lg:w-[38vw]">
            <p className="rotulo text-muted">Momentos</p>
            <div>
              <Headline
                className="text-[clamp(48px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.04em]"
                parts={["Oficina", { t: "×", cross: true }, { t: "gimnasio.", it: true }]}
              />
              <p className="mt-6 max-w-[24rem] text-[17px] leading-relaxed text-ink/65">
                LIV acompaña el día entero, no solo el entrenamiento. Seguí bajando.
              </p>
            </div>
            <p className="rotulo text-ink/40">→</p>
          </div>

          {MOMENTOS.map((m, i) => (
            <Card key={m.lugar} m={m} i={i} progress={scrollYProgress} total={MOMENTOS.length} reduce={reduce} />
          ))}

          {/* Cierre */}
          <a
            href="#lista"
            className="group flex w-[70vw] shrink-0 flex-col justify-between rounded-[6px] bg-ink p-7 text-white sm:w-[44vw] lg:w-[26vw]"
          >
            <p className="rotulo text-white/55">¿Cuál es el tuyo?</p>
            <p className="text-[clamp(34px,3.6vw,52px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
              Sumate a la <span className="it font-normal">lista.</span>
            </p>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-ink transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function Card({ m, i, progress, total, reduce }) {
  // Paralaje interno: la foto se desplaza un poco dentro del marco
  const imgX = useTransform(progress, [0, 1], reduce ? ["0%", "0%"] : [`${6 + i * 2}%`, `${-6 - i * 2}%`]);
  return (
    <figure className="relative w-[78vw] shrink-0 overflow-hidden rounded-[6px] sm:w-[52vw] lg:w-[30vw]">
      <div className="relative aspect-[4/5] h-full max-h-[76svh] w-full overflow-hidden">
        <motion.div style={{ x: imgX }} className="absolute inset-[-8%]">
          <Image src={m.img} alt="" fill sizes="(min-width: 1024px) 30vw, 78vw" className="object-cover" style={{ objectPosition: m.pos }} />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-5">
          <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold tabular-nums text-ink">{m.hora}</span>
          <span className="rotulo text-white/80">{String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
          <p className="text-[clamp(30px,3vw,44px)] font-extrabold leading-none tracking-[-0.03em]">{m.lugar}</p>
        </figcaption>
      </div>
    </figure>
  );
}
