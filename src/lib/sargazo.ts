import report from "@/data/sargazo-report.json";

export type BeachStatusType = "clean" | "moderate" | "seaweed";

export interface SargazoZone {
  name: string;
  status: BeachStatusType;
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
}

export const sargazoReport = report as SargazoReport;
