import { Albert_Sans, Fraunces } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const albert = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: "italic",
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

// Dominio oficial en producción; en previews y en local, la URL de ese entorno
const siteUrl =
  process.env.VERCEL_ENV === "production"
    ? "https://drinkliv.energy"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: "LIV — Energy Drink",
  description:
    "Energy drink con gas en lata sleek de 355 mL: 100 mg de cafeína, 150 mg de L-teanina, cero azúcar. Primer sabor: Raspberry. Sumate a la lista.",
  openGraph: {
    title: "LIV — Energía liviana",
    description: "Energy drink con gas. 100 mg de cafeína, 150 mg de L-teanina, 0 azúcar. Primer sabor: Raspberry.",
    images: ["/media/estudio.jpg"],
    locale: "es_AR",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${albert.variable} ${fraunces.variable}`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
