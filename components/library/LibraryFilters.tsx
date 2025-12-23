// ================================
// FILE: components/library/LibraryFilters.tsx
// ================================

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type FilterOptions = {
  topics: Array<{ id: string; topic: string }>;
  categories: Array<{ id: string; category: string }>;
  steep: Array<{ id: string; category: string }>;
  geographies: Array<{ id: string; name: string }>;
};

export type LibraryFiltersProps = {
  filterOptions: FilterOptions;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function LibraryFilters({ filterOptions, open = false, onOpenChange }: LibraryFiltersProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-semibold">Topics</h3>
              <p className="text-xs text-muted-foreground">{filterOptions.topics.length} available</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filterOptions.topics.slice(0, 24).map((t) => (
                  <div key={t.id} className="rounded-lg border p-2 text-sm">{t.topic}</div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold">Categories</h3>
              <p className="text-xs text-muted-foreground">{filterOptions.categories.length} available</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filterOptions.categories.slice(0, 24).map((c) => (
                  <div key={c.id} className="rounded-lg border p-2 text-sm">{c.category}</div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold">STEEP</h3>
              <p className="text-xs text-muted-foreground">{filterOptions.steep.length} available</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filterOptions.steep.slice(0, 24).map((s) => (
                  <div key={s.id} className="rounded-lg border p-2 text-sm">{s.category}</div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold">Geographies</h3>
              <p className="text-xs text-muted-foreground">{filterOptions.geographies.length} available</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filterOptions.geographies.slice(0, 24).map((g) => (
                  <div key={g.id} className="rounded-lg border p-2 text-sm">{g.name}</div>
                ))}
              </div>
            </section>

            <div className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange?.(false)} className="rounded-full">
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

