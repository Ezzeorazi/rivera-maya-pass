import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de RivieraMayaPass, plataforma de intermediación de day passes en la Riviera Maya.",
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
    title: "Términos y Condiciones",
    updated: `Última actualización: 20 de junio de 2026`,
    intro:
      "Al acceder y utilizar el sitio web RivieraMayaPass (en adelante, “la Plataforma”), usted (en adelante, “el Usuario”) acepta de forma expresa los presentes Términos y Condiciones. Si no está de acuerdo con ellos, le solicitamos abstenerse de utilizar la Plataforma.",
    sections: [
      {
        heading: "1. Naturaleza del servicio",
        body: [
          "RivieraMayaPass es una plataforma tecnológica de intermediación y difusión que conecta a Usuarios interesados en adquirir pases de día (“day passes”) con hoteles, beach clubs, albercas y establecimientos turísticos de terceros (en adelante, “los Establecimientos”) en la Riviera Maya, Quintana Roo, México.",
          "RivieraMayaPass NO es propietaria, operadora, administradora ni responsable de los Establecimientos, ni de las instalaciones, servicios, alimentos, bebidas, actividades o experiencias que estos ofrecen. RivieraMayaPass actúa exclusivamente como un canal de contacto y promoción.",
        ],
      },
      {
        heading: "2. Reservas y pagos",
        body: [
          "Las solicitudes de reserva se gestionan a través de servicios de mensajería de terceros (como WhatsApp) directamente entre el Usuario y el Establecimiento correspondiente. RivieraMayaPass no procesa pagos ni cobra importe alguno por las reservas.",
          "La confirmación, disponibilidad, condiciones de cancelación, reembolsos y cualquier otro aspecto de la contratación quedan sujetos exclusivamente a las políticas del Establecimiento. Los precios mostrados en la Plataforma son de carácter referencial, se expresan en pesos mexicanos (MXN) y pueden variar sin previo aviso según lo determine cada Establecimiento.",
        ],
      },
      {
        heading: "3. Exención y limitación de responsabilidad",
        body: [
          "En la máxima medida permitida por la legislación aplicable, RivieraMayaPass, sus titulares, desarrolladores y colaboradores quedan eximidos de toda responsabilidad por daños, perjuicios, lesiones, pérdidas, gastos o inconvenientes de cualquier naturaleza, directos o indirectos, derivados de: (i) la prestación, calidad, seguridad o disponibilidad de los servicios de los Establecimientos; (ii) el incumplimiento por parte de los Establecimientos; (iii) accidentes, robos o incidentes ocurridos en las instalaciones de terceros; y (iv) cualquier relación comercial entre el Usuario y el Establecimiento.",
          "El Usuario reconoce que contrata y disfruta los servicios de los Establecimientos bajo su propia y exclusiva responsabilidad y riesgo.",
        ],
      },
      {
        heading: "4. Información sobre playas y sargazo",
        body: [
          "La información relativa al estado de las playas, presencia de sargazo, clima, temperatura y demás datos ambientales se ofrece únicamente con fines informativos y referenciales, proviene de fuentes de terceros y/o estimaciones automatizadas, y puede no reflejar las condiciones reales en tiempo real. RivieraMayaPass no garantiza su exactitud, vigencia ni integridad, y no asume responsabilidad por decisiones tomadas con base en dicha información.",
        ],
      },
      {
        heading: "5. Obligaciones del Usuario",
        body: [
          "El Usuario se compromete a proporcionar información veraz, a utilizar la Plataforma conforme a la ley, la moral y el orden público, y a respetar los reglamentos internos de cada Establecimiento. El Usuario es responsable de verificar directamente con el Establecimiento los precios, horarios, requisitos de acceso y condiciones vigentes antes de asistir.",
        ],
      },
      {
        heading: "6. Propiedad intelectual",
        body: [
          "Las marcas, logotipos, textos, diseños y contenidos de la Plataforma son propiedad de RivieraMayaPass o de sus respectivos titulares y se encuentran protegidos por la legislación aplicable en materia de propiedad intelectual e industrial. Queda prohibida su reproducción total o parcial sin autorización expresa.",
        ],
      },
      {
        heading: "7. Datos personales y privacidad",
        body: [
          "El tratamiento de los datos personales que el Usuario llegue a proporcionar se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su normativa secundaria. La Plataforma no recopila datos de pago. Para cualquier solicitud relativa a sus datos puede contactarnos a través de los medios indicados.",
        ],
      },
      {
        heading: "8. Enlaces y servicios de terceros",
        body: [
          "La Plataforma puede contener enlaces a sitios o servicios de terceros sobre los cuales RivieraMayaPass no tiene control. El acceso a dichos sitios se realiza bajo responsabilidad del Usuario, sujeto a los términos y políticas de privacidad de cada tercero.",
        ],
      },
      {
        heading: "9. Modificaciones",
        body: [
          "RivieraMayaPass se reserva el derecho de modificar en cualquier momento estos Términos y Condiciones, así como el contenido, funcionamiento y disponibilidad de la Plataforma. Las modificaciones entrarán en vigor desde su publicación en este sitio.",
        ],
      },
      {
        heading: "10. Legislación aplicable y jurisdicción",
        body: [
          "Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos y, en particular, por las del Estado de Quintana Roo. Para la interpretación y cumplimiento de los mismos, las partes se someten expresamente a la jurisdicción de los tribunales competentes del Municipio de Solidaridad (Playa del Carmen), Quintana Roo, renunciando a cualquier otro fuero que pudiera corresponderles.",
        ],
      },
      {
        heading: "11. Contacto",
        body: [
          "Para cualquier duda o aclaración sobre estos Términos y Condiciones puede escribirnos a contact@rivieramayapass.com.",
        ],
      },
    ],
  },
  en: {
    title: "Terms & Conditions",
    updated: `Last updated: June 20, 2026`,
    intro:
      "By accessing and using the RivieraMayaPass website (the “Platform”), you (the “User”) expressly agree to these Terms & Conditions. If you do not agree with them, please refrain from using the Platform.",
    sections: [
      {
        heading: "1. Nature of the service",
        body: [
          "RivieraMayaPass is a technology intermediation and listing platform that connects Users interested in purchasing day passes with third-party hotels, beach clubs, pools and tourist establishments (the “Establishments”) in the Riviera Maya, Quintana Roo, Mexico.",
          "RivieraMayaPass is NOT the owner, operator, manager or party responsible for the Establishments, nor for the facilities, services, food, drinks, activities or experiences they provide. RivieraMayaPass acts solely as a contact and promotional channel.",
        ],
      },
      {
        heading: "2. Bookings and payments",
        body: [
          "Booking requests are handled through third-party messaging services (such as WhatsApp) directly between the User and the relevant Establishment. RivieraMayaPass does not process payments or charge any amount for bookings.",
          "Confirmation, availability, cancellation policies, refunds and any other aspect of the transaction are subject exclusively to the Establishment's policies. Prices shown on the Platform are for reference only, are expressed in Mexican pesos (MXN) and may change without notice as determined by each Establishment.",
        ],
      },
      {
        heading: "3. Disclaimer and limitation of liability",
        body: [
          "To the maximum extent permitted by applicable law, RivieraMayaPass, its owners, developers and collaborators are released from any liability for damages, harm, injuries, losses, expenses or inconveniences of any nature, whether direct or indirect, arising from: (i) the provision, quality, safety or availability of the Establishments' services; (ii) breach by the Establishments; (iii) accidents, theft or incidents occurring on third-party premises; and (iv) any commercial relationship between the User and the Establishment.",
          "The User acknowledges that they contract and enjoy the Establishments' services under their own sole responsibility and risk.",
        ],
      },
      {
        heading: "4. Beach and sargassum information",
        body: [
          "Information regarding beach conditions, sargassum presence, weather, temperature and other environmental data is provided for informational and reference purposes only, comes from third-party sources and/or automated estimates, and may not reflect actual real-time conditions. RivieraMayaPass does not guarantee its accuracy, currency or completeness and assumes no liability for decisions made based on such information.",
        ],
      },
      {
        heading: "5. User obligations",
        body: [
          "The User agrees to provide truthful information, to use the Platform in accordance with the law, public morals and public order, and to respect the internal rules of each Establishment. The User is responsible for verifying directly with the Establishment the current prices, schedules, access requirements and conditions before attending.",
        ],
      },
      {
        heading: "6. Intellectual property",
        body: [
          "The trademarks, logos, texts, designs and content of the Platform are the property of RivieraMayaPass or their respective owners and are protected by applicable intellectual and industrial property law. Their total or partial reproduction without express authorization is prohibited.",
        ],
      },
      {
        heading: "7. Personal data and privacy",
        body: [
          "Any personal data the User may provide is processed in accordance with the Mexican Federal Law on the Protection of Personal Data Held by Private Parties (LFPDPPP) and its secondary regulations. The Platform does not collect payment data. For any request regarding your data you may contact us through the channels indicated.",
        ],
      },
      {
        heading: "8. Third-party links and services",
        body: [
          "The Platform may contain links to third-party sites or services over which RivieraMayaPass has no control. Access to such sites is at the User's own risk and subject to the terms and privacy policies of each third party.",
        ],
      },
      {
        heading: "9. Modifications",
        body: [
          "RivieraMayaPass reserves the right to modify these Terms & Conditions at any time, as well as the content, operation and availability of the Platform. Modifications take effect upon publication on this site.",
        ],
      },
      {
        heading: "10. Governing law and jurisdiction",
        body: [
          "These Terms & Conditions are governed by the laws of the United Mexican States and, in particular, those of the State of Quintana Roo. For their interpretation and enforcement, the parties expressly submit to the jurisdiction of the competent courts of the Municipality of Solidaridad (Playa del Carmen), Quintana Roo, waiving any other jurisdiction that may correspond to them.",
        ],
      },
      {
        heading: "11. Contact",
        body: [
          "For any questions about these Terms & Conditions you may write to us at contact@rivieramayapass.com.",
        ],
      },
    ],
  },
};

export default async function TermsPage({
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
