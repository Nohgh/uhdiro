import { CustomOverlayMap, Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/useKakaoLoader";
import "./CampusMap.scss";
import { useEffect, useRef, useState } from "react";
import useSelectStore from "../../store/useSelectStore";
import axios from "axios";

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

interface WeatherData {
  name: string; //현재 위치
  main: {
    temp: number; //온도
    humidity: number; //습도
  };
  weather: {
    main: string;
    description: string; //날씨
    icon: string;
    //weather.weather[0].description로 접근
  }[];
  wind: {
    speed: number; //풍속
  };
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

  const [myPosition, setMyPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleMyPositionClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyPosition({ lat: latitude, lng: longitude });

          if (mapRef.current) {
            const newCenter = new kakao.maps.LatLng(latitude, longitude);
            mapRef.current.panTo(newCenter);
          }
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다.", error);
        }
      );
    } else {
      console.error("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get<WeatherData>(
          "https://api.openweathermap.org/data/2.5/weather", // 최신 API 버전 사용
          {
            params: {
              lat: DEFAULT_LAT,
              lon: DEFAULT_LNG,
              appid: import.meta.env.VITE_WEATHER_KEY,
              units: "metric",
              lang: "kr",
            },
          }
        );

        setWeather(response.data);
        console.log("날씨 정보 입니다. ", response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "날씨 정보를 가져오는 중 오류 발생"
          );
        } else {
          setError("알 수 없는 오류 발생");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) console.log("날씨 정보를 불러오는 중");
  if (error) console.log("날씨 오류");
  const iconUrl = `https://openweathermap.org/img/wn/${weather?.weather[0].icon}@2x.png`;

  // if (!weather) return <p>날씨 데이터를 가져오지 못했습니다.</p>;
  return (
    <div className="MapWrapper">
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
        {myPosition && (
          <CustomOverlayMap position={myPosition}>
            <div className="MyPoition">
              <div className="MyPoition"></div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>
      <div className="Myposition" onClick={handleMyPositionClick}>
        <svg
          className="Myposition_icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M256 0c17.7 0 32 14.3 32 32l0 34.7C368.4 80.1 431.9 143.6 445.3 224l34.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-34.7 0C431.9 368.4 368.4 431.9 288 445.3l0 34.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.7C143.6 431.9 80.1 368.4 66.7 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l34.7 0C80.1 143.6 143.6 80.1 224 66.7L224 32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z" />
        </svg>
      </div>
      {weather && (
        <div className="Weather">
          <img className="weather_icon" src={iconUrl} alt="날씨 아이콘" />
          <div>{weather.main.temp}°C</div>
        </div>
      )}
    </div>
  );
};

export default CampusMap;
