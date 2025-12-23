// components/library/SignalsTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Radio } from "lucide-react";
import type { Signal } from "@/app/lib/data/library";
import { getDefaultCardImage } from "@/app/lib/cardImages";

export type SignalsTabProps = {
  signals: Signal[];
  currentUserId?: string;
};

export default function SignalsTab({ signals }: SignalsTabProps) {
  const [selected, setSelected] = useState<Signal | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      const images: Record<string, string> = {};
      for (const signal of signals) {
        images[signal.id] = await getDefaultCardImage(signal.id);
      }
      setCardImages(images);
    };
    loadImages();
  }, [signals]);

  if (signals.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-xl font-headline font-semibold mb-3">No signals found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Signals will appear here after processing trend reports.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.map((signal) => {
          const isVerified = signal.verificationStatus === "Verified";
          const cardImage = cardImages[signal.id];
          const strength = (signal as any).strength || 'moderate_signal';

          // Determine badge color based on strength
          let strengthBadgeClass = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm bg-yellow-500/90 text-white';
          if (strength === 'strong_signal') {
            strengthBadgeClass = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm bg-green-500/90 text-white';
          } else if (strength === 'weak_signal') {
            strengthBadgeClass = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm bg-orange-500/90 text-white';
          }

          return (
            <article
              key={signal.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => setSelected(signal)}
            >
              <div className="relative h-40 overflow-hidden bg-muted">
                {cardImage && (
                  <img
                    src={cardImage}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                
                <div className="absolute top-3 right-3">
                  {isVerified ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/90 text-success-foreground backdrop-blur-sm">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
                      <Bot className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">AI Generated</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-3 left-3">
                  <div className={strengthBadgeClass}>
                    <Radio className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium capitalize">
                      {strength.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-headline font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {signal.signalName}
                </h3>

                {signal.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {signal.description}
                  </p>
                )}

                {signal.topics && signal.topics.length > 0 && (
                  <div className="mt-auto flex gap-2 flex-wrap">
                    {signal.topics.slice(0, 3).map((topic) => (
                      <Badge 
                        key={topic} 
                        variant="secondary"
                        className="text-xs"
                      >
                        {topic}
                      </Badge>
                    ))}
                    {signal.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{signal.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {signal.steep && signal.steep.length > 0 && (
                  <div className="flex gap-1.5">
                    {signal.steep.slice(0, 3).map((steep) => (
                      <span 
                        key={steep}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent text-accent-foreground uppercase tracking-wide"
                      >
                        {steep}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48 overflow-hidden">
              {cardImages[selected.id] && (
                <img
                  src={cardImages[selected.id]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Signal</div>
                <h2 className="text-2xl font-headline font-bold">{selected.signalName}</h2>
              </div>

              {selected.description && (
                <div>
                  <div className="text-sm font-medium mb-2">Description</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.description}
                  </p>
                </div>
              )}

              {selected.topics && selected.topics.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Topics</div>
                  <div className="flex gap-2 flex-wrap">
                    {selected.topics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selected.steep && selected.steep.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">STEEP Categories</div>
                  <div className="flex gap-2 flex-wrap">
                    {selected.steep.map((steep) => (
                      <Badge key={steep} variant="outline" className="uppercase">
                        {steep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}