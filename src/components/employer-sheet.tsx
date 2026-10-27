"use client";

import * as React from "react";
import {
  Check,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DialogTitle, Sheet } from "@/components/ui/dialog";
import {
  Button,
  ComplianceBadge,
  Segmented,
  StageBadge,
} from "@/components/ui/primitives";
import { OPTIONAL_CHECKS, REQUIRED_CHECKS, SCRIPTS } from "@/lib/data";
import {
  compliancePassed,
  complianceStatus,
  gateTo,
  isQualified,
  nextStageId,
  qualScore,
  requiredMissing,
  stageDef,
  stageOrder,
} from "@/lib/domain";
import type { Employer } from "@/lib/types";
import {
  cn,
  copyText,
  dueLabel,
  fillScript,
  naira,
  num,
  shortDate,
  whatsappHref,
} from "@/lib/utils";
import { useSalesStore } from "@/store/use-sales-store";
import { useUiStore } from "@/store/use-ui-store";

const stageChip: Record<string, string> = {
  lead: "bg-[#eee9dd] text-[#5d675f]",
  contacted: "bg-blue-soft text-blue",
  qualified: "bg-[#e6efdf] text-[#4c6b3e]",
  demo: "bg-gold-soft text-[#8c611d]",
  compliance: "bg-[#f4e6d8] text-[#855526]",
  live: "bg-mint text-brand",
};

