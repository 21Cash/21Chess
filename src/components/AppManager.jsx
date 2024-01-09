import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext, SocketContext } from "../Context";
import gameRequestSoundEffect from "../media/GameRequest.mp3";
import gameStartSoundEffect from "../media/GameEnd.mp3";

const AppManager = ({ onGameRequest }) => {
  const { socket } = useContext(SocketContext);
  const { gameContext, setGameContext } = useContext(GameContext);
  const [gameRequestSound] = useState(new Audio(gameRequestSoundEffect));
  const [gameStartSound] = useState(new Audio(gameStartSoundEffect));
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
        gameStartSound.play();
        navigate(`Game/${gameString}`);
      });

      socket.on("gameRequest", (reqData) => {
        console.log(`Game Req`);
        gameRequestSound.play();
        onGameRequest(reqData);
        console.log(reqData);
      });
    }
  }, [socket]);

  return <></>;
};

export default AppManager;
