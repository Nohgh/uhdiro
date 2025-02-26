import { useEffect, useState } from "react";
import "./App.scss";

const App = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      console.log(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  //440이 넘어가면 중앙에 화면을 440으로 고정
  return (
    <>
      <div className="main">
        <div>현재 화면의 너비는 {windowWidth}</div>
      </div>
    </>
  );
};

export default App;