export function EmployerSheet({ employerId }: { employerId: string | null }) {
  const emp = useSalesStore((s) => s.employers.find((e) => e.id === employerId));
  const close = useUiStore((s) => s.closeEmployer);
  const update = useSalesStore((s) => s.updateEmployer);
  const updateQualification = useSalesStore((s) => s.updateQualification);
  const setCheck = useSalesStore((s) => s.setCheck);
  const setFailReason = useSalesStore((s) => s.setFailReason);
  const setFixable = useSalesStore((s) => s.setFixable);
  const advanceStage = useSalesStore((s) => s.advanceStage);
  const completeAction = useSalesStore((s) => s.completeAction);
  const snoozeAction = useSalesStore((s) => s.snoozeAction);
  const restartCadence = useSalesStore((s) => s.restartCadence);
  const addNote = useSalesStore((s) => s.addNote);
  const deleteEmployer = useSalesStore((s) => s.deleteEmployer);
  const revPerEmployee = useSalesStore((s) => s.revPerEmployee);

  const [note, setNote] = React.useState("");

  if (!emp) return null;

  const next = nextStageId(emp.stage);
  const gate = gateTo(emp, next);
  const missing = requiredMissing(emp);
  const score = qualScore(emp);
  const status = complianceStatus(emp);

  function commit(field: keyof Employer, value: string | number) {
    update(emp!.id, { [field]: value } as Partial<Employer>);
  }

  function handleAdvance() {
    const result = advanceStage(emp!.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Stage updated.");
  }

  function reopen() {
    update(emp!.id, { stage: "lead" });
    if (!emp!.nextAction) restartCadence(emp!.id);
    toast.success("Reopened as a lead.");
  }

  function handleDelete() {
    if (!window.confirm(`Delete ${emp!.name}? This cannot be undone.`)) return;
    deleteEmployer(emp!.id);
    close();
    toast.success("Employer deleted.");
  }

  function handleNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    addNote(emp!.id, note.trim());
    setNote("");
  }

  function nextLink() {
    if (!emp!.nextAction) return null;
    const action = emp!.nextAction;
    if (action.type === "whatsapp" && emp!.phone) {
      const script = action.script ? SCRIPTS[action.script] : undefined;
      const text = script ? fillScript(script.body, emp!) : "";
      return (
        <Button asChild variant="outline" size="sm">
          <a href={whatsappHref(emp!.phone, text)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5" /> Open WhatsApp
          </a>
        </Button>
      );
    }
    if (action.type === "call" && emp!.phone) {
      return (
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${emp!.phone.replace(/[^\d+]/g, "")}`}>
            <Phone className="h-3.5 w-3.5" /> Call now
          </a>
        </Button>
      );
    }
    if (action.type === "email" && emp!.email) {
      const script = action.script ? SCRIPTS[action.script] : undefined;
      const subject = script?.subject ? fillScript(script.subject, emp!) : `Free payroll for ${emp!.name}`;
      const body = script ? fillScript(script.body, emp!) : "";
      return (
        <Button asChild variant="outline" size="sm">
          <a href={`mailto:${emp!.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>
            <Mail className="h-3.5 w-3.5" /> Compose email
          </a>
        </Button>
      );
    }
    return null;
  }

  return (
    <Sheet open={!!employerId} onOpenChange={(open) => !open && close()}>
      <DialogTitle className="sr-only">{emp.name}</DialogTitle>
      <div key={emp.id}>
        <header className="sticky top-0 z-10 border-b border-line bg-[#fbf9f3]/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow">
                {emp.segment || "Employer"}
                {emp.city ? ` · ${emp.city}` : ""}
              </div>
              <h2 className="serif mt-0.5 text-[26px] leading-tight">{emp.name}</h2>
              <div className="mt-2 flex flex-wrap gap-1">
                <StageBadge stage={emp.stage} />
                <ComplianceBadge employer={emp} />
              </div>
            </div>
            <button
              onClick={close}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[#eae5d8]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="px-5 pb-8 pt-4">
          <div className="mb-4 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-line bg-line">
            {[
              ["Staff", num(emp.staffEstimate) || "—"],
              ["Employees paid", num(emp.metrics.employees)],
              ["Revenue / mo", naira(emp.metrics.revenue)],
              ["Compliance", missing.length ? `${missing.length} missing` : "8 / 8"],
            ].map(([label, value]) => (
              <div key={label} className="bg-card px-2.5 py-2">
                <div className="text-[8.5px] uppercase tracking-[0.08em] text-muted">{label}</div>
                <div className="serif text-[15px]">{value}</div>
              </div>
            ))}
          </div>

          <section className="border-t border-line py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="eyebrow">Next action</div>
              {emp.nextAction ? (
                <span className={cn("text-[10px] font-semibold", dueLabel(emp.nextAction.due).includes("overdue") ? "text-danger" : "text-muted")}>
                  {dueLabel(emp.nextAction.due)}
                </span>
              ) : null}
            </div>
            {emp.nextAction ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f3eee1] px-3 py-2.5">
                  <div>
                    <div className="text-[12.5px] font-semibold">{emp.nextAction.title}</div>
                    <div className="text-[10.5px] text-muted">{emp.nextAction.detail}</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="outline" onClick={() => completeAction(emp.id)}>
                      <Check className="h-3 w-3" /> Done
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => snoozeAction(emp.id)}>
                      +1d
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {emp.nextAction.script ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const script = SCRIPTS[emp.nextAction!.script!];
                        if (script) {
                          await copyText(script.subject ? `Subject: ${script.subject}\n\n${script.body}` : script.body);
                          toast.success("Copied to clipboard.");
                        }
                      }}
                    >
                      Copy the script
                    </Button>
                  ) : null}
                  {nextLink()}
                </div>
              </>
            ) : (
              <div className="text-[11.5px] text-muted">
                No next action.{" "}
                <button onClick={() => restartCadence(emp.id)} className="font-semibold text-brand hover:underline">
                  Restart the cadence
                </button>
              </div>
            )}
          </section>

          <section className="border-t border-line py-3.5">
            <div className="eyebrow mb-2">Stage</div>
            <div className="mb-1.5 flex flex-wrap gap-1">
              {stageOrder.map((id, i) => {
                const current = stageOrder.indexOf(emp.stage);
                return (
                  <span
                    key={id}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px]",
                      id === emp.stage
                        ? "bg-brand font-semibold text-white"
                        : i < current
                          ? "bg-mint text-[#4f7c66]"
                          : "bg-[#f0ebdf] text-[#7a837b]",
                    )}
                  >
                    {stageDef(id).short}
                  </span>
                );
              })}
            </div>
            <p className="text-[10.5px] text-muted">{stageDef(emp.stage).hint}</p>
            {next ? (
              <Button
                className="mt-2.5 w-full"
                disabled={!gate.ok}
                onClick={handleAdvance}
              >
                Move to {stageDef(next).label}
              </Button>
            ) : (
              <p className="mt-2 rounded-lg bg-[#fdf7ea] px-2.5 py-2 text-[10.5px] text-muted">
                This employer is at the final stage.
              </p>
            )}
            {!gate.ok && next ? (
              <p className="mt-2 rounded-lg bg-[#fdf7ea] px-2.5 py-2 text-[10.5px] leading-relaxed text-muted">
                {gate.message}
              </p>
            ) : null}
            {emp.stage === "lost" ? (
              <Button className="mt-2.5 w-full" onClick={reopen}>
                Reopen as lead
              </Button>
            ) : null}
            {emp.stage === "qualified" || emp.stage === "demo" ? (
              <label className="mt-2 flex items-start gap-2 rounded-lg bg-[#fbf7ed] p-2 text-[11.5px]">
                <input
                  type="checkbox"
                  checked={emp.qualification.demoDone}
                  onChange={(e) => updateQualification(emp.id, { demoDone: e.target.checked })}
                  className="mt-0.5 accent-brand"
                />
                <span>Demo completed (unlocks compliance)</span>
              </label>
            ) : null}
          </section>

          <section className="border-t border-line py-3.5">
            <div className="eyebrow mb-2">Contact &amp; details</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="field-label">Employer name</span>
                <input defaultValue={emp.name} onBlur={(e) => commit("name", e.target.value)} className="input" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Contact person</span>
                <input defaultValue={emp.contact} onBlur={(e) => commit("contact", e.target.value)} className="input" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Role</span>
                <input defaultValue={emp.role} onBlur={(e) => commit("role", e.target.value)} className="input" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Phone / WhatsApp</span>
                <input defaultValue={emp.phone} onBlur={(e) => commit("phone", e.target.value)} className="input" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Email</span>
                <input defaultValue={emp.email} onBlur={(e) => commit("email", e.target.value)} className="input" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">City / area</span>
                <input defaultValue={emp.city} onBlur={(e) => commit("city", e.target.value)} className="input" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Segment</span>
                <select
                  className="input"
                  value={emp.segment}
                  onChange={(e) => commit("segment", e.target.value)}
                >
                  {["School", "Hospital / clinic", "Hospitality", "Retail / distribution", "Services / agency", "Other", "Unconfirmed"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Staff estimate</span>
                <input
                  type="number"
                  defaultValue={emp.staffEstimate || ""}
                  onBlur={(e) => commit("staffEstimate", Number(e.target.value) || 0)}
                  className="input"
                />
              </label>
            </div>
            <label className="mt-2 flex flex-col gap-1">
              <span className="field-label">Notes</span>
              <textarea
                rows={2}
                defaultValue={emp.notes}
                onBlur={(e) => commit("notes", e.target.value)}
                className="input resize-y"
              />
            </label>
          </section>

          <section className="border-t border-line py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="eyebrow">Qualification</div>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px]",
                  score >= 7 ? "bg-mint text-brand" : "bg-danger-soft text-danger",
                )}
              >
                {score}/10
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="field-label">Staff on payroll</span>
                <input
                  type="number"
                  defaultValue={emp.qualification.staffCount ?? ""}
                  onBlur={(e) =>
                    updateQualification(emp.id, {
                      staffCount: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="input"
                  placeholder="e.g. 45"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Monthly payroll (₦)</span>
                <input
                  type="number"
                  defaultValue={emp.qualification.monthlyPayroll ?? ""}
                  onBlur={(e) =>
                    updateQualification(emp.id, {
                      monthlyPayroll: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="input"
                  placeholder="e.g. 4500000"
                />
              </label>
            </div>
            <div className="mt-1">
              {[
                ["paidByTransfer", "Salaries paid by transfer", "Cash payroll is a hard stop"],
                ["decisionMaker", "Decision maker engaged", "Owner, proprietor or finance lead"],
                ["registered", "CAC + TIN in place", "If not, they fail compliance later"],
                ["noDeductions", "No existing salary deductions", "Needs partner sign-off"],
                ["consentPossible", "Staff consent is realistic", "Will they collect it this term?"],
              ].map(([key, label, hint]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 border-b border-[#f1ece0] py-1.5 last:border-0"
                >
                  <div>
                    <div className="text-[11.5px] font-medium">{label}</div>
                    <div className="text-[9.5px] text-muted">{hint}</div>
                  </div>
                  <Segmented
                    size="sm"
                    value={emp.qualification[key as "paidByTransfer"] as boolean | null}
                    onChange={(value) =>
                      updateQualification(emp.id, { [key]: value } as never)
                    }
                  />
                </div>
              ))}
            </div>
            <p
              className={cn(
                "mt-2 rounded-lg px-2.5 py-2 text-[10.5px] leading-relaxed",
                isQualified(emp) ? "bg-mint text-[#2f604a]" : "bg-[#fdf7ea] text-muted",
              )}
            >
              {isQualified(emp)
                ? "Qualified — the demo gate is open."
                : "Needs 7/10, all answers, 10+ staff, transfer payroll, CAC/TIN and a decision maker before Demo."}
            </p>
          </section>

          <section className="border-t border-line py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="eyebrow">Compliance</div>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px]",
                  compliancePassed(emp) ? "bg-mint text-brand" : "bg-danger-soft text-danger",
                )}
              >
                {compliancePassed(emp) ? "Passed" : `${missing.length} missing`}
              </span>
            </div>
            <div className="flex flex-col">
              {REQUIRED_CHECKS.map((check) => (
                <label
                  key={check.id}
                  className="flex cursor-pointer items-start gap-2 border-b border-[#f1ece0] py-1.5 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={emp.compliance.checks[check.id] === true}
                    onChange={(e) => setCheck(emp.id, check.id, e.target.checked)}
                    className="mt-0.5 accent-brand"
                  />
                  <span>
                    <span className="block text-[11.5px]">{check.label}</span>
                    <span className="block text-[9.5px] text-muted">{check.detail}</span>
                  </span>
                </label>
              ))}
            </div>
            <details className="mt-1">
              <summary className="cursor-pointer text-[10.5px] font-semibold text-brand">
                Optional checks
              </summary>
              {OPTIONAL_CHECKS.map((check) => (
                <label key={check.id} className="flex items-start gap-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={emp.compliance.checks[check.id] === true}
                    onChange={(e) => setCheck(emp.id, check.id, e.target.checked)}
                    className="mt-0.5 accent-brand"
                  />
                  <span>
                    <span className="block text-[11.5px]">{check.label}</span>
                    <span className="block text-[9.5px] text-muted">{check.detail}</span>
                  </span>
                </label>
              ))}
            </details>
            <label className="mt-2 flex flex-col gap-1">
              <span className="field-label">Failure reason (if any)</span>
              <input
                defaultValue={emp.compliance.failReason}
                onBlur={(e) => setFailReason(emp.id, e.target.value)}
                className="input"
                placeholder="e.g. TIN name mismatch"
              />
            </label>
            {status === "failed" || emp.compliance.fixable != null ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10.5px] text-muted">Triage</span>
                <Segmented
                  size="sm"
                  options={["Fixable", "Not a fit"]}
                  value={emp.compliance.fixable}
                  onChange={(value) => setFixable(emp.id, value)}
                />
              </div>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={async () => {
                await copyText(SCRIPTS.wa_docs.body);
                toast.success("Document request copied.");
              }}
            >
              Copy document request
            </Button>
          </section>

          <section className="border-t border-line py-3.5">
            <div className="eyebrow mb-2">Revenue &amp; activation</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["employees", "Employees paid"],
                ["ewaActive", "Using salary access"],
                ["savingsFunded", "Funding savings"],
                ["revenue", "Monthly revenue (₦)"],
              ].map(([key, label]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="field-label">{label}</span>
                  <input
                    type="number"
                    defaultValue={emp.metrics[key as keyof typeof emp.metrics] || ""}
                    onBlur={(e) =>
                      update(emp.id, {
                        metrics: { ...emp.metrics, [key]: Number(e.target.value) || 0 },
                      })
                    }
                    className="input"
                  />
                </label>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-muted">
              Revenue per employee:{" "}
              {emp.metrics.employees ? naira(Math.round(emp.metrics.revenue / emp.metrics.employees)) : "—"}
              {emp.metrics.employees && !emp.metrics.revenue
                ? ` · suggested ${naira(emp.metrics.employees * revPerEmployee)}`
                : ""}
            </p>
            {emp.metrics.employees && !emp.metrics.revenue ? (
              <button
                type="button"
                onClick={() => {
                  update(emp.id, {
                    metrics: {
                      ...emp.metrics,
                      revenue: emp.metrics.employees * revPerEmployee,
                    },
                  });
                  toast.success("Revenue filled from the assumption.");
                }}
                className="mt-1 text-[10.5px] font-semibold text-brand hover:underline"
              >
                Fill revenue at {naira(revPerEmployee)} / employee
              </button>
            ) : null}
          </section>

          <section className="border-t border-line py-3.5">
            <div className="eyebrow mb-2">Activity</div>
            <form onSubmit={handleNote} className="mb-2.5 flex gap-1.5">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note — what was said?"
                className="input flex-1"
              />
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>
            <div className="flex flex-col">
              {emp.activity.slice(0, 12).map((item, i) => (
                <div key={`${item.date}-${i}`} className="flex gap-2 border-b border-[#f3eee2] py-1.5 last:border-0">
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      item.type === "done" ? "bg-brand-bright" : item.type === "stage" ? "bg-gold" : "bg-[#b9b29f]",
                    )}
                  />
                  <div className="text-[11.5px]">
                    <div>{item.text}</div>
                    <div className="text-[9.5px] text-muted">{shortDate(item.date)}</div>
                  </div>
                </div>
              ))}
              {!emp.activity.length ? <p className="text-[11px] text-muted">No activity yet.</p> : null}
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <Button variant="ghost" size="sm" className="text-danger" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" /> Delete employer
            </Button>
            <span className="text-[9.5px] text-muted">Changes save automatically.</span>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
