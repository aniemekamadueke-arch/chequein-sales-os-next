"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { SEQUENCES, blankChecks, seed, stepAction } from "@/lib/data";
import {
  actionFor,
  compliancePassed,
  gateTo,
  nextStageId,
  sequenceFor,
} from "@/lib/domain";
import type {
  AppState,
  DailyLog,
  Employer,
  GateResult,
  Qualification,
  Task,
} from "@/lib/types";
import { addDaysISO, todayISO } from "@/lib/utils";

export interface NewEmployerInput {
  name: string;
  contact?: string;
  role?: string;
  phone?: string;
  staff?: number | string;
  segment?: string;
  city?: string;
  source?: string;
  startSequence?: boolean;
}

interface SalesStore extends AppState {
  addEmployer: (input: NewEmployerInput) => void;
  updateEmployer: (id: string, patch: Partial<Employer>) => void;
  updateQualification: (id: string, patch: Partial<Qualification>) => void;
  setCheck: (id: string, checkId: string, value: boolean) => void;
  setFailReason: (id: string, value: string) => void;
  setFixable: (id: string, value: boolean | null) => void;
  advanceStage: (id: string) => GateResult;
  completeAction: (id: string) => void;
  snoozeAction: (id: string) => void;
  restartCadence: (id: string) => void;
  completeTask: (id: string) => void;
  snoozeTask: (id: string) => void;
  logMetric: (metric: keyof DailyLog, delta: number) => void;
  toggleChecklist: (key: string) => void;
  addNote: (id: string, text: string) => void;
  deleteEmployer: (id: string) => void;
  reset: () => void;
  importState: (raw: unknown) => void;
  setRevPerEmployee: (value: number) => void;
}

const importSchema = z.object({
  employers: z.array(z.record(z.string(), z.unknown())),
  tasks: z.array(z.record(z.string(), z.unknown())).optional(),
  log: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  checklist: z.record(z.string(), z.boolean()).optional(),
  revPerEmployee: z.number().optional(),
  revPerActive: z.number().optional(),
});

const baseEmployer: Employer = {
  id: "",
  name: "",
  segment: "Other",
  city: "",
  contact: "",
  role: "",
  phone: "",
  email: "",
  source: "",
  staffEstimate: 0,
  stage: "lead",
  createdAt: todayISO(),
  qualification: {
    staffCount: null,
    monthlyPayroll: null,
    paidByTransfer: null,
    decisionMaker: null,
    registered: null,
    noDeductions: null,
    consentPossible: null,
    demoDone: false,
  },
  compliance: { checks: blankChecks(), failReason: "", fixable: null },
  metrics: { employees: 0, ewaActive: 0, savingsFunded: 0, revenue: 0 },
  nextAction: null,
  activity: [],
  notes: "",
};

