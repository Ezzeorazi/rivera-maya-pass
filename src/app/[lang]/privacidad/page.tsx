import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de privacidad integral de RivieraMayaPass conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México, 2025).",
  robots: { index: true, follow: true },
};

type Section = { heading: string; body: string[] };
type Content = {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
};

const content: Record<"es" | "en", Content> = {
  es: {
    title: "Aviso de Privacidad",
    updated: "Última actualización: 20 de junio de 2026",
    intro:
      "El presente Aviso de Privacidad Integral se emite en cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente en los Estados Unidos Mexicanos (publicada en el Diario Oficial de la Federación el 20 de marzo de 2025) y su normativa secundaria.",
    sections: [
      {
        heading: "1. Responsable del tratamiento",
        body: [
          "RivieraMayaPass (en adelante, “el Responsable”), con operación en Playa del Carmen, Municipio de Solidaridad, Quintana Roo, México, y correo de contacto contact@rivieramayapass.com, es responsable del tratamiento y protección de los datos personales que usted (el “Titular”) llegue a proporcionar.",
        ],
      },
      {
        heading: "2. Datos personales que se recaban",
        body: [
          "El Responsable únicamente recaba los datos que el Titular proporciona de forma voluntaria al contactarnos o solicitar una reserva, los cuales pueden incluir: nombre, número de teléfono o WhatsApp, y correo electrónico.",
          "Adicionalmente, de forma automática se pueden recabar datos de navegación con fines estadísticos y de funcionamiento, tales como dirección IP, tipo de dispositivo y navegador, y páginas visitadas.",
          "El Responsable NO recaba datos personales sensibles ni datos patrimoniales o financieros (no se procesan pagos en la Plataforma).",
        ],
      },
      {
        heading: "3. Finalidades del tratamiento",
        body: [
          "Finalidades primarias (necesarias para el servicio): (i) atender y dar seguimiento a sus consultas y solicitudes de reserva; (ii) poner al Titular en contacto con el hotel, beach club o establecimiento (el “Establecimiento”) de su interés; y (iii) cumplir obligaciones legales aplicables.",
          "Finalidades secundarias (opcionales): (i) enviar información promocional, novedades y ofertas; y (ii) elaborar estadísticas para mejorar la Plataforma. Si no desea que sus datos se traten para estas finalidades secundarias, puede manifestarlo en cualquier momento escribiendo a contact@rivieramayapass.com; su negativa no será motivo para negarle los servicios.",
        ],
      },
      {
        heading: "4. Transferencias de datos",
        body: [
          "Para gestionar su solicitud, sus datos pueden ser transferidos al Establecimiento seleccionado por usted, transferencia necesaria para la prestación del servicio solicitado conforme a la legislación aplicable. Asimismo, podemos apoyarnos en proveedores tecnológicos que actúan como encargados (por ejemplo, servicios de hospedaje web y plataformas de mensajería), quienes tratan los datos únicamente por cuenta del Responsable.",
          "Salvo lo anterior y las excepciones previstas por la ley, no transferimos sus datos a terceros sin su consentimiento.",
        ],
      },
      {
        heading: "5. Derechos ARCO y revocación del consentimiento",
        body: [
          "Usted tiene derecho a Acceder a sus datos personales, a Rectificarlos cuando sean inexactos, a Cancelarlos cuando considere que no se requieren para las finalidades señaladas, y a Oponerse a su tratamiento (derechos ARCO). También puede revocar el consentimiento otorgado.",
          "Para ejercer cualquiera de estos derechos, envíe su solicitud a contact@rivieramayapass.com indicando su nombre, los datos sobre los que desea ejercer el derecho y una descripción clara de su petición. Daremos respuesta en los plazos que marca la ley.",
        ],
      },
      {
        heading: "6. Limitación del uso o divulgación",
        body: [
          "Puede solicitar la limitación del uso o divulgación de sus datos enviando un correo a contact@rivieramayapass.com. De resultar procedente, su solicitud será atendida conforme a la normativa aplicable.",
        ],
      },
      {
        heading: "7. Uso de cookies y tecnologías de rastreo",
        body: [
          "La Plataforma puede utilizar cookies y tecnologías similares con fines técnicos y estadísticos para mejorar la experiencia de navegación. El Titular puede deshabilitar las cookies desde la configuración de su navegador, considerando que ello podría afectar el funcionamiento del sitio.",
        ],
      },
      {
        heading: "8. Autoridad en materia de protección de datos",
        body: [
          "Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir ante la autoridad competente en la materia, que conforme a la legislación vigente corresponde a la Secretaría Anticorrupción y Buen Gobierno del Gobierno de México.",
        ],
      },
      {
        heading: "9. Cambios al Aviso de Privacidad",
        body: [
          "El presente Aviso podrá ser modificado en cualquier momento para atender novedades legislativas, internas o de servicio. Cualquier cambio se publicará en esta misma página, por lo que recomendamos su revisión periódica.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Notice",
    updated: "Last updated: June 20, 2026",
    intro:
      "This comprehensive Privacy Notice is issued in compliance with the Mexican Federal Law on the Protection of Personal Data Held by Private Parties currently in force (published in the Official Gazette of the Federation on March 20, 2025) and its secondary regulations.",
    sections: [
      {
        heading: "1. Data controller",
        body: [
          "RivieraMayaPass (the “Controller”), operating in Playa del Carmen, Municipality of Solidaridad, Quintana Roo, Mexico, with contact email contact@rivieramayapass.com, is responsible for the processing and protection of the personal data you (the “Data Subject”) may provide.",
        ],
      },
      {
        heading: "2. Personal data collected",
        body: [
          "The Controller only collects data that the Data Subject voluntarily provides when contacting us or requesting a booking, which may include: name, phone or WhatsApp number, and email address.",
          "Additionally, navigation data may be collected automatically for statistical and operational purposes, such as IP address, device and browser type, and pages visited.",
          "The Controller does NOT collect sensitive personal data or financial/patrimonial data (no payments are processed on the Platform).",
        ],
      },
      {
        heading: "3. Purposes of processing",
        body: [
          "Primary purposes (necessary for the service): (i) to handle and follow up on your inquiries and booking requests; (ii) to put the Data Subject in contact with the hotel, beach club or establishment (the “Establishment”) of interest; and (iii) to comply with applicable legal obligations.",
          "Secondary purposes (optional): (i) to send promotional information, news and offers; and (ii) to compile statistics to improve the Platform. If you do not want your data processed for these secondary purposes, you may state so at any time by writing to contact@rivieramayapass.com; your refusal will not be grounds to deny you the services.",
        ],
      },
      {
        heading: "4. Data transfers",
        body: [
          "To manage your request, your data may be transferred to the Establishment you select, a transfer necessary to provide the requested service under applicable law. We may also rely on technology providers acting as processors (for example, web hosting and messaging platforms), which process the data solely on behalf of the Controller.",
          "Except for the above and the exceptions provided by law, we do not transfer your data to third parties without your consent.",
        ],
      },
      {
        heading: "5. ARCO rights and withdrawal of consent",
        body: [
          "You have the right to Access your personal data, to Rectify it when inaccurate, to Cancel it when you consider it is no longer required for the stated purposes, and to Object to its processing (ARCO rights). You may also withdraw the consent granted.",
          "To exercise any of these rights, send your request to contact@rivieramayapass.com stating your name, the data over which you wish to exercise the right, and a clear description of your request. We will respond within the timeframes set by law.",
        ],
      },
      {
        heading: "6. Limiting use or disclosure",
        body: [
          "You may request the limitation of the use or disclosure of your data by emailing contact@rivieramayapass.com. Where applicable, your request will be handled in accordance with the relevant regulations.",
        ],
      },
      {
        heading: "7. Use of cookies and tracking technologies",
        body: [
          "The Platform may use cookies and similar technologies for technical and statistical purposes to improve the browsing experience. The Data Subject may disable cookies from their browser settings, bearing in mind that doing so may affect the operation of the site.",
        ],
      },
      {
        heading: "8. Data protection authority",
        body: [
          "If you believe your right to the protection of personal data has been violated, you may turn to the competent authority on the matter, which under current legislation is the Anti-Corruption and Good Governance Secretariat (Secretaría Anticorrupción y Buen Gobierno) of the Government of Mexico.",
        ],
      },
      {
        heading: "9. Changes to this Privacy Notice",
        body: [
          "This Notice may be amended at any time to address legislative, internal or service-related developments. Any change will be published on this same page, so we recommend periodic review.",
        ],
      },
    ],
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = content[lang === "en" ? "en" : "es"];

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
      <h1 className="font-display text-3xl lg:text-4xl font-semibold text-ink mb-2">
        {t.title}
      </h1>
      <p className="text-ink-soft/70 text-sm font-body mb-8">{t.updated}</p>

      <p className="text-ink leading-relaxed font-body mb-10">{t.intro}</p>

      <div className="space-y-8">
        {t.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl font-semibold text-ink mb-3">
              {section.heading}
            </h2>
            <div className="space-y-3">
              {section.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-ink-soft leading-relaxed font-body text-[15px]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
