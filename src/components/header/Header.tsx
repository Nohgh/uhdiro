import React, { useEffect, useRef, useState } from "react";
import "./Header.scss";
import building from "../../data/building/building.json";
import useDebounce from "../../hooks/useDebounce";
//TODO: 검색 로직 작성
//입력한 문자가 있는 경우에 x아이콘 생성하여 한번에 없앨 수 있도록
//1. 숫자, 문자 판별 2.문자길이 판별
interface Building {
  buildingId: number;
  buildingName: string | string[];
  imgUrl: string;
  lat?: string;
  lng?: string;
}

const Header = () => {
  const searchBox = useRef<null | HTMLDivElement>(null);
  const resultArea = useRef<null | HTMLDivElement>(null);

  const [showResultArea, setShowResultAria] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [buildingsData, setBuildingsData] = useState<Building[] | null>([]);
  const [buildingResult, setBuildingResult] = useState<Building[] | null>(null);

  useEffect(() => {
    setBuildingsData(building.buildings);
  }, []);

  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (searchBox.current && searchBox.current.contains(target)) ||
        (resultArea.current && resultArea.current.contains(target))
      ) {
        setShowResultAria(true);
      } else {
        setShowResultAria(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, []);

  const debounceInputValue = useDebounce(inputValue, 300);

  useEffect(() => {
    //탐색을 통해 반환되는 결과는 전역으로 관리되어야 한다. (지도에서 사용)
    const handleSearch = () => {
      if (isNumber(debounceInputValue)) {
        const numberValue = parseFloat(debounceInputValue);

        if (numberValue < 100) {
          const buildings = buildingsData?.filter((b) =>
            String(b.buildingId).startsWith(String(numberValue))
          );
          if (buildings) setBuildingResult(buildings);
        } else {
          console.log("두 자리수 이상입니다. 강의실 찾기 로직을 만들어주세여");
        }
      } else {
        console.log("숫자가 아닌 영어입니다.");
      }
    };
    if (debounceInputValue) {
      handleSearch();
    } else {
      setBuildingResult(null); // 입력값이 없을 경우 초기화
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
      {showResultArea && (
        <div className="search-area" ref={resultArea}>
          {buildingResult &&
            buildingResult.map((rst) => {
              return (
                <div>
                  <div></div>
                  {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg> */}
                  <div>
                    <div>{rst.buildingName}</div>
                    <div>{rst.buildingId}번 건물</div>
                  </div>
                  <div></div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Header;
