import { useEffect, useState } from "react";
interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  errMsg: string | null;
  isLoading: boolean;
}
/**지도에서 현재 위치를 반환합니다. */
const useCurrentPosition = () => {
  const LAT = 37.88635830852239;
  const LNG = 127.73791244339736;
  const [position, setPosition] = useState<MapState>({
    center: {
      lat: LAT,
      lng: LNG,
    },
    errMsg: null,
    isLoading: true,
  });
  useEffect(() => {
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition((prev) => ({
            ...prev,
            center: {
              lat: position.coords.latitude, // 위도
              lng: position.coords.longitude, // 경도
            },
            isLoading: false,
          }));
        },
        (err) => {
          setPosition((prev) => ({
            ...prev,
            errMsg: err.message,
            isLoading: false,
          }));
        }
      );
    } else {
      // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
      setPosition((prev) => ({
        ...prev,
        errMsg: "geolocation을 사용할수 없어요..",
        isLoading: false,
      }));
    }
  }, []);
  return position;
};
export default useCurrentPosition;
