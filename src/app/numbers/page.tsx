"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { Card, Eyebrow, PageHeader, Pill, Progress, Stat } from "@/components/ui/primitives";
import { currentNumbers, weeklyTotals } from "@/lib/domain";
import { naira, num, pct } from "@/lib/utils";
import { useSalesStore } from "@/store/use-sales-store";

function FunnelRow({ label, value, max, display }: { label: string; value: number; max: number; display: string }) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)_46px] items-center gap-2.5">
      <span className="text-[11.5px] text-ink-soft">{label}</span>
      <div className="h-5 overflow-hidden rounded-md bg-[#f0ebdf]">
        <div
          className="h-full rounded-md bg-gradient-to-r from-[#2a7a5b] to-[#7aa88f]"
          style={{ width: `${Math.max(2, Math.round((value / max) * 100))}%` }}
        />
      </div>
      <strong className="text-right text-[11.5px]">{display}</strong>
    </div>
  );
}

function TargetRow({ label, value, target }: { label: string; value: number; target: number }) {
  const progress = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-[11.5px]">
        <span>{label}</span>
        <strong className="text-[11px] text-muted">{progress}%</strong>
      </div>
      <Progress value={value} max={target} />
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex justify-between text-[11px] text-muted">
        {label} <strong className="serif text-[15px] text-ink">{format(value)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full accent-brand"
      />
    </label>
  );
}

