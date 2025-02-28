import { create } from "zustand";
import { Building, ClassRoom } from "../interfaces/place";

type SelectedType = Building | ClassRoom;

const useSelectedDataStore = create((set) => ({
  selectedType: "",
  selectedData: {},

  setSelected: (type: string, data: SelectedType) =>
    set({ selectedTyle: type, selectedData: data }),
}));
export default useSelectedDataStore;
