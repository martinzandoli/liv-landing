'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LandingConstruction() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-lime-100 via-white to-lime-50 text-gray-900 p-6 relative overflow-hidden font-sans">
      {/* Fondo decorativo con formas suaves */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-80 h-80 bg-lime-200 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] bg-gray-300 rounded-full blur-3xl opacity-30 animate-pulse" />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-6xl md:text-7xl font-normal tracking-tight text-center mb-8 text-gray-800 font-[Titillium_Web,sans-serif]"
      >
        LIV Energy Water
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-2xl md:text-4xl font-semibold text-gray-700 text-center mb-12 leading-snug"
      >
        💧LIV es simple.<br />⚡️Potencia lo que hacés.
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-10 w-full max-w-lg text-center border border-gray-200"
      >
        <p className="text-lg text-gray-600 mb-6">
          Sé de los primeros en descubrir nuestra bebida.
        </p>
        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: enviar email al backend/servicio
            alert(`Gracias! Te avisamos a: ${email}`);
            setEmail("");
          }}
        >
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 rounded-2xl px-5 py-3 text-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <Button type="submit" className="rounded-2xl px-8 text-lg">
            Notificarme
          </Button>
        </form>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-6 text-base text-gray-400"
      >
        © {new Date().getFullYear()} LIV Energy Water — En construcción
      </motion.footer>
    </div>
  );
}
