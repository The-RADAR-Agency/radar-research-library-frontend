// components/library/TrendsTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, TrendingUp } from "lucide-react";
import type { Trend } from "@/app/lib/data/library";
import { getDefaultCardImage } from "@/app/lib/cardImages";

export type TrendsTabProps = {
  trends: Trend[];
  currentUserId?: string;
};

export default function TrendsTab({ trends }: TrendsTabProps) {
  const [selected, setSelected] = useState<Trend | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});

  // Pre-generate all card images
  useEffect(() => {
    const loadImages = async () => {
      const images: Record<string, string> = {};
      for (const trend of trends) {
        images[trend.id] = await getDefaultCardImage(trend.id);
      }
      setCardImages(images);
    };
    loadImages();
  }, [trends]);

  if (trends.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-xl font-headline font-semibold mb-3">No trends found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Trends will appear here after processing trend reports.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((trend) => {
          const isVerified = trend.verificationStatus === "Verified";
          const cardImage = cardImages[trend.id];

          return (
            <article
              key={trend.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => setSelected(trend)}
            >
              {/* Card Header Image */}
              <div className="relative h-40 overflow-hidden bg-muted">
                {cardImage && (
                  <img
                    src={cardImage}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Verification badge */}
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

                {/* Trend type badge */}
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/90 text-white backdrop-blur-sm">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium capitalize">
                      {(trend as any).trendType || 'Trend'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-headline font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {trend.trendName}
                </h3>

                {trend.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {trend.description}
                  </p>
                )}

                {/* Topics */}
                {trend.relatedTopics && trend.relatedTopics.length > 0 && (
                  <div className="mt-auto flex gap-2 flex-wrap">
                    {trend.relatedTopics.slice(0, 3).map((topic) => (
                      <Badge 
                        key={topic} 
                        variant="secondary"
                        className="text-xs"
                      >
                        {topic}
                      </Badge>
                    ))}
                    {trend.relatedTopics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{trend.relatedTopics.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* STEEP Categories */}
                {trend.steep && trend.steep.length > 0 && (
                  <div className="flex gap-1.5">
                    {trend.steep.slice(0, 3).map((steep) => (
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

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
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

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Trend</div>
                <h2 className="text-2xl font-headline font-bold">{selected.trendName}</h2>
              </div>

              {selected.description && (
                <div>
                  <div className="text-sm font-medium mb-2">Description</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.description}
                  </p>
                </div>
              )}

              {selected.relatedTopics && selected.relatedTopics.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Related Topics</div>
                  <div className="flex gap-2 flex-wrap">
                    {selected.relatedTopics.map((topic) => (
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