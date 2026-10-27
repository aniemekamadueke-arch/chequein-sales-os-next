import {
  OPTIONAL_CHECKS,
  REQUIRED_CHECKS,
  SEQUENCES,
  STAGES,
  stepAction,
} from "./data";
import type {
  ActionItem,
  AppState,
  Compliance,
  DailyLog,
  Employer,
  GateResult,
  NextAction,
  SeqId,
  StageId,
} from "./types";
import { addDaysISO, dayDiff, todayISO } from "./utils";

export const stageOrder: StageId[] = ["lead", "contacted", "qualified", "demo", "compliance", "live"];

export const stageDef = (id: StageId) => STAGES.find((s) => s.id === id) ?? STAGES[0];

export const nextStageId = (id: StageId): StageId | null => {
  const i = stageOrder.indexOf(id);
  return i >= 0 && i < stageOrder.length - 1 ? stageOrder[i + 1] : null;
};

export const requiredMissing = (e: Employer) =>
  REQUIRED_CHECKS.filter((c) => e.compliance.checks[c.id] !== true);

export const compliancePassed = (e: Employer) => requiredMissing(e).length === 0;

export type ComplianceStatus = "passed" | "failed" | "pending" | "closed";

export function complianceStatus(e: Employer): ComplianceStatus {
  if (e.stage === "lost") return "closed";
  if (compliancePassed(e)) return "passed";
  if (e.compliance.failReason) return "failed";
  return "pending";
}

export function qualScore(e: Employer) {
  const q = e.qualification;
  let score = 0;
  if ((q.staffCount ?? 0) >= 10) score += 2;
  if (q.paidByTransfer === true) score += 2;
  if (q.decisionMaker === true) score += 2;
  if (q.registered === true) score += 2;
  if (q.noDeductions === true) score += 1;
  if (q.consentPossible === true) score += 1;
  return score;
}

const isNullish = (v: unknown) => v === null || v === undefined;

export function qualComplete(e: Employer) {
  const q = e.qualification;
  return (
    Number(q.staffCount) > 0 &&
    Number(q.monthlyPayroll) > 0 &&
    !isNullish(q.paidByTransfer) &&
    !isNullish(q.decisionMaker) &&
    !isNullish(q.registered) &&
    !isNullish(q.noDeductions) &&
    !isNullish(q.consentPossible)
  );
}

export function isQualified(e: Employer) {
  return (
    qualComplete(e) &&
    qualScore(e) >= 7 &&
    e.qualification.paidByTransfer === true &&
    e.qualification.registered === true &&
    (e.qualification.staffCount ?? 0) >= 10
  );
}

export function gateTo(emp: Employer, to: StageId | null): GateResult {
  if (!to) return { ok: false, message: "This employer is already at the final stage." };
  if (to === "contacted" && !(emp.phone || emp.email)) {
    return { ok: false, message: "Add a phone number or email first." };
  }
  if (to === "qualified" && !isQualified(emp)) {
    return {
      ok: false,
      message: `Qualification gate: complete all 7 answers, score 7/10+, 10+ staff, transfer payroll and CAC/TIN. Currently ${qualScore(emp)}/10.`,
    };
  }
  if (to === "compliance" && !emp.qualification.demoDone) {
    return { ok: false, message: "Mark the demo as completed below before moving to compliance." };
  }
  if (to === "live" && !compliancePassed(emp)) {
    const missing = requiredMissing(emp).map((c) => c.label).join(", ");
    return { ok: false, message: `Compliance gate: still missing ${missing}.` };
  }
  return { ok: true, message: "" };
}

export function sequenceFor(emp: Employer): SeqId {
  if (emp.stage === "live") return "activation";
  if (complianceStatus(emp) === "failed" || (emp.stage === "compliance" && emp.compliance.failReason)) {
    return "recovery";
  }
  return "school";
}

export function actionFor(seq: SeqId, step: number, emp: { name: string; contact?: string }): NextAction {
  return stepAction(seq, step, emp);
}

export function actionsFor(state: AppState): ActionItem[] {
  const items: ActionItem[] = [];
  state.employers.forEach((e) => {
    if (e.stage !== "lost" && e.nextAction) {
      items.push({
        key: e.id,
        kind: "employer",
        employer: e,
        type: e.nextAction.type,
        title: e.nextAction.title,
        detail: e.nextAction.detail,
        due: e.nextAction.due,
        script: e.nextAction.script,
      });
    }
  });
  state.tasks.forEach((t) => {
    if (!t.done) {
      items.push({
        key: t.id,
        kind: "task",
        task: t,
        type: t.type,
        title: t.title,
        detail: t.detail,
        due: t.due,
      });
    }
  });
  return items.sort((a, b) => a.due.localeCompare(b.due));
}

export function currentNumbers(state: AppState) {
  const live = state.employers.filter((e) => e.stage === "live");
  const employees = live.reduce((t, e) => t + (Number(e.metrics.employees) || 0), 0);
  const revenue = live.reduce((t, e) => t + (Number(e.metrics.revenue) || 0), 0);
  return {
    live: live.length,
    employees,
    revenue,
    perEmployee: employees ? Math.round(revenue / employees) : 0,
    ewa: live.reduce((t, e) => t + (Number(e.metrics.ewaActive) || 0), 0),
    savings: live.reduce((t, e) => t + (Number(e.metrics.savingsFunded) || 0), 0),
  };
}

export function weeklyTotals(state: AppState): DailyLog {
  const out: DailyLog = { whatsapp: 0, calls: 0, demos: 0, packs: 0 };
  for (let i = 0; i < 7; i++) {
    const l = state.log[addDaysISO(todayISO(), -i)];
    if (!l) continue;
    out.whatsapp += Number(l.whatsapp) || 0;
    out.calls += Number(l.calls) || 0;
    out.demos += Number(l.demos) || 0;
    out.packs += Number(l.packs) || 0;
  }
  return out;
}

export function pendingActions(state: AppState) {
  const all = actionsFor(state);
  const today = todayISO();
  return {
    all,
    overdue: all.filter((a) => dayDiff(a.due, today) < 0),
    dueToday: all.filter((a) => dayDiff(a.due, today) === 0),
    next3: all.filter((a) => {
      const n = dayDiff(a.due, today);
      return n > 0 && n <= 3;
    }),
  };
}

export function checklistTotal(state: AppState) {
  return Object.keys(state.checklist).length;
}

export function checklistDone(state: AppState) {
  return Object.keys(state.checklist).filter((k) => state.checklist[k]).length;
}

export function sequenceSteps(seq: SeqId) {
  return SEQUENCES[seq]?.steps ?? [];
}

export const allChecks = [...REQUIRED_CHECKS, ...OPTIONAL_CHECKS];

export function triageCount(state: AppState) {
  return state.employers.filter(
    (e) => complianceStatus(e) === "failed" && e.compliance.fixable == null,
  ).length;
}

export function displayStepTitle(title: string) {
  return title
    .replace(" to {contact}", "")
    .replace(" to {name}", "")
    .replace(" at {name}", "")
    .replace("{contact}", "the contact")
    .replace("{name}", "the employer");
}

export function emptyCompliance(): Compliance {
  return { checks: {}, failReason: "", fixable: null };
}
