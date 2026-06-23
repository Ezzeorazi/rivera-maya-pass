# Viator — Afiliados (registro y activación)

Guía para dar de alta el programa de afiliados de Viator y activar las comisiones
en el sitio. La oferta de tours ya está implementada (sección en el home, página
`/tours`, CTA contextual en el semáforo de sargazo). Solo falta el Partner ID.

---

## 1. Registro (≈ 1 minuto)

1. Entrá a **https://partners.viator.com/signup**
2. Iniciá sesión con tu cuenta de **TripAdvisor** (si no tenés, la creás ahí mismo).
3. Completá el formulario con datos básicos de la plataforma.
4. Cargá los **datos de cobro**.
5. Te aprueban y obtenés tu **Partner ID** (algo tipo `P00012345`).

**No hay mínimos de tráfico ni de seguidores** → la aprobación es prácticamente
automática.

### Datos a tener a mano para el formulario
- **URL del sitio:** `https://rivieramayapass.com` (o la URL `*.vercel.app` si el
  dominio aún no propagó).
- **Tipo / temática:** sitio de turismo y day passes en la Riviera Maya / Playa del Carmen.
- **Método de pago:** **PayPal** (recomendado: pago semanal, sin mínimo) o banco
  (mensual, mínimo US$50).

---

## 2. Condiciones del programa

| Concepto      | Detalle                                              |
|---------------|------------------------------------------------------|
| Comisión      | **8%** por reserva **completada**                    |
| Cookie        | **30 días**                                          |
| Pago PayPal   | Semanal, sin mínimo ✅                               |
| Pago banco    | Mensual, mínimo US$50 (se acumula si no llegás)      |
| Requisitos    | Sin mínimo de tráfico/seguidores                     |

La comisión se acredita **después de que el cliente completa el tour**. Si cancela
o no se presenta, no hay comisión.

### Políticas clave (para no ser dado de baja)
- ✅ **Disclosure de afiliado (FTC):** obligatorio. Ya implementado al pie de cada
  grilla de tours (`TourSection.tsx` → `tours.affiliateDisclosure` en los diccionarios).
- ⚠️ **No** usar la marca "Viator" en el dominio/subdominio ni pujar por ella en
  ads (Google, Meta, etc.). No aplicamos ads, así que OK.
- ⚠️ **Email marketing** promocionando Viator requiere **aprobación previa** de ellos.
- ❌ Nada de sitios de contenido adulto/odio (no aplica).

---

## 3. Activar las comisiones (Fase 1 — deep-links)

Una sola variable de entorno:

1. Vercel → proyecto → **Settings → Environment Variables**.
2. Agregá:
   - `NEXT_PUBLIC_VIATOR_PID` = tu Partner ID
   - (opcionales) `NEXT_PUBLIC_VIATOR_MCID` (default `42383`), `NEXT_PUBLIC_VIATOR_MEDIUM` (default `link`)
3. **Redeploy.**

Listo: todos los enlaces a Viator del sitio ya llevan tu tracking. El helper que
lo arma es `src/lib/viator.ts` (`buildAffiliateUrl`). Sin el PID los enlaces
funcionan igual pero **no acreditan comisión**.

### Mejorar conversión (opcional)
Reemplazá los `viatorUrl` de `src/data/tours.ts` (hoy son búsquedas genéricas) por
**deep-links de producto** específicos generados con el *Link Builder* del panel de
Viator. El tracking se sigue agregando solo.

---

## 4. Catálogo en vivo (Fase 2 — Partner API)

Ya está el data layer listo en `src/lib/get-tours.ts`. Trae los tours desde la API
de Viator y **cae automáticamente a los tours curados** si la API no está
configurada o falla (el sitio nunca se rompe).

Para activarla:

1. Pedí en tu panel acceso **"Basic-access affiliate"** a la Partner API y generá
   una **API key**.
2. Vercel → Environment Variables:
   - `VIATOR_API_KEY` = tu key
   - (opcionales) `VIATOR_DESTINATION_ID` (default `631` = Cancún/Riviera Maya),
     `VIATOR_TOURS_COUNT` (default `12`)
3. **Redeploy.**

Detalles técnicos:
- Endpoint: `POST https://api.viator.com/partner/products/search`
- Headers: `exp-api-key`, `Accept: application/json;version=2.0`, `Accept-Language`, `Content-Type`
- Caché: 6 h (`revalidate`), para no golpear la API en cada request.
- Docs: https://docs.viator.com/partner-api/affiliate/technical/

> ⚠️ La integración de la API quedó escrita según la doc oficial pero **sin
> probar contra una key real**. Al activarla, verificá en el deploy que los tours
> carguen bien; si algo del esquema cambió, ajustá el mapeo en `mapProduct()`.
> Mientras tanto, el fallback a curados garantiza que la sección siempre funcione.

---

## Archivos relevantes
- `src/data/tours.ts` — tours curados (fallback) + tipos.
- `src/lib/get-tours.ts` — data layer: API Viator + fallback.
- `src/lib/viator.ts` — tracking de afiliado (pid/mcid/medium).
- `src/components/TourCard.tsx`, `TourSection.tsx` — UI.
- `src/app/[lang]/tours/page.tsx` — página dedicada.
- `src/components/BeachStatus.tsx` — CTA contextual cuando hay sargazo.
