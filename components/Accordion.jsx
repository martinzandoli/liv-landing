"use client";

import { useState } from "react";

export default function Accordion({ items }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="divide-y divide-[var(--ink)]/10 border-y border-[var(--ink)]/10">
      {items.map(({ q, a }, i) => (
        <div key={q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-6 py-5 text-left"
          >
            <span className="text-base font-medium">{q}</span>
            <span
              className={
                "shrink-0 text-xl leading-none text-[var(--rose-deep)] transition-transform duration-200 " +
                (open === i ? "rotate-45" : "")
              }
            >
              +
            </span>
          </button>
          {open === i && (
            <p className="max-w-2xl pb-5 text-sm leading-relaxed text-[var(--ink)]/60">{a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
