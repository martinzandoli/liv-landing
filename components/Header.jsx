"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import Logo from "./Logo";
import { EASE } from "./motion";

export const NAV = [
  { href: "#lata", label: "La lata" },
  { href: "#teanina", label: "Fórmula" },
  { href: "#momentos", label: "Momentos" },
  { href: "#sabores", label: "Sabores" },
  { href: "#faq", label: "Preguntas" },
];

export default function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.3 });
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 48);
    if (y < 200) setHidden(false);
    else if (y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  useEffect(() => {
    const lenis = window.__lenis;
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="bg-ink text-white">
        <p className="mx-auto max-w-[1240px] px-5 py-2.5 text-center text-[10.5px] font-semibold uppercase tracking-[0.2em] md:text-[11px]">
          Primer sabor: Raspberry
          <span className="hidden sm:inline">
            {" "}
            <span className="cross mx-1.5 text-[13px]">×</span> Lista de espera abierta
          </span>
        </p>
      </div>

      <motion.header
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE }}
        className={
          "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300 " +
          (scrolled ? "border-line bg-white/85 backdrop-blur-md" : "border-transparent bg-white")
        }
      >
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-5 md:h-[72px] md:px-8">
          <a href="#top" aria-label="LIV, volver al inicio" className="shrink-0">
            <Logo className="h-[22px] w-auto md:h-6" />
          </a>

          <nav aria-label="Secciones" className="hidden items-center gap-8 lg:flex">
            {NAV.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="group relative text-[13.5px] font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#lista"
              className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              Sumate
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
            >
              <span className="flex w-4 flex-col gap-[5px]">
                <span className="h-[1.5px] w-full bg-ink" />
                <span className="h-[1.5px] w-full bg-ink" />
              </span>
            </button>
          </div>
        </div>
        <motion.div aria-hidden style={{ scaleX: progress }} className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-ink" />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink px-5 pb-10 pt-5 text-white"
          >
            <div className="flex items-center justify-between">
              <Logo className="h-[22px] w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-xl font-light"
              >
                ×
              </button>
            </div>
            <nav aria-label="Secciones" className="mt-auto flex flex-col gap-2">
              {[...NAV, { href: "#lista", label: "Sumate a la lista" }].map(({ href, label }, i) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: EASE }}
                  className={"text-[42px] font-bold leading-[1.1] tracking-[-0.02em] " + (href === "#lista" ? "it mt-4 font-normal" : "")}
                >
                  {label}
                </motion.a>
              ))}
            </nav>
            <p className="rotulo mt-10 text-white/50">Energía · Foco · Calma</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
