"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Headline } from "./motion";

/* Video en loop que solo se reproduce mientras está en pantalla.
   Con "reducir movimiento" no arranca solo: queda el póster y el botón. */
function useAutoVideo(reduce) {
  const ref = useRef(null);
  const pausedByUser = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // el autoplay solo se permite en silencio
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !pausedByUser.current && !reduce) v.play().catch(() => {});
        else if (!e.isIntersecting) v.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [reduce]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      pausedByUser.current = false;
      v.play().catch(() => {});
    } else {
      pausedByUser.current = true;
      v.pause();
    }
  };

  return { ref, playing, toggle };
}

function PlayToggle({ playing, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playing ? "Pausar video" : "Reproducir video"}
      className={
        "grid h-12 w-12 place-items-center rounded-full bg-white/90 text-ink shadow-[0_6px_24px_-8px_rgba(0,0,0,0.4)] backdrop-blur transition-transform duration-300 hover:scale-105 " +
        className
      }
    >
      {playing ? (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
          <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

export default function VideoFilm() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  // El marco se abre hasta ocupar todo el ancho a medida que entra
  const inset = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["7%", "0%"]);
  const radius = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, 0]);
  const clip = useTransform([inset, radius], ([i, r]) => `inset(${i} ${i} ${i} ${i} round ${r}px)`);

  const desk = useAutoVideo(reduce);
  const mob = useAutoVideo(reduce);

  return (
    <section ref={ref} aria-label="Video: la lata de LIV Raspberry girando" className="bg-ink">
      {/* Escritorio: video a todo el ancho, texto a la izquierda */}
      <motion.div style={{ clipPath: clip }} className="relative hidden h-[min(100svh,960px)] min-h-[600px] overflow-hidden md:block">
        <video
          ref={desk.ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/video/giro-real-h.jpg"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        >
          <source src="/video/giro-real-h.mp4" type='video/mp4; codecs="avc1.640028"' />
          <source src="/video/giro-real-h.webm" type='video/webm; codecs="vp9"' />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#eeede9]/80 via-transparent to-transparent" />
        <div className="relative mx-auto flex h-full max-w-[1240px] flex-col justify-between px-8 py-16">
          <p className="rotulo text-ink/60">En estudio · 360°</p>
          <div className="max-w-[30rem]">
            <Headline
              className="text-[clamp(48px,6vw,92px)] font-extrabold leading-[0.92] tracking-[-0.04em]"
              parts={["La parte", { t: "linda", it: true }, "de cuidarte."]}
            />
          </div>
          <div className="flex items-center gap-4">
            <PlayToggle playing={desk.playing} onClick={desk.toggle} />
            <span className="rotulo text-ink/55">{desk.playing ? "Girando" : "En pausa"}</span>
          </div>
        </div>
      </motion.div>

      {/* Mobile: texto arriba, video vertical abajo */}
      <div className="md:hidden">
        <div className="px-5 pb-8 pt-20 text-white">
          <p className="rotulo text-white/55">En estudio · 360°</p>
          <Headline
            className="mt-4 text-[44px] font-extrabold leading-[0.92] tracking-[-0.04em]"
            parts={["La parte", { t: "linda", it: true }, "de cuidarte."]}
          />
        </div>
        <div className="relative aspect-[1080/1340] w-full overflow-hidden">
          <video
            ref={mob.ref}
            className="absolute inset-0 h-full w-full object-cover"
            poster="/video/giro-real-v.jpg"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
          >
            <source src="/video/giro-real-v.mp4" type='video/mp4; codecs="avc1.640028"' />
            <source src="/video/giro-real-v.webm" type='video/webm; codecs="vp9"' />
          </video>
          <PlayToggle playing={mob.playing} onClick={mob.toggle} className="absolute bottom-4 right-4" />
        </div>
      </div>
    </section>
  );
}
