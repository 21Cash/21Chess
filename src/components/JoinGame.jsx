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
    <div className="dark:bg-gray-900 flex flex-col items-center justify-center min-h-screen">
      <input
        className="dark:bg-gray-800 shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="Enter game code"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleJoinClick}
      >
        Join
      </button>
    </div>
  );
};

export default JoinGame;
