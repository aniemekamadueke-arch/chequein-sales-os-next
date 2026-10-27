"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-[#07140f]/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className={cn(
            "animate-modal-in fixed left-1/2 top-1/2 z-[90] max-h-[90vh] w-[min(540px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] border border-line bg-[#fbf9f3] p-6 shadow-[0_40px_100px_-40px_rgba(9,21,17,0.7)] focus:outline-none",
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="serif text-[28px] leading-tight">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-[12px] text-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[#eae5d8] hover:text-ink">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-[#091511]/45 backdrop-blur-[1.5px]" />
        <DialogPrimitive.Content className="animate-sheet-in fixed inset-y-0 right-0 z-[90] w-[min(560px,94vw)] overflow-y-auto border-l border-line bg-[#fbf9f3] shadow-[-24px_0_60px_-30px_rgba(9,21,17,0.55)] focus:outline-none">
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsContent = TabsPrimitive.Content;

export function TabsTrigger(props: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      {...props}
      className={cn(
        "whitespace-nowrap rounded-t border-b-2 border-transparent px-3 py-2.5 text-[12px] font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 data-[state=active]:border-brand data-[state=active]:text-brand",
        props.className,
      )}
    />
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
