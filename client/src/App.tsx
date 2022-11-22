import { Route, Routes } from "react-router-dom";

import GameDisplay from "./components/GamePage/GameDisplay/GameDisplay";
import Controller from "./components/Controller/Controller";
import NotFound from "./components/NotFound/NotFound";

import "./App.css";
import useHostDC from "./customHook/useHostDC";
import MenuPage from "./pages/MenuPage";

function App() {
  useHostDC();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/game"  element={<GameDisplay />} />
        <Route path="/controller" element={<Controller />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
