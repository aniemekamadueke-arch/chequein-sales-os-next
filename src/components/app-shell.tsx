"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  GitBranch,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { cn, dayDiff, naira, num, todayISO, weekNumber } from "@/lib/utils";
import { actionsFor, currentNumbers, triageCount } from "@/lib/domain";
import { useSalesStore } from "@/store/use-sales-store";
import { useUiStore } from "@/store/use-ui-store";
import { useHydrated } from "@/lib/use-hydrated";
import { AddEmployerDialog } from "@/components/add-employer-dialog";
import { EmployerSheet } from "@/components/employer-sheet";
import { SettingsDialog } from "@/components/settings-dialog";

const nav = [
  { href: "/", label: "Today", icon: Sun, key: "today" },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch, key: "pipeline" },
  { href: "/compliance", label: "Compliance gate", icon: ShieldCheck, key: "compliance" },
  { href: "/playbook", label: "Playbook", icon: BookOpen, key: "playbook" },
  { href: "/numbers", label: "Numbers", icon: BarChart3, key: "numbers" },
] as const;

const crumb: Record<string, string> = {
  "/": "Today",
  "/pipeline": "Pipeline",
  "/compliance": "Compliance gate",
  "/playbook": "Playbook",
  "/numbers": "Numbers",
};

function cleanPath(pathname: string | null) {
  const raw = pathname || "/";
  const stripped = raw.replace(/^\/chequein-sales-os-next/, "").replace(/\/+$/, "");
  return stripped || "/";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = cleanPath(usePathname());
  const hydrated = useHydrated();
  const state = useSalesStore();
  const due = actionsFor(state).filter((a) => dayDiff(a.due, todayISO()) <= 0).length;
  const active = state.employers.filter((e) => e.stage !== "lost").length;
  const triage = triageCount(state);
  const numbers = currentNumbers(state);
  const week = weekNumber();

  const addOpen = useUiStore((s) => s.addOpen);
  const setAddOpen = useUiStore((s) => s.setAddOpen);
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const employerId = useUiStore((s) => s.employerId);
  const mobileNav = useUiStore((s) => s.mobileNav);
  const setMobileNav = useUiStore((s) => s.setMobileNav);

  React.useEffect(() => {
    setMobileNav(false);
  }, [pathname, setMobileNav]);

  const counts: Record<string, number | null> = {
    today: hydrated ? due : null,
    pipeline: hydrated ? active : null,
    compliance: hydrated ? triage : null,
  };

  return (
    <div className="min-h-screen">
      {mobileNav ? (
        <div
          className="fixed inset-0 z-[70] bg-[#091511]/50 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[75] flex w-[252px] flex-col bg-[radial-gradient(120%_90%_at_10%_0%,#163b2e_0%,#0b1d17_58%,#08150f_100%)] px-4 pb-4 pt-6 text-[#f8f4e8] transition-transform duration-200 lg:z-40 lg:translate-x-0",
          mobileNav ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2.5 px-2 pb-6">
          <div className="serif grid h-9 w-9 place-items-center rounded-[10px] bg-[#f8f4e8] text-[21px] font-bold text-[#0b1d17] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
            C
          </div>
          <div>
            <div className="serif text-[19px] leading-none">ChequeIn</div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#92a89b]">
              Sales OS
            </div>
          </div>
          <button
            onClick={() => setMobileNav(false)}
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-[#c7d2c8] hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const activeItem = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={activeItem ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] transition-colors",
                  activeItem
                    ? "bg-[#f8f4e8]/12 text-white"
                    : "text-[#c7d2c8] hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className="h-[17px] w-[17px] opacity-80" />
                <span>{item.label}</span>
                {counts[item.key] ? (
                  <span className="ml-auto min-w-5 rounded-full bg-[#e9e2cc] px-1.5 py-0.5 text-center text-[10px] font-semibold text-[#0b1d17]">
                    {counts[item.key]}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-[#f8f4e8]/12 bg-white/5 p-3.5">
          <div className="text-[9px] uppercase tracking-[0.16em] text-[#93a99c]">
            The one number
          </div>
          <div className="serif mt-1 text-[27px]">
            {hydrated ? naira(numbers.revenue) : "—"}
          </div>
          <div className="text-[10.5px] text-[#9db1a4]">
            {hydrated ? `per month · ${num(numbers.employees)} employees` : "loading workspace"}
          </div>
          <Link
            href="/numbers"
            className="mt-2 inline-block text-[11px] text-[#d9ceb2] hover:underline"
          >
            Grow revenue per employee →
          </Link>
        </div>

        <div className="flex flex-col gap-2 px-1 pt-4">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#f8f4e8]/20 px-3 py-2 text-[11.5px] font-medium text-[#d9d2c2] hover:bg-white/8"
          >
            <Settings className="h-3.5 w-3.5" /> Settings &amp; data
          </button>
          <div className="text-center text-[9.5px] text-[#7e9187]">
            Local-first · saves in this browser
          </div>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[62px] items-center gap-3 border-b border-[#d5cebf]/60 bg-cream/85 px-4 backdrop-blur-md sm:px-8">
          <button
            onClick={() => setMobileNav(true)}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[#eae5d8] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">
            {crumb[pathname] ?? "Today"}
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden rounded-full border border-line bg-card px-2.5 py-1 text-[10.5px] text-muted sm:inline">
              {hydrated ? `Week ${week}` : "This week"}
            </span>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand px-3 text-[11.5px] font-semibold text-white hover:bg-[#0f4b37]"
            >
              <Plus className="h-3.5 w-3.5" /> Add employer
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-6 sm:px-8">
          <StoreGate>{children}</StoreGate>
        </main>
      </div>

      {hydrated ? (
        <>
          <AddEmployerDialog open={addOpen} onOpenChange={setAddOpen} />
          <EmployerSheet employerId={employerId} />
          <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
      ) : null}
    </div>
  );
}

function StoreGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="serif mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand text-2xl text-white">
            C
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
            Opening workspace
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
