import { create } from "zustand";
import { Building } from "../interfaces/place";
interface BuildingState {
  resultBuilding: Building[] | null;
  setResultClassRoom: (building: Building[]) => void;
  clearResultBuilding: () => void;
}

const useResultBuildingStore = create<BuildingState>((set) => ({
  resultBuilding: null,
  setResultClassRoom: (building) => set({ resultBuilding: building }),
  clearResultBuilding: () => set({ resultBuilding: null }),
}));

export default useResultBuildingStore;
