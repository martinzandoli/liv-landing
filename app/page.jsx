"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AnimatedCan from "@/components/AnimatedCan";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <main className="relative">
      {/* HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <Image
          src="/hero.png"
          alt="LIV Energy Water"
          fill
          priority
          className="object-cover"
        />
        <div className="hero-overlay absolute inset-0" />

        <div className="absolute inset-0 mx-auto grid max-w-7xl grid-cols-1 items-center px-6 md:grid-cols-2">
          {/* Columna izquierda: título + texto + form */}
          <div>
            {/* (Eliminado el pequeño logo/título superior) */}

            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Energética. Simple.{" "}
              <span className="bg-gradient-to-r from-lime-500 to-teal-500 bg-clip-text text-transparent">
                Natural.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-lg text-gray-700">
              ¿Querés que te avisemos cuando lancemos? Dejá tu email y sé de los primeros.
            </p>

            {/* FORM */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const value = email.trim();
                if (!value) return;

                try {
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
                }
              }}
              className="mt-6 flex max-w-lg gap-3"
            >
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

          {/* Columna derecha: logo grande LIV */}
          <div className="relative hidden h-full w-full items-center justify-center md:flex">
            {/* Halo suave detrás del logo */}
            <div className="absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />
            <Image
              src="/images/liv-logo-removebg.png"
              alt="LIV Energy Water Logo"
              width={560}
              height={560}
              priority
              className="relative z-10 mx-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* SABORES */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-14 md:pb-24">
        <h2 className="mb-8 text-2xl font-semibold">Sabores</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <AnimatedCan src="/images/raspberry-can.png" alt="Raspberry" />
          <AnimatedCan src="/images/grape-can.png" alt="Grape" />
          <AnimatedCan src="/images/lemon-can.png" alt="Lemon" />
          <AnimatedCan src="/images/blueberry-can.png" alt="Blueberry" />
        </div>
      </section>

      {/* POR QUÉ LIV */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="mb-6 text-2xl font-semibold">¿Por qué LIV?</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["⚡️ Energía limpia", "Cafeína calibrada, sin azúcar."],
            ["💧 Hidratación real", "Agua + electrolitos ligeros."],
            ["🍃 Sabor natural", "Refresco claro y liviano."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur"
            >
              <div className="text-base font-medium">{title}</div>
              <div className="text-sm text-gray-600">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200/70 bg-white/60 py-8 text-center text-sm text-gray-600 backdrop-blur">
        © {new Date().getFullYear()} LIV Energy Water
      </footer>
    </main>
  );
}

