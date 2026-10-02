import { API_TIENDANUBE, PACKS, cabeceras, credenciales } from "@/lib/catalogo";

/* Arma el pedido en Tiendanube y devuelve el link de pago.
   El carrito vive en la landing; al finalizar se crea un pedido borrador (draft order) con los packs y
   los datos de contacto, y Tiendanube devuelve un checkout_url donde se paga con Pago Nube. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (v, max = 60) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request) {
  const cred = credenciales();
  if (!cred) {
    return Response.json({ error: "La tienda abre pronto. Sumate a la lista y te avisamos." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const nombre = texto(body?.nombre);
  const apellido = texto(body?.apellido);
  const email = texto(body?.email, 120);
  const telefono = texto(body?.telefono, 30);
  if (!nombre || !apellido || !EMAIL.test(email)) {
    return Response.json({ error: "Revisá nombre, apellido y email." }, { status: 400 });
  }

  // Sólo se aceptan los packs del catálogo y cantidades razonables
  const items = Array.isArray(body?.items) ? body.items : [];
  const productos = [];
  for (const it of items) {
    const pack = PACKS.find((p) => p.id === it?.id);
    const cantidad = Math.floor(Number(it?.cantidad));
    if (!pack || !Number.isFinite(cantidad) || cantidad < 1 || cantidad > 20) continue;
    productos.push({ variant_id: pack.variantId, quantity: cantidad });
  }
  if (!productos.length) {
    return Response.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_TIENDANUBE}/${cred.store}/draft_orders`, {
      method: "POST",
      headers: cabeceras(cred.token),
      body: JSON.stringify({
        contact_name: nombre,
        contact_lastname: apellido,
        contact_email: email,
        ...(telefono ? { contact_phone: telefono } : {}),
        payment_status: "unpaid",
        note: "Pedido desde drinkliv.energy/tienda",
        products: productos,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.checkout_url) {
      return Response.json({ error: "No pudimos armar el pedido. Probá de nuevo en un rato." }, { status: 502 });
    }
    const url = /^https?:\/\//.test(data.checkout_url) ? data.checkout_url : `https://${data.checkout_url}`;
    return Response.json({ url });
  } catch {
    return Response.json({ error: "No pudimos conectar con la tienda. Probá de nuevo en un rato." }, { status: 502 });
  }
}
