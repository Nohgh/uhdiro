import { Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/useKakaoLoader";
import "./CampusMap.scss";
const CampusMap = () => {
  useKakaoLoader();
  return (
    <>
      <Map // 지도를 표시할 Container
        id="map"
        className="map"
        center={{
          // 지도의 중심좌표
          lat: 37.8839362,
          lng: 127.7378349,
        }}
        level={3} // 지도의 확대 레벨
      />
    </>
  );
};

export default CampusMap;
