import { Albert_Sans, Fraunces } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { WhatsAppFlotante } from "@/components/Redes";
import { REDES } from "@/lib/contacto";
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
    "Energy drink en lata sleek de 355 mL: 100 mg de cafeína, 200 mg de L-teanina, cero azúcar y cero calorías. Primer sabor: Raspberry. Sumate a la lista.",
  openGraph: {
    title: "LIV — Energía liviana",
    description: "Energy drink. 100 mg de cafeína, 200 mg de L-teanina, 0 azúcar. Primer sabor: Raspberry.",
    images: ["/media/estudio-v3.jpg"],
    locale: "es_AR",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#000000",
};

// Datos de la marca para buscadores: nombre, sitio y redes oficiales
const organizacion = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LIV",
  url: "https://drinkliv.energy",
  logo: "https://drinkliv.energy/icon.png",
  sameAs: REDES.map((r) => r.href),
  contactPoint: { "@type": "ContactPoint", telephone: "+54-9-3364-36-0607", contactType: "customer service", areaServed: "AR" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${albert.variable} ${fraunces.variable}`}>
      <body>
        <SmoothScroll />
        {children}
        <WhatsAppFlotante />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizacion) }} />
      </body>
    </html>
  );
}
