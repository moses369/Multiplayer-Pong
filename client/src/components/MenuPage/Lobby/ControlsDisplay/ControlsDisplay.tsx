import { useSelector } from "react-redux";
import { useState } from "react";
import ReactModal from "react-modal";
import { RootState } from "../../../../redux";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { PlayerChoices } from "../../../../util/types";

import "./ControlsDisplay.css";
const ControlsDisplay = () => {
  const { local, mobileCodes } = useSelector((state: RootState) => ({
    mobileCodes: state.menu.mobileCode,
    local: state.menu.local,
  }));
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal((show) => !show);
  return (
    <>
      <button
        className="neonBorder neonText neonButton controlButton "
        onClick={toggleModal}
      >
        Controls
      </button>
      <h3 className="controlTitle">Controls</h3>
      <ReactModal
        onRequestClose={toggleModal}
        className={"controlModal neonBorder centerAbs neonText"}
        overlayClassName={`modalOverlay`}
        isOpen={showModal}
        children={
          <>
            <SlideControls inModal />
            <PlayerControl player="player1" code={mobileCodes.player1} />
            <PlayerControl player="player2" code={mobileCodes.player2} />
          </>
        }
      />
    </>
  );
};
export default ControlsDisplay;

const H2Center = ({ text }: { text: string }) => (
  <h2 className="controlHeader" style={{ textAlign: "center" }}>
    {" "}
    {text}
  </h2>
);

const PlayerControl = ({
  player,
  code,
}: {
  player: PlayerChoices;
  code: string;
}) => {
  return (
    <div className="playerControl">
      <H2Center text={`${player === "player1" ? "Player 1" : "Player 2"}`} />
      <div className="row controlTextContainer">
        <span>
          <h4 className="controlSubHeader">Keyboard</h4>
          {player === "player1" ? (
            <>
              {" "}
              <p>W - up</p>
              <p>S - down</p>
            </>
          ) : (
            <>
              <p>
                <AiOutlineArrowUp /> - up
              </p>
              <p>
                <AiOutlineArrowDown /> - down
              </p>
            </>
          )}
        </span>
        <span>
          <h4 className="controlSubHeader">Mobile Code</h4>
          <p style={{ textAlign: "center" }}>{code}</p>
        </span>
      </div>
    </div>
  );
};
export const SlideControls = ({ inModal }: { inModal: boolean }) => {
  const local = useSelector((state: RootState) => state.menu.local);
  return (
    <div className={`${!inModal ? "inLobby" : ""}`}>
      {" "}
      {!local && (
        <div className="controlTextContainer">
          <H2Center text="Mouse" />
          <p>Slide the mouse up and down to move the paddle</p>
        </div>
      )}
      <div className="controlTextContainer">
        <H2Center text="Mobile" />
        <p>Touch the paddle and slide it up and down</p>
      </div>
    </div>
  );
};
SlideControls.defaultProps = {
  inModal: false,
};
