import { create } from "zustand";
import { BuildingResult } from "../interfaces/place";
interface BuildingState {
  resultBuilding: BuildingResult[] | null;
  setResultBuilding: (building: BuildingResult[]) => void;
  clearResultBuilding: () => void;
}

const useResultBuildingStore = create<BuildingState>((set) => ({
  resultBuilding: null,
  setResultBuilding: (building) => set({ resultBuilding: building }),
  clearResultBuilding: () => set({ resultBuilding: null }),
}));

export default useResultBuildingStore;
