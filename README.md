# RivieraMayaPass

**El especialista local del day pass en la Riviera Maya.** Conectamos viajeros con
albercas, beach clubs y playas limpias en Playa del Carmen — para disfrutar un día
completo sin tener que pagar la noche de hotel.

🌐 [rivieramayapass.com](https://rivieramayapass.com)

---

## De qué se trata

RivieraMayaPass es el sitio de un negocio local que ofrece **accesos de día (day
pass)** a beach clubs, albercas y hoteles de Playa del Carmen, además de **tours y
experiencias** de la zona. La propuesta de valor es ser *el conocedor local*: el que
sabe qué lugar conviene cada día y le abre la puerta al viajero.

Su diferencial frente a las grandes plataformas (OTAs) es un **dato exclusivo y
local: el estado del sargazo playa por playa, actualizado a diario**. Ese dato es el
gancho que atrae tráfico y, cuando una playa amanece con sargazo, deriva al visitante
hacia planes que no dependen del mar (cenotes, ruinas, islas, parques).

El modelo de contacto y reserva es directo y de baja fricción: **todo se cierra por
WhatsApp**, sin carrito ni checkout.

---

## Qué ofrece el sitio

- **🏖️ Day passes (modo concierge "te lo conseguimos").** Mientras no hay propiedades
  con acuerdo cerrado, el home muestra un bloque honesto que invita a pedir el day
  pass por WhatsApp y lo gestionamos a demanda. Cuando se cargan propiedades reales,
  el sitio pasa solo a mostrar la grilla con sus fichas individuales.
- **🟢 Estado de playas / sargazo.** Semáforo por zona de Playa del Carmen y de la
  región, con resumen y recomendación del día, pronóstico de viento a 3 días, nivel
  de confianza y fuentes. Tiene **página propia** (`/sargazo`) optimizada para la
  búsqueda "sargazo playa del carmen hoy", y un resumen compacto en el home.
- **🌴 Tours y experiencias.** Catálogo de tours de la Riviera Maya (cenotes, Chichén
  Itzá, Xcaret, Isla Mujeres, etc.) presentado como alternativa cuando hay sargazo.
  Funciona con el **programa de afiliados de Viator**.
- **📝 Blog.** Guías y notas SEO sobre day pass, sargazo, precios y beach clubs.
- **⭐ Reseñas.** Testimonios de visitantes.
- **🤝 Alta de prestadores (B2B).** Formulario para que hoteles, beach clubs y
  operadores de tours sumen su servicio (envía por WhatsApp **y** por email).
- **🌎 Bilingüe.** Español e inglés, con URLs e `hreflang` por idioma.
- **🔐 Panel de administración.** Zona privada (`/admin`) para gestionar propiedades y
  el reporte de sargazo sin tocar código.

---

## Cómo está hecho

### Stack

- **[Next.js](https://nextjs.org) (App Router)** con React 19 y TypeScript.
- **[Tailwind CSS v4](https://tailwindcss.com)** para el diseño, con una paleta de
  marca propia (mar, coral, arena, laguna).
- **Tipografías** Fraunces (display) y Hanken Grotesk (texto), vía `next/font`.
- Desplegado en **[Vercel](https://vercel.com)**.

### Estructura del sitio

Rutas localizadas bajo `/[lang]` (`es` / `en`), resueltas por un *middleware* que
redirige al idioma por defecto:

| Ruta | Qué es |
|------|--------|
| `/[lang]` | Home: hero + buscador, resumen de sargazo, tours, propiedades/concierge, reseñas, blog y CTA B2B |
| `/[lang]/sargazo` | Estado de playas completo con pronóstico (página clave de SEO) |
| `/[lang]/tours` | Catálogo de experiencias |
| `/[lang]/blog` y `/[lang]/blog/[slug]` | Blog y artículos |
| `/[lang]/propiedad/[slug]` | Ficha de cada day pass |
| `/[lang]/terminos` · `/[lang]/privacidad` | Legales |
| `/admin/*` | Panel privado (propiedades + sargazo) |
| `/api/contact` | Endpoint del formulario de prestadores |

### Fuentes de datos

El sitio está pensado para arrancar con datos de demo y migrar a fuentes reales sin
tocar las páginas:

- **Propiedades** → capa desacoplada (`lib/get-properties`) que lee de **Supabase** si
  está configurado, con *fallback* controlado. Hoy no se publican negocios que no son
  clientes; las propiedades reales se cargan desde `/admin`.
- **Sargazo** → un **bot diario** (GitHub Actions + Python/Gemini) genera el reporte,
  que se versiona como JSON y se sirve en el sitio; editable manualmente desde
  `/admin`.
- **Tours** → catálogo en vivo desde la **Viator Partner API** (con cache e idioma por
  página), con *fallback* a una selección curada; los enlaces llevan el ID de afiliado
  para acreditar las comisiones.
- **Reseñas y blog** → contenido en archivos del repo.

### SEO

- Metadata por página (títulos, descripciones), `sitemap.xml` y `robots.txt`
  dinámicos.
- `canonical` + `hreflang` (es/en/x-default) en todas las rutas.
- Imagen Open Graph generada como PNG.
- Datos estructurados **JSON-LD** (`LocalBusiness`, `TouristTrip`, `WebPage`).
- La página de sargazo está optimizada como activo SEO principal (alta prioridad y
  actualización diaria en el sitemap).

### Analítica

- **Google Analytics 4** + **Vercel Analytics** y **Speed Insights**.
- **Seguimiento de clicks** propio: un *listener* global registra cada interacción
  marcada con `data-track` (contactos por WhatsApp segmentados por origen, clicks a
  tours de afiliado, uso del buscador, leads B2B, etc.) y envía el evento a GA4 y a
  Vercel a la vez.
- Verificación de **Google Search Console**.

### Contacto y captación

- Toda la conversión pasa por **WhatsApp** (botón flotante, CTAs y fichas), con el
  número y el contacto centralizados en `lib/site`.
- El formulario de prestadores envía el lead por **email** mediante
  [Resend](https://resend.com) y, en paralelo, abre **WhatsApp**.

---

_Desarrollado por [Ezequiel Orazi](https://ezequiel-orazi.online)._
