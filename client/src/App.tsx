import { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import ReactModal from "react-modal";
import useHostDC from "./customHook/useHostDC";

import NotFound from "./components/NotFound/NotFound";
import GamePage from "./pages/GamePage/GamePage";
import ControllerPage from "./pages/ControllerPage/ControllerPage";
import MenuPage from "./pages/MenuPage/MenuPage";
import useScreenSize from "./customHook/useScreenSize";

import "./App.css";

function App() {
  const [showHostDC, setShowHostDC] = useState(false);
  const [showGuestDC, setShowGuestDC] = useState(false);
  useHostDC(setShowHostDC);
  useScreenSize();

  const closeModal = () => {
    setShowHostDC(false);
    setShowGuestDC(false);
  };
  return (
    <div className="App">
      <ReactModal
        isOpen={showHostDC || showGuestDC }
        onRequestClose={closeModal}
        className={"neonBorder centerAbs neonText hostDCModal"}
        overlayClassName={`modalOverlay`}
        children={
          <>
            <h2>{showHostDC ? 'Host' : 'Player'} Disconnected</h2>
            <button
              onClick={closeModal}
              className={`neonBorder neonText neonButton`}
            >
              OK
            </button>
          </>
        }
      />

      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/game" element={<GamePage setShowGuestDC={setShowGuestDC} />} />
        <Route path="/controller" element={<ControllerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
