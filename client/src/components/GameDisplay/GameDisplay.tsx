import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux";
import { moveSocket, Rect } from "../../redux/features/paddle-slice";
import Modal from "react-modal";

import Ball from "../Ball/Ball";
import Paddle from "../Padddle/Paddle";
import Menu from "../Menu/Menu";

import "./GameDisplay.css";
import { stringify } from "querystring";

const GameDisplay = () => {
  const dispatch = useDispatch();
  const { socket, uid, player1, player2 } = useSelector(
    ({ socket: { socket, uid }, paddle: { player1, player2 } }: RootState) => ({
      socket,
      uid,
      player1,
      player2,
    })
  );

  const [start, setStart] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [chosePlayer, setChosePlayer] = useState<boolean>(false);

  const paddle1Ref = useRef<HTMLDivElement>(null);
  const paddle2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      !start && setStart(true);
    }, 1000);
  }, [start]);
  useEffect(() => {
    
    socket.on(
      "MOVING_PADDLE",
      (direction: "up" | "down", player: "player1" | "player2") => {
        const border: Rect = {
          top: 0,
          right: document?.body.clientWidth,
          bottom: document?.body.clientHeight,
          left: 0,
        };
        if (paddle1Ref.current && paddle2Ref.current) {
          const paddle =
            player === "player1" ? paddle1Ref.current : paddle2Ref.current;
          dispatch(
            moveSocket({
              direction,
              player,
              border,
              paddle,
            })
          );
        }
      }
    );
  }, [socket]);

  return (
    <>
      {!showModal && (
        <div className="game_container">
          <Paddle player={"player1"} paddleRef={paddle1Ref} />
          {start && (
            <Ball
              paddle1={paddle1Ref.current}
              paddle2={paddle2Ref.current}
              setStart={setStart}
            />
          )}
          <Paddle player={"player2"} paddleRef={paddle2Ref} />
        </div>
      )}
      <Modal
        isOpen={showModal}
        onRequestClose={() => chosePlayer && setShowModal(false)}
        className={"menu"}
      >
        <Menu />
      </Modal>
    </>
  );
};

export default GameDisplay;
