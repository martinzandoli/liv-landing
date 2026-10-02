/* Catálogo de la tienda. Los packs existen en Tiendanube (mismos IDs); la landing los muestra con su
   propio diseño y Tiendanube queda como motor de pago.
   - Sin credenciales de la API, la tienda queda en "Próximamente" (sin precio ni stock).
   - Con TIENDANUBE_STORE_ID y TIENDANUBE_ACCESS_TOKEN (variables de entorno en Vercel), el precio y el
     stock se leen de Tiendanube cada 5 minutos: para lanzar alcanza con cargarlos ahí. */

export const PACKS = [
  {
    id: "x6",
    latas: 6,
    nombre: "Pack x6",
    lema: "Para probar",
    productId: 371573447,
    variantId: 1610675121,
    sku: "LIV-RAS-06",
    img: "/tienda/latas-x6-v3.jpg",
  },
  {
    id: "x12",
    latas: 12,
    nombre: "Pack x12",
    lema: "Para tener a mano",
    productId: 371573552,
    variantId: 1610675852,
    sku: "LIV-RAS-12",
    img: "/tienda/latas-x12-v3.jpg",
  },
  {
    id: "x24",
    latas: 24,
    nombre: "Pack x24",
    lema: "Para todo el mes",
    productId: 371573580,
    variantId: 1610676164,
    sku: "LIV-RAS-24",
    img: "/tienda/latas-x24-v3.jpg",
  },
];

export const API_TIENDANUBE = "https://api.tiendanube.com/v1";
export const USER_AGENT = "LIV Landing (https://drinkliv.energy)";

export function credenciales() {
  const store = process.env.TIENDANUBE_STORE_ID;
  const token = process.env.TIENDANUBE_ACCESS_TOKEN;
  return store && token ? { store, token } : null;
}

export function cabeceras(token) {
  return { Authentication: `bearer ${token}`, "User-Agent": USER_AGENT, "Content-Type": "application/json" };
}

const numero = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

/* Packs con precio y stock. Un pack está disponible si tiene precio y stock (o stock sin control). */
export async function getCatalogo() {
  const packs = PACKS.map((p) => ({ ...p, precio: null, precioLista: null, stock: 0 }));

  // Sólo para revisar el diseño en local con precios de ejemplo: TIENDA_DEMO=1
  if (process.env.NODE_ENV !== "production" && process.env.TIENDA_DEMO === "1") {
    const demo = { x6: 15000, x12: 28000, x24: 52000 };
    return terminar(packs.map((p) => ({ ...p, precio: demo[p.id], stock: 40 })));
  }

  const cred = credenciales();
  if (!cred) return terminar(packs);
  try {
    const res = await fetch(`${API_TIENDANUBE}/${cred.store}/products?per_page=50&fields=id,variants`, {
      headers: cabeceras(cred.token),
      next: { revalidate: 300 },
    });
    if (!res.ok) return terminar(packs);
    const productos = await res.json();
    for (const p of packs) {
      const v = productos.find((x) => x.id === p.productId)?.variants?.find((x) => x.id === p.variantId);
      if (!v) continue;
      const lista = numero(v.price);
      const promo = numero(v.promotional_price);
      p.precio = promo && lista && promo < lista ? promo : lista;
      p.precioLista = promo && lista && promo < lista ? lista : null;
      p.stock = v.stock_management === false || v.stock === null ? 999 : Math.max(0, numero(v.stock) || 0);
    }
  } catch {
    // si la API no responde, la tienda queda en "Próximamente"
  }
  return terminar(packs);
}

function terminar(packs) {
  const lista = packs.map((p) => ({ ...p, disponible: Boolean(p.precio && p.precio > 0 && p.stock > 0) }));
  return { packs: lista, ventaAbierta: lista.some((p) => p.disponible) };
}

export const precioArs = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
