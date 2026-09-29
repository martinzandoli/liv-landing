"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ENDPOINT = "https://formspree.io/f/xjkarpoq";

export default function SignupForm({ dark = false, className = "", cta = "Sumate", hint = "Te avisamos primero cuando salga. Cero spam." }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const value = email.trim();
    if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
      setStatus("error");
      setMessage("Revisá el email: parece que le falta algo.");
      return;
    }
    try {
      setStatus("sending");
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("ok");
        setMessage(`Listo. Te avisamos a ${value}.`);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data?.error || "Hubo un problema. Probá de nuevo en un rato.");
      }
    } catch {
      setStatus("error");
      setMessage("No se pudo enviar. Revisá tu conexión y probá de nuevo.");
    }
  }

  const sending = status === "sending";

  return (
    <form onSubmit={handleSubmit} noValidate className={"w-full max-w-md " + className}>
      <label htmlFor={id} className="sr-only">
        Tu email
      </label>
      <div
        className={
          "group flex items-center gap-1 rounded-full border p-1.5 transition-colors duration-300 " +
          (dark
            ? "border-white/20 bg-white/[0.06] focus-within:border-white/60"
            : "border-ink/15 bg-white focus-within:border-ink")
        }
      >
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="Tu email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          className={
            "min-w-0 flex-1 rounded-full bg-transparent px-4 py-3 text-[15px] outline-none " +
            (dark ? "text-white placeholder:text-white/45" : "text-ink placeholder:text-ink/40")
          }
        />
        <button
          type="submit"
          disabled={sending}
          className={
            "relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-[14px] font-semibold transition-transform duration-300 active:scale-[0.97] disabled:opacity-60 " +
            (dark ? "bg-white text-ink" : "bg-ink text-white")
          }
        >
          <span>{sending ? "Enviando…" : cta}</span>
          <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
      <div className="relative mt-3 min-h-[20px] pl-4 text-[13px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={status === "ok" || status === "error" ? status : "hint"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className={
              status === "ok"
                ? dark
                  ? "font-semibold text-white"
                  : "font-semibold text-ink"
                : status === "error"
                  ? dark
                    ? "text-white"
                    : "text-ink"
                  : dark
                    ? "text-white/55"
                    : "text-muted"
            }
          >
            {status === "ok" ? "✓ " + message : status === "error" ? message : hint}
          </motion.p>
        </AnimatePresence>
      </div>
    </form>
  );
}
