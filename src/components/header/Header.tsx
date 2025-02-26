import React, { useEffect, useRef, useState } from "react";
import "./Header.scss";
import building from "../../data/building/building.json";
import useDebounce from "@hooks/useDebounce";
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

  const [showResultArea, setResultAria] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [findValue, setFindValue] = useState<Building | null>(null);
  const [buildingsData, setBuildingsData] = useState<Building[]>([]);

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
        setResultAria(true);
      } else {
        setResultAria(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, []);

  useEffect(() => {
    console.log("입력");
    const handleSearch = () => {
      if (isNumber(inputValue)) {
        const find = parseFloat(inputValue);
        const building = buildingsData.find((b) => b.buildingId === find);
        setFindValue(building || null);
      }
    };
    if (inputValue) {
      handleSearch();
    } else {
      setFindValue(null); // 입력값이 없을 경우 초기화
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

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
        ></input>
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
          {findValue && <div>{findValue.buildingId}</div>}
        </div>
      )}
    </div>
  );
};

export default Header;
