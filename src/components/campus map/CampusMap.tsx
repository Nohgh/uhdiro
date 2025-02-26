import { Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/useKakaoLoader";
import "./CampusMap.scss";
const CampusMap = () => {
  useKakaoLoader();
  return (
    <>
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
