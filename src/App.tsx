import { useEffect } from "react";
import "./App.scss";
import CampusMap from "./components/campus map/CampusMap";
import Header from "./components/header/Header";

const App = () => {
  const setScreenSize = () => {
    // eslint-disable-next-line prefer-const
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
  useEffect(() => {
    setScreenSize();
  });
  return (
    <>
      <div className="main">
        <Header />
        <CampusMap />
      </div>
    </>
  );
};

export default App;