function normalizeEmployer(raw: Record<string, unknown>): Employer {
  const base = baseEmployer;
  const emp = raw as unknown as Employer;
  return {
    ...base,
    ...emp,
    qualification: { ...base.qualification, ...(emp.qualification ?? {}) },
    compliance: {
      ...base.compliance,
      ...(emp.compliance ?? {}),
      checks: { ...blankChecks(), ...(emp.compliance?.checks ?? {}) },
    },
    metrics: { ...base.metrics, ...(emp.metrics ?? {}) },
    activity: Array.isArray(emp.activity) ? emp.activity : [],
    nextAction: emp.nextAction ?? null,
  };
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      ...seed(),

      addEmployer: (input) => {
        const id = `e_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
        const name = input.name.trim();
        const contact = input.contact?.trim() ?? "";
        const staff = Number(input.staff) || 0;
        const employer: Employer = {
          id,
          name,
          segment: input.segment || "Other",
          city: input.city?.trim() ?? "",
          contact,
          role: input.role?.trim() ?? "",
          phone: input.phone?.trim() ?? "",
          email: "",
          source: input.source?.trim() ?? "",
          staffEstimate: staff,
          stage: "lead",
          createdAt: todayISO(),
          qualification: {
            staffCount: staff || null,
            monthlyPayroll: null,
            paidByTransfer: null,
            decisionMaker: null,
            registered: null,
            noDeductions: null,
            consentPossible: null,
            demoDone: false,
          },
          compliance: { checks: blankChecks(), failReason: "", fixable: null },
          metrics: { employees: 0, ewaActive: 0, savingsFunded: 0, revenue: 0 },
          nextAction: input.startSequence
            ? actionFor("school", 0, { name, contact })
            : null,
          activity: [
            {
              date: todayISO(),
              type: "note",
              text: `Added to pipeline${input.source ? ` · ${input.source}` : ""}`,
            },
          ],
          notes: "",
        };
        set((s) => ({ employers: [...s.employers, employer] }));
      },

      updateEmployer: (id, patch) =>
        set((s) => ({
          employers: s.employers.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      updateQualification: (id, patch) =>
        set((s) => ({
          employers: s.employers.map((e) =>
            e.id === id
              ? { ...e, qualification: { ...e.qualification, ...patch } }
              : e,
          ),
        })),

      setCheck: (id, checkId, value) =>
        set((s) => ({
          employers: s.employers.map((e) => {
            if (e.id !== id) return e;
            const next: Employer = {
              ...e,
              compliance: {
                ...e.compliance,
                checks: { ...e.compliance.checks, [checkId]: value },
              },
            };
            if (compliancePassed(next)) next.compliance.failReason = "";
            return next;
          }),
        })),

      setFailReason: (id, value) =>
        set((s) => ({
          employers: s.employers.map((e) =>
            e.id === id ? { ...e, compliance: { ...e.compliance, failReason: value } } : e,
          ),
        })),

      setFixable: (id, value) =>
        set((s) => ({
          employers: s.employers.map((e) => {
            if (e.id !== id) return e;
            if (value === false) {
              return {
                ...e,
                stage: "lost",
                nextAction: null,
                compliance: { ...e.compliance, fixable: false },
                activity: [
                  {
                    date: todayISO(),
                    type: "stage",
                    text: `Marked not a fit · ${e.compliance.failReason || "compliance"}`,
                  },
                  ...e.activity,
                ],
              };
            }
            return {
              ...e,
              compliance: { ...e.compliance, fixable: value },
              nextAction: actionFor("recovery", 1, e),
              activity: [
                {
                  date: todayISO(),
                  type: "note",
                  text: "Marked fixable — fix list is the next step",
                },
                ...e.activity,
              ],
            };
          }),
        })),

      advanceStage: (id) => {
        const emp = get().employers.find((e) => e.id === id);
        if (!emp) return { ok: false, message: "Employer not found." };
        const to = nextStageId(emp.stage);
        const gate = gateTo(emp, to);
        if (!gate.ok || !to) return gate;

        const next: Employer = {
          ...emp,
          stage: to,
          activity: [
            { date: todayISO(), type: "stage", text: `Moved to ${to}` },
            ...emp.activity,
          ],
        };

        if (to === "live") {
          if (!next.metrics.employees) next.metrics.employees = Number(next.staffEstimate) || 0;
          if (!next.metrics.revenue) {
            next.metrics.revenue = next.metrics.employees * (get().revPerEmployee || 300);
          }
          next.nextAction = actionFor("activation", 0, next);
        } else if (
          (to === "demo" || to === "compliance") &&
          next.nextAction?.seq === "school"
        ) {
          next.nextAction = null;
        }

        set((s) => ({
          employers: s.employers.map((e) => (e.id === id ? next : e)),
        }));
        return { ok: true, message: "" };
      },

      completeAction: (id) => {
        const emp = get().employers.find((e) => e.id === id);
        if (!emp?.nextAction) return;
        const current = emp.nextAction;
        const nextStep = current.step + 1;
        const steps = SEQUENCES[current.seq]?.steps.length ?? 0;
        const next: Employer = {
          ...emp,
          stage: emp.stage === "lead" && current.seq === "school" ? "contacted" : emp.stage,
          nextAction:
            nextStep < steps
              ? stepAction(current.seq, nextStep, emp)
              : null,
          activity: [
            {
              date: todayISO(),
              type: "done",
              text: `${current.type}: ${current.title}`,
            },
            ...emp.activity,
          ],
        };
        set((s) => ({ employers: s.employers.map((e) => (e.id === id ? next : e)) }));
      },

      snoozeAction: (id) =>
        set((s) => ({
          employers: s.employers.map((e) =>
            e.id === id && e.nextAction
              ? { ...e, nextAction: { ...e.nextAction, due: addDaysISO(todayISO(), 1) } }
              : e,
          ),
        })),

      restartCadence: (id) =>
        set((s) => ({
          employers: s.employers.map((e) =>
            e.id === id
              ? {
                  ...e,
                  nextAction: actionFor(sequenceFor(e), 0, e),
                  activity: [
                    { date: todayISO(), type: "note", text: "Cadence restarted" },
                    ...e.activity,
                  ],
                }
              : e,
          ),
        })),

      completeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: true } : t)),
        })),

      snoozeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, due: addDaysISO(todayISO(), 1) } : t,
          ),
        })),

      logMetric: (metric, delta) =>
        set((s) => {
          const date = todayISO();
          const current = s.log[date] ?? { whatsapp: 0, calls: 0, demos: 0, packs: 0 };
          return {
            log: {
              ...s.log,
              [date]: { ...current, [metric]: Math.max(0, current[metric] + delta) },
            },
          };
        }),

      toggleChecklist: (key) =>
        set((s) => ({
          checklist: { ...s.checklist, [key]: !s.checklist[key] },
        })),

      addNote: (id, text) =>
        set((s) => ({
          employers: s.employers.map((e) =>
            e.id === id
              ? {
                  ...e,
                  activity: [{ date: todayISO(), type: "note", text }, ...e.activity],
                }
              : e,
          ),
        })),

      deleteEmployer: (id) =>
        set((s) => ({ employers: s.employers.filter((e) => e.id !== id) })),

      reset: () => set({ ...seed() }),

      importState: (raw) => {
        const parsed = importSchema.parse(raw);
        const base = seed();
        const employers = parsed.employers.map(normalizeEmployer);
        set({
          ...base,
          employers,
          tasks: (parsed.tasks as unknown as Task[]) ?? base.tasks,
          log: (parsed.log as unknown as Record<string, DailyLog>) ?? {},
          checklist: parsed.checklist ?? {},
          revPerEmployee: parsed.revPerEmployee ?? base.revPerEmployee,
          revPerActive: parsed.revPerActive ?? base.revPerActive,
        });
      },

      setRevPerEmployee: (value) =>
        set({ revPerEmployee: Number.isFinite(value) ? value : 300 }),
    }),
    {
      name: "chequein-sales-os-next-v1",
      version: 1,
      partialize: (s) => ({
        employers: s.employers,
        tasks: s.tasks,
        log: s.log,
        checklist: s.checklist,
        revPerEmployee: s.revPerEmployee,
        revPerActive: s.revPerActive,
      }),
    },
  ),
);
