"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";
import PourScene from "./PourScene";
import { crearSonidoVertido } from "./three/sonidoVertido";
import { Headline } from "./motion";

/* Transición: el título y la lata, que con el scroll se inclina y sirve la soda en un vaso de vidrio.
   El sonido del vertido es opcional (los navegadores sólo dejan reproducir audio después de un click). */
export default function CanStory() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progreso = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });

  const [sonido, setSonido] = useState(null);
  const [conSonido, setConSonido] = useState(false);

  const alternarSonido = () => {
    let motor = sonido;
    if (!motor) {
      motor = crearSonidoVertido();
      if (!motor) return;
      setSonido(motor);
    }
    if (conSonido) motor.apagar();
    else motor.encender();
    setConSonido(!conSonido);
  };

  useEffect(() => () => sonido?.cerrar(), [sonido]);

  return (
    <section id="lata" ref={ref} className="relative h-[300vh] bg-surface">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* En vertical: título arriba y escena abajo; apaisado: título a la izquierda y escena a la derecha */}
        <div className="mx-auto grid h-full w-full max-w-[1240px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)] px-5 pb-6 pt-[84px] md:px-8 md:pt-[96px] 2xl:max-w-[1560px] wide:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] wide:grid-rows-1 wide:gap-x-10 wide:pb-10">
          <div className="flex flex-col items-start gap-4 wide:justify-center">
            <Headline
              className="text-[clamp(34px,min(10vw,6svh),56px)] font-extrabold leading-[0.95] tracking-[-0.035em] wide:text-[clamp(40px,min(5.6vw,10svh),112px)]"
              parts={["Todo lo que", { br: "hidden wide:block" }, "necesitás.", { br: true }, { t: "Nada", it: true }, "más."]}
            />
            <button
              type="button"
              onClick={alternarSonido}
              aria-pressed={conSonido}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-3.5 py-2 text-[13px] font-semibold text-ink/75 backdrop-blur transition hover:border-ink/40 hover:text-ink wide:mt-10"
            >
              <Parlante activo={conSonido} />
              <span>{conSonido ? "Sonido activado" : "Activar sonido"}</span>
            </button>
          </div>

          <div className="relative min-h-0">
            <div className="absolute inset-0">
              <PourScene progreso={progreso} sonido={conSonido ? sonido : null} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Parlante({ activo }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" />
      {activo ? (
        <>
          <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
          <path d="M18.2 6.5a7.8 7.8 0 0 1 0 11" />
        </>
      ) : (
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      )}
    </svg>
  );
}
