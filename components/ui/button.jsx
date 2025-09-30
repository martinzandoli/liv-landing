export function Button({ className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 ring-offset-white bg-lime-500 hover:bg-lime-400 text-white";
  return (
    <button className={base + (className ? " " + className : "")} {...props}>
      {children}
    </button>
  );
}
