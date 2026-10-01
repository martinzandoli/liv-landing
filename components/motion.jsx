"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

export const EASE = [0.2, 0.7, 0.1, 1];

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* Titular que entra palabra por palabra desde abajo.
   `parts`: strings o { t, it } (itálica Fraunces) / { t, cross } (el ×) /
   { br: "clases" } (salto de línea forzado; las clases deciden en qué pantallas, p. ej. "hidden wide:block"). */
export function Headline({ as = "h2", parts, className = "", delay = 0, stagger = 0.06, immediate = false }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = [];
  parts.forEach((p) => {
    const part = typeof p === "string" ? { t: p } : p;
    if (part.br) {
      words.push(part);
      return;
    }
    part.t
      .split(" ")
      .filter(Boolean)
      .forEach((w) => words.push({ ...part, t: w }));
  });

  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-8% 0px" } };

  return (
    <Tag
      className={className}
      initial={reduce ? false : "hidden"}
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((w, i) =>
        w.br ? (
          <span key={i} aria-hidden className={w.br === true ? "block" : w.br} />
        ) : (
          <span key={i}>
            <span className={"inline-block overflow-hidden align-top pb-[0.14em] -mb-[0.14em] " + (w.it ? "pr-[0.09em] -mr-[0.09em]" : "")}>
              <motion.span
                className={"inline-block " + (w.it ? "it" : w.cross ? "cross" : "")}
                variants={{
                  hidden: { y: "115%", rotate: 4 },
                  show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE } },
                }}
              >
                {w.t}
              </motion.span>
            </span>
            {i < words.length - 1 && " "}
          </span>
        )
      )}
    </Tag>
  );
}

/* Aparición suave al entrar en pantalla */
export function Reveal({ children, className = "", delay = 0, y = 28, as = "div", amount = 0.2, immediate = false }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const trigger = immediate ? { animate: { opacity: 1, y: 0 } } : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount } };
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      {...trigger}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/* Número que cuenta hasta su valor cuando entra en pantalla.
   El HTML del servidor trae el valor final (sin JS se ve bien). */
export function CountUp({ to, duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduce = useReducedMotion();

  useIsoLayoutEffect(() => {
    if (!reduce && to > 0 && ref.current) ref.current.textContent = "0";
  }, [reduce, to]);

  useEffect(() => {
    if (!inView || reduce || to === 0) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} className={className}>
      {to}
    </span>
  );
}

/* Ficha: rótulo chico arriba, cifra abajo, líneas verticales entre valores */
export function Ficha({ items, className = "", size = "md", tone = "ink", nowrap = false }) {
  const big = size === "lg";
  const line = tone === "paper" ? "border-white/35" : tone === "rasp" ? "border-rasp/40" : "border-ink";
  const label = tone === "paper" ? "text-white/60" : tone === "rasp" ? "text-rasp/70" : "text-muted";
  return (
    <dl className={"flex gap-y-4 " + (nowrap ? "flex-nowrap " : "flex-wrap ") + className}>
      {items.map(({ r, v, u }, i) => (
        <div key={r} className={"pr-3.5 sm:pr-5 md:pr-6 " + (i > 0 ? "border-l-[1.5px] pl-3.5 sm:pl-5 md:pl-6 " + line : "")}>
          <dt className={"rotulo " + label}>{r}</dt>
          <dd className={"mt-1 font-extrabold leading-none tabular-nums " + (big ? "text-[36px] sm:text-[40px] md:text-[56px]" : "text-[23px] sm:text-[26px] md:text-[30px]")}>
            {typeof v === "number" ? <CountUp to={v} /> : v}
            {u && <span className={"ml-0.5 font-semibold " + (big ? "text-[0.4em]" : "text-[0.5em]")}>{u}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
