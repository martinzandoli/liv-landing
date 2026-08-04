"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AnimatedCan from "@/components/AnimatedCan";
import Accordion from "@/components/Accordion";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#producto", label: "Producto" },
  { href: "#formula", label: "Fórmula" },
  { href: "#momentos", label: "Momentos" },
  { href: "#faq", label: "FAQ" },
];

const SPECS = [
  { value: "150", unit: "mg", label: "Cafeína" },
  { value: "150", unit: "mg", label: "L-teanina", accent: true },
  { value: "0", unit: "g", label: "Azúcar" },
  { value: "0", unit: "kcal", label: "Calorías" },
  { value: "355", unit: "ml", label: "Contenido", wide: true },
];

/* Callouts posicionados sobre la lata (top en %, lado) */
const ANATOMY = [
  { side: "left", top: "17%", title: "Agua sin gas", desc: "La base es agua pura, no jarabe." },
  { side: "right", top: "34%", title: "Cafeína", desc: "Como un café doble." },
  { side: "left", top: "56%", title: "L-teanina", desc: "Suaviza el pico nervioso." },
  { side: "right", top: "72%", title: "Raspberry", desc: "Perfil seco, nada dulzón." },
];

const FORMULA = [
  {
    n: "01",
    title: "La cafeína da el impulso",
    desc: "150 mg, la dosis de un café doble. Suficiente para sostener una jornada larga sin quedarse corto a media tarde.",
  },
  {
    n: "02",
    title: "La L-teanina lo ordena",
    desc: "150 mg, en proporción 1:1 con la cafeína. Es el aminoácido del té verde que modera el componente nervioso: la subida se vuelve gradual en lugar de abrupta.",
  },
  {
    n: "03",
    title: "El agua hace el resto",
    desc: "Agua sin gas, sin azúcar que después pese ni jarabes que tapen el sabor. Lo que queda es una bebida liviana que se puede tomar todos los días.",
  },
];

const MOMENTS = [
  { title: "Trabajo profundo", desc: "Horas de código, diseño o análisis sin el ciclo de pico y caída." },
  { title: "Antes de entrenar", desc: "Energía limpia, sin azúcar que después pese." },
  { title: "Sesiones de estudio", desc: "Lectura y concentración larga con la mente clara." },
  { title: "Media tarde", desc: "El momento donde el café ya no rinde y la gaseosa sobra." },
];

const FAQ = [
  {
    q: "¿Qué es exactamente una energy water?",
    a: "Una categoría intermedia entre el agua saborizada y la bebida energética. Mantiene la base de agua sin gas y la ligereza de una bebida diaria, pero incorpora cafeína y L-teanina en dosis funcionales. No es un energizante azucarado ni un agua con sabor.",
  },
  {
    q: "¿Cuánta cafeína tiene y con qué se compara?",
    a: "150 mg por lata de 355 ml, aproximadamente lo mismo que un café doble. La diferencia está en la curva: combinada con L-teanina, la subida es más gradual y sostenida.",
  },
  {
    q: "¿Por qué cafeína y L-teanina juntas?",
    a: "Es una de las combinaciones más estudiadas en el terreno de la atención, y la proporción 1:1 es la que más se usa: 150 mg de cada una. La L-teanina, presente en el té verde, modera el componente nervioso de la cafeína. El resultado buscado es foco sin ansiedad.",
  },
  {
    q: "¿Tiene azúcar o calorías?",
    a: "No. LIV es cero azúcar y cero calorías. El perfil de sabor se construye desde el lado aromático, no desde la carga dulce.",
  },
  {
    q: "¿Va a haber más sabores?",
    a: "Sí, hay más en desarrollo. Vamos sacando uno a la vez para que cada perfil salga bien resuelto, y la lista de espera se entera primero de cada lanzamiento.",
  },
  {
    q: "¿Cuándo se lanza?",
    a: "Estamos en la etapa final de desarrollo y registro. Dejá tu email y te avisamos apenas esté disponible: la lista de espera tiene prioridad.",
  },
];

