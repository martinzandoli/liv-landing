import { put, list } from '@vercel/blob';

// Opcional: forzá Node.js runtime (no Edge)
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email inválido' }),
        { status: 400 }
      );
    }

    // ⬇️ usamos el token que Vercel inyecta al conectar el Store
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Falta BLOB_READ_WRITE_TOKEN en el proyecto');
      return new Response(
        JSON.stringify({ ok: false, error: 'Storage no configurado' }),
        { status: 500 }
      );
    }

    const CSV_NAME = 'emails.csv';

    // Ver si ya existe el CSV
    const { blobs } = await list({ prefix: CSV_NAME, token });
    let current = '';

    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      current = res.ok ? await res.text() : '';
    }

    // Armar CSV (con header si hace falta)
    const header = 'email,created_at\n';
    const hasHeader = current.startsWith('email,created_at');
    const safeEmail = String(email).replace(/,/g, ' ');
    const line = `${safeEmail},${new Date().toISOString()}\n`;

    const nextContent =
      (hasHeader ? current : (current ? header + current : header)) + line;

    // Guardar (sobrescribe mismo nombre)
    await put(CSV_NAME, nextContent, {
      access: 'private',
      contentType: 'text/csv; charset=utf-8',
      token,               // ⬅️ token explícito
      addRandomSuffix: false,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('subscribe error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'Server error' }),
      { status: 500 }
    );
  }
}
