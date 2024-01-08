import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext, SocketContext } from "../Context";

const AppManager = ({ onGameRequest }) => {
  const { socket } = useContext(SocketContext);
  const { gameContext, setGameContext } = useContext(GameContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      socket.on("ServerGame", (gameData) => {
        console.log("Server Game received");
        const {
          myColor,
          opponentName,
          gameString,
          totalTimeInSecs,
          incrementTimeInSecs,
        } = gameData;
        setGameContext({
          ...gameContext,
          myColor,
          opponentName,
          gameString,
          totalTimeInSecs,
          incrementTimeInSecs,
        });
        navigate(`Game/${gameString}`);
      });

      socket.on("gameRequest", (reqData) => {
        console.log(`Game Req`);
        onGameRequest(reqData);
        console.log(reqData);
      });
    }
  }, [socket]);

  return <></>;
};

export default AppManager;
