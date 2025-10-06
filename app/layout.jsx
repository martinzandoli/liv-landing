import "./globals.css";
export const metadata = {
  title: "LIV Energy Water",
  description: "Energía limpia, hidratación real.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
-     <body className="bg-pastel">{children}</body>
+     <body className="bg-pastel antialiased text-gray-900">{children}</body>
    </html>
  );
}
