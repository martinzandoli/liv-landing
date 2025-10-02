import { put, list } from '@vercel/blob';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email inválido' }),
        { status: 400 }
      );
    }

    // Nombre fijo del archivo CSV
    const CSV_NAME = 'emails.csv';

    // Ver si ya existe el CSV en Vercel Blob
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: CSV_NAME,
    });
    let current = '';

    if (blobs.length > 0) {
      const url = blobs[0].url;
      const res = await fetch(url);
      current = res.ok ? await res.text() : '';
    }

    // Armar el header si aún no existe
    const hasHeader = current.startsWith('email,created_at');
    const header = 'email,created_at\n';
    const line = `${email.replace(/,/g, ' ')},${new Date().toISOString()}\n`;

    const nextContent =
      (hasHeader ? current : current ? header + current : header) + line;

    // Guardar en Blob (sobrescribe con el mismo nombre)
    await put(CSV_NAME, nextContent, {
      access: 'private', // cambiar a 'public' si querés acceder con link
      contentType: 'text/csv; charset=utf-8',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ ok: false, error: 'Server error' }),
      { status: 500 }
    );
  }
}
