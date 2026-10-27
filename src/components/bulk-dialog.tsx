"use client";

import * as React from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/dialog";
import { Button, Field, Textarea } from "@/components/ui/primitives";
import { useSalesStore } from "@/store/use-sales-store";

export function BulkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addEmployer = useSalesStore((s) => s.addEmployer);
  const [rows, setRows] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = rows
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, contact, phone, staff, city] = line.split(",").map((p) => p.trim());
        return { name, contact, phone, staff, city, segment: "School" };
      })
      .filter((r) => r.name);

    if (!parsed.length) {
      toast.error("Add at least one employer name.");
      return;
    }
    parsed.forEach((row) => addEmployer({ ...row, startSequence: true }));
    toast.success(`${parsed.length} employers added. First WhatsApps are in Today.`);
    setRows("");
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Paste a target list"
      description="One employer per line: Name, Contact, Phone, Staff, Area. Only the name is required."
    >
      <form onSubmit={submit} className="flex flex-col gap-2.5">
        <Field label="Targets">
          <Textarea
            rows={8}
            value={rows}
            onChange={(e) => setRows(e.target.value)}
            placeholder={"Greenfield Academy, Mrs. Adeyemi, 08031234567, 35, Ikeja\nSt. Paul's College, Mr. Okafor, 08087654321, 52, Surulere"}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">Add all</Button>
        </div>
      </form>
    </Modal>
  );
}
