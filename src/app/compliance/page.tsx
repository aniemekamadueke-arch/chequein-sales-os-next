"use client";

import { Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Eyebrow, PageHeader, Pill, Stat } from "@/components/ui/primitives";
import { RED_FLAGS, REQUIRED_CHECKS, SCRIPTS } from "@/lib/data";
import { complianceStatus } from "@/lib/domain";
import { copyText, dueLabel } from "@/lib/utils";
import { useSalesStore } from "@/store/use-sales-store";
import { useUiStore } from "@/store/use-ui-store";

export default function CompliancePage() {
  const employers = useSalesStore((s) => s.employers);
  const setFixable = useSalesStore((s) => s.setFixable);
  const openEmployer = useUiStore((s) => s.openEmployer);

  const failed = employers.filter((e) => complianceStatus(e) === "failed");
  const passed = employers.filter((e) => complianceStatus(e) === "passed" && e.stage === "live").length;
  const triaged = failed.filter((e) => e.compliance.fixable != null).length;
  const untriaged = failed.length - triaged;

  function triage(id: string, fixable: boolean) {
    setFixable(id, fixable);
    toast.success(fixable ? "Fixable. Send the fix list today." : "Parked as not a fit.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="The gate that killed 7 of 11"
        title="Compliance"
        description="Seven of eleven employers failed after they signed up. That is a sales problem, not just an operations problem — so the gate now sits in front of the sale."
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Stat label="Signed up" value="11" sub="historical" />
        <Stat label="Passed" value="4" sub="36% pass rate" tone="warn" />
        <Stat label="Live & paying" value={passed} sub="current pipeline" />
        <Stat label="Failed" value={failed.length} sub={`${untriaged} untriaged`} tone="bad" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <Eyebrow>Before the first demo</Eyebrow>
          <h2 className="mt-0.5 text-[18px] font-semibold">The pre-qualification gate</h2>
          <div className="mt-2 flex flex-col">
            {[
              ["Ask the six questions on the first call.", "Staff count, payroll value, transfer vs cash, decision maker, CAC/TIN, existing deductions."],
              ["Score 7/10 or park them.", "Below 10 staff or cash payroll is a no for now. Politely close and revisit next term."],
              ["Collect documents before the demo.", "If they cannot produce CAC, TIN and a staff list, the demo is a waste of both calendars."],
              ["No exceptions at go-live.", "All eight required checks must pass. The partner bank will ask; better you ask first."],
            ].map(([title, body], i) => (
              <div key={title} className="flex gap-3 border-b border-[#f0ebdf] py-2.5 last:border-0">
                <span className="mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-[#f0ebdf] text-[10.5px] font-bold text-ink-soft">
                  {i + 1}
                </span>
                <div>
                  <strong className="text-[12.5px]">{title}</strong>
                  <p className="mt-0.5 text-[11.5px] text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <Eyebrow>Copy and send</Eyebrow>
              <h2 className="mt-0.5 text-[18px] font-semibold">Document request</h2>
            </div>
            <Button
              variant="subtle"
              size="sm"
              onClick={async () => {
                await copyText(SCRIPTS.wa_docs.body);
                toast.success("Document request copied.");
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <p className="mb-2 text-[11.5px] text-muted">
            Send this after the qualification call, before you book the demo.
          </p>
          <ul className="flex flex-col">
            {REQUIRED_CHECKS.map((check) => (
              <li key={check.id} className="border-b border-[#f1ece0] py-1.5 last:border-0">
                <strong className="block text-[12px]">{check.label}</strong>
                <span className="text-[10.5px] text-muted">{check.detail}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mb-4 p-5" id="triage">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <Eyebrow>Clean up the past</Eyebrow>
            <h2 className="mt-0.5 text-[18px] font-semibold">Triage the seven</h2>
          </div>
          <Pill>{triaged} / {failed.length} classified</Pill>
        </div>

        {failed.length ? (
          <div className="overflow-hidden rounded-xl border border-[#efe9dc]">
            {failed.map((e) => (
              <div key={e.id} className="grid items-center gap-3 border-b border-[#f0ebdf] bg-card px-3 py-2.5 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto_92px]">
                <div className="min-w-0">
                  <button
                    onClick={() => openEmployer(e.id)}
                    className="text-left text-[12.5px] font-semibold hover:text-brand"
                  >
                    {e.name}
                  </button>
                  <div className="text-[11px] text-muted">{e.compliance.failReason || "Reason not recorded"}</div>
                </div>
                <div className="inline-flex rounded-md bg-[#f0ebdf] p-0.5">
                  <button
                    onClick={() => triage(e.id, true)}
                    className={`rounded px-2 py-1 text-[10px] font-semibold ${e.compliance.fixable === true ? "bg-white text-brand shadow-sm" : "text-muted"}`}
                  >
                    Fixable
                  </button>
                  <button
                    onClick={() => triage(e.id, false)}
                    className={`rounded px-2 py-1 text-[10px] font-semibold ${e.compliance.fixable === false ? "bg-white text-danger shadow-sm" : "text-muted"}`}
                  >
                    Not a fit
                  </button>
                </div>
                <div className="text-left text-[10.5px] font-semibold text-muted sm:text-right">
                  {e.nextAction ? dueLabel(e.nextAction.due) : "No next action"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <h3 className="serif text-xl">Nothing failed in the pipeline</h3>
            <p className="mt-1 text-[12px] text-muted">Either compliance is clean or the failed records were removed.</p>
          </div>
        )}
        <p className="mt-2.5 text-[11px] text-muted">
          Rename each record to the real employer first. A reason is not a diagnosis: “documents
          missing” is not fixable until you know which document.
        </p>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-gold" />
          <h2 className="text-[18px] font-semibold">Red flags</h2>
        </div>
        <div className="grid gap-x-6 sm:grid-cols-2">
          {RED_FLAGS.map((flag, i) => (
            <div key={flag.title} className="flex gap-2.5 border-b border-[#f1ece0] py-2.5">
              <span className="pt-0.5 font-mono text-[9px] text-faint">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong className="text-[12px]">{flag.title}</strong>
                <p className="mt-0.5 text-[10.5px] text-muted">{flag.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
