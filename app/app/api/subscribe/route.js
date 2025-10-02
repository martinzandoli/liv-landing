import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // Para comprobar que la ruta existe: devuelve 405 en GET
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Email inválido' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN; // Vercel lo inyecta al conectar el Store
    if (!token) {
      return res.status(500).json({ ok: false, error: 'Storage no configurado' });
    }

    const CSV_NAME = 'emails.csv';

    // Buscar CSV existente
    const { blobs } = await list({ prefix: CSV_NAME, token });
    let current = '';
    if (blobs.length > 0) {
      const r = await fetch(blobs[0].url);
      current = r.ok ? await r.text() : '';
    }

    // Armar CSV con header si falta
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
      token,
      addRandomSuffix: false,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
