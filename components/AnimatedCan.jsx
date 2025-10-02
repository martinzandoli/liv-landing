"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function AnimatedCan({ src, alt, label, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [-20, 20], [-6, 6]);

  return (
    <motion.div
      className="relative select-none"
      initial={{ y: 40, opacity: 0, rotate: -8 }}
      whileInView={{ y: 0, opacity: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 60, damping: 10, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ rotate }}
    >
      <motion.div
        animate={{ y: hovered ? [0, -6, 0] : [0, -12, 0] }}
        transition={{ duration: hovered ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mx-auto can-gloss can-drops"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
          y.set(relY);
        }}
      >
        <div className="absolute -bottom-6 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full bg-gray-900/10 blur-md" />
        <Image src={src} alt={alt} width={260} height={600} priority className="pointer-events-none" />
      </motion.div>
      <div className="mt-2 text-center text-sm font-medium text-gray-700">{label}</div>
    </motion.div>
  );
}
