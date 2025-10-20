"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AnimatedCan from "@/components/AnimatedCan";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <main className="relative grain">
      {/* HERO */}
      <section className="relative flex min-h-[92svh] w-full items-center overflow-hidden">
        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center px-6 md:grid-cols-2">
          
          {/* Columna izquierda */}
          <div>
            {/* Logo mobile */}
            <div className="relative mb-6 flex justify-center md:hidden z-20">
              <img
                src="/images/liv-logo-removebg.png"
                alt="LIV Energy Water"
                className="h-24 w-auto object-contain drop-shadow-lg"
                loading="eager"
                decoding="async"
              />
            </div>

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

            {/* 🛒 BOTÓN NUEVO: Ir a la Tienda */}
            <div className="mt-6">
              <a
                href="https://livenergywater.mitiendanube.com/?utm_source=landing&utm_medium=hero-cta&utm_campaign=launch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Ir a la Tienda
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Columna derecha: logo grande LIV */}
          <div className="relative hidden h-full w-full items-center justify-center md:flex">
            <Image
              src="/images/liv-logo-removebg.png"
              alt="LIV Energy Water Logo"
              width={560}
              height={560}
              priority
              className="relative z-10 mx-auto drop-shadow-2xl object-contain"
              style={{ marginTop: "-10px" }}
            />
          </div>
        </div>

        <div className="seamless-fade z-30" />
      </section>

      {/* SABORES */}
      <section className="mx-auto -mt-6 max-w-7xl px-6 pb-16 pt-14 md:pb-24">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="can-tilt">
            <AnimatedCan src="/images/raspberry-can.png" alt="Raspberry" />
          </div>
          <div className="can-tilt">
            <AnimatedCan src="/images/grape-can.png" alt="Grape" />
          </div>
          <div className="can-tilt">
            <AnimatedCan src="/images/lemon-can.png" alt="Lemon" />
          </div>
          <div className="can-tilt">
            <AnimatedCan src="/images/blueberry-can.png" alt="Blueberry" />
          </div>
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

      <footer className="border-t border-gray-200/70 bg-white/60 py-8 text-center text-sm text-gray-600 backdrop-blur">
        © {new Date().getFullYear()} LIV Energy Water
      </footer>
    </main>
  );
}

  );
}
