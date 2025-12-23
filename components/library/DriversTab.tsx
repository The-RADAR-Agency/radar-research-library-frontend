// ================================
// FILE: components/library/DriversTab.tsx
// ================================

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle } from "lucide-react";
import type { Driver, Trend, Signal, EvidenceItem } from "@/lib/data/library";

export type DriversTabProps = {
  drivers: Driver[];
  currentUserId: string;
  allTrends: Trend[];
  allSignals: Signal[];
  allEvidence: EvidenceItem[];
};

export default function DriversTab({ drivers }: DriversTabProps) {
  const [selected, setSelected] = useState<Driver | null>(null);

  if (drivers.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
        <p className="text-muted-foreground">Drivers will appear here after processing.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((d) => {
          const isVerified = d.verificationStatus === "Verified";
          return (
            <div
              key={d.id}
              className="overflow-hidden rounded-xl border bg-card shadow-sm flex flex-col cursor-pointer hover:shadow-lg hover:border-primary transition-all"
              onClick={() => setSelected(d)}
            >
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold flex-1">{d.driverName}</h3>
                  {isVerified ? (
                    <CheckCircle className="h-5 w-5 text-success ml-2" />
                  ) : (
                    <Bot className="h-5 w-5 text-muted-foreground ml-2" />
                  )}
                </div>

                {d.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{d.description}</p>
                )}

                <div className="mt-auto flex gap-2 flex-wrap">
                  {d.topics?.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keep it simple for now; you can add DriverDetailDialog later like TrendReportDetailDialog */}
      {selected && (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Selected driver</div>
              <div className="text-lg font-semibold">{selected.driverName}</div>
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
