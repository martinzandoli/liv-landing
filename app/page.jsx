"use client";

import Image from "next/image";
import { useState } from "react";
import AnimatedCan from "@/components/AnimatedCan";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Page() {
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
    <main className="relative">
      {/* HERO */}
      <section className="relative flex min-h-[92svh] w-full items-center overflow-hidden">
        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:gap-16">
          {/* Columna izquierda */}
          <div>
            {/* Logo centrado en mobile */}
            <div className="mb-6 flex justify-center md:hidden">
              <Image
                src="/images/liv-logo-removebg.png"
                alt="LIV Energy Water"
                width={120}
                height={120}
                priority
              />
            </div>

            <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Energética. Simple.
            </h1>

            <p className="mt-4 max-w-xl text-lg text-gray-700">
              ¿Querés que te avisemos cuando lancemos? Dejá tu email y sé de los primeros.
            </p>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg gap-3">
              <input
                type="email"
                required
                placeholder="Ingresá tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-2xl border border-gray-300 bg-white/90 px-5 py-3 outline-none ring-lime-400 transition focus:ring-2"
              />
              <Button className="rounded-2xl px-6 font-semibold" disabled={sending}>
                {sending ? "Enviando..." : "Notificarme"}
              </Button>
            </form>
          </div>

          {/* Columna derecha: logo grande (solo md+) */}
          <div className="relative hidden h-full w-full items-center justify-center md:flex">
            <Image
              src="/images/liv-logo-removebg.png"
              alt="LIV Energy Water Logo"
              width={560}
              height={560}
              priority
              className="mx-auto object-contain"
            />
          </div>
        </div>

        {/* Suaviza la unión con la siguiente sección */}
        <div className="seamless-fade" />
      </section>

      {/* SABORES */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-14 md:pb-24 text-center">
        <h2 className="mb-10 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          Sabores
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {[{ src: "/images/raspberry-new.png", alt: "Raspberry" },
            { src: "/images/mango-new.png", alt: "Mango" }]
            .map((can, index) => (
              <motion.div
                key={index}
                className="can-tilt"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <AnimatedCan src={can.src} alt={can.alt} />
              </motion.div>
            ))}
        </div>

        {/* Botón “Ir a la tienda” — debajo de las latas */}
        <div className="mt-12 flex justify-center md:justify-end">
          <a
            href="https://livenergywater.mitiendanube.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-2xl bg-black px-8 py-3 text-base font-medium text-white transition hover:opacity-85"
          >
            Ir a la tienda
          </a>
        </div>
      </section>

      {/* POR QUÉ LIV */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="mb-6 text-2xl font-semibold">¿Por qué LIV?</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["⚡️ Potencia lo que hacés", "Solo cafeína. 0 calorías."],
            ["💧 LIV es simple", "LIV es agua."],
            ["🍃 Sabor natural", "Refresco claro y liviano."],
          ].map(([title, desc]) => (
            <div key={title} className="card-soft p-5">
              <div className="text-base font-medium">{title}</div>
              <div className="text-sm text-gray-600">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200/70 bg-white/60 py-8 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} LIV Energy Water
      </footer>
    </main>
  );
}
