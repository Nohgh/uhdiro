import { create } from "zustand";
import { ClassRoomResult } from "../interfaces/place";

interface ClassRoomState {
  resultClassRoom: ClassRoomResult[] | null;
  setResultClassRoom: (classRoom: ClassRoomResult[]) => void;
  clearResultClassRoom: () => void;
}

const useResultClassRoomStore = create<ClassRoomState>((set) => ({
  resultClassRoom: null,

  setResultClassRoom: (classRoom) =>
    set((state) => {
      const prev = state.resultClassRoom ?? [];
      const uniqClassRooms = [
        ...prev,
        ...classRoom.filter(
          (room) =>
            !prev.some(
              (prevRoom) =>
                prevRoom.num === room.num && prevRoom.name === room.name
            )
        ),
      ];
      return { resultClassRoom: uniqClassRooms };
    }),

  clearResultClassRoom: () => set({ resultClassRoom: null }),
}));

export default useResultClassRoomStore;
