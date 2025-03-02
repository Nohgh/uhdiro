import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import building from "../../data/building/building.json";
import classRoom from "../../data/classRoom/classRoom.json";
import {
  BuildingResult,
  ClassRoomResult,
  ClassRoom,
  Room,
} from "../../interfaces/place";
import useDebounce from "../../hooks/useDebounce";
import useResultBuildingStore from "../../store/useResultBuildingStore";
import useResultClassRoomStore from "../../store/useResultClassRoomStore";
import "./Header.scss";

const Header = () => {
  //헤더의 검색창
  const searchBox = useRef<null | HTMLDivElement>(null);

  //검색결과창
  const searchPanel = useRef<null | HTMLDivElement>(null);

  //검색결과창 표시 여부
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  //입력값
  const [inputValue, setInputValue] = useState("");

  //func: 입력값 초기화 아이콘 클릭
  const clickXmark = () => {
    setInputValue("");
    setShowSearchPanel(false);
  };

  //건물 데이터
  const [buildingsData, setBuildingsData] = useState<BuildingResult[] | null>(
    []
  );

  //interface: 선택한 결과 타입
  interface SelectResultType {
    selectType: string;
    selectData: BuildingResult | ClassRoomResult | null;
  }

  //선택한 결과
  const [selectResult, setSelectedResult] = useState<SelectResultType>({
    selectType: "none",
    selectData: null,
  });

  //건물 검색 결과
  const { resultBuilding, setResultBuilding, clearResultBuilding } =
    useResultBuildingStore();

  //강의실 검색 결과
  const { resultClassRoom, setResultClassRoom, clearResultClassRoom } =
    useResultClassRoomStore();

  //func: 위도 경도 검색
  const findLocation = (buildingId: number) => {
    const building = buildingsData?.find((b) => b.buildingId === buildingId);
    if (building) {
      return {
        lat: building.lat,
        lng: building.lng,
      };
    }
  };

  //장소 클릭에 따른 장소 저장
  useEffect(() => {
    //localStorage에 저장되는 데이터
    const localSelectData = {
      types: "",
      buildingId: 0,
      buildingName: "",
      lat: "",
      lng: "",
      floor: 0,
      name: "",
      num: "",
    };

    if (selectResult.selectType === "none") console.log(" 선택 x");
    //선택한 유형에 따라 localstorage에 저장할 값들 입력
    if (selectResult.selectType === "building") {
      const SelectData = selectResult.selectData as BuildingResult;

      localSelectData.types = selectResult.selectType;
      localSelectData.buildingId = SelectData?.buildingId || 0;
      localSelectData.buildingName = SelectData?.buildingName || "";
      localSelectData.lat = SelectData?.lat || "";
      localSelectData.lng = SelectData?.lng || "";
    }
    if (selectResult.selectType === "classRoom") {
      const SelectData = selectResult.selectData as ClassRoomResult;
      // const buildingLat=
      const classRoomLocation = findLocation(SelectData?.buildingId);

      localSelectData.types = selectResult.selectType;
      localSelectData.buildingId = SelectData?.buildingId || 0;
      localSelectData.buildingName = SelectData?.buildingName || "";
      localSelectData.lat = classRoomLocation?.lat || "";
      localSelectData.lng = classRoomLocation?.lng || "";
      localSelectData.floor = SelectData?.floor || 0;
      localSelectData.name = SelectData?.name || "";
      localSelectData.num = SelectData?.num || "";
    }
    console.log("로컬스토리지에 입력할 데이터", localSelectData);
    /**
     * 선택한 정보를 로컬스토리지에 저장할 수 있는 자료구조로 만든다.
     * 1. recent데이터를 가져온다
     * 2. recent데이터가 있다면 recent 데이터를 업데이트한다.
     *      2-1.최근 기록에서 현재 선택한 정보가 있으면 해당 기록을 최상단으로 올린다.
     *      2-2.최근 기록에서 현재 선택한 정보가 없다면 최상단에 저장한다.
     * 3. recent데이터가 있다면 recent 데이터를 업데이트 한다.
     */
    const recentData = JSON.parse(
      window.localStorage.getItem("recent") || "[]"
    );
    //선택 o , 최근 기록 x
    if (selectResult.selectType !== "none" && recentData.length === 0) {
      console.log("선택 o , 최근 기록 x");
      // window.localStorage.setItem(
      //   "recent",
      //   JSON.stringify(selectResult.selectData)
      // );
    }
    //선택 o, 최근 기록 o
    else if (selectResult.selectType !== "none" && recentData.length !== 0) {
      console.log("선택o, 최근 기록 o");
    }
  }, [selectResult]);

  //건물 데이터 초기화
  useEffect(() => {
    setBuildingsData(building.buildings);
  }, []);

  //패널 클릭 여부
  useEffect(() => {
    const handleClickSearchBox = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !searchBox.current?.contains(target) &&
        !searchPanel.current?.contains(target)
      ) {
        setShowSearchPanel(false);
      } else {
        setShowSearchPanel(true);
      }
    };
    document.addEventListener("mousedown", handleClickSearchBox);

    return () => {
      document.removeEventListener("mousedown", handleClickSearchBox);
    };
  }, []);

  //func: 강의실 찾기
  const findClassrooms = (searchValue: string) => {
    const result: ClassRoomResult[] = [];
    function searchInFloor(
      floorData: Room[],
      building: ClassRoom,
      floorLevel: number
    ): void {
      floorData.forEach((room: Room) => {
        if (
          room.num?.toLowerCase().includes(searchValue.toLowerCase()) ||
          room.name?.toLowerCase().includes(searchValue.toLowerCase())
        ) {
          result.push({
            buildingId: building.buildingId,
            buildingName: building.buildingName,
            basement: building.basement || 0, // 기본값 0
            floor: floorLevel,
            num: room.num,
            name: room.name,
          });
        }
      });
    }

    classRoom.classRoom.forEach((building: ClassRoom) => {
      if (building.basement) {
        for (let i = 1; i <= building.basement; i++) {
          const basementKey = `b${i}`;
          const basementRooms = building[basementKey];

          if (Array.isArray(basementRooms)) {
            searchInFloor(basementRooms, building, -i);
          }
        }
      }

      // floor 검사
      for (let i = 1; i <= building.floor; i++) {
        const floorKey = `${i}f`;
        const floorRooms = building[floorKey];

        // floorRooms가 Room[] 타입인지 확인
        if (Array.isArray(floorRooms)) {
          searchInFloor(floorRooms, building, i); // Room[] 타입이면 호출
        }
      }
    });

    return result;
  };

  //입력값 debounce 최적화
  const debounceInputValue = useDebounce(inputValue, 300);

  //입력에 따른 결과 세팅
  useEffect(() => {
    const handleSearch = () => {
      if (debounceInputValue) {
        //건물 검색
        const buildingResults = buildingsData?.filter(
          (b) =>
            b.buildingName
              .toLowerCase()
              .includes(debounceInputValue.toLowerCase()) ||
            String(b.buildingId).startsWith(debounceInputValue)
        );
        //건물 결과 세팅
        if (buildingResults && buildingResults.length > 0) {
          setResultBuilding(buildingResults);
        }

        //강의실 검색
        const classroomResults = findClassrooms(debounceInputValue);
        if (classroomResults.length > 0) {
          const resultClassRoomSet = new Set(resultClassRoom);
          classroomResults.forEach((item) => {
            if (!resultClassRoomSet.has(item)) {
              //강의실 결과 세팅
              setResultClassRoom(classroomResults);
            }
          });
        }
      } else {
        console.log("입력값이 없습니다.");
      }
    };

    handleSearch();

    return () => {
      clearResultClassRoom();
      clearResultBuilding();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceInputValue]);

  //입력값 변화 관리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  //Component: 검색 결과 컴포넌트
  const Places = () => {
    if (resultBuilding?.length || resultClassRoom?.length) {
      return (
        <>
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
                xmlns="http://www.w3.org/2000/svg"
                className="placeIcon"
                viewBox="0 0 384 512"
              >
                <path d="M48 0C21.5 0 0 21.5 0 48L0 464c0 26.5 21.5 48 48 48l96 0 0-80c0-26.5 21.5-48 48-48s48 21.5 48 48l0 80 96 0c26.5 0 48-21.5 48-48l0-416c0-26.5-21.5-48-48-48L48 0zM64 240c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zm112-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM80 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM272 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16z" />
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
          {resultClassRoom?.map((classRoom) => (
            <div
              className="resultBlock classRoom"
              key={uuidv4()}
              onClick={() =>
                setSelectedResult({
                  selectType: "classRoom",
                  selectData: classRoom,
                })
              }
            >
              <svg
                className="placeIcon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
              >
                <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
              </svg>
              <div className="classRoom-data">
                <div className="classRoom-data-name">{classRoom.name}</div>
                <div
                  className={`classRoom-data-other ${
                    classRoom.name ? "" : "notname"
                  }`}
                >
                  <div className="detail">{classRoom.buildingName} /</div>
                  <div className="detail">
                    {classRoom.floor > 0
                      ? classRoom.floor
                      : `지하 ${-classRoom.floor}`}
                    층{classRoom.num ? " /" : ""}
                  </div>
                  <div className="detail">{classRoom.num}</div>
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
        </>
      );
    }

    return <div>결과가 검색되지 않았습니다. 숫자 또는 문자를 확인해주세요</div>;
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
        {inputValue && (
          <svg
            className="header__search-box__icon"
            onClick={() => clickXmark()}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
          </svg>
        )}
      </div>
      {showSearchPanel && (
        <div className="search-panel" ref={searchPanel}>
          {inputValue ? (
            <div className="search-panel-resultTab">{Places()}</div>
          ) : (
            <div className="search-panel-savedTab">
              최근 기록과 저장된 내 장소가 나옵니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
