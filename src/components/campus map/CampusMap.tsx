import { CustomOverlayMap, Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/useKakaoLoader";
import "./CampusMap.scss";
import { useEffect, useRef, useState } from "react";
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

  const DEFAULT_LAT = 37.88635830852239;
  const DEFAULT_LNG = 127.73791244339736;
  const mapRef = useRef<kakao.maps.Map>(null);

  const { isSelect, setSelectOff } = useSelectStore();

  const [placeData, setPlaceData] = useState<RecentDataType | null>();

  const [center, setCenter] = useState<{ lat: number; lng: number }>(() => {
    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  });

  useEffect(() => {
    // 맵이 로드된 후 강제로 크기 재계산
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.relayout();
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (isSelect) {
      setTimeout(() => {
        const placeDataList = JSON.parse(
          window.localStorage.getItem("recent") || "[]"
        );
        if (placeDataList !== null) {
          setPlaceData(placeDataList[0]);
        }
      }, 300);
    }

    if (isSelect) {
      setSelectOff();
      console.log("isSelect이후에", isSelect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelect]);

  useEffect(() => {
    console.log("placeData", placeData);
    if (placeData && mapRef.current) {
      const newCenter = new kakao.maps.LatLng(
        Number(placeData.lat),
        Number(placeData.lng)
      );
      mapRef.current.panTo(newCenter);
      setCenter({
        lat: Number(placeData.lat),
        lng: Number(placeData.lng),
      });
    }
  }, [placeData]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("새로고침 또는 창이 닫힙니다");
      setSelectOff();
      console.log(isSelect);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <Map
        id="map"
        className="map"
        center={center}
        isPanto={true}
        level={3}
        ref={mapRef}
      >
        {placeData && (
          <CustomOverlayMap
            position={{
              lat: Number(placeData?.lat),
              lng: Number(placeData?.lng),
            }}
          >
            <div className="MapMarker">
              {placeData.types === "building" ? (
                <div className="infoWrapper">
                  <div className="building_info">{placeData.buildingName}</div>
                  <svg
                    className="mark building_mark"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                  >
                    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg>
                </div>
              ) : (
                <div className="infoWrapper">
                  <div className="classRoom_info">
                    <div className="classRoom_name">{placeData.name}</div>
                    <div className="classRoom_detail">
                      <div className="detail">{placeData.buildingName}</div>
                      <div className="detail">
                        {placeData.floor > 0
                          ? placeData.floor
                          : `지하 ${-placeData.floor}`}
                        층{placeData.num ? "" : ""}
                      </div>
                      <div className="detail">{placeData.num}</div>
                    </div>
                  </div>
                  <svg
                    className="mark classRoom_mark"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                  >
                    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg>
                </div>
              )}
            </div>
          </CustomOverlayMap>
        )}
      </Map>
    </>
  );
};

export default CampusMap;
