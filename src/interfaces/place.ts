export interface Building {
  buildingId: number;
  buildingName: string | string[];
  imgUrl: string;
  lat?: string;
  lng?: string;
}
export interface ClassRoom {
  buildingId: number;
  buildingName: string;
  basement?: number;
  floor: number; //전체 층이 아닌 현재 층에 대한 정보
  num: string;
  name: string;
}
