import { ImageResponse } from "next/og";

// Imagen Open Graph (la que ven WhatsApp / Facebook / X al compartir el link).
// Next la sirve como PNG real en /opengraph-image — reemplaza al SVG anterior.
export const alt = "RivieraMayaPass · Day Passes en Playa del Carmen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0e3a4a 0%, #1f7a8c 55%, #2bb7c4 100%)",
          color: "#fdf6ec",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Playa del Carmen · Riviera Maya
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.05,
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          Day passes, beach clubs y playas limpias
        </div>
        <div style={{ fontSize: 36, marginTop: 28, opacity: 0.9 }}>
          El especialista local del day pass · rivieramayapass.com
        </div>
      </div>
    ),
    { ...size }
  );
}
