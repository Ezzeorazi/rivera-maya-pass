import report from "@/data/sargazo-report.json";

export type BeachStatusType = "clean" | "moderate" | "seaweed" | "unknown";

export type Confidence = "high" | "medium" | "low";

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

export interface Bilingual {
  es: string;
  en: string;
}

export interface ForecastDay {
  date: string;
  dir_deg: number | null;
  dir_cardinal: string;
  speed_kmh: number | null;
  gust_kmh: number | null;
  temp_max_c: number | null;
  temp_min_c: number | null;
  /** True if the wind pushes sargassum toward the shore. */
  onshore: boolean;
}

export interface HurricaneStorm {
  name: string;
  classification: string;
  distance_km: number;
  movement: string;
}

export interface HurricaneAlert {
  active: boolean;
  headline?: Bilingual;
  storms?: HurricaneStorm[];
}

export interface SargazoSource {
  title: string;
  url: string;
}

export interface SargazoReport {
  /** ISO 8601 timestamp of when the report was generated. */
  updatedAt: string;
  /** Where the data came from: "ai", "ai+manual" (overridden) or "seed". */
  source: string;
  /** How sure the report is: high / medium / low. */
  confidence?: Confidence;
  zones: SargazoZone[];
  /** Regional reference points (Holbox, Isla Mujeres, etc.) to find clean spots. */
  regionZones?: SargazoZone[];
  summary: Bilingual;
  /** Sources Gemini used (grounding citations). */
  sources?: SargazoSource[];
  /** Note shown when a human manually corrected the report. */
  overrideNote?: Bilingual;
  /** Practical advice: cleanest zone today or an alternative plan. */
  recommendation?: Bilingual;
  /** Outlook for the next 2-3 days based on the wind forecast. */
  forecast?: Bilingual;
  /** Per-day wind forecast (structured). */
  forecastDays?: ForecastDay[];
  /** Active tropical storm/hurricane alert near the Riviera Maya. */
  hurricaneAlert?: HurricaneAlert;
  /** Wind measured at report time (Open-Meteo). Absent in the seed file. */
  wind?: SargazoWind;
  /** Current air temperature in °C (Open-Meteo). */
  temperatureC?: number;
}

export const sargazoReport = report as SargazoReport;
