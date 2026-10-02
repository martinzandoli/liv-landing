import Header from "@/components/Header";
import Cierre from "@/components/Cierre";
import Tienda from "@/components/tienda/Tienda";
import { BotonCarrito, CarritoProvider } from "@/components/tienda/Carrito";
import { getCatalogo } from "@/lib/catalogo";

// El precio y el stock se leen de Tiendanube; la página se regenera cada 5 minutos
export const revalidate = 300;

export const metadata = {
  title: "Tienda — LIV",
  description:
    "Packs de LIV Raspberry: energy drink con gas en lata sleek de 355 mL, con 100 mg de cafeína, 200 mg de L-teanina, 0 azúcar y 0 calorías.",
  alternates: { canonical: "/tienda" },
  openGraph: {
    title: "Tienda — LIV",
    description: "Elegí tu pack de LIV Raspberry: x6, x12 o x24 latas de 355 mL.",
    images: ["/tienda/latas-x12-v4.jpg"],
    locale: "es_AR",
    type: "website",
  },
};

export default async function TiendaPage() {
  const { packs, ventaAbierta } = await getCatalogo();
  return (
    <CarritoProvider packs={packs} ventaAbierta={ventaAbierta}>
      <Header base="/" acciones={<BotonCarrito />} />
      <Tienda packs={packs} />
      <Cierre base="/" />
    </CarritoProvider>
  );
}
