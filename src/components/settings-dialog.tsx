"use client";

import * as React from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/dialog";
import { Button, Field, Input } from "@/components/ui/primitives";
import { useSalesStore } from "@/store/use-sales-store";
import { naira, todayISO } from "@/lib/utils";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rev = useSalesStore((s) => s.revPerEmployee);
  const setRev = useSalesStore((s) => s.setRevPerEmployee);
  const importState = useSalesStore((s) => s.importState);
  const reset = useSalesStore((s) => s.reset);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [revValue, setRevValue] = React.useState(String(rev));

  React.useEffect(() => {
    if (open) setRevValue(String(rev));
  }, [open, rev]);

  function exportData() {
    const data = useSalesStore.getState();
    const payload = {
      version: 1,
      employers: data.employers,
      tasks: data.tasks,
      log: data.log,
      checklist: data.checklist,
      revPerEmployee: data.revPerEmployee,
      revPerActive: data.revPerActive,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chequein-sales-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded.");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        importState(parsed);
        toast.success("Backup imported.");
        onOpenChange(false);
      } catch {
        toast.error("That file doesn't look like a ChequeIn backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleReset() {
    if (!window.confirm("Reset everything to the seeded baseline? Your current pipeline will be replaced.")) {
      return;
    }
    reset();
    toast.success("Reset to baseline.");
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Settings & data"
      description="Everything is saved in this browser. Export regularly if the team needs a snapshot."
    >
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-3">
          <h3 className="text-[12.5px] font-semibold">Export</h3>
          <p className="mt-0.5 text-[10.5px] text-muted">A JSON backup of the pipeline, logs and targets.</p>
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={exportData}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </div>
        <div className="rounded-xl border border-line bg-card p-3">
          <h3 className="text-[12.5px] font-semibold">Import</h3>
          <p className="mt-0.5 text-[10.5px] text-muted">Restore a backup. This replaces what is here.</p>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleFile} />
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" /> Choose file
          </Button>
        </div>
        <div className="rounded-xl border border-line bg-card p-3">
          <h3 className="text-[12.5px] font-semibold">Reset</h3>
          <p className="mt-0.5 text-[10.5px] text-muted">Back to the seeded ChequeIn starting point.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full text-danger"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-line bg-card p-3">
        <h3 className="text-[12.5px] font-semibold">Revenue assumption</h3>
        <p className="mt-0.5 text-[10.5px] text-muted">
          Used when a new employer goes live. Baseline is about {naira(rev)} per employee per month.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[12px] text-muted">₦</span>
          <Input
            type="number"
            min={0}
            step={10}
            value={revValue}
            onChange={(e) => setRevValue(e.target.value)}
            onBlur={() => setRev(Number(revValue) || 300)}
            className="w-28"
          />
          <span className="text-[11px] text-muted">per active employee / month</span>
        </div>
      </div>
    </Modal>
  );
}
