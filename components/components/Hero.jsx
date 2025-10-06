"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {/* Fondo gradiente + blobs animados */}
      <div className="hero-gradient absolute inset-0" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl animate-blob-slow" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/20 blur-3xl animate-pulseGlow" />

      <div className="relative mx-auto grid min-h-[80svh] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:min-h-[86svh] md:grid-cols-2">
        {/* Columna texto + form */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3"
          >
            <Image src="/images/liv-logo.png" alt="LIV" width={36} height={36} />
            <span className="text-base font-semibold tracking-tight">LIV Energy Water</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05 }}
            className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 md:text-7xl"
          >
            Energética. <span className="text-gray-800/90">Simple.</span>{" "}
            <span className="bg-gradient-to-r from-lime-500 to-teal-500 bg-clip-text text-transparent">
              Natural.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="mt-4 max-w-xl text-lg text-gray-700"
          >
            ¿Querés que te avisemos cuando lancemos? Dejá tu email y sé de los primeros.
          </motion.p>

          {/* Form de captura */}
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            onSubmit={async (e) => {
              e.preventDefault();
              const value = email.trim();
              if (!value) return;
              setSending(true);
              try {
                const res = await fetch("/api/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: value }),
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data?.ok) {
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
            }}
            className="mt-6 flex max-w-lg items-center gap-3 rounded-2xl bg-white/60 p-2 shadow-lg backdrop-blur-md ring-1 ring-black/5"
          >
            <input
              type="email"
              required
              placeholder="Ingresá tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl border border-transparent bg-white/90 px-4 py-3 text-gray-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/40"
            />
            <Button className="rounded-xl px-5 font-semibold" disabled={sending}>
              {sending ? "Enviando..." : "Notificarme"}
            </Button>
          </motion.form>

          {/* mini badges opcionales */}
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-5 flex flex-wrap gap-2 text-sm text-gray-600"
          >
            {["0 calorías", "Sin azúcar", "Hidratación real", "Energía limpia"].map((t) => (
              <li key={t} className="rounded-full bg-white/70 px-3 py-1 shadow-sm ring-1 ring-black/5">
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Columna visual: latas/imagen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative hidden md:block"
        >
          {/* Halo */}
          <div className="absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/30 blur-3xl" />
          {/* Imagen de latas (ideal PNG con transparencia) */}
          <Image
            src="/images/hero-cans.png" // subí esta imagen a public/images/ con fondo transparente
            alt="LIV Cans"
            width={720}
            height={720}
            className="relative z-10 mx-auto drop-shadow-2xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
