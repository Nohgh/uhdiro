import { create } from "zustand";
interface SearchPanel {
  showSearchPanel: boolean;
  showSearchPanelOn: () => void;
  showSearchPanelOff: () => void;
}
const useSearchPanelStore = create<SearchPanel>((set) => ({
  showSearchPanel: false,
  showSearchPanelOn: () => set({ showSearchPanel: true }),
  showSearchPanelOff: () => set({ showSearchPanel: false }),
}));
export default useSearchPanelStore;
