import { create } from "zustand";
import { ClassRoomResult } from "../interfaces/place";

interface ClassRoomState {
  classRoomResult: ClassRoomResult[] | null;
  setClassRoomResult: (classRoom: ClassRoomResult[]) => void;
  clearClassRoomResult: () => void;
}

const useClassRoomResultStore = create<ClassRoomState>((set) => ({
  classRoomResult: null,

  setClassRoomResult: (classRoom) =>
    set((state) => {
      const prev = state.classRoomResult ?? [];
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
      return { classRoomResult: uniqClassRooms };
    }),

  clearClassRoomResult: () => set({ classRoomResult: null }),
}));

export default useClassRoomResultStore;
