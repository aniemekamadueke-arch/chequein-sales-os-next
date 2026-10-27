"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { ActionRow } from "@/components/action-row";
import {
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Pill,
  Progress,
} from "@/components/ui/primitives";
import {
  actionsFor,
  checklistDone,
  checklistTotal,
  currentNumbers,
  pendingActions,
  triageCount,
  weeklyTotals,
} from "@/lib/domain";
import { naira, num, todayISO } from "@/lib/utils";
import { useSalesStore } from "@/store/use-sales-store";
import { useUiStore } from "@/store/use-ui-store";

const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

function HeroStat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="hero-stat flex min-h-[82px] flex-col justify-center gap-0.5 px-4 py-3.5">
      <span className="text-[9.5px] uppercase tracking-[0.1em] text-[#9db2a5]">{label}</span>
      <strong className="serif text-[25px] font-medium leading-tight">{value}</strong>
      <em className="text-[10.5px] not-italic text-[#8ea396]">{sub}</em>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (delta: number) => void;
}) {
  return (
    <div className="rounded-[10px] border border-[#ece6d8] bg-[#fbf8f0] px-3 py-2.5">
      <div className="text-[9.5px] uppercase tracking-[0.08em] text-muted">{label}</div>
      <div className="mt-1 flex items-center gap-2.5">
        <button
          onClick={() => onChange(-1)}
          className="grid h-6 w-6 place-items-center rounded-md border border-line-strong bg-white text-[14px] text-ink-soft hover:bg-[#efe9da]"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="serif min-w-6 text-center text-[22px]">{value}</span>
        <button
          onClick={() => onChange(1)}
          className="grid h-6 w-6 place-items-center rounded-md border border-line-strong bg-white text-[14px] text-ink-soft hover:bg-[#efe9da]"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const state = useSalesStore();
  const openAdd = useUiStore((s) => s.setAddOpen);
  const logMetric = useSalesStore((s) => s.logMetric);
  const toggleChecklist = useSalesStore((s) => s.toggleChecklist);

  const numbers = currentNumbers(state);
  const actions = actionsFor(state);
  const { overdue, dueToday, next3 } = pendingActions(state);
  const week = weeklyTotals(state);
  const targets = state.targets.weekly;
  const dueNow = overdue.length + dueToday.length;
  const live = state.employers.filter((e) => e.stage === "live").length;
  const triage = triageCount(state);
  const done = checklistDone(state);
  const total = checklistTotal(state);

  const headline = overdue.length
    ? `${overdue.length} overdue. Clear ${dueNow} today.`
    : dueNow
      ? `${dueNow <= 10 ? words[dueNow] : dueNow} ${dueNow === 1 ? "action" : "actions"} before lunch.`
      : "Queue clear. Find ten schools.";

  const todayLog = state.log[todayISO()] ?? { whatsapp: 0, calls: 0, demos: 0, packs: 0 };
  const groups = [
    { title: "Overdue", items: overdue, tone: "text-danger" },
    { title: "Today", items: dueToday, tone: "text-muted" },
    { title: "Next 3 days", items: next3, tone: "text-muted" },
  ].filter((g) => g.items.length);

  return (
    <div>
      <section className="hero-surface relative mb-4 overflow-hidden rounded-[20px] px-5 py-6 text-[#f8f4e8] shadow-[0_22px_44px_-32px_rgba(9,28,22,0.9)] sm:px-7 lg:grid lg:grid-cols-[1.35fr_1fr] lg:gap-7 lg:px-8 lg:py-7">
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(231,216,178,0.16),transparent_65%)]" />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#a9bdad]">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            · Lagos
          </div>
          <h1
            className="serif mt-3 whitespace-pre-line text-[42px] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[48px]"
            dangerouslySetInnerHTML={{
              __html: headline.replace(" Clear", "<br />Clear").replace(" before lunch.", "<br />before lunch."),
            }}
          />
          <p className="mt-3 max-w-[460px] text-[13px] leading-relaxed text-[#b9c8bd]">
            Free payroll is the door. Activation is the revenue. Every action in this queue points
            at the same number: naira per employee per month.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button variant="light" onClick={() => openAdd(true)}>
              + Add employer
            </Button>
            <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#e8dfc8] hover:underline">
              Source 25 targets <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#f8f4e8]/15 bg-[#f8f4e8]/15 lg:mt-0">
          <HeroStat label="Due now" value={dueNow} sub={overdue.length ? `${overdue.length} overdue` : "keep it at zero"} />
          <HeroStat label="WhatsApp · 7d" value={`${week.whatsapp} / ${targets.whatsapp}`} sub={week.whatsapp >= targets.whatsapp ? "on pace" : `${targets.whatsapp - week.whatsapp} to go`} />
          <HeroStat label="Calls · 7d" value={`${week.calls} / ${targets.calls}`} sub={week.calls >= targets.calls ? "on pace" : `${targets.calls - week.calls} to go`} />
          <HeroStat label="Live payrolls" value={live} sub={`${naira(numbers.revenue)} / month`} />
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_336px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <Eyebrow>Do this now</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">Action queue</h2>
              </div>
              <Pill>{actions.length} open</Pill>
            </div>

            {groups.length ? (
              groups.map((group) => (
                <div key={group.title} className="mt-2 first:mt-0">
                  <div className={`flex items-center gap-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] ${group.tone}`}>
                    {group.title}
                    <span className="rounded-full bg-[#f0ebdf] px-1.5 text-[10px] tracking-normal text-ink-soft">
                      {group.items.length}
                    </span>
                  </div>
                  {group.items.map((item) => (
                    <ActionRow key={`${item.kind}-${item.key}`} item={item} />
                  ))}
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Check className="h-5 w-5" />}
                title="Nothing scheduled"
                body="Add employers and the 21-day cadence will fill this queue for you."
                action={<Button onClick={() => openAdd(true)}>Add your first employer</Button>}
              />
            )}

            {actions.length > dueNow + next3.length ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[#efeade] pt-2.5 text-[11px] text-muted">
                {actions.length - dueNow - next3.length} more scheduled later.
                <Link href="/pipeline" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                  See pipeline <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <Eyebrow>Daily discipline</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">Log today</h2>
              </div>
              <span className="text-[11px] text-muted">
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Counter label="WhatsApp sent" value={todayLog.whatsapp} onChange={(d) => logMetric("whatsapp", d)} />
              <Counter label="Calls made" value={todayLog.calls} onChange={(d) => logMetric("calls", d)} />
              <Counter label="Demos run" value={todayLog.demos} onChange={(d) => logMetric("demos", d)} />
              <Counter label="Compliance packs" value={todayLog.packs} onChange={(d) => logMetric("packs", d)} />
            </div>
            <p className="mt-2.5 text-[11px] text-muted">
              The scorecard is only as honest as this log. Count what you actually sent, not what you planned.
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <Eyebrow>Last 7 days</Eyebrow>
            <h2 className="mt-0.5 text-[18px] font-semibold">This week</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {[
                ["WhatsApp", week.whatsapp, targets.whatsapp],
                ["Calls", week.calls, targets.calls],
                ["Demos", week.demos, targets.demos],
                ["Compliance packs", week.packs, targets.compliancePacks],
              ].map(([label, value, target]) => (
                <div key={label}>
                  <div className="mb-1 flex items-baseline justify-between text-[12px]">
                    <span>{label}</span>
                    <span className="serif text-[16px]">
                      {value} <span className="font-sans text-[10.5px] text-muted">/ {target}</span>
                    </span>
                  </div>
                  <Progress value={Number(value)} max={Number(target)} tone={Number(value) >= Number(target) ? "good" : "default"} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-b from-[#fffdf6] to-[#f7f1e1] p-5">
            <Eyebrow>The offer</Eyebrow>
            <blockquote className="serif mt-2 text-[17px] leading-snug">
              “Free payroll for the school. Financial wellbeing for the staff. We earn when they save
              or use salary they have already earned.”
            </blockquote>
            <Button asChild variant="outline" className="mt-3.5">
              <Link href="/playbook">
                Open the playbook <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>

          <Card className="p-5">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <Eyebrow>First 30 minutes</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">Start here</h2>
              </div>
              <Pill>{done}/{total}</Pill>
            </div>
            <div className="mt-1 flex flex-col">
              {Object.keys(state.checklist).map((key) => (
                <label key={key} className="flex cursor-pointer items-start gap-2 border-b border-[#f2ede1] py-2 text-[12px] last:border-0">
                  <input
                    type="checkbox"
                    checked={!!state.checklist[key]}
                    onChange={() => toggleChecklist(key)}
                    className="mt-0.5 accent-brand"
                  />
                  <span className={state.checklist[key] ? "text-faint line-through" : ""}>{key}</span>
                </label>
              ))}
            </div>
          </Card>

          {triage ? (
            <Card className="border-[#ead8c2] bg-[#fdf7ec] p-5">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <strong className="text-[12.5px]">{triage} failed employers still unclassified</strong>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    Fixable or not a fit — decide this week. They are not a pipeline until you do.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2 border-[#dccbae] bg-[#fffaf0]">
                    <Link href="/compliance">Triage them <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
