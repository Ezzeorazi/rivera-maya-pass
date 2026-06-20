import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import PrintButton from './PrintButton';

export const metadata: Metadata = {
  title: 'Documentación · Bot de sargazo',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function SargazoDocPage() {
  if (!(await isAuthenticated())) redirect('/admin/login');

  return (
    <main className="min-h-screen bg-white text-ink">
      {/* Barra de acciones (no se imprime) */}
      <div className="print:hidden sticky top-0 z-10 bg-ink text-sand">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/admin/sargazo" className="text-sm text-lagoon/80 hover:text-lagoon">
            ← Volver al panel
          </Link>
          <PrintButton />
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-10 leading-relaxed">
        <header className="mb-8 border-b border-line pb-6">
          <p className="text-xs uppercase tracking-widest text-sea font-semibold mb-1">
            RivieraMayaPass · Documentación técnica
          </p>
          <h1 className="font-display text-3xl font-bold">Bot de Sargazo</h1>
          <p className="text-ink-soft mt-2">
            Qué hace hoy, cómo funciona y a dónde va en los próximos 2 meses.
          </p>
        </header>

        <H>1. ¿Qué es?</H>
        <P>
          El Bot de Sargazo es un sistema automático que, <B>todos los días</B>,
          publica el estado del sargazo en las playas de la Riviera Maya y ayuda
          al visitante a decidir a dónde ir. Combina <B>datos reales</B> (viento,
          temperatura, pronóstico, alertas de tormenta) con <B>inteligencia
          artificial</B> que busca en internet e interpreta la información. El
          resultado alimenta la sección «Estado de playas» del sitio.
        </P>
        <P>
          No requiere servidor propio ni intervención manual: corre solo en la
          nube y se actualiza día a día. Costo de operación: prácticamente cero.
        </P>

        <H>2. Qué hace hoy (capacidades actuales)</H>
        <UL
          items={[
            'Estado del sargazo por zona en Playa del Carmen (Zona Norte, Mamitas, Centro, Playacar, Xcalacoco).',
            '«¿Dónde está limpio hoy?»: estado en Holbox, Isla Mujeres, Puerto Morelos, Cancún y Tulum, para sugerir alternativas.',
            'Viento de hoy (dirección, velocidad, ráfagas) y temperatura, medidos en tiempo real.',
            'Pronóstico de viento y temperatura a 3 días, con señal de si el viento empuja el sargazo a la costa.',
            'Alertas de tormenta/huracán activas en el Caribe (con su distancia).',
            'Resumen y recomendación práctica, redactados en español e inglés.',
            'Nivel de confianza del reporte y las fuentes consultadas (transparencia).',
            'Controles anti-error: estado «sin dato» cuando no hay información, e interruptor manual para corregir o pausar.',
            'Historial diario almacenado (este panel) como base de datos para el futuro modelo predictivo.',
          ]}
        />

        <H>3. Cómo funciona (arquitectura)</H>
        <Pre>
{`GitHub Actions (reloj) — corre cada día 10:00 hora QR
        │
        ▼
Script en Python (cerebro)
  ├─ Open-Meteo  → viento + temperatura (hoy y pronóstico)
  ├─ NOAA NHC    → tormentas/huracanes activos
  └─ Google Gemini (IA) → busca el sargazo en internet y cruza todo
        │
        ├─►  sitio web (Vercel)        → lo ve el visitante
        └─►  base de datos (Supabase)  → se acumula el histórico`}
        </Pre>
        <P>
          La inteligencia artificial usada es <B>Google Gemini</B> con búsqueda
          web («grounding»): el modelo busca fuentes reales del día (Red de
          Monitoreo del Sargazo de Quintana Roo, noticias locales), las lee, las
          combina con el viento medido y produce un reporte estructurado.
        </P>

        <H>4. Qué datos se guardan (cada día)</H>
        <P>
          Por cada día se registra una fila con: fecha y hora de captura, fuente,
          nivel de confianza, viento (dirección en grados y cardinal, velocidad,
          ráfagas), temperatura, estado por zona (Playa del Carmen y región),
          peor estado del día, si hay alerta de huracán, el resumen, la
          recomendación, el pronóstico y las fuentes. Esta acumulación diaria es
          la <B>materia prima</B> del modelo predictivo de la Fase 2.
        </P>

        <H>5. A dónde va en 2 meses (roadmap)</H>
        <P>
          <B>Fase 1 (hecha):</B> reporte diario + previsión por reglas (heurística
          según el viento).
        </P>
        <P>
          <B>Fase 2 (~2-3 meses):</B> <B>modelo de Machine Learning</B> que predice
          el arribo de sargazo a 48-72 horas. Necesita datos: por eso hoy se
          acumula el histórico. Cuando haya ~60-90 días, se entrena el modelo (ver
          §6).
        </P>
        <P>
          <B>Fase 3 (más adelante):</B> incorporar <B>datos satelitales</B>{' '}
          (índice AFAI / Copernicus) que detectan las manchas de sargazo flotando
          en el Atlántico <B>días antes</B> de llegar a la costa, y leer con visión
          el <B>mapa-semáforo oficial</B> para tener el dato verificado playa por
          playa. Esto es lo que da una predicción realmente precisa a varios días.
        </P>

        <H>6. ¿Qué es el Machine Learning? (en cristiano)</H>
        <P>
          <B>Machine Learning (ML)</B> o «aprendizaje automático» es enseñarle a
          una computadora a <B>reconocer patrones a partir de ejemplos</B>, en vez
          de programarle reglas a mano.
        </P>
        <P className="font-semibold">Ejemplos de la vida cotidiana:</P>
        <UL
          items={[
            'Netflix/Spotify: aprenden de lo que viste o escuchaste antes y te recomiendan lo próximo. Nadie programó "a esta persona le gusta X"; el sistema lo dedujo de tus ejemplos.',
            'El corrector del celular: aprende cómo escribís y predice la próxima palabra.',
            'Un pescador veterano: tras años de salir al mar, "sabe" que con cierto viento y mar picado conviene no salir. No leyó un manual: aprendió de la experiencia (muchos ejemplos). El ML hace lo mismo, pero con datos.',
          ]}
        />
        <P>
          <B>¿Por qué sirve para el sargazo?</B> Porque el sargazo no llega al
          azar: responde a patrones (viento, corrientes, época del año). Si le
          damos a la computadora muchos ejemplos de «tal día, con tal viento y tal
          época, llegó tanto sargazo», puede aprender la relación y{' '}
          <B>estimar el día de mañana</B>.
        </P>
        <P>
          <B>¿Cómo se entrena?</B> Igual que estudiás con exámenes viejos:
        </P>
        <UL
          items={[
            'Se juntan datos: cada día guardamos el viento, la temperatura, la época y el estado real de las playas (las "preguntas" y la "respuesta correcta").',
            'Se entrena: el algoritmo (un "Random Forest", como un conjunto de muchos árboles de decisión que votan) busca patrones entre las condiciones y el resultado.',
            'Se evalúa: se compara contra una "línea base" simple (suponer que mañana será igual que hoy). El modelo solo se usa si le gana a esa base.',
            'Se mejora: cada día que pasa hay más ejemplos, así que el modelo se puede re-entrenar y volverse más preciso.',
          ]}
        />
        <P>
          <B>Un límite honesto:</B> el modelo aprende de las «respuestas» que le
          damos. Hoy esas respuestas son la estimación de la IA; por eso conviene
          <B> verificar los días con el semáforo oficial</B> (función «Editar» de
          este panel). Cuantos más días verificados, mejor aprende el modelo.
        </P>

        <H>7. Tecnología utilizada</H>
        <UL
          items={[
            'Automatización: GitHub Actions (cron diario).',
            'Lenguaje del bot: Python.',
            'IA: Google Gemini con Google Search grounding.',
            'Clima: Open-Meteo API (viento, temperatura, pronóstico).',
            'Tormentas: NOAA National Hurricane Center (CurrentStorms).',
            'Base de datos: Supabase (PostgreSQL).',
            'Sitio web: Next.js sobre Vercel.',
            'Modelo predictivo (Fase 2): scikit-learn (Random Forest / clasificación), pandas.',
          ]}
        />

        <H>8. Bibliografía y fuentes</H>
        <UL
          items={[
            'Red de Monitoreo del Sargazo de Quintana Roo (SEMA) — mapa-semáforo diario por playa.',
            'Open-Meteo — API meteorológica abierta. https://open-meteo.com',
            'NOAA National Hurricane Center — https://www.nhc.noaa.gov',
            'University of South Florida, Optical Oceanography Lab — Sargassum Watch System (índice AFAI). https://optics.marine.usf.edu',
            'Copernicus Marine Service (UE) — corrientes y temperatura del mar. https://marine.copernicus.eu',
            'scikit-learn — biblioteca de Machine Learning. https://scikit-learn.org',
            'Wang, M. et al. (2019). "The great Atlantic Sargassum belt", Science — sobre el origen y dinámica del sargazo en el Atlántico.',
          ]}
        />

        <footer className="mt-10 pt-6 border-t border-line text-xs text-ink-soft">
          RivieraMayaPass — documento generado para uso interno. Para guardarlo
          como PDF, usá el botón «Guardar / Imprimir PDF» (o Ctrl/Cmd + P →
          Guardar como PDF).
        </footer>
      </article>
    </main>
  );
}

/* ---------- pequeños componentes de maquetación ---------- */

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-bold text-ink mt-8 mb-3 break-after-avoid">
      {children}
    </h2>
  );
}

function P({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-ink-soft mb-3 ${className}`}>{children}</p>;
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-ink font-semibold">{children}</strong>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-ink-soft mb-4 marker:text-sea">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-sand/60 border border-line rounded-xl p-4 text-xs overflow-x-auto mb-4 text-ink whitespace-pre">
      {children}
    </pre>
  );
}
