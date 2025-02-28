import { create } from "zustand";

interface SearchState {
  isSearchEmpty: boolean;
  setNotSearchEmpty: () => void;
  setSearchEmpty: () => void;
}

const useSearchStateStore = create<SearchState>((set) => ({
  isSearchEmpty: true,
  setNotSearchEmpty: () => set({ isSearchEmpty: false }),
  setSearchEmpty: () => set({ isSearchEmpty: true }),
}));

export default useSearchStateStore;
