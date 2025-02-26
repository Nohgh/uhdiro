import "./App.scss";
import CampusMap from "./components/campus map/CampusMap";
import Header from "./components/header/Header";

const App = () => {
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
