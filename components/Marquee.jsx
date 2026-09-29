"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/* Marquesina que acelera y cambia de sentido con la velocidad del scroll */
export function VelocityRow({ children, baseVelocity = -2, className = "" }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    moveBy += dir.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={"flex overflow-hidden whitespace-nowrap " + className}>
      <motion.div className="flex shrink-0 flex-nowrap whitespace-nowrap" style={{ x }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section aria-label="Energía, foco, calma" className="overflow-hidden bg-ink py-7 text-white md:py-10">
      <VelocityRow baseVelocity={-2.2}>
        <span className="px-4 text-[clamp(44px,8vw,112px)] font-extrabold uppercase leading-none tracking-[-0.02em]">
          Energía <Dot /> Foco <Dot /> Calma <Dot />
          <span className="it normal-case tracking-[-0.03em]">disciplina</span> <span className="cross">×</span>{" "}
          <span className="it normal-case tracking-[-0.03em]">disfrute</span> <Dot />
        </span>
      </VelocityRow>
    </section>
  );
}

function Dot() {
  return <span className="mx-[0.25em] inline-block h-[0.14em] w-[0.14em] translate-y-[-0.22em] rounded-full bg-white align-middle" />;
}
