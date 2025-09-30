export const metadata = {
  title: "LIV Energy Water",
  description: "LIV es simple. Potencia lo que hacés.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
