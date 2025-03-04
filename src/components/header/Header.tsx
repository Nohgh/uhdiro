import React, { useCallback, useEffect, useRef, useState } from "react";
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
import useSelectStore from "../../store/useSelectStore";
import RootModal from "../modal/root modal/RootModal";
import useModalStateStore from "../../store/useModalStateStore";
//interface: 선택한 결과 타입
interface SelectResultType {
  selectType: string;
  selectData: BuildingResult | ClassRoomResult | null;
}
//interface최근기록 타입
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

/**
 * TODO:
 * 최근 기록 선택시 데이터 올리기
 * 결과 선택시 이동
 */

const Header = () => {
  //------useRef------
  const buildingsData = building.buildings;

  //헤더의 검색창
  const searchBox = useRef<null | HTMLDivElement>(null);

  //검색결과창
  const searchPanel = useRef<null | HTMLDivElement>(null);

  //------useState------

  //입력값
  const [inputValue, setInputValue] = useState("");

  //검색결과창 표시 여부
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  //localstorage에 저장된 최근 기록
  const [recentDataList, setRecentDataList] = useState<RecentDataType[]>(() => {
    return JSON.parse(window.localStorage.getItem("recent") || "[]");
  });

  //선택한 결과
  const [selectResult, setSelectedResult] = useState<SelectResultType>({
    selectType: "none",
    selectData: null,
  });
  const [panelMode, setPanelMode] = useState("recent");

  //------custom hooks------
  //건물 검색 결과
  const { resultBuilding, setResultBuilding, clearResultBuilding } =
    useResultBuildingStore();

  //강의실 검색 결과
  const { resultClassRoom, setResultClassRoom, clearResultClassRoom } =
    useResultClassRoomStore();
  const { setSelectOn } = useSelectStore();

  const { isModalOpen, openModal } = useModalStateStore();
  //------func------

  //입력값 초기화 아이콘 클릭
  const clickXmark = () => {
    setInputValue("");
    setShowSearchPanel(false);
  };

  //입력값 변화 관리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  //위도 경도 검색
  const findLocation = (buildingId: number) => {
    const building = buildingsData?.find((b) => b.buildingId === buildingId);
    if (building) {
      return {
        lat: building.lat,
        lng: building.lng,
      };
    }
  };

  //강의실 찾기
  const findClassrooms = useCallback((searchValue: string) => {
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
  }, []);

  /**최근 기록 조건 비교 함수 */
  const matchRecentData = (
    item: RecentDataType,
    recentData: RecentDataType
  ): boolean => {
    if (recentData.types === "building") {
      // types가 "building"일 때, buildingId를 비교
      return (
        item.types === "building" && item.buildingId === recentData.buildingId
      );
    } else if (recentData.types === "classRoom") {
      // types가 "classRoom"일 때, name과 num을 비교
      return (
        item.types === "classRoom" &&
        item.name === recentData.name &&
        item.num === recentData.num
      );
    }
    return false; // 위 조건에 해당하지 않으면 일치하지 않음
  };
  //최근 기록 삭제 함수
  const deleteRecentRecord = (recentData: RecentDataType) => {
    setRecentDataList((prevList) => {
      const updatedList = prevList.filter(
        (item) => !matchRecentData(item, recentData)
      );
      window.localStorage.setItem("recent", JSON.stringify(updatedList));
      return updatedList;
    });
  };
  //------useEffect------
  //장소 클릭에 따른 장소 저장
  useEffect(() => {
    if (selectResult.selectType === "none") return;
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const recentData: RecentDataType = {
      uuid: uuidv4(),
      mon: month,
      day: day,
      types: selectResult.selectType,
      buildingId: 0,
      buildingName: "",
      lat: "",
      lng: "",
      floor: 0,
      name: "",
      num: "",
    };

    if (selectResult.selectType === "building") {
      const SelectData = selectResult.selectData as BuildingResult;
      recentData.buildingId = SelectData?.buildingId || 0;
      recentData.buildingName = SelectData?.buildingName || "";
      recentData.lat = SelectData?.lat || "";
      recentData.lng = SelectData?.lng || "";
    }
    if (selectResult.selectType === "classRoom") {
      const SelectData = selectResult.selectData as ClassRoomResult;
      const classRoomLocation = findLocation(SelectData?.buildingId);
      recentData.buildingId = SelectData?.buildingId || 0;
      recentData.buildingName = SelectData?.buildingName || "";
      recentData.lat = classRoomLocation?.lat || "";
      recentData.lng = classRoomLocation?.lng || "";
      recentData.floor = SelectData?.floor || 0;
      recentData.name = SelectData?.name || "";
      recentData.num = SelectData?.num || "";
    }

    setRecentDataList((prev) => {
      const updatedList = [...prev];
      const existingIndex = updatedList.findIndex((item) =>
        matchRecentData(item, recentData)
      );

      if (existingIndex !== -1) {
        // 이미 존재하는 경우 최상단 이동
        const [existingData] = updatedList.splice(existingIndex, 1);
        updatedList.unshift(existingData);
      } else {
        // 새로운 데이터 추가
        updatedList.unshift(recentData);
      }

      // localStorage 업데이트
      window.localStorage.setItem("recent", JSON.stringify(updatedList));
      return updatedList;
    });

    // setSelectedResult({ selectType: "none", selectData: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectResult]);

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
      }
    };

    handleSearch();

    return () => {
      clearResultClassRoom();
      clearResultBuilding();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceInputValue]);
  //Component: 검색 결과 컴포넌트
  const SearchPlaces = () => {
    if (resultBuilding?.length || resultClassRoom?.length) {
      return (
        <>
          {resultBuilding?.map((building) => (
            <div
              className="resultBlock building"
              key={building.buildingId}
              onClick={() => {
                setSelectedResult({
                  selectType: "building",
                  selectData: building,
                });
                setSelectOn();
                setShowSearchPanel(false);
              }}
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
                <div
                  className={`building-data__name ${
                    building.buildingId === 33 ? "id33" : ""
                  }`}
                >
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
              onClick={() => {
                setSelectedResult({
                  selectType: "classRoom",
                  selectData: classRoom,
                });
                setSelectOn();
                setShowSearchPanel(false);
              }}
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

    return (
      <div className="not_result">
        <svg
          className="not_result-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
        </svg>
        <div>결과가 검색되지 않았습니다.</div>
        <div>숫자 또는 문자를 확인해주세요.</div>
      </div>
    );
  };
  const RecentPlace = () => {
    return (
      <>
        {recentDataList?.map((recent: RecentDataType) => (
          <div
            className="search-panel-storaged-place-container"
            key={recent.uuid}
          >
            {recent.types === "building" ? (
              <div
                className="recent_building"
                onClick={() => {
                  setSelectedResult({
                    selectType: "building",
                    selectData: recent,
                  });
                  setSelectOn();
                  setShowSearchPanel(false);
                }}
              >
                <svg
                  className="recent_icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z" />
                </svg>
                <div className="recent_place">
                  <div
                    className={`recent_place__name ${
                      recent.buildingId === 33 ? "id33" : ""
                    }`}
                  >
                    {recent.buildingName}
                  </div>
                  <div className="recent_place__id">
                    {recent.buildingId}번 건물
                  </div>
                </div>
                <svg
                  className="recent_icon"
                  onClick={(event) => {
                    event.stopPropagation(); // 부모 onClick 실행 방지
                    deleteRecentRecord(recent);
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                </svg>
              </div>
            ) : (
              <div
                className="recent_building recent_classRoom"
                onClick={() => {
                  setSelectedResult({
                    selectType: "classRoom",
                    selectData: recent,
                  });
                  setSelectOn();
                  setShowSearchPanel(false);
                }}
              >
                <svg
                  className="recent_icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z" />
                </svg>
                <div className="recent_place classRoom_info">
                  <div className="recent_place__name">{recent.name}</div>
                  <div
                    className={`recent_place__detail ${
                      recent.name ? "" : "not_name"
                    }`}
                  >
                    <div className="detail_block">{recent.buildingName}</div>
                    <div className="detail_block">
                      {recent.floor > 0
                        ? recent.floor
                        : `지하 ${-recent.floor}`}
                      층
                    </div>
                    <div className="detail_block">{recent.num}</div>
                  </div>
                </div>
                <svg
                  className="recent_icon"
                  onClick={(event) => {
                    event.stopPropagation(); // 부모 onClick 실행 방지
                    deleteRecentRecord(recent);
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                </svg>
              </div>
            )}
          </div>
        ))}
        {recentDataList.length === 0 && (
          <div className="search-panel-storaged-place-empty">
            <svg
              className="empty_icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
            >
              <path d="M58.9 42.1c3-6.1 9.6-9.6 16.3-8.7L320 64 564.8 33.4c6.7-.8 13.3 2.7 16.3 8.7l41.7 83.4c9 17.9-.6 39.6-19.8 45.1L439.6 217.3c-13.9 4-28.8-1.9-36.2-14.3L320 64 236.6 203c-7.4 12.4-22.3 18.3-36.2 14.3L37.1 170.6c-19.3-5.5-28.8-27.2-19.8-45.1L58.9 42.1zM321.1 128l54.9 91.4c14.9 24.8 44.6 36.6 72.5 28.6L576 211.6l0 167c0 22-15 41.2-36.4 46.6l-204.1 51c-10.2 2.6-20.9 2.6-31 0l-204.1-51C79 419.7 64 400.5 64 378.5l0-167L191.6 248c27.8 8 57.6-3.8 72.5-28.6L318.9 128l2.2 0z" />
            </svg>
            <div>최근 기록이 비어있습니다.</div>
          </div>
        )}
      </>
    );
  };
  const SavedPlace = () => {
    return <div>저장된 장소입니다.</div>;
  };
  return (
    <div className="header">
      <div className="header__top">
        <svg
          className="header__top__bars"
          onClick={openModal}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
        </svg>
        <div className="header__top__logo">uhdiro</div>
      </div>
      <div className="header__search-box" ref={searchBox}>
        <input
          type="text"
          className="header__search-box__input"
          placeholder="건물 이름 및 번호, 강의실 이름 및 번호 검색"
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
        <div className="search-panel" ref={searchPanel} style={{ zIndex: 999 }}>
          {inputValue ? (
            <div className="search-panel-resultTab">{SearchPlaces()}</div>
          ) : (
            <div className="search-panel-storaged">
              <div className="search-panel-storaged-navigation">
                <div
                  className={`${
                    panelMode === "recent" ? "clicked" : ""
                  } panelBtn`}
                  onClick={() => setPanelMode("recent")}
                >
                  최근기록
                </div>
                {/* <div
                  className={`${
                    panelMode === "saved" ? "clicked" : ""
                  } panelBtn`}
                  onClick={() => setPanelMode("saved")}
                >
                  내장소
                </div> */}
              </div>
              {panelMode === "recent" ? (
                <div className="search-panel-storaged-place">
                  {RecentPlace()}
                </div>
              ) : (
                <div className="saved-place">{SavedPlace()}</div>
              )}
            </div>
          )}
        </div>
      )}
      {isModalOpen && <RootModal modalName="side_modal" />}
    </div>
  );
};

export default Header;
