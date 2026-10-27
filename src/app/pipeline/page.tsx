"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Plus, Search } from "lucide-react";
import { BulkDialog } from "@/components/bulk-dialog";
import { Button, Card, Eyebrow, PageHeader, Pill } from "@/components/ui/primitives";
import { SOURCING, STAGES } from "@/lib/data";
import { complianceStatus } from "@/lib/domain";
import type { Employer } from "@/lib/types";
import { cn, dueLabel } from "@/lib/utils";
import { useSalesStore } from "@/store/use-sales-store";
import { useUiStore } from "@/store/use-ui-store";

function PipelineCard({ employer }: { employer: Employer }) {
  const openEmployer = useUiStore((s) => s.openEmployer);
  const failed = complianceStatus(employer) === "failed";
  return (
    <button
      onClick={() => openEmployer(employer.id)}
      className="mb-1.5 w-full rounded-lg border border-[#e4ddcc] bg-card p-2.5 text-left transition hover:-translate-y-px hover:border-[#bfb49a] hover:shadow-[0_5px_14px_-10px_rgba(15,36,30,0.5)]"
    >
      {failed ? (
        <span className="rounded bg-danger-soft px-1.5 py-0.5 text-[8.5px] font-semibold text-danger">
          Gate failed
        </span>
      ) : null}
      <h3 className="mt-1 text-[12.5px] font-semibold leading-snug">{employer.name}</h3>
      <div className="text-[10px] text-muted">
        {employer.segment || "—"}
        {employer.city ? ` · ${employer.city}` : ""}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-muted">
        <span>{employer.staffEstimate ? `${employer.staffEstimate} staff` : "staff unknown"}</span>
        {employer.nextAction ? (
          <span className={cn("font-semibold", dueLabel(employer.nextAction.due).includes("overdue") && "text-danger")}>
            {dueLabel(employer.nextAction.due)}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function PipelinePage() {
  const employers = useSalesStore((s) => s.employers);
  const setAddOpen = useUiStore((s) => s.setAddOpen);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const active = employers.filter((e) => e.stage !== "lost");
  const lost = employers.filter((e) => e.stage === "lost");
  const filtered = search.trim()
    ? employers.filter((e) =>
        `${e.name} ${e.contact} ${e.city}`.toLowerCase().includes(search.toLowerCase()),
      )
    : employers;

  return (
    <div>
      <PageHeader
        eyebrow="Where the money comes from"
        title="Pipeline"
        description="Source in batches, qualify before you demo, and never sell past the compliance gate."
        actions={
          <>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              Paste a list
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add employer
            </Button>
          </>
        }
      />

      <Card className="mb-4 p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <Eyebrow>Step one</Eyebrow>
            <h2 className="mt-0.5 text-[18px] font-semibold">Find 25 employers this week</h2>
          </div>
          <Pill>{active.length} in pipeline</Pill>
        </div>
        <p className="mb-3 max-w-[760px] text-[12.5px] text-muted">
          Schools first: 10–150 staff, monthly payroll, salaries paid by transfer. Two of your three
          live employers are schools — copy what already works.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCING.map((source) => (
            <a
              key={source.label}
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-0.5 rounded-lg border border-[#eae3d3] bg-[#fbf8f0] py-2.5 pl-3 pr-8 transition hover:border-[#cdc1a5] hover:bg-[#f6f0df]"
            >
              <strong className="text-[12px]">{source.label}</strong>
              <span className="text-[10.5px] leading-snug text-muted">{source.detail}</span>
              <ArrowRight className="absolute right-2.5 top-3.5 h-3 w-3 text-faint" />
            </a>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-mint px-3 py-2 text-[11.5px] text-[#24553f]">
          <span className="mt-0.5">✓</span>
          <span>
            <strong>Qualify on the first call.</strong> Cash payroll, no CAC or no TIN means they
            will fail the gate — park them and keep moving.
          </span>
        </div>
      </Card>

      <div className="mb-2.5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employer, contact or area…"
            className="input w-[300px] max-w-full pl-8"
          />
        </div>
        <span className="text-[11px] text-muted">Click any card to open the record. Stages are gated.</span>
      </div>

      <div className="board-scroll flex items-start gap-2.5 overflow-x-auto pb-3">
        {STAGES.filter((s) => s.id !== "lost").map((stage) => {
          const items = filtered.filter((e) => e.stage === stage.id);
          return (
            <div key={stage.id} className="board-col min-h-[180px]">
              <div className="flex items-center gap-1.5 px-0.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    stage.id === "live" ? "bg-brand-bright" : stage.id === "compliance" ? "bg-[#8a5a2b]" : "bg-[#9aa49b]",
                  )}
                />
                <strong className="text-[11.5px]">{stage.label}</strong>
                <em className="ml-auto rounded bg-white/60 px-1.5 text-[9.5px] not-italic text-muted">
                  {items.length}
                </em>
              </div>
              <p className="min-h-[27px] px-0.5 py-1 text-[9.5px] leading-snug text-[#8a948c]">{stage.hint}</p>
              {items.length ? (
                items.map((e) => <PipelineCard key={e.id} employer={e} />)
              ) : (
                <div className="px-1 py-3 text-[10.5px] text-[#9aa49b]">Nothing here yet</div>
              )}
            </div>
          );
        })}
      </div>

      {lost.length ? (
        <div className="mt-1 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          <span className="text-[11px] text-muted">Parked / lost · {lost.length}</span>
          {lost.map((e) => (
            <Link
              key={e.id}
              href="/compliance"
              className="rounded-full border border-line bg-[#efeade] px-2.5 py-1 text-[10.5px] text-muted hover:bg-[#e7e0cf]"
            >
              {e.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-4 text-[10.5px] text-muted">
        Board stages are enforced in the employer record. A card cannot skip a gate.
      </div>

      <BulkDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    </div>
  );
}
