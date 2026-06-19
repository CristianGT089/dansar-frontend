"use client";

import { create } from "zustand";
import type { UserCompany } from "@/types";

interface CompanyState {
  activeCompany: UserCompany | null;
  setActiveCompany: (company: UserCompany | null) => void;
}

export const useCompanyStore = create<CompanyState>()((set) => ({
  activeCompany: null,
  setActiveCompany: (company) => set({ activeCompany: company }),
}));
