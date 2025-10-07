import "./globals.css";

export const metadata = {
  title: "LIV Energy Water",
  description: "Energía limpia, hidratación real.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased text-gray-900 animate-background">
        {children}
      </body>
    </html>
  );
}
