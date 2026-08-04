export function Button({ className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors bg-[var(--rose-deep)] hover:bg-[#8a473f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rose-deep)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  return (
    <button className={base + (className ? " " + className : "")} {...props}>
      {children}
    </button>
  );
}
