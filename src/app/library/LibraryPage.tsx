// ================================
// FILE: src/app/library/LibraryPage.tsx
// ================================

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

import Navigation from "@/components/Navigation";
import LibraryFilters from "@/components/library/LibraryFilters";
import TrendReportsTab from "@/components/library/TrendReportsTab";
import DriversTab from "@/components/library/DriversTab";
import TrendsTab from "@/components/library/TrendsTab";
import SignalsTab from "@/components/library/SignalsTab";

import { supabase } from "@/lib/supabase/client";
import {
  loadLibraryBundle,
  type LibraryBundle,
  type TrendReport,
  type Driver,
  type Trend,
  type Signal,
  type EvidenceItem,
} from "@/lib/data/library";

export default function LibraryPage() {
  const [bundle, setBundle] = useState<LibraryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // these are placeholders for whatever filtering state you’ll add next
  // (the UI is already wired; you can pass real state into LibraryFilters later)
  const hasLoadedData = useRef(false);

  useEffect(() => {
    let alive = true;

    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id ?? "";
      if (!alive) return;
      setCurrentUserId(userId);

      // Keep it updated
      supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUserId(session?.user?.id ?? "");
      });
    };

    initAuth();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    const load = async () => {
      setLoading(true);
      try {
        const b = await loadLibraryBundle();
        setBundle(b);
      } catch (e) {
        console.error("Failed to load library bundle:", e);
        hasLoadedData.current = false;
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const reports: TrendReport[] = bundle?.reports ?? [];
  const drivers: Driver[] = bundle?.drivers ?? [];
  const trends: Trend[] = bundle?.trends ?? [];
  const signals: Signal[] = bundle?.signals ?? [];
  const evidence: EvidenceItem[] = bundle?.evidence ?? [];

  const filterOptions = bundle?.filterOptions;

  const counts = useMemo(
    () => ({
      reports: reports.length,
      drivers: drivers.length,
      trends: trends.length,
      signals: signals.length,
    }),
    [reports.length, drivers.length, trends.length, signals.length]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-headline tracking-tight">Research Library</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse uploads, drivers, trends, and signals.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setFiltersOpen(true)}
            disabled={!filterOptions}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="uploads">
            <TabsList className="rounded-full bg-muted/60 p-1">
              <TabsTrigger value="uploads" className="rounded-full px-6">
                Uploads {counts.reports ? `(${counts.reports})` : ""}
              </TabsTrigger>
              <TabsTrigger value="drivers" className="rounded-full px-6">
                Drivers {counts.drivers ? `(${counts.drivers})` : ""}
              </TabsTrigger>
              <TabsTrigger value="trends" className="rounded-full px-6">
                Trends {counts.trends ? `(${counts.trends})` : ""}
              </TabsTrigger>
              <TabsTrigger value="signals" className="rounded-full px-6">
                Signals {counts.signals ? `(${counts.signals})` : ""}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="uploads">
                <TrendReportsTab
                  reports={reports}
                  currentUserId={currentUserId}
                  allDrivers={drivers}
                  allTrends={trends}
                  allSignals={signals}
                  allEvidence={evidence}
                />
              </TabsContent>

              <TabsContent value="drivers">
                <DriversTab
                  drivers={drivers}
                  currentUserId={currentUserId}
                  allTrends={trends}
                  allSignals={signals}
                  allEvidence={evidence}
                />
              </TabsContent>

              <TabsContent value="trends">
                <TrendsTab
                  trends={trends}
                  currentUserId={currentUserId}
                  allDrivers={drivers}
                  allSignals={signals}
                  allEvidence={evidence}
                />
              </TabsContent>

              <TabsContent value="signals">
                <SignalsTab
                  signals={signals}
                  currentUserId={currentUserId}
                  allDrivers={drivers}
                  allTrends={trends}
                  allEvidence={evidence}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {loading && (
          <div className="mt-8 text-sm text-muted-foreground">Loading…</div>
        )}
      </main>

      {filterOptions && (
        <LibraryFilters
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filterOptions={filterOptions}
        />
      )}
    </div>
  );
}
