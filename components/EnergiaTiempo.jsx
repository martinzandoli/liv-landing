"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Logo from "./Logo";
import { EASE, Headline, Reveal } from "./motion";

/* Gráfico "energía en el tiempo": dos curvas que se dibujan de izquierda a derecha en loop mientras
   el gráfico está en pantalla (se dibujan, quedan un instante y se borran). Es ilustrativo, no una medición. */

const W = 600;
const H = 240;
const BASE = 228; // línea de "energía cero"

// Energizante común: sube de golpe, pico y bajón
const PICO =
  "M0,228 C40,226 70,150 100,80 C120,36 150,30 172,52 C205,86 222,180 262,206 C300,226 380,222 600,224";
// LIV: sube de a poco y se sostiene
const PAREJA = "M0,228 C60,226 110,150 170,110 C215,82 260,78 330,78 C430,78 520,82 600,92";

// Ciclo de la animación, en segundos
const DIBUJO = 3;
const PAUSA = 1.6;
const BORRADO = 1.2;
const CICLO = DIBUJO + PAUSA + BORRADO + 0.4;
const suave = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const entrada = (x) => x * x * x;

function muestras(d, n = 480) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  const len = p.getTotalLength();
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const q = p.getPointAtLength((i / n) * len);
    pts.push([q.x, q.y]);
  }
  return pts;
}

function yEn(pts, x) {
  if (!pts.length) return BASE;
  let lo = 0;
  let hi = pts.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (pts[mid][0] < x) lo = mid;
    else hi = mid;
  }
  const [x0, y0] = pts[lo];
  const [x1, y1] = pts[hi];
  return x1 === x0 ? y0 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

