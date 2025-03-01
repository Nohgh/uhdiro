import { create } from "zustand";
import { BuildingResult, ClassRoomResult } from "../interfaces/place";

type SelectedType = BuildingResult | ClassRoomResult;

const useSelectedDataStore = create((set) => ({
  selectedType: "",
  selectedData: {},

  setSelected: (type: string, data: SelectedType) =>
    set({ selectedTyle: type, selectedData: data }),
}));
export default useSelectedDataStore;
