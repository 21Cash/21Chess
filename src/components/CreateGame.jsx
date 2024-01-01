import React, { useState, useContext } from "react";
import { SocketContext } from "../Context";
import { UserContext } from "../Context";

const getTimeData = (format) => {
  const timeData = {};
  if (format == "Rapid") {
    timeData.totalTime = 10;
    timeData.timeIncrement = 5;
  } else if (format == "Blitz") {
    timeData.totalTime = 3;
    timeData.timeIncrement = 2;
  } else if (format == "Bullet") {
    timeData.totalTime = 1;
    timeData.timeIncrement = 1;
  }
  return timeData;
};

const CreateGame = () => {
  const [timeControl, setTimeControl] = useState("");
  const [showEval, setShowEval] = useState(false);
  const [targetOpponent, setTargetOpponent] = useState("");

  const { socket } = useContext(SocketContext);
  const { username, setUsername } = useContext(UserContext);
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
  };

  return (
    <div className="container dark:bg-gray-900">
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
            <option value="Bullet">Bullet</option>
            <option value="Rapid">Rapid</option>
            <option value="Blitz">Blitz</option>
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
