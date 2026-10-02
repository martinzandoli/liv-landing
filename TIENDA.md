# Tienda (drinkliv.energy/tienda)

La tienda vive en la landing con su propio diseño; **Tiendanube es el motor**: catálogo, precios, stock,
cobro (Pago Nube), pedidos y facturación. El cliente nunca ve la tienda de Tiendanube salvo en el paso de pago.

## Cómo está armada

| Archivo | Qué hace |
|---|---|
| `lib/catalogo.js` | Los tres packs con sus IDs de producto y variante en Tiendanube. Lee precio y stock de la API (cada 5 minutos) si hay credenciales. |
| `app/tienda/page.jsx` | Página `/tienda`. |
| `components/tienda/Tienda.jsx` | Selector de packs, galería y listado. |
| `components/tienda/Carrito.jsx` | Carrito (se guarda en el navegador) y paso de datos para pagar. |
| `app/api/checkout/route.js` | Crea un **pedido borrador** (draft order) en Tiendanube y devuelve el link de pago (`checkout_url`). |
| `public/tienda/*-v5.jpg` | Fotos de la lata y los packs. Se arman con los scripts de `marketing/salida/tienda/` (fuera del repo). |

Productos en Tiendanube (mismos IDs que en `lib/catalogo.js`):

| Pack | Producto | Variante | SKU |
|---|---|---|---|
| x6 | 371573447 | 1610675121 | LIV-RAS-06 |
| x12 | 371573552 | 1610675852 | LIV-RAS-12 |
| x24 | 371573580 | 1610676164 | LIV-RAS-24 |

## Estado actual: "Próximamente"

Sin credenciales de la API (o sin precio y stock), la tienda muestra "Sale pronto" y el formulario de la
lista de espera. El carrito no aparece.

## Para abrir la venta

1. **Crear una app en Tiendanube** (panel de socios/desarrolladores) con permisos de lectura de productos y
   de escritura de pedidos borrador, e instalarla en la tienda. De ahí salen el `store_id` y el `access_token`.
2. **Cargar las credenciales en Vercel** (Settings → Environment Variables, entorno Production):
   - `TIENDANUBE_STORE_ID`
   - `TIENDANUBE_ACCESS_TOKEN`

   Nunca en el código ni en un chat.
3. **Cargar precio y stock** de los tres packs en el admin de Tiendanube.
4. **Volver a publicar** (redeploy). Desde ahí la página toma precio y stock sola y aparece el carrito.
5. **Hacer una compra de prueba** completa y revisar que el pedido llegue al admin.

## Pendiente

- **Envíos**: definir cómo se cobran (fijo, gratis desde un monto o por código postal) y verificar cómo los
  maneja el pago del pedido borrador; hoy el pedido se crea solo con los packs.
- La tienda de Tiendanube (livenergywater.mitiendanube.com) tiene los productos viejos ocultos; se pueden
  borrar y redirigir sus páginas de producto a `/tienda`.
- Lista de espera: los mails van a Formspree (`components/SignupForm.jsx`), no a Tiendanube.

Para revisar el diseño con precios de ejemplo en local: `TIENDA_DEMO=1` en `.env.local` (no tiene efecto en producción).
