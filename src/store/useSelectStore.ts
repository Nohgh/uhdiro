import { create } from "zustand";
interface SelectType {
  isSelect: boolean;
  setSelectOn: () => void;
  setSelectOff: () => void;
}
/**isSelect, setSelectOn, setSelectOff */
const useSelectStore = create<SelectType>((set) => ({
  isSelect: false,
  setSelectOn: () => set({ isSelect: true }),
  setSelectOff: () => set({ isSelect: false }),
}));
export default useSelectStore;