function SignupForm({ id, dark = false }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    try {
      setSending(true);
      const res = await fetch("https://formspree.io/f/xjkarpoq", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: value }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(`¡Gracias! Te avisamos a: ${value}`);
        setEmail("");
      } else {
        alert(data?.error || "Hubo un problema. Intentá de nuevo.");
      }
    } catch {
      alert("No se pudo enviar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={
        "flex max-w-md items-center gap-1 rounded-full border p-1.5 transition " +
        (dark
          ? "border-white/15 bg-white/5 focus-within:border-white/30"
          : "border-[var(--ink)]/12 bg-white focus-within:border-[var(--rose-deep)]")
      }
    >
      <input
        type="email"
        required
        placeholder="Ingresá tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={
          "min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 outline-none " +
          (dark ? "text-white placeholder:text-white/40" : "text-[var(--ink)] placeholder:text-[var(--ink)]/40")
        }
      />
      {dark ? (
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-white/85 disabled:opacity-50"
        >
          {sending ? "Enviando..." : "Notificarme"}
        </button>
      ) : (
        <Button className="shrink-0" disabled={sending}>
          {sending ? "Enviando..." : "Notificarme"}
        </Button>
      )}
    </form>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 bg-[var(--cream)] transition-shadow duration-300 " +
        (scrolled
          ? "border-b border-[var(--ink)]/10 shadow-[0_2px_16px_-6px_rgba(26,22,20,0.25)]"
          : "border-b border-transparent")
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <a href="#top" aria-label="LIV — inicio" className="shrink-0">
          <Image src="/images/liv-mark.png" alt="LIV" width={58} height={23} />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-[var(--ink)]/60 transition-colors hover:text-[var(--ink)]"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href="#signup"
          className="shrink-0 rounded-full bg-[var(--rose-deep)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#8a473f]"
        >
          Notificarme
        </a>
      </div>

      {/* Secciones en mobile */}
      <nav className="flex items-center gap-6 overflow-x-auto border-t border-[var(--ink)]/8 px-6 pb-2 pt-1.5 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="whitespace-nowrap text-xs text-[var(--ink)]/60 transition-colors hover:text-[var(--ink)]"
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default function Page() {
  return (
    <main id="top">
      <Header />

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-14 md:grid-cols-[1fr_0.85fr] md:gap-8 md:pb-28 md:pt-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--rose-deep)]">
            Energy Water
          </p>

          <h1 className="mt-5 text-[3rem] font-semibold leading-[0.98] tracking-[-0.03em] md:text-[4.5rem]">
            Energía <span className="text-[var(--rose-deep)]">simple.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--ink)]/65">
            Agua sin gas con 150&nbsp;mg de cafeína y 150&nbsp;mg de L-teanina. Cero azúcar, cero
            calorías. Claridad mental que se sostiene.
          </p>

          <div className="mt-9">
            <SignupForm id="signup" />
            <p className="mt-3 text-xs text-[var(--ink)]/45">
              Lista de espera con prioridad de lanzamiento. Cero spam.
            </p>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div
            className="absolute top-1/2 h-[290px] w-[290px] -translate-y-1/2 rounded-full md:h-[400px] md:w-[400px]"
            style={{ background: "var(--rose)", opacity: 0.16 }}
          />
          <div className="relative z-10 w-52 md:w-72">
            <AnimatedCan src="/images/raspberry-can.png" alt="Lata de LIV Raspberry, 355 ml" />
          </div>
        </div>
      </section>

      {/* FRANJA DE SPECS */}
      <section className="border-y border-[var(--ink)]/10 bg-[var(--cream-deep)]">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-6 py-10 md:grid-cols-5 md:py-12">
          {SPECS.map(({ value, unit, label, accent, wide }) => (
            <div
              key={label}
              className={"text-center " + (wide ? "col-span-2 md:col-span-1" : "")}
              style={accent ? { color: "var(--rose-deep)" } : undefined}
            >
              <dt className="text-[2.1rem] font-semibold leading-none tracking-tight md:text-[2.6rem]">
                {value}
                <span
                  className={
                    "ml-0.5 text-base font-medium " + (accent ? "opacity-60" : "text-[var(--ink)]/40")
                  }
                >
                  {unit}
                </span>
              </dt>
              <dd
                className={
                  "mt-2 text-xs uppercase tracking-[0.14em] " +
                  (accent ? "font-semibold opacity-80" : "text-[var(--ink)]/50")
                }
              >
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ANATOMÍA DE LA LATA */}
      <section id="producto" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-4 max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Todo tiene una razón</h2>
          <p className="mt-3 text-[var(--ink)]/60">
            Cuatro decisiones de producto. Ninguna de casualidad.
          </p>
        </div>

        {/* Desktop: callouts sobre la lata */}
        <div className="relative mx-auto hidden h-[520px] max-w-3xl md:block">
          <div className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/images/raspberry-can.png"
              alt="Lata de LIV Raspberry"
              width={260}
              height={600}
              className="w-full"
            />
          </div>

          {ANATOMY.map(({ side, top, title, desc }) => (
            <div
              key={title}
              className={
                "absolute flex w-[42%] items-center gap-3 " +
                (side === "left" ? "left-0 flex-row-reverse text-right" : "right-0")
              }
              style={{ top }}
            >
              <div className="flex flex-1 items-center gap-3">
                {side === "right" && <span className="callout-dot shrink-0" />}
                <span className="callout-line flex-1" />
                {side === "left" && <span className="callout-dot shrink-0" />}
              </div>
              <div className="w-[70%] shrink-0">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-0.5 text-sm leading-snug text-[var(--ink)]/55">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: lata a la izquierda, callouts a la derecha con separación pareja */}
        <div className="mt-8 flex items-center md:hidden">
          <div className="w-[104px] shrink-0">
            <Image
              src="/images/raspberry-can.png"
              alt="Lata de LIV Raspberry"
              width={260}
              height={600}
              className="w-full"
            />
          </div>

          <div className="flex flex-1 flex-col gap-7">
            {ANATOMY.map(({ title, desc }) => (
              <div key={title} className="flex items-center gap-2">
                <span className="callout-dot shrink-0" />
                <span className="callout-line w-3.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-tight">{title}</h3>
                  <p className="mt-0.5 text-sm leading-snug text-[var(--ink)]/55">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FÓRMULA */}
      <section id="formula" className="border-y border-[var(--ink)]/10 bg-[var(--cream-deep)] py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Por qué se siente distinto
            </h2>
            <p className="mt-3 text-[var(--ink)]/60">
              No es cuánta cafeína lleva. Es con qué la lleva.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {FORMULA.map(({ n, title, desc }) => (
              <div key={n}>
                <span className="text-xs font-semibold tracking-[0.14em] text-[var(--rose-deep)]">{n}</span>
                <div className="rule my-4" />
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink)]/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOMENTOS */}
      <section id="momentos" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="mb-12 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
          Para cuándo la vas a querer
        </h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {MOMENTS.map(({ title, desc }) => (
            <div key={title} className="border-t border-[var(--ink)]/12 pt-5">
              <h3 className="text-base font-medium">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[var(--ink)]/10 bg-[var(--cream-deep)] py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight md:text-4xl">Preguntas frecuentes</h2>
          <Accordion items={FAQ} />
        </div>
      </section>

      {/* CIERRE */}
      <section className="border-t border-[var(--ink)]/8 bg-[var(--pure)] px-6 py-24 text-center md:py-28">
        <h2 className="mx-auto max-w-lg text-3xl font-semibold tracking-tight md:text-5xl">
          Sé de los primeros en probarla
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--ink)]/60">
          Estamos en la etapa final de desarrollo. Dejanos tu email y te avisamos apenas esté
          disponible.
        </p>
        <div className="mt-9 flex justify-center">
          <SignupForm />
        </div>
      </section>

      <footer className="bg-[var(--pure)] pb-10 text-center text-xs text-[var(--ink)]/40">
        © {new Date().getFullYear()} LIV Energy Water
      </footer>
    </main>
  );
}
