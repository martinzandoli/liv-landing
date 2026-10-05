/* Redes y WhatsApp oficiales de LIV (los mismos links que linktr.ee/drinkliv) */
// Link a WhatsApp con el mensaje ya escrito
export const whatsapp = (texto) => "https://wa.me/5493364360607?text=" + encodeURIComponent(texto);

export const WHATSAPP = {
  numero: "+54 9 3364 36-0607",
  href: whatsapp("Hola LIV, quería hacerles una consulta."),
};

export const REDES = [
  { red: "Instagram", usuario: "@drinkliv", href: "https://www.instagram.com/drinkliv" },
  { red: "TikTok", usuario: "@drink_liv", href: "https://www.tiktok.com/@drink_liv" },
  { red: "X", usuario: "@drinkliv", href: "https://x.com/drinkliv" },
];
