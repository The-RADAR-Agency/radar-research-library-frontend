"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Radio } from "lucide-react";
import type { Signal, Driver, Trend, EvidenceItem } from "@/lib/data/library";
import SignalDetailDialog from "./dialogs/SignalDetailDialog";
import { getDefaultCardImage } from "@/lib/cardImages";

type SignalsTabProps = {
  signals: Signal[];
  currentUserId: string;
  allDrivers: Driver[];
  allTrends: Trend[];
  allEvidence: EvidenceItem[];
};

export default function SignalsTab({
  signals,
  currentUserId,
  allDrivers,
  allTrends,
  allEvidence,
}: SignalsTabProps) {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      const map: Record<string, string> = {};
      for (const signal of signals) {
        const headerImage = (signal as any).headerImage as
          | { url: string }[]
          | undefined;

        if (headerImage && headerImage.length > 0) {
          map[signal.id] = headerImage[0].url;
        } else {
          map[signal.id] = await getDefaultCardImage(signal.id);
        }
      }
      setCardImages(map);
    };

    loadImages();
  }, [signals]);

  if (signals.length === 0) {
    return (
      <div className="py-12 text-center">
        <Radio className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No signals found</h3>
        <p className="text-muted-foreground">
          Signals will appear here after reports are processed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.map((signal) => {
          const isVerified = signal.verificationStatus === "Verified";
          const headerImageSrc = cardImages[signal.id];

          const signalDate = (signal as any).date ?? null;
          const potentialImpact = (signal as any).potentialImpact ?? null;
          const strength = (signal as any).strength ?? null;

          return (
            <div
              key={signal.id}
              className="overflow-hidden rounded-xl border bg-card shadow-sm flex flex-col cursor-pointer hover:shadow-lg hover:border-primary transition-all"
              onClick={() => setSelectedSignal(signal)}
            >
              {headerImageSrc && (
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={headerImageSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold flex-1">
                    {signal.signalName}
                  </h3>
                  {isVerified ? (
                    <CheckCircle className="h-5 w-5 text-success ml-2" />
                  ) : (
                    <Bot className="h-5 w-5 text-muted-foreground ml-2" />
                  )}
                </div>

                {signal.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {signal.description}
                  </p>
                )}

                {(strength || potentialImpact) && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {strength && (
                      <Badge variant="secondary">{strength}</Badge>
                    )}
                    {potentialImpact && (
                      <Badge variant="outline">
                        Impact: {potentialImpact}
                      </Badge>
                    )}
                  </div>
                )}

                {signalDate && (
                  <div className="mt-auto text-xs text-muted-foreground">
                    Published:{" "}
                    {new Date(signalDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSignal && (
        <SignalDetailDialog
          signal={selectedSignal}
          open={!!selectedSignal}
          onOpenChange={(open) =>
            !open && setSelectedSignal(null)
          }
          currentUserId={currentUserId}
          allDrivers={allDrivers}
          allTrends={allTrends}
          allEvidence={allEvidence}
        />
      )}
    </>
  );
}
