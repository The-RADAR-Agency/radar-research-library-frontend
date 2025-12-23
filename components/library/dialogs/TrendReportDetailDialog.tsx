"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TrendReport, Driver, Trend, Signal, EvidenceItem } from "@/lib/data/library";

export default function TrendReportDetailDialog({
  report,
  open,
  onOpenChange,
}: {
  report: TrendReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allDrivers: Driver[];
  allTrends: Trend[];
  allSignals: Signal[];
  allEvidence: EvidenceItem[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">{report.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {report.summary && <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Visibility</div>
              <div>{report.visibility}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Processing</div>
              <div>{report.processingStatus}</div>
            </div>
            {report.publicationDate && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Published</div>
                <div>{new Date(report.publicationDate).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          {/* We’ll replace this later with the full Zite-style related accordions */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
