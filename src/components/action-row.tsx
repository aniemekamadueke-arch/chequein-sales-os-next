"use client";

import { useRouter } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { Button, TypeChip } from "@/components/ui/primitives";
import type { ActionItem } from "@/lib/types";
import { cn, dayDiff, dueLabel, todayISO } from "@/lib/utils";
import { useSalesStore } from "@/store/use-sales-store";
import { useUiStore } from "@/store/use-ui-store";

export function ActionRow({ item }: { item: ActionItem }) {
  const router = useRouter();
  const openEmployer = useUiStore((s) => s.openEmployer);
  const completeAction = useSalesStore((s) => s.completeAction);
  const snoozeAction = useSalesStore((s) => s.snoozeAction);
  const completeTask = useSalesStore((s) => s.completeTask);
  const snoozeTask = useSalesStore((s) => s.snoozeTask);

  const overdue = dayDiff(item.due, todayISO()) < 0;
  const dueToday = dayDiff(item.due, todayISO()) === 0;

  function open() {
    if (item.kind === "employer" && item.employer) {
      openEmployer(item.employer.id);
      return;
    }
    if (item.task?.route) {
      router.push(item.task.route);
      if (item.task.anchor) {
        setTimeout(() => {
          document.getElementById(item.task!.anchor!)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 120);
      }
    }
  }

  function done() {
    if (item.kind === "employer" && item.employer) completeAction(item.employer.id);
    else if (item.task) completeTask(item.task.id);
  }

  function snooze() {
    if (item.kind === "employer" && item.employer) snoozeAction(item.employer.id);
    else if (item.task) snoozeTask(item.task.id);
  }

  return (
    <div className="grid grid-cols-[46px_minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-[#efeade] py-2.5 first:border-0 max-sm:grid-cols-[40px_minmax(0,1fr)_auto]">
      <TypeChip type={item.type} />
      <button onClick={open} className="min-w-0 text-left">
        <div className="text-[13px] font-semibold leading-snug">{item.title}</div>
        <div className="truncate text-[11.5px] text-muted">
          {item.employer ? `${item.employer.name} · ` : ""}
          {item.detail}
          {item.script ? <span className="text-brand"> · script attached</span> : null}
        </div>
      </button>
      <span
        className={cn(
          "whitespace-nowrap text-[10.5px] font-semibold max-sm:hidden",
          overdue ? "text-danger" : dueToday ? "text-brand" : "text-muted",
        )}
      >
        {dueLabel(item.due)}
      </span>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="h-7 border-[#cfe0d3] bg-[#f0f7f1] px-2 text-[10px] text-[#1c6b49] hover:bg-[#dff0e3]" onClick={done}>
          <Check className="h-3 w-3" /> Done
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-1.5 text-[10px]" onClick={snooze}>
          <Clock className="h-3 w-3" /> +1d
        </Button>
      </div>
    </div>
  );
}
