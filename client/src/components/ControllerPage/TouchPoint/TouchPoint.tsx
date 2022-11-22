import { dir } from "console";
import { useCallback, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux";
interface Props {
  direction: "up" | "down";
  Arrow: React.ReactNode;
}
export interface MoveSocket {
  direction: "up" | "down";
  player: "player1" | "player2";
  id: string;
}
const TouchPoint = ({ direction, Arrow }: Props) => {
  const { socket,sessionId, player } = useSelector(
    ({ socket: { socket }, menu:{sessionId,player} }: RootState) => ({ socket,sessionId,player })
  );

  const [holding, setHolding] = useState<boolean>(false);
  

  const moveSocket = useCallback(({ direction, player, id }: MoveSocket) => {
    socket.emit("MOVE_PADDLE", id, direction, player);
  }, []);
  const moving = useCallback(
    ({ direction, player, id }: MoveSocket) =>
      setInterval(() => {
        moveSocket({ direction, player, id });
      }, 100),
    []
  );
  const id = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (holding) {
      id.current = moving({ direction, player, id:sessionId });
    } else {
      clearInterval(id.current);
    }
  }, [holding]);

  return (
    <button
      onTouchStart={(e) => {
        moveSocket({ direction, player, id:sessionId });
        setHolding(true);
      }}
      onTouchEnd={(e) => {
        setHolding(false);
      }}
    >
      {Arrow}
    </button>
  );
};

export default TouchPoint;
