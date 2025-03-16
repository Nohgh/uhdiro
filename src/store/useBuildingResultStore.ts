import { create } from "zustand";
import { BuildingResult } from "../interfaces/place";
interface BuildingState {
  buildingResult: BuildingResult[] | null;
  setBuildingResult: (building: BuildingResult[]) => void;
  clearBuildingResult: () => void;
}

const useBuilidngResultStore = create<BuildingState>((set) => ({
  buildingResult: null,
  setBuildingResult: (building) => set({ buildingResult: building }),
  clearBuildingResult: () => set({ buildingResult: null }),
}));

export default useBuilidngResultStore;