function Curva({ id, d, tramo, fuerte, etiquetas }) {
  // se muestrea en el cliente (necesita el DOM); en el servidor el punto arranca en el origen
  const [pts, setPts] = useState([]);
  useEffect(() => setPts(muestras(d)), [d]);
  const { s, e: fin } = tramo; // la línea se ve entre s (cola) y fin (punta), de 0 a 1
  const x = fin * W;
  const y = fin > 0 ? yEn(pts, Math.max(1, x)) : BASE;
  const punto = fin > 0 && s < 0.995;
  const area = `${d} L${W},${H} L0,${H} Z`;

  return (
    <div className="relative">
      <div className="relative aspect-[600/240] w-full lg:aspect-[600/185]">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            {/* máscara: punta nítida (la línea "se dibuja") y cola difuminada cuando se borra */}
            <linearGradient id={`ventana-${id}`} gradientUnits="userSpaceOnUse" x1="0" x2={W} y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity={s > 0 ? 0 : 1} />
              <stop offset={Math.max(0, s - 0.08)} stopColor="#fff" stopOpacity={s > 0 ? 0 : 1} />
              <stop offset={s} stopColor="#fff" stopOpacity="1" />
              <stop offset={Math.max(s, fin)} stopColor="#fff" stopOpacity="1" />
              <stop offset={Math.min(1, Math.max(s, fin) + 0.001)} stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity={fin >= 1 ? 1 : 0} />
            </linearGradient>
            <mask id={`mask-${id}`} maskUnits="userSpaceOnUse" x="-10" y="-20" width={W + 20} height={H + 40}>
              <rect x="-10" y="-20" width={W + 20} height={H + 40} fill={`url(#ventana-${id})`} />
            </mask>
            <linearGradient id={`grad-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={fuerte ? 0.26 : 0.1} />
              <stop offset="1" stopColor="#fff" stopOpacity={fuerte ? 0.04 : 0.02} />
            </linearGradient>
          </defs>
          {/* ejes */}
          <line x1="0" y1="0" x2="0" y2={BASE} stroke="#fff" strokeOpacity="0.22" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1={BASE} x2={W} y2={BASE} stroke="#fff" strokeOpacity="0.22" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <g mask={fin > 0 ? `url(#mask-${id})` : undefined} opacity={fin > 0 ? 1 : 0}>
            <path d={area} fill={`url(#grad-${id})`} />
            <path
              d={d}
              fill="none"
              stroke="#fff"
              strokeOpacity={fuerte ? 1 : 0.5}
              strokeWidth={fuerte ? 2.4 : 1.6}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>

        {/* punto en la punta de la línea */}
        <span
          className={
            "absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full " +
            (fuerte ? "bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.18)]" : "bg-white/60")
          }
          style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, opacity: punto ? 1 : 0 }}
        />

        {etiquetas.map((e) => {
          const ve = fin >= e.en && s < e.x / W;
          return (
            <motion.span
              key={e.t}
              initial={false}
              animate={{ opacity: ve ? 1 : 0, y: ve ? 0 : 6 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={"absolute -translate-x-1/2 whitespace-nowrap text-[12px] md:text-[13px] " + (fuerte ? "font-semibold text-white" : "text-white/60")}
              style={{ left: `${(e.x / W) * 100}%`, top: `${(e.y / H) * 100}%` }}
            >
              {e.t}
            </motion.span>
          );
        })}

        <span className="rotulo absolute -top-5 left-0 text-[10px] text-white/40">Energía</span>
      </div>
      <p className="rotulo mt-2 text-right text-[10px] text-white/40">Tiempo</p>
    </div>
  );
}

export default function EnergiaTiempo() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const visible = useInView(ref, { amount: 0.45 });
  const [tramo, setTramo] = useState({ s: 0, e: reduce ? 1 : 0 });

  // Mientras está en pantalla, la línea se dibuja, queda un instante, se borra y vuelve a empezar
  useEffect(() => {
    if (reduce) {
      setTramo({ s: 0, e: 1 });
      return;
    }
    if (!visible) {
      setTramo({ s: 0, e: 0 });
      return;
    }
    let raf;
    const t0 = performance.now();
    const loop = (now) => {
      const t = ((now - t0) / 1000) % CICLO;
      if (t < DIBUJO) setTramo({ s: 0, e: suave(t / DIBUJO) });
      else if (t < DIBUJO + PAUSA) setTramo({ s: 0, e: 1 });
      else if (t < DIBUJO + PAUSA + BORRADO) setTramo({ s: entrada((t - DIBUJO - PAUSA) / BORRADO), e: 1 });
      else setTramo({ s: 0, e: 0 });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduce]);

  return (
    <div className="mt-20 grid grid-cols-1 gap-12 border-t border-white/15 pt-16 md:mt-28 md:pt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="lg:self-center">
        <p className="rotulo text-white/55">Energía en el tiempo</p>
        <Headline
          className="mt-4 text-[clamp(36px,4.6vw,64px)] font-extrabold leading-[0.95] tracking-[-0.035em]"
          parts={["Energía, pero", { t: "pareja.", it: true }]}
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-[28rem] text-pretty text-[17px] leading-relaxed text-white/70">
            Un energizante común sube de golpe y después se cae. Juntas, la cafeína y la L-⁠teanina dan una energía que se siente
            más pareja: en estudios con voluntarios, la combinación mostró mejor atención y foco que la cafeína sola.
          </p>
        </Reveal>
        <p className="mt-6 max-w-[28rem] text-[12px] leading-relaxed text-white/40">
          Gráfico ilustrativo de cómo se siente la energía; no es una medición. Estudios sobre cafeína y L-{"\u2060"}teanina: Owen et
          al., <span className="italic">Nutritional Neuroscience</span> (2008) · Kelly et al.,{" "}
          <span className="italic">The Journal of Nutrition</span> (2008).
        </p>
      </div>

      <div ref={ref}>
        <p className="mb-7 text-[15px] font-semibold text-white/70">Energizante común</p>
        <Curva
          id="pico"
          d={PICO}
          tramo={tramo}
          etiquetas={[
            { t: "Pico de energía", x: 150, y: 2, en: 0.3 },
            { t: "Bajón", x: 330, y: 176, en: 0.55 },
          ]}
        />

        <div className="my-8 flex items-center gap-4 text-white/40 lg:my-7">
          <span className="h-px flex-1 bg-white/15" />
          <span className="rotulo text-[11px]">vs</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        <p className="mb-7 flex items-center gap-3 text-[15px] font-semibold text-white">
          <Logo title="LIV" className="h-[18px] w-auto text-white" />
          <span className="text-white/60">cafeína + L-teanina</span>
        </p>
        <Curva
          id="pareja"
          d={PAREJA}
          tramo={tramo}
          fuerte
          etiquetas={[{ t: "Energía más pareja y sostenida", x: 380, y: 34, en: 0.62 }]}
        />
      </div>
    </div>
  );
}
