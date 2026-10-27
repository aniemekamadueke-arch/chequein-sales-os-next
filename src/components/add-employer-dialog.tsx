"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/dialog";
import { Button, Field, Input } from "@/components/ui/primitives";
import { useSalesStore } from "@/store/use-sales-store";

const empty = {
  name: "",
  contact: "",
  role: "",
  phone: "",
  staff: "",
  segment: "School",
  city: "",
  source: "",
  startSequence: true,
};

export function AddEmployerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const addEmployer = useSalesStore((s) => s.addEmployer);
  const [form, setForm] = React.useState(empty);

  React.useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Give the employer a name first.");
      return;
    }
    addEmployer(form);
    toast.success(
      form.startSequence
        ? "Added. First WhatsApp is in Today."
        : "Added to the pipeline.",
    );
    onOpenChange(false);
    router.push("/pipeline");
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Who are you going after?"
      description="One employer at a time. The 21-day cadence starts automatically."
    >
      <form onSubmit={submit} className="flex flex-col gap-2.5">
        <Field label="Employer name">
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Greenfield Academy, Ikeja"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Contact person">
            <Input
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="Mrs. Adeyemi"
            />
          </Field>
          <Field label="Role">
            <Input
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Proprietor / Admin"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Phone / WhatsApp">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="080..."
              inputMode="tel"
            />
          </Field>
          <Field label="Staff count">
            <Input
              type="number"
              min={0}
              value={form.staff}
              onChange={(e) => set("staff", e.target.value)}
              placeholder="e.g. 35"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Segment">
            <select
              className="input"
              value={form.segment}
              onChange={(e) => set("segment", e.target.value)}
            >
              {["School", "Hospital / clinic", "Hospitality", "Retail / distribution", "Services / agency", "Other"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="City / area">
            <Input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Ikeja, Lagos"
            />
          </Field>
        </div>
        <Field label="How did you find them? (optional)">
          <Input
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            placeholder="Google Maps / referral / school association"
          />
        </Field>
        <label className="mt-1 flex items-start gap-2 rounded-lg bg-[#fbf7ed] p-2 text-[11.5px]">
          <input
            type="checkbox"
            checked={form.startSequence}
            onChange={(e) => set("startSequence", e.target.checked)}
            className="mt-0.5 accent-brand"
          />
          <span>Start the 21-day cadence and put the first WhatsApp in Today.</span>
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">Add to pipeline</Button>
        </div>
      </form>
    </Modal>
  );
}
