import { create } from "zustand";
interface PanelState {
  isPanelOpen: boolean;
  setPanelOpen: () => void;
  setPanelClose: () => void;
}
/**isSelect, setSelectOn, setSelectOff */
const usePanelState = create<PanelState>((set) => ({
  isPanelOpen: false,
  setPanelOpen: () => set({ isPanelOpen: true }),
  setPanelClose: () => set({ isPanelOpen: false }),
}));
export default usePanelState;
