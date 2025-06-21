// src/stores/search-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Company, Employee } from "@/lib/openai/types";

type Criteria = {
  jobTitle: string;
  location?: string;
  jobType?: string;
  industry?: string;
  jobPlatforms?: string;
  companySize?: string;
  experienceLevel?: string;
  keywords?: string[];
  language?: string;
  expectedSalary?: string;
  excludeCompanies?: string;
};

type SearchStore = {
  criteria: Criteria | null;
  companies: Company[];
  selectedCompany: Company | null;
  employees: Employee[];
  selectedEmployee: Employee | null;
  generatedEmail: string;
  searchSessionId: string | null;
  linkedinPeopleSearchUrl: string | null;
  searchMode: "standard" | "websearch";

  setCriteria: (c: Criteria) => void;
  setCompanies: (c: Company[]) => void;
  setSelectedCompany: (c: Company) => void;
  setEmployees: (e: Employee[], linkedinUrl?: string | null) => void;
  setSelectedEmployee: (e: Employee) => void;
  setGeneratedEmail: (email: string) => void;
  startNewSearch: () => void;
  reset: () => void;
  setLinkedinPeopleSearchUrl: (url: string | null) => void;
  setSearchMode: (mode: "standard" | "websearch") => void;
  addManualCompany: (companyName: string) => void;
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      criteria: null,
      companies: [],
      selectedCompany: null,
      employees: [],
      selectedEmployee: null,
      generatedEmail: "",
      searchSessionId: null,
      linkedinPeopleSearchUrl: null,
      searchMode: "standard",

      setCriteria: (c) => {
        // Generate new session ID when criteria changes significantly
        const currentCriteria = get().criteria;
        const isNewSearch =
          !currentCriteria ||
          currentCriteria.jobTitle !== c.jobTitle ||
          currentCriteria.location !== c.location ||
          currentCriteria.industry !== c.industry;

        set({
          criteria: c,
          searchSessionId: isNewSearch
            ? Date.now().toString()
            : get().searchSessionId,
          // Clear downstream data when starting new search
          ...(isNewSearch && {
            companies: [],
            selectedCompany: null,
            employees: [],
            selectedEmployee: null,
            generatedEmail: "",
            linkedinPeopleSearchUrl: null,
          }),
        });
      },

      setCompanies: (c) => set({ companies: c }),
      setSelectedCompany: (c) => set({ selectedCompany: c }),
      setEmployees: (employees, linkedinUrl) =>
        set({
          employees,
          linkedinPeopleSearchUrl: linkedinUrl || null,
        }),
      setSelectedEmployee: (e) => set({ selectedEmployee: e }),
      setGeneratedEmail: (email) => set({ generatedEmail: email }),

      setSearchMode: (mode) => set({ searchMode: mode }),

      addManualCompany: (companyName: string) => {
        const currentCompanies = get().companies;
        const criteria = get().criteria;

        const newCompany: Company = {
          id: `manual-${Date.now()}`,
          name: companyName,
          logo: "",
          description: "Manually added company",
          estimatedEmployees: "Unknown",
          relevanceScore: "Good Match",
          location: criteria?.location || "",
          url: "",
          source: "Manual Entry",
        };

        // Add to the beginning of the companies array
        set({ companies: [newCompany, ...currentCompanies] });
      },

      startNewSearch: () =>
        set({
          criteria: null,
          companies: [],
          selectedCompany: null,
          employees: [],
          selectedEmployee: null,
          generatedEmail: "",
          searchSessionId: null,
          linkedinPeopleSearchUrl: null,
          searchMode: "standard",
        }),

      reset: () =>
        set({
          criteria: null,
          companies: [],
          selectedCompany: null,
          employees: [],
          selectedEmployee: null,
          generatedEmail: "",
          searchSessionId: null,
          linkedinPeopleSearchUrl: null,
          searchMode: "standard",
        }),

      setLinkedinPeopleSearchUrl: (url) =>
        set({ linkedinPeopleSearchUrl: url }),
    }),
    {
      name: "bypass-search-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        criteria: state.criteria,
        companies: state.companies,
        selectedCompany: state.selectedCompany,
        employees: state.employees,
        selectedEmployee: state.selectedEmployee,
        generatedEmail: state.generatedEmail,
        searchSessionId: state.searchSessionId,
        linkedinPeopleSearchUrl: state.linkedinPeopleSearchUrl,
        searchMode: state.searchMode,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Failed to rehydrate search store:", error);
          localStorage.removeItem("bypass-search-storage");
        }
      },
    },
  ),
);
