import "./globals.css";

export const metadata = {
  title: "LIV — Energy Water",
  description:
    "Agua sin gas, 150 mg de cafeína y L-teanina. Cero azúcar, cero calorías. Foco sostenido, sin el bajón.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
