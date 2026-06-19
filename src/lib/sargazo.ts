import report from "@/data/sargazo-report.json";

export type BeachStatusType = "clean" | "moderate" | "seaweed";

export interface SargazoZone {
  name: string;
  status: BeachStatusType;
}

export interface SargazoWind {
  speed_kmh: number | null;
  gust_kmh: number | null;
  dir_deg: number | null;
  dir_cardinal: string;
}

export interface SargazoReport {
  /** ISO 8601 timestamp of when the report was generated. */
  updatedAt: string;
  /** Where the data came from: "ai" (Gemini) or "seed" (manual fallback). */
  source: string;
  zones: SargazoZone[];
  summary: {
    es: string;
    en: string;
  };
  /** Wind measured at report time (Open-Meteo). Absent in the seed file. */
  wind?: SargazoWind;
}

export const sargazoReport = report as SargazoReport;