export default function NumbersPage() {
  const state = useSalesStore();
  const numbers = currentNumbers(state);
  const week = weeklyTotals(state);
  const baseline = state.baseline;
  const targets = state.targets;
  const [emp, setEmp] = React.useState(8);
  const [staff, setStaff] = React.useState(50);
  const [activation, setActivation] = React.useState(50);
  const [perActive, setPerActive] = React.useState(state.revPerActive || 900);

  const paid = emp * staff;
  const active = Math.round(paid * (activation / 100));
  const mrr = active * perActive;
  const chartData = [
    { name: "WhatsApp", actual: week.whatsapp, target: targets.weekly.whatsapp },
    { name: "Calls", actual: week.calls, target: targets.weekly.calls },
    { name: "Demos", actual: week.demos, target: targets.weekly.demos },
    { name: "Packs", actual: week.packs, target: targets.weekly.compliancePacks },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="The only scoreboard"
        title="Numbers"
        description={`${numbers.employees} employees, ${naira(numbers.revenue)} a month. The job is more employees paid through ChequeIn, and more revenue from each one.`}
        actions={<Pill>Baseline {baseline.asOf}</Pill>}
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Stat label="Monthly revenue" value={naira(numbers.revenue)} sub="live payrolls" />
        <Stat label="Employees paid" value={num(numbers.employees)} sub="through ChequeIn" />
        <Stat label="Revenue / employee" value={naira(numbers.perEmployee)} sub={`target ${naira(targets.quarter.revenuePerEmployee)}`} tone={numbers.perEmployee < targets.quarter.revenuePerEmployee ? "warn" : "good"} />
        <Stat label="Live employers" value={numbers.live} sub={`target ${targets.quarter.employersLive}`} tone={numbers.live < targets.quarter.employersLive ? "warn" : "good"} />
        <Stat label="EWA users" value={pct(numbers.employees ? numbers.ewa / numbers.employees : baseline.ewaPenetration)} sub="baseline 33%" />
        <Stat label="Savings funded" value={pct(numbers.employees ? numbers.savings / numbers.employees : baseline.savingsRate)} sub="baseline 8%" tone="bad" />
        <Stat label="30-day retention" value={pct(baseline.retained30d / baseline.signups30d)} sub="1 of 25 sign-ups" tone="bad" />
        <Stat label="EWA repayment" value={`${(baseline.repayment * 100).toFixed(1)}%`} sub="verify definition" tone="bad" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <Eyebrow>The funnel, honestly</Eyebrow>
          <h2 className="mt-0.5 text-[18px] font-semibold">Where it leaks</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            <FunnelRow label="Employers signed" value={11} max={11} display="11" />
            <FunnelRow label="Passed compliance" value={4} max={11} display="4" />
            <FunnelRow label="Live payrolls" value={3} max={11} display="3" />
            <FunnelRow label="Employees paid" value={106} max={106} display="106" />
            <FunnelRow label="Using EWA" value={35} max={106} display="33%" />
            <FunnelRow label="Funded savings" value={8} max={106} display="8%" />
          </div>
          <p className="mt-3 text-[11px] text-muted">
            The biggest drop is not sign-up — it is activation. 106 people are paid through you and
            eight save. Fix that before adding more employers.
          </p>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <Eyebrow>Direction</Eyebrow>
              <h2 className="mt-0.5 text-[18px] font-semibold">Quarter target</h2>
            </div>
            <Pill>90 days</Pill>
          </div>
          <TargetRow label="Live employers" value={numbers.live} target={targets.quarter.employersLive} />
          <TargetRow label="Employees paid" value={numbers.employees} target={targets.quarter.activeEmployees} />
          <TargetRow label="Revenue / employee" value={numbers.perEmployee} target={targets.quarter.revenuePerEmployee} />
          <TargetRow label="Compliance pass rate" value={0.36} target={targets.quarter.compliancePass} />
          <TargetRow label="Activation (any product)" value={0.33} target={targets.quarter.activation} />
          <TargetRow label="Savings rate" value={0.08} target={targets.quarter.savingsRate} />
          <div className="mt-2.5 rounded-lg border border-[#eee2c8] bg-[#fbf6e9] px-2.5 py-2 text-[11.5px] text-[#6a5628]">
            To hit {naira(targets.quarter.activeEmployees * targets.quarter.revenuePerEmployee)} a
            month you need {targets.quarter.employersLive} employers at about 50 staff each — and half
            of those staff using a product. The first number is sales. The second is activation.
          </div>
        </Card>
      </div>

      <Card className="mb-4 p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <Eyebrow>Play with it</Eyebrow>
            <h2 className="mt-0.5 text-[18px] font-semibold">Revenue model</h2>
          </div>
          <Pill>{naira(perActive)} / active user</Pill>
        </div>
        <div className="grid items-center gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-3">
            <Slider label="Employers" value={emp} min={1} max={30} step={1} onChange={setEmp} format={(v) => String(v)} />
            <Slider label="Staff per employer" value={staff} min={5} max={150} step={5} onChange={setStaff} format={(v) => String(v)} />
            <Slider label="Activation rate" value={activation} min={10} max={90} step={5} onChange={setActivation} format={(v) => `${v}%`} />
            <Slider label="Revenue per active user" value={perActive} min={200} max={2000} step={50} onChange={setPerActive} format={(v) => naira(v)} />
          </div>
          <div className="rounded-xl bg-[#123229] p-4 text-[#f8f4e8]">
            <div className="text-[9px] uppercase tracking-[0.12em] text-[#a2b5a8]">Monthly revenue</div>
            <div className="serif text-[36px] leading-tight">{naira(mrr)}</div>
            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/15 pt-2.5">
              <div>
                <div className="text-[8.5px] uppercase tracking-[0.08em] text-[#9db1a4]">Employees paid</div>
                <div className="serif text-[16px]">{num(paid)}</div>
              </div>
              <div>
                <div className="text-[8.5px] uppercase tracking-[0.08em] text-[#9db1a4]">Active users</div>
                <div className="serif text-[16px]">{num(active)}</div>
              </div>
              <div>
                <div className="text-[8.5px] uppercase tracking-[0.08em] text-[#9db1a4]">Annual</div>
                <div className="serif text-[16px]">{naira(mrr * 12)}</div>
              </div>
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-[#8fa397]">
              Baseline: {num(numbers.employees)} paid employees, {num(numbers.ewa)} active users and{" "}
              {naira(numbers.revenue)} a month — about {naira(perActive)} per active user.
            </p>
          </div>
        </div>
      </Card>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5" id="scorecard">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <Eyebrow>Last 7 days</Eyebrow>
              <h2 className="mt-0.5 text-[18px] font-semibold">Weekly output</h2>
            </div>
            <Pill>inputs</Pill>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid stroke="#eee7d8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6e7a72" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 10,
                    border: "1px solid #e5dfd2",
                    background: "#fffdf8",
                  }}
                />
                <Bar dataKey="target" name="Target" fill="#e6dfcf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#1f8a63" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[10.5px] text-muted">
            Inputs are the only thing you control. If these are green for four weeks, the outputs follow.
          </p>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-gold" />
            <h2 className="text-[18px] font-semibold">Repayment warning</h2>
          </div>
          <p className="text-[12px] text-muted">
            EWA repayment is reported at <strong>{(baseline.repayment * 100).toFixed(1)}%</strong>. If
            that means recovered ÷ due, EWA is not working and credit is not the next product —
            collections is. Confirm the definition with your partner bank this week, then track it
            weekly here.
          </p>
          <div className="mt-3 rounded-lg bg-danger-soft px-2.5 py-2 text-[11.5px] text-[#7d3222]">
            Do not market credit on a repayment number you cannot explain.
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <Eyebrow>Next 90 days</Eyebrow>
        <h2 className="mt-0.5 text-[18px] font-semibold">The plan</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Weeks 1–2", "Fix the gate, fill the list", ["Rename and triage the 7 failed employers", "Build 25 school targets with phone numbers", "Send the first 10 openers", "Run the Will’B’ staff session"], "25 targets · 7 triaged"],
            ["Weeks 3–6", "First new go-live", ["40 conversations · 8 demos", "3 compliance packs out", "1–2 new employers live", "First staff session at a new school"], "2 new live · 80 staff"],
            ["Weeks 7–12", "Activation proof", ["50% of staff on a product", "25% funding savings", "EWA recovery understood and ≥ 90%", "8 live employers · 400 employees"], "₦180k MRR"],
          ].map(([when, title, items, target]) => (
            <div key={String(title)} className="rounded-xl border border-[#ece5d5] bg-[#fbf8f0] p-3.5">
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-gold">{when}</div>
              <h3 className="serif mt-1 text-[18px]">{title}</h3>
              <ul className="mt-1.5 flex flex-col gap-1 text-[11.5px] text-ink-soft">
                {(items as string[]).map((item) => (
                  <li key={item} className="relative pl-3 before:absolute before:left-0.5 before:text-brand-bright before:content-['·']">{item}</li>
                ))}
              </ul>
              <div className="mt-2 inline-block rounded bg-mint px-2 py-1 text-[10px] font-semibold text-brand">{target}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
