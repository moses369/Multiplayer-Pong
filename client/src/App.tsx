import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import useHostDC from "./customHook/useHostDC";


import NotFound from "./components/NotFound/NotFound";

import GamePage from "./pages/GamePage";
import ControllerPage from "./pages/ControllerPage/ControllerPage";
import MenuPage from "./pages/MenuPage/MenuPage";

import "./App.css";

function App() {
  useHostDC();


  return (
    <div className="App" 
      
    >
      <Routes>
        <Route path="/" element={<MenuPage/>} />
        <Route path="/game"  element={<GamePage />} />
        <Route path="/controller" element={<ControllerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
