import { create } from "zustand";

interface SearchStatus {
  isTyping: boolean;
  setIsTyping: (status: boolean) => void;
}

const useSearchStatusStore = create<SearchStatus>((set) => ({
  isTyping: false,
  setIsTyping: (status) => set({ isTyping: status }),
}));

export default useSearchStatusStore;
