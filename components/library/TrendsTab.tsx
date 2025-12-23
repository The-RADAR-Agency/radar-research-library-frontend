// ================================
// FILE: components/library/TrendsTab.tsx
// ================================

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle } from "lucide-react";
import type { Trend, Driver, Signal, EvidenceItem } from "@/lib/data/library";

export type TrendsTabProps = {
  trends: Trend[];
  currentUserId: string;
  allDrivers: Driver[];
  allSignals: Signal[];
  allEvidence: EvidenceItem[];
};

export default function TrendsTab({ trends }: TrendsTabProps) {
  const [selected, setSelected] = useState<Trend | null>(null);

  if (trends.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No trends found</h3>
        <p className="text-muted-foreground">Trends will appear here after processing.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((t) => {
          const isVerified = t.verificationStatus === "Verified";
          return (
            <div
              key={t.id}
              className="overflow-hidden rounded-xl border bg-card shadow-sm flex flex-col cursor-pointer hover:shadow-lg hover:border-primary transition-all"
              onClick={() => setSelected(t)}
            >
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold flex-1">{t.trendName}</h3>
                  {isVerified ? (
                    <CheckCircle className="h-5 w-5 text-success ml-2" />
                  ) : (
                    <Bot className="h-5 w-5 text-muted-foreground ml-2" />
                  )}
                </div>

                {t.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{t.description}</p>
                )}

                <div className="mt-auto flex gap-2 flex-wrap">
                  {t.relatedTopics?.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple inline detail for now */}
      {selected && (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Selected trend</div>
              <div className="text-lg font-semibold">{selected.trendName}</div>
              {selected.description && <div className="mt-2 text-sm">{selected.description}</div>}
            </div>
            <button className="text-sm underline" onClick={() => setSelected(null)}>
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
}
