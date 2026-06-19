import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
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
  metadataBase: new URL("https://rivieramayapass.com"),
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
    images: [{ url: "/imagotipo.svg", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/isotipo-logo.webp",
    apple: "/isotipo-logo.webp",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      </body>
    </html>
  );
}
