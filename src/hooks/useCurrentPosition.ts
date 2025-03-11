import { useEffect, useState } from "react";
interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  errMsg: string | null;
  isLoading: boolean;
}

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
