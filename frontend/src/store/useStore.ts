"use client";
import { create } from "zustand";
import type { Role, ChatMessage, Offer } from "../lib/mockData";
import { MOCK_CHAT, MOCK_OFFERS } from "../lib/mockData";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  // Discovery Hub filters
  industryFilter: string;
  stageFilter: string;
  setIndustryFilter: (v: string) => void;
  setStageFilter: (v: string) => void;
  // Chat
  messages: ChatMessage[];
  addMessage: (m: Omit<ChatMessage, "id" | "ts">) => void;
  // Offers / Commitment
  offers: Offer[];
  submitOffer: (amount: number, equity: number) => void;
  updateOffer: (id: string, status: "accepted" | "rejected") => void;
  // Wizard
  wizardStep: number;
  setWizardStep: (n: number) => void;
  wizardData: Record<string, string>;
  setWizardData: (k: string, v: string) => void;
  // Term sheet
  termSheetOpen: string | null;
  setTermSheetOpen: (id: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  role: "investor",
  setRole: (r) => set({ role: r }),
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  industryFilter: "All",
  stageFilter: "All",
  setIndustryFilter: (v) => set({ industryFilter: v }),
  setStageFilter: (v) => set({ stageFilter: v }),

  messages: MOCK_CHAT,
  addMessage: (m) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...m, id: Math.random().toString(36).slice(2), ts: Date.now() },
      ],
    })),

  offers: MOCK_OFFERS,
  submitOffer: (amount, equity) =>
    set((s) => ({
      offers: [
        ...s.offers,
        {
          id: Math.random().toString(36).slice(2),
          investor: "You",
          amount,
          equity,
          ts: Date.now(),
          status: "pending",
        },
      ],
    })),
  updateOffer: (id, status) =>
    set((s) => ({
      offers: s.offers.map((o) => (o.id === id ? { ...o, status } : o)),
    })),

  wizardStep: 0,
  setWizardStep: (n) => set({ wizardStep: n }),
  wizardData: {},
  setWizardData: (k, v) =>
    set((s) => ({ wizardData: { ...s.wizardData, [k]: v } })),

  termSheetOpen: null,
  setTermSheetOpen: (id) => set({ termSheetOpen: id }),
}));
