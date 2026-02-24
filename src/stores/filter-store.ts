import { create } from "zustand";

interface FilterState {
  query: string;
  status: "all" | "draft" | "complete" | "archived";
  sortBy: "updatedAt" | "score" | "title";
  setQuery: (query: string) => void;
  setStatus: (status: FilterState["status"]) => void;
  setSortBy: (sortBy: FilterState["sortBy"]) => void;
  reset: () => void;
}

const initialState = {
  query: "",
  status: "all" as const,
  sortBy: "updatedAt" as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setQuery: (query) => set({ query }),
  setStatus: (status) => set({ status }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set(initialState),
}));
