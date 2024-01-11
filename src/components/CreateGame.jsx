import React, { useState, useContext } from "react";
import { GameContext, SocketContext } from "../Context";
import { UserContext } from "../Context";
import { useNavigate } from "react-router-dom";

const getTimeData = (format) => {
  let timeData = {};
  if (format == "HyperBullet") {
    timeData.totalTime = 0.4;
    timeData.timeIncrement = 0;
  } else if (format == "Rapid") {
    timeData.totalTime = 10;
    timeData.timeIncrement = 2;
  } else if (format == "Blitz") {
    timeData.totalTime = 3;
    timeData.timeIncrement = 2;
  } else if (format == "Bullet") {
    timeData.totalTime = 1;
    timeData.timeIncrement = 0;
  } else {
    return null;
  }
  return timeData;
};

const CreateGame = () => {
  const [timeControl, setTimeControl] = useState("");
  const [showEval, setShowEval] = useState(false);
  const [targetOpponent, setTargetOpponent] = useState("");

  const { socket } = useContext(SocketContext);
  const { gameContext, setGameContext } = useContext(GameContext);

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here

    const timeData = getTimeData(timeControl);
    const gameData = {
      showEval: showEval,
      totalTime: timeData.totalTime,
      timeIncrement: timeData.timeIncrement,
      targetOpponent: targetOpponent,
    };
    socket.emit("createGame", gameData);

    socket.on("gameCreated", (gameInfo) => {
      /*
       const gameInfo = {
        creator: username,
        isPublic: isPublic,
        showEval: showEval,
        totalTime: totalTime,
        timeIncrement: timeIncrement,
        targetOpponent: targetOpponent,
        gameString: gameString,
      };
      */
      const { gameString, showEval, totalTime, timeIncrement } = gameInfo;
      setGameContext({
        ...gameContext,
        myColor: gameInfo.creatorColor,
        showEval,
        gameString: gameInfo.gameString,
        totalTimeInSecs: totalTime * 60,
        timeIncrementInSecs: timeIncrement,
      });
      console.log(gameContext);
      navigate(`/Game/${gameString}`);
    });
  };

  return (
    <div className="bg-gray-900 p-5 rounded-lg">
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex flex-col mb-4">
          <label htmlFor="timeControl" className="text-lg text-gray-300">
            Time Control:
          </label>
          <select
            id="timeControl"
            value={timeControl}
            onChange={(e) => setTimeControl(e.target.value)}
            className="py-2 px-4 mt-1 rounded-md bg-gray-500 text-white"
          >
            <option value="">Select Time Control</option>
            <option value="HyperBullet">Hyperbullet (1/2 + 0)</option>
            <option value="Bullet">Bullet (1 + 0)</option>
            <option value="Rapid">Rapid (10 + 2)</option>
            <option value="Blitz">Blitz (3 + 2) </option>
          </select>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="showEval"
            checked={showEval}
            onChange={(e) => setShowEval(e.target.checked)}
            className="h-4 w-4 mr-2 rounded bg-gray-500"
          />
          <label htmlFor="showEval" className="text-gray-300">
            Show Evaluation
          </label>
        </div>

        <div className="flex flex-col mb-4">
          <label htmlFor="targetOpponent" className="text-lg text-gray-300">
            Target Opponent:
          </label>
          <input
            type="text"
            id="targetOpponent"
            placeholder="To Challenge Player Name (Optional)"
            value={targetOpponent}
            onChange={(e) => setTargetOpponent(e.target.value)}
            className="py-2 px-4 mt-1 rounded-md bg-gray-500 text-white"
          />
        </div>

        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateGame;
