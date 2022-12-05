import React from "react";
import './Rules.css'
const Rules = ({inModal}:{inModal?:boolean}) => {
  return (
    <div className={`${inModal ? 'inModal' :'neonBorder'} rules `}>
      <h2 className="rulesTitle">How to Play</h2>
      <ul className="ruleContent">
        <li >Join a session through the list, or id.</li>
        <li>
          If you want to connect a mobile controller, enter its code instead
        </li>
        <li>Games are first to 11 points</li>
        <li>As time goes on the pong will move faster</li>
        <li>
          If your playing on a mobile device, please play on landscape for the
          best experience
        </li>
        <li>Have Fun!!</li>
      </ul>
    </div>
  );
};

export default Rules;
