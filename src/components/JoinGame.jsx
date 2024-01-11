import React, { useContext, useEffect, useState } from "react";
import { GameContext, SocketContext } from "../Context";
import { useNavigate } from "react-router-dom";

const JoinGame = () => {
  const [inputValue, setInputValue] = useState("");
  const { socket } = useContext(SocketContext);
  const { gameContext, setGameContext } = useContext(GameContext);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("gameJoined", (gameData) => {
      console.log("Game Join Successful");
      console.log(gameData);
      setGameContext({
        ...gameContext,
        myColor: gameData.myColor,
        gameString: gameData.gameString,
        showEval: gameData.showEval,
        totalTimeInSecs: gameData.totalTimeInSecs,
        incrementTimeInSecs: gameData.incrementTimeInSecs,
      });
      navigate(`/Game/${gameData.gameString}`);
    });

    socket.on("gameJoinFailed", (info) => {
      console.log(info);
      alert(info.msg);
    });
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleJoinClick = () => {
    console.log("Making req To Join");
    socket.emit("joinGame", { gameString: inputValue });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJoinClick();
    }
  };

  return (
    <div className="bg-gray-900 flex items-center justify-center min-h-screen ">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-2/6 py-16">
        <input
          className="mb-4 w-full shadow appearance-none border rounded py-2 px-3 text-gray-700  leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Game Code or Player"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleJoinClick}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
