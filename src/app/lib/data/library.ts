// src/app/lib/data/library.ts

import { supabase } from "@/lib/supabase/client";

/* =========================
   Types (named exports)
   ========================= */

export type TrendReport = {
  id: string;
  title: string;
  summary: string | null;
  publicationDate: string | null;
  processingStatus: string;
  visibility: string;

  // visibility + ownership (camelCase for UI)
  uploadedBy: string[];
  visibleBy: string[];

  // filters (camelCase for UI)
  topics: string[];
  geographicalRelevance: string[];
};

export type Driver = {
  id: string;
  driverName: string;
  description: string | null;
  verificationStatus: string;
  trendReports: string[];
  topics: string[];
  category: string[];
  steepCategory: string[];
  geographicRelevance: string[];
};

export type Trend = {
  id: string;
  trendName: string;
  description: string | null;
  verificationStatus: string;
  extractedFrom: string[];
  relatedTopics: string[];
  categoryRelevance: string[];
  steep: string[];
  geographicRelevance: string[];
};

export type Signal = {
  id: string;
  signalName: string;
  description: string | null;
  verificationStatus: string;
  extractedFrom: string[];
  topics: string[];
  category: string[];
  steep: string[];
  geographicRelevance: string[];
};

export type EvidenceItem = {
  id: string;
  title: string;
  description: string | null;
  trendReports: string[];
  topics: string[];
  category: string[];
  steep: string[];
  geographicRelevance: string[];
};

export type LibraryBundle = {
  reports: TrendReport[];
  drivers: Driver[];
  trends: Trend[];
  signals: Signal[];
  evidence: EvidenceItem[];
  filterOptions: {
    topics: Array<{ id: string; topic: string }>;
    categories: Array<{ id: string; category: string }>;
    steep: Array<{ id: string; category: string }>;
    geographies: Array<{ id: string; name: string }>;
  };
};

/* =========================
   Helpers
   ========================= */

async function safeSelect<T = any>(table: string, columns: string) {
  const { data, error } = await supabase.from(table).select(columns);
  
  // DETAILED LOGGING FOR DEBUGGING
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Table: ${table}`);
  console.log(`📝 Columns: ${columns}`);
  
  if (error) {
    console.error(`❌ ERROR:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return [] as T[];
  }
  
  console.log(`✅ SUCCESS: ${data?.length ?? 0} rows returned`);
  if (data && data.length > 0) {
    console.log(`📄 Sample row:`, data[0]);
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  return (data ?? []) as T[];
}

function groupByArray(
  rows: Array<Record<string, any>>,
  key: string,
  value: string
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const r of rows) {
    const k = r[key];
    const v = r[value];
    if (!k || !v) continue;
    if (!out[k]) out[k] = [];
    out[k].push(v);
  }
  return out;
}

/* =========================
   Loader
   ========================= */

export async function loadLibraryBundle(): Promise<LibraryBundle> {
  // Core tables
  const [docs, drivers, trends, signals, evidence] = await Promise.all([
    safeSelect<any>("source_documents", "*"),
    safeSelect<any>("drivers", "*"),
    safeSelect<any>("trends", "*"),
    safeSelect<any>("signals", "*"),
    safeSelect<any>("evidence", "*"),
  ]);

  // Taxonomy tables (options)
  const [topics, categories, steep, geographies] = await Promise.all([
    safeSelect<any>("topics", "id, topic_name"),
    safeSelect<any>("categories", "id, category_name"),
    safeSelect<any>("steep_categories", "id, steep_name"),
    safeSelect<any>("geographical_focus", "id, region_name"),
  ]);

  // Junction tables (IDs only)
  const [sd_topics, sd_geo] = await Promise.all([
    safeSelect<any>("source_documents_topics", "source_document_id, topic_id"),
    safeSelect<any>(
      "source_documents_geographical_focus",
      "source_document_id, geographical_focus_id"
    ),
  ]);

  const sdTopicsMap = groupByArray(sd_topics, "source_document_id", "topic_id");
  const sdGeoMap = groupByArray(sd_geo, "source_document_id", "geographical_focus_id");

  // Reports (documents)
  const reports: TrendReport[] = docs.map((d: any) => ({
    id: d.id,
    title: d.title ?? "(Untitled)",
    summary: d.summary ?? null,
    publicationDate: d.publication_date ?? null,
    processingStatus: d.processing_status ?? "completed",
    visibility: d.visibility ?? "radar_members",

    // visibility + ownership
    uploadedBy: d.uploaded_by ? [d.uploaded_by] : [],
    visibleBy: Array.isArray(d.visible_to) ? d.visible_to : [],

    // filters
    topics: sdTopicsMap[d.id] ?? [],
    geographicalRelevance: sdGeoMap[d.id] ?? [],
  }));

  // NOTE: For now, drivers/trends/signals/evidence are minimally shaped.
  // We'll add their junction mappings next once the UI is rendering.
  const mappedDrivers: Driver[] = drivers.map((dr: any) => ({
    id: dr.id,
    driverName: dr.driver_name ?? "(Untitled driver)",
    description: dr.description ?? null,
    verificationStatus: dr.verification_status ?? "Unverified",
    trendReports: dr.extracted_from ? [dr.extracted_from] : [],
    topics: [],
    category: [],
    steepCategory: [],
    geographicRelevance: [],
  }));

  const mappedTrends: Trend[] = trends.map((tr: any) => ({
    id: tr.id,
    trendName: tr.trend_name ?? "(Untitled trend)",
    description: tr.description ?? null,
    verificationStatus: tr.verification_status ?? "Unverified",
    extractedFrom: tr.extracted_from ? [tr.extracted_from] : [],
    relatedTopics: [],
    categoryRelevance: [],
    steep: [],
    geographicRelevance: [],
  }));

  const mappedSignals: Signal[] = signals.map((s: any) => ({
    id: s.id,
    signalName: s.signal_name ?? "(Untitled signal)",
    description: s.description ?? null,
    verificationStatus: s.verification_status ?? "Unverified",
    extractedFrom: s.extracted_from ? [s.extracted_from] : [],
    topics: [],
    category: [],
    steep: [],
    geographicRelevance: [],
  }));

  const mappedEvidence: EvidenceItem[] = evidence.map((e: any) => ({
    id: e.id,
    title: e.title ?? "Evidence",
    description: e.description ?? null,
    trendReports: e.extracted_from ? [e.extracted_from] : [],
    topics: [],
    category: [],
    steep: [],
    geographicRelevance: [],
  }));

  return {
    reports,
    drivers: mappedDrivers,
    trends: mappedTrends,
    signals: mappedSignals,
    evidence: mappedEvidence,
    filterOptions: {
      topics: topics.map((t: any) => ({ id: t.id, topic: t.topic_name })),
      categories: categories.map((c: any) => ({
        id: c.id,
        category: c.category_name,
      })),
      steep: steep.map((s: any) => ({ id: s.id, category: s.steep_name })),
      geographies: geographies.map((g: any) => ({ id: g.id, name: g.region_name })),
    },
  };
}