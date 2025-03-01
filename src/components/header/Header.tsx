import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import building from "../../data/building/building.json";
import classRoom from "../../data/classRoom/classRoom.json";
import {
  BuildingResult,
  ClassRoomResult,
  ClassRoomData,
  ClassRoom,
  Room,
} from "../../interfaces/place";
import useDebounce from "../../hooks/useDebounce";
import useResultBuildingStore from "../../store/useResultBuildingStore";
import "./Header.scss";
import useResultClassRoomStore from "../../store/useResultClassRoomStore";

const Header = () => {
  const searchBox = useRef<null | HTMLDivElement>(null);
  const placePanel = useRef<null | HTMLDivElement>(null);

  const [showPlacePanel, setShowPlacePanel] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [buildingsData, setBuildingsData] = useState<BuildingResult[] | null>(
    []
  );

  const [selectResult, setSelectedResult] = useState({
    selectType: "none",
    selectData: {},
  });
  console.log("selectResult", selectResult);

  const { resultBuilding, setResultBuilding } = useResultBuildingStore();
  const { resultClassRoom, setResultClassRoom, clearResultClassRoom } =
    useResultClassRoomStore();

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

  function findClassrooms(
    data: ClassRoomData,
    searchValue: string
  ): ClassRoomResult[] {
    const result: ClassRoomResult[] = [];
    // console.log("findClassrooms");
    function searchInFloor(
      floorData: Room[],
      building: ClassRoom,
      floorLevel: number
    ): void {
      floorData.forEach((room: Room) => {
        if (
          room.num &&
          room.num.toLowerCase().includes(searchValue.toLowerCase())
        ) {
          const isDuplicate = result.some(
            (item) => item.num === room.num && item.name === room.name
          );
          if (!isDuplicate) {
            result.push({
              buildingId: building.buildingId,
              buildingName: building.buildingName,
              basement: building.basement || 0, // 기본값 0
              floor: floorLevel,
              num: room.num,
              name: room.name,
            });
          }
        }
      });
    }

    data.classRoom.forEach((building: ClassRoom) => {
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
  }

  const debounceInputValue = useDebounce(inputValue, 300);
  useEffect(() => {
    const handleSearch = () => {
      if (debounceInputValue) {
        //건물 찾기
        if (debounceInputValue.length < 3) {
          clearResultClassRoom();
          const buildingResults = buildingsData?.filter(
            (b) =>
              //입력 데이터가 건물이름에 포함
              b.buildingName.includes(debounceInputValue) ||
              //건물 번호가 입력데이터로 시작
              String(b.buildingId).startsWith(debounceInputValue)
          );
          if (buildingResults && buildingResults.length > 0) {
            // console.log("buildingResults", buildingResults);
            setResultBuilding(buildingResults);
          }
        }
        //강의실 찾기
        else {
          //3글자 이상이라면 2글자에서 나왔던 결과를 초기화
          //현재 입력값에서 입력이 달라지면 결과를 초기화()
          console.log("3글자 이상");
          const classroomResults = findClassrooms(
            classRoom,
            debounceInputValue
          );
          if (classroomResults.length > 0) {
            console.log("classroomResults", classroomResults);
            const resultClassRoomSet = new Set(resultClassRoom);
            classroomResults.forEach((item) => {
              if (!resultClassRoomSet.has(item)) {
                clearResultClassRoom();
                setResultClassRoom(classroomResults);
              }
            });
          }
        }
      } else {
        console.log("입력값이 없습니다.");
      }
    };

    handleSearch();
  }, [debounceInputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const Places = () => {
    if (resultBuilding?.length || resultClassRoom?.length) {
      return (
        <div>
          {resultClassRoom?.map((i) => (
            <div className="resultBlock classRoom" key={uuidv4()}>
              {i.name}
              {i.num}
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
