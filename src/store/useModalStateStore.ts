import { create } from "zustand";

interface ModalStore {
  isModalOpen: boolean;
  modalName: string;
  openModal: () => void;
  closeModal: () => void;
}
/**isModalOpen,openModal,closeModal */
const useModalStateStore = create<ModalStore>((set) => ({
  isModalOpen: false,
  modalName: "",
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
export default useModalStateStore;
