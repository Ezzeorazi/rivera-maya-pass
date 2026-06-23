import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GA_ID, GSC_VERIFICATION, SITE_URL } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RivieraMayaPass · Day Passes en Playa del Carmen",
    template: "%s | RivieraMayaPass",
  },
  description:
    "El especialista local del day pass. Accede a albercas, beach clubs y playas limpias en Playa del Carmen sin hospedarte.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "RivieraMayaPass",
    // La imagen OG la genera src/app/opengraph-image.tsx (PNG 1200x630).
  },
  icons: {
    icon: "/isotipo-logo.webp",
    apple: "/isotipo-logo.webp",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${hanken.variable} font-body antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
