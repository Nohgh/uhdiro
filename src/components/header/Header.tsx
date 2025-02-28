import React, { useEffect, useRef, useState } from "react";
import building from "../../data/building/building.json";
import { Building } from "../../interfaces/place";
import useDebounce from "../../hooks/useDebounce";
import useResultBuildingStore from "../../store/useResultBuildingStore";
import "./Header.scss";
import useResultClassRoomStore from "../../store/useResultClassRoomStore";

const Header = () => {
  const searchBox = useRef<null | HTMLDivElement>(null);
  const placePanel = useRef<null | HTMLDivElement>(null);

  const [showPlacePanel, setShowPlacePanel] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [buildingsData, setBuildingsData] = useState<Building[] | null>([]);

  const [selectResult, setSelectedResult] = useState({
    selectType: "none",
    selectData: {},
  });
  console.log(selectResult);

  const { resultBuilding, setResultBuilding } = useResultBuildingStore();
  const { resultClassRoom } = useResultClassRoomStore();

  useEffect(() => {
    setBuildingsData(building.buildings);
  }, []);

  useEffect(() => {
    const handleClickSearchBox = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !searchBox.current?.contains(target) &&
        !placePanel.current?.contains(target)
      ) {
        setShowPlacePanel(false);
      } else {
        setShowPlacePanel(true);
      }
    };
    document.addEventListener("mousedown", handleClickSearchBox);

    return () => {
      document.removeEventListener("mousedown", handleClickSearchBox);
    };
  }, []);

  const debounceInputValue = useDebounce(inputValue, 300);
  useEffect(() => {
    //탐색을 통해 반환되는 결과는 전역으로 관리되어야 한다. (지도에서 사용)
    const handleSearch = () => {
      if (isNumber(debounceInputValue)) {
        const numberValue = parseFloat(debounceInputValue);

        //건물에 해당하는 입력에 대한 처리
        if (numberValue < 100) {
          const buildings = buildingsData?.filter((b) =>
            String(b.buildingId).startsWith(String(numberValue))
          );
          if (buildings) setResultBuilding(buildings);
        } else {
          //강의실에 해당하는 입력에 대한 처리
          console.log("두 자리수 이상입니다. 강의실 찾기 로직을 만들어주세여");
          // setResultClassRoom({});
        }
      } else {
        //문자열에 대한 처리로 건물 또는 강의실로 결과 반환
        console.log("숫자가 아닌 문자입니다.");
        //강의실에서 일치하는 값이 나오면 강의실 결과 업데이트
        //건물에서 일치하는 값이 나오면 건물 결과 업데이트
      }
    };

    if (debounceInputValue) {
      handleSearch();
    } else {
      console.log("입력값이 없습니다.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceInputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const isNumber = (value: string) => {
    const parsedValue = parseFloat(value);
    return !isNaN(parsedValue) && isFinite(parsedValue);
  };
  //검색을 시작하기 전 -> 최근 기록, 저장 기록 보여주기
  //검색을 시작 -> 결과창

  const Places = () => {
    if (resultBuilding?.length || resultClassRoom?.length) {
      return (
        <div>
          {resultClassRoom?.map((i) => (
            <div className="resultBlock classRoom" key={i.name}>
              {i.name}
            </div>
          ))}
          {resultBuilding?.map((building) => (
            <div
              className="resultBlock building"
              key={building.buildingId}
              onClick={() =>
                setSelectedResult({
                  selectType: "building",
                  selectData: building,
                })
              }
            >
              {/* 선택한 빌딩과 강의실 정보는 campus map으로 전달되어야 한다.-> 전역 상태 관리 */}
              <svg
                className="placeIcon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
              >
                <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
              </svg>
              <div className="building-data">
                <div className="building-data__name">
                  {building.buildingName}
                </div>
                <div className="building-data__id">
                  {building.buildingId}번 건물
                </div>
              </div>
              <svg
                className="moveIcon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        결과가 검색되지 않았습니다. 결과를 유추하자면 ..곳에 있을 것으로
        예상됩니다.
      </div>
    );
  };
  return (
    <div className="header">
      <div className="header__top">
        <svg
          className="header__top__bars"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
        </svg>
        <div className="header__top__logo">Udiro</div>
      </div>
      <div className="header__search-box" ref={searchBox}>
        <input
          type="text"
          className="header__search-box__input"
          placeholder="건물 이름 및 번호, 강의실 번호 및 이름 검색"
          value={inputValue}
          onChange={handleInputChange}
        />
        <svg
          className="header__search-box__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
        </svg>
      </div>
      {showPlacePanel && (
        <div className="place-panel" ref={placePanel}>
          {inputValue ? (
            <div className="place-panel-resultTab">{Places()}</div>
          ) : (
            <div className="place-panel-savedTab">
              최근 기록과 저장된 내 장소가 나옵니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
