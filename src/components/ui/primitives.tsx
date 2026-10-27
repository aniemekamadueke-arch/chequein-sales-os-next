"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { complianceStatus } from "@/lib/domain";
import type { Employer, StageId } from "@/lib/types";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/30 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "border border-brand bg-brand text-white hover:bg-[#0f4b37]",
        outline: "border border-line-strong bg-transparent text-ink-soft hover:bg-[#f3efe4]",
        ghost: "border border-transparent bg-transparent text-ink-soft hover:bg-[#ebe5d7]",
        light: "border-0 bg-[#f8f4e8] text-[#10241e] hover:bg-white",
        danger: "border border-danger-soft bg-danger-soft text-danger hover:bg-[#f3d9d2]",
        subtle: "border border-[#e4dccb] bg-[#f0ebdf] text-ink-soft hover:bg-[#e9e2d2]",
      },
      size: {
        sm: "h-7 px-2.5 text-[10.5px]",
        md: "h-9 px-3.5",
        lg: "h-10 px-4",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("eyebrow", className)} {...props} />;
}

export function Pill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#e4dccb] bg-[#f0ebdf] px-2.5 py-0.5 text-[10.5px] font-semibold text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}

const stageClasses: Record<StageId, string> = {
  lead: "bg-[#eee9dd] text-[#5d675f]",
  contacted: "bg-blue-soft text-blue",
  qualified: "bg-[#e6efdf] text-[#4c6b3e]",
  demo: "bg-gold-soft text-[#8c611d]",
  compliance: "bg-[#f4e6d8] text-[#855526]",
  live: "bg-mint text-brand",
  lost: "bg-[#eceae4] text-[#858b84]",
};

export function StageBadge({ stage }: { stage: StageId }) {
  const labels: Record<StageId, string> = {
    lead: "Lead",
    contacted: "Contacted",
    qualified: "Qualified",
    demo: "Demo",
    compliance: "Compliance",
    live: "Live",
    lost: "Lost",
  };
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-semibold", stageClasses[stage])}>
      {labels[stage]}
    </span>
  );
}

export function ComplianceBadge({ employer }: { employer: Employer }) {
  const status = complianceStatus(employer);
  const map = {
    passed: "bg-mint text-brand",
    failed: "bg-danger-soft text-danger",
    pending: "bg-[#f1ecdf] text-[#7c735d]",
    closed: "bg-[#eceae4] text-[#858b84]",
  } as const;
  const labels = {
    passed: "Compliance passed",
    failed: "Compliance failed",
    pending: "Compliance in progress",
    closed: "Closed",
  } as const;
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-semibold", map[status])}>
      {labels[status]}
    </span>
  );
}

export function Progress({
  value,
  max,
  tone = "default",
  className,
}: {
  value: number;
  max: number;
  tone?: "default" | "good" | "warn" | "bad";
  className?: string;
}) {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const tones = {
    default: "bg-[#b9ad8f]",
    good: "bg-brand-bright",
    warn: "bg-gold",
    bad: "bg-danger",
  };
  return (
    <div className={cn("h-[5px] overflow-hidden rounded-full bg-[#ece6d9]", className)}>
      <div className={cn("h-full rounded-full", tones[tone])} style={{ width: `${width}%` }} />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="serif mt-1 text-[40px] leading-[1.02]">{title}</h1>
        <p className="mt-2 max-w-[720px] text-[13px] text-muted">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "good" | "warn" | "bad";
}) {
  const tones = { good: "text-brand", warn: "text-gold", bad: "text-danger" };
  return (
    <div className="card px-4 py-3.5">
      <div className="text-[9.5px] font-medium uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className={cn("serif mt-1 text-[27px] leading-tight", tone && tones[tone])}>{value}</div>
      {sub ? <div className="text-[10.5px] text-muted">{sub}</div> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="text-[10px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("input", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("input resize-y", props.className)} />;
}

export function Segmented({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: boolean | null;
  onChange: (next: boolean) => void;
  options?: [string, string];
  size?: "sm" | "md";
}) {
  const [yes, no] = options ?? ["Yes", "No"];
  return (
    <div className="inline-flex rounded-md bg-[#f0ebdf] p-0.5">
      {[true, false].map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded px-2 font-semibold text-muted transition-colors",
            size === "sm" ? "py-0.5 text-[9.5px]" : "py-1 text-[10px]",
            value === option && "bg-white text-brand shadow-sm",
            value === false && option === false && "text-danger",
          )}
        >
          {option ? yes : no}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-8 text-center">
      {icon ? (
        <div className="mx-auto mb-2.5 grid h-10 w-10 place-items-center rounded-full bg-mint text-brand">
          {icon}
        </div>
      ) : null}
      <h3 className="serif text-xl">{title}</h3>
      <p className="mx-auto mt-1 max-w-[340px] text-[12px] text-muted">{body}</p>
      {action ? <div className="mt-3.5">{action}</div> : null}
    </div>
  );
}

export function TypeChip({ type }: { type: string }) {
  const label: Record<string, string> = {
    whatsapp: "WA",
    call: "CALL",
    email: "MAIL",
    session: "SESS",
    review: "CHECK",
    admin: "TASK",
  };
  return <span className={cn("type-chip", `type-${type}`)}>{label[type] ?? "TASK"}</span>;
}
