"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Signal, Driver, Trend, EvidenceItem } from "@/lib/data/library";

type SignalDetailDialogProps = {
  signal: Signal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  allDrivers: Driver[];
  allTrends: Trend[];
  allEvidence: EvidenceItem[];
};

export default function SignalDetailDialog({
  signal,
  open,
  onOpenChange,
}: SignalDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{signal.signalName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {signal.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {signal.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description available.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
