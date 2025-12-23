"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Bot, FileText } from "lucide-react";
import TrendReportDetailDialog from "@/components/library/dialogs/TrendReportDetailDialog";
import { getDefaultCardImage } from "@/lib/cardImages";
import type { TrendReport, Driver, Trend, Signal, EvidenceItem } from "@/lib/data/library";

type TrendReportsTabProps = {
  reports: TrendReport[];
  currentUserId: string;
  allDrivers: Driver[];
  allTrends: Trend[];
  allSignals: Signal[];
  allEvidence: EvidenceItem[];
};

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString();
}

export default function TrendReportsTab({
  reports,
  currentUserId,
  allDrivers,
  allTrends,
  allSignals,
  allEvidence,
}: TrendReportsTabProps) {
  const [selectedReport, setSelectedReport] = useState<TrendReport | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});

  // Load header images (or defaults)
  useEffect(() => {
    let alive = true;

    const loadImages = async () => {
      const map: Record<string, string> = {};
      for (const r of reports) {
        const headerImage = (r as any).headerImage as { url: string }[] | undefined;
        if (headerImage && headerImage.length > 0) {
          map[r.id] = headerImage[0].url;
        } else {
          map[r.id] = await getDefaultCardImage(r.id);
        }
      }
      if (alive) setCardImages(map);
    };

    loadImages();
    return () => {
      alive = false;
    };
  }, [reports]);

  const sorted = useMemo(() => {
    return [...reports].sort((a, b) => {
      const da = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
      const db = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
      return db - da;
    });
  }, [reports]);

  if (reports.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No uploads found</h3>
        <p className="text-muted-foreground">Trend reports will appear here once ingested.</p>
      </div>
    );
  }

  return (
    <>
      {/* Zite-like card grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((r) => {
          const headerImageSrc = cardImages[r.id];
          const published = formatDate(r.publicationDate);

          // Optional “source” label if you have it in your data; fallback blank
          const sourceLabel =
            (r as any).sourceName ||
            (r as any).publisher ||
            (r as any).source ||
            "";

          // Optional “type” label
          const typeLabel = (r as any).documentType || (r as any).type || "Trend Report";

          const isCompleted =
            (r.processingStatus || "").toLowerCase() === "completed" ||
            (r.processingStatus || "").toLowerCase() === "complete";

          return (
            <div
              key={r.id}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer"
              onClick={() => setSelectedReport(r)}
            >
              {/* Image */}
              {headerImageSrc ? (
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <img
                    src={headerImageSrc}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <div className="h-40 w-full bg-muted" />
              )}

              <div className="p-5">
                {/* top row meta */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">{typeLabel}</div>

                  <div className="flex items-center gap-2">
                    {sourceLabel ? (
                      <Badge variant="secondary" className="rounded-full px-3 py-1 font-normal">
                        {sourceLabel}
                      </Badge>
                    ) : null}

                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* title */}
                <h3 className="mt-4 text-xl leading-snug font-semibold tracking-tight">
                  <span className="font-headline italic">
                    {r.title || "(Untitled)"}
                  </span>
                </h3>

                {/* summary */}
                {r.summary ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {r.summary}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground italic">
                    No summary available.
                  </p>
                )}

                {/* footer */}
                <div className="mt-5 text-xs text-muted-foreground">
                  {published ? `Published: ${published}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail dialog */}
      {selectedReport && (
        <TrendReportDetailDialog
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => {
            if (!open) setSelectedReport(null);
          }}
          allDrivers={allDrivers}
          allTrends={allTrends}
          allSignals={allSignals}
          allEvidence={allEvidence}
        />
      )}
    </>
  );
}
