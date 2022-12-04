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
  useEffect(() => {
// We listen to the resize event
window.addEventListener('resize', () => {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});
  },[])

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
