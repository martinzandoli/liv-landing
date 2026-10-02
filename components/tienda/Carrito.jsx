"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { precioArs } from "@/lib/catalogo";
import { EASE } from "../motion";

/* Carrito de la tienda: vive en la landing (se guarda en el navegador) y al pagar se arma el pedido
   en Tiendanube. Sólo aparece cuando hay packs a la venta. */

const CarritoCtx = createContext(null);
const CLAVE = "liv-carrito";

export function useCarrito() {
  return useContext(CarritoCtx);
}

export function CarritoProvider({ packs, ventaAbierta, children }) {
  const [items, setItems] = useState([]); // [{ id, cantidad }]
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      if (Array.isArray(guardado)) setItems(guardado.filter((i) => packs.some((p) => p.id === i.id && p.disponible)));
    } catch {}
  }, [packs]);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {}
  }, [items]);

  const agregar = useCallback((id, cantidad = 1) => {
    setItems((prev) => {
      const ya = prev.find((i) => i.id === id);
      if (ya) return prev.map((i) => (i.id === id ? { ...i, cantidad: Math.min(20, i.cantidad + cantidad) } : i));
      return [...prev, { id, cantidad }];
    });
    setAbierto(true);
  }, []);

  const cambiar = useCallback((id, cantidad) => {
    setItems((prev) => (cantidad < 1 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, cantidad: Math.min(20, cantidad) } : i))));
  }, []);

  const lineas = useMemo(
    () => items.map((i) => ({ ...i, pack: packs.find((p) => p.id === i.id) })).filter((l) => l.pack),
    [items, packs]
  );
  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * (l.pack.precio || 0), 0);

  const valor = { ventaAbierta, lineas, unidades, total, agregar, cambiar, abierto, setAbierto };
  return (
    <CarritoCtx.Provider value={valor}>
      {children}
      {ventaAbierta && <PanelCarrito />}
    </CarritoCtx.Provider>
  );
}

/* Botón del encabezado: bolsa con la cantidad de packs */
export function BotonCarrito() {
  const c = useCarrito();
  if (!c?.ventaAbierta) return null;
  return (
    <button
      type="button"
      onClick={() => c.setAbierto(true)}
      aria-label={`Abrir carrito${c.unidades ? `, ${c.unidades} ${c.unidades === 1 ? "pack" : "packs"}` : ""}`}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-line transition-colors hover:border-ink"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" strokeLinejoin="round" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      {c.unidades > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">
          {c.unidades}
        </span>
      )}
    </button>
  );
}

function Cantidad({ valor, onChange, chico = false }) {
  const b = "grid place-items-center rounded-full transition-colors hover:bg-ink hover:text-white " + (chico ? "h-8 w-8" : "h-11 w-11");
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-ink/15 p-1">
      <button type="button" className={b} onClick={() => onChange(valor - 1)} aria-label="Restar uno">
        −
      </button>
      <span className={"min-w-8 text-center font-semibold tabular-nums " + (chico ? "text-[14px]" : "text-[16px]")} aria-live="polite">
        {valor}
      </span>
      <button type="button" className={b} onClick={() => onChange(valor + 1)} aria-label="Sumar uno">
        +
      </button>
    </div>
  );
}
export { Cantidad };

