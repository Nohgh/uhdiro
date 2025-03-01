export interface Room {
  num: string;
  name: string;
}

export interface ClassRoom {
  buildingId: number;
  buildingName: string;
  floor: number;
  basement?: number;
  [key: string]: Room[] | number | string | undefined;
}

export interface ClassRoomData {
  classRoom: ClassRoom[];
}

export interface ClassRoomResult {
  buildingId: number;
  buildingName: string;
  basement?: number;
  floor: number; //전체 층이 아닌 현재 층에 대한 정보
  num: string;
  name: string;
}

export interface BuildingResult {
  buildingId: number;
  buildingName: string | string[];
  imgUrl: string;
  lat?: string;
  lng?: string;
}
