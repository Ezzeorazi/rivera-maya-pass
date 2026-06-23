// Configuración central del sitio.
// ⚠️ Antes de salir a vender: reemplazá el número placeholder por tu WhatsApp real
// (o mejor, seteá las env vars en Vercel para no tocar código).

export const SITE_URL = "https://rivieramayapass.com";

/**
 * Número de WhatsApp en formato internacional SIN "+" (ej: 521 + lada + número).
 * Usado en links wa.me de toda la web. Placeholder hasta tener el número real.
 */
export const WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "529982017863";

/**
 * Teléfono en formato E.164 (+52...) para el schema LocalBusiness.
 * Por defecto usa el mismo número de WhatsApp (con "+"). Para usar otro,
 * seteá NEXT_PUBLIC_CONTACT_PHONE; para ocultarlo del JSON-LD, ponelo vacío.
 */
export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? `+${WHATSAPP_PHONE}`;

export const CONTACT_EMAIL = "contact@rivieramayapass.com";

/** Google Analytics 4. Vacío = no se carga el script. Ej: "G-XXXXXXXXXX". */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-QG60S7RX42";

/** Código de verificación de Google Search Console (solo el token del meta tag). */
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "UKy1AA8CmDKjfKsrBfHD9NLeXxIVCteiVZix2z5zTPs";