function PanelCarrito() {
  const c = useCarrito();
  const [paso, setPaso] = useState("carrito"); // carrito | datos
  const [datos, setDatos] = useState({ nombre: "", apellido: "", email: "", telefono: "" });
  const [estado, setEstado] = useState({ cargando: false, error: "" });

  useEffect(() => {
    if (!c.abierto) return;
    const lenis = window.__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && c.setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [c.abierto, c]);

  useEffect(() => {
    if (!c.lineas.length) setPaso("carrito");
  }, [c.lineas.length]);

  async function pagar(e) {
    e.preventDefault();
    setEstado({ cargando: true, error: "" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, items: c.lineas.map((l) => ({ id: l.id, cantidad: l.cantidad })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setEstado({ cargando: false, error: data.error || "No pudimos armar el pedido. Probá de nuevo." });
    } catch {
      setEstado({ cargando: false, error: "No se pudo conectar. Revisá tu conexión y probá de nuevo." });
    }
  }

  const campo =
    "w-full rounded-[10px] border border-ink/15 bg-white px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-ink/35 focus:border-ink";

  return (
    <AnimatePresence>
      {c.abierto && (
        <motion.div key="carrito" className="fixed inset-0 z-[70]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button
            type="button"
            aria-label="Cerrar carrito"
            onClick={() => c.setAbierto(false)}
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <p className="text-[22px] font-extrabold tracking-[-0.02em]">{paso === "datos" ? "Tus datos" : "Tu carrito"}</p>
              <button
                type="button"
                onClick={() => c.setAbierto(false)}
                aria-label="Cerrar carrito"
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-xl font-light"
              >
                ×
              </button>
            </div>

            {!c.lineas.length ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-[18px] font-semibold">Todavía no sumaste ningún pack.</p>
                <button type="button" onClick={() => c.setAbierto(false)} className="rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-white">
                  Elegir un pack
                </button>
              </div>
            ) : paso === "carrito" ? (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6" data-lenis-prevent>
                  {c.lineas.map((l) => (
                    <li key={l.id} className="flex items-center gap-4 py-5">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[6px] bg-surface">
                        <Image src={l.pack.img} alt="" fill sizes="96px" className="object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">LIV Raspberry · {l.pack.nombre}</p>
                        <p className="text-[13px] text-muted">{l.pack.latas} latas de 355 mL</p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <Cantidad chico valor={l.cantidad} onChange={(n) => c.cambiar(l.id, n)} />
                          <p className="font-semibold tabular-nums">{precioArs(l.cantidad * l.pack.precio)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="rotulo text-muted">Subtotal</span>
                    <span className="text-[26px] font-extrabold tabular-nums tracking-[-0.02em]">{precioArs(c.total)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaso("datos")}
                    className="mt-5 w-full rounded-full bg-ink py-4 text-[15px] font-semibold text-white transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Finalizar compra →
                  </button>
                  <p className="mt-3 text-center text-[12.5px] text-muted">Pagás con tarjeta, débito, billetera virtual o transferencia.</p>
                </div>
              </>
            ) : (
              <form onSubmit={pagar} className="flex flex-1 flex-col" noValidate>
                <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6" data-lenis-prevent>
                  <div className="grid grid-cols-2 gap-3">
                    <input className={campo} placeholder="Nombre" autoComplete="given-name" required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
                    <input className={campo} placeholder="Apellido" autoComplete="family-name" required value={datos.apellido} onChange={(e) => setDatos({ ...datos, apellido: e.target.value })} />
                  </div>
                  <input className={campo} type="email" inputMode="email" placeholder="Email" autoComplete="email" required value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })} />
                  <input className={campo} type="tel" inputMode="tel" placeholder="Teléfono (opcional)" autoComplete="tel" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} />
                  <p className="pt-2 text-[13px] leading-relaxed text-muted">
                    Con estos datos armamos tu pedido y te llevamos al pago seguro de Tiendanube. Ahí elegís cómo pagar.
                  </p>
                  {estado.error && (
                    <p role="alert" className="rounded-[10px] bg-surface px-4 py-3 text-[14px] font-medium">
                      {estado.error}
                    </p>
                  )}
                </div>
                <div className="border-t border-line px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="rotulo text-muted">Total de packs</span>
                    <span className="text-[26px] font-extrabold tabular-nums tracking-[-0.02em]">{precioArs(c.total)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={estado.cargando}
                    className="mt-5 w-full rounded-full bg-ink py-4 text-[15px] font-semibold text-white transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
                  >
                    {estado.cargando ? "Armando tu pedido…" : "Ir a pagar →"}
                  </button>
                  <button type="button" onClick={() => setPaso("carrito")} className="mt-3 w-full text-center text-[13.5px] font-medium text-ink/60 hover:text-ink">
                    ← Volver al carrito
                  </button>
                </div>
              </form>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
