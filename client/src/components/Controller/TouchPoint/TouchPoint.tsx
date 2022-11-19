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
  id: number;
}
const TouchPoint = ({ direction, Arrow }: Props) => {
  const { socket, uid } = useSelector(
    ({ socket: { socket, uid } }: RootState) => ({ socket, uid })
  );

  const [holding, setHolding] = useState<boolean>(false);
  const [player, setPlayer] = useState<"player1" | "player2">("player1");

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
      id.current = moving({ direction, player, id: uid });
    } else {
      clearInterval(id.current);
    }
  }, [holding]);

  return (
    <button
      onTouchStart={(e) => {
        moveSocket({ direction, player, id:uid });
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
