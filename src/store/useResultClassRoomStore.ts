import { create } from "zustand";
import { ClassRoom } from "../interfaces/place";

interface ClassRoomState {
  resultClassRoom: ClassRoom | null;
  setResultClassRoom: (classRoom: ClassRoom) => void;
  clearResultClassRoom: () => void;
}

const useResultClassRoomStore = create<ClassRoomState>((set) => ({
  resultClassRoom: null,
  setResultClassRoom: (classRoom) => set({ resultClassRoom: classRoom }),
  clearResultClassRoom: () => set({ resultClassRoom: null }),
}));

export default useResultClassRoomStore;
