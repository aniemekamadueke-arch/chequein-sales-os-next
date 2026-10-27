"use client";

import { create } from "zustand";

interface UiStore {
  addOpen: boolean;
  settingsOpen: boolean;
  employerId: string | null;
  mobileNav: boolean;
  setAddOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  openEmployer: (id: string) => void;
  closeEmployer: () => void;
  setMobileNav: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  addOpen: false,
  settingsOpen: false,
  employerId: null,
  mobileNav: false,
  setAddOpen: (open) => set({ addOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  openEmployer: (id) => set({ employerId: id }),
  closeEmployer: () => set({ employerId: null }),
  setMobileNav: (open) => set({ mobileNav: open }),
}));
