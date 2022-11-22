import React, { useEffect, useRef, useState } from "react";


import Ball from "../Ball/Ball";
import Paddle from "../Padddle/Paddle";

import "./GameDisplay.css";

const GameDisplay = () => {


  const [start, setStart] = useState<boolean>(false);

  const paddle1Ref = useRef<HTMLDivElement>(null);
  const paddle2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      !start && setStart(true);
    }, 1000);
  }, [start]);
 

  return (
    <>
      {
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
      }
    </>
  );
};

export default GameDisplay;
