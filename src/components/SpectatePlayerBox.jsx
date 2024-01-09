import React, { useContext, useEffect, useState, version } from "react";
import { SocketContext, SpectateContext } from "../Context";
import { backendUrl } from "../../Constants";
import { useNavigate } from "react-router-dom";

const SpectatePlayerBox = () => {
  const [gameCode, setGameCode] = useState("");
  const { spectateContext, setSpectateContext } = useContext(SpectateContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("spectatorRegistered", (gameData) => {
      const { whiteName, blackName, gameString, fen, whiteTime, blackTime } =
        gameData;
      console.log(gameData);
      setSpectateContext({
        ...spectateContext,
        whiteName,
        blackName,
        fen,
        whiteTime,
        blackTime,
      });
      const specRoute = `/Spectate/${gameString}`;
      console.log(`ROUTE : ${specRoute}`);
      navigate(specRoute);
    });
    socket.on("spectatorRegisterFailed", ({ msg }) => {
      alert(msg);
    });
  }, []);

  const handleInputChange = (event) => {
    setGameCode(event.target.value);
  };

  const onClickSpectate = () => {
    socket.emit("registerSpectator", { gameString: gameCode });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onClickSpectate();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-md p-5 bg-gray-900">
      <input
        type="text"
        value={gameCode}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="Enter Game Code"
        className="border border-gray-300 p-2 mb-4 rounded-md"
      />
      <button
        onClick={onClickSpectate}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Spectate
      </button>
    </div>
  );
};

export default SpectatePlayerBox;
