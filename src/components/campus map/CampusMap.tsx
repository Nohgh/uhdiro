import { Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/useKakaoLoader";
import "./CampusMap.scss";
import { useEffect, useState } from "react";
import useSelectStore from "../../store/useSelectStore";

interface RecentDataType {
  uuid: string;
  mon: string;
  day: string;
  types: string;
  buildingId: number;
  buildingName: string;
  lat: string;
  lng: string;
  floor: number;
  name: string;
  num: string;
}

const CampusMap = () => {
  useKakaoLoader();
  const { isSelect, setSelectOff } = useSelectStore();
  const [placeData, setPlaceData] = useState<RecentDataType>();

  useEffect(() => {
    setTimeout(() => {
      const placeDataList = JSON.parse(
        window.localStorage.getItem("recent") || "[]"
      );
      if (placeDataList !== null) {
        setPlaceData(placeDataList[0]);
      }
    }, 0);

    console.log("선택");
    if (isSelect) setSelectOff();
  }, [isSelect]);

  return (
    <>
      {placeData ? <div>{placeData.buildingName}</div> : <div>로딩 중...</div>}
      <Map
        id="map"
        className="map"
        center={{
          // 지도의 중심좌표
          lat: 37.88635830852239,
          lng: 127.73791244339736,
        }}
        level={3}
      />
    </>
  );
};

export default CampusMap;
