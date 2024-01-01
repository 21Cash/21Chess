import React, { useContext, useEffect, useRef } from "react";
import { GameContext, UserContext } from "../Context";

const Popup = ({ handleClose }) => {
  const { gameContext } = useContext(GameContext);
  const { username } = useContext(UserContext);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg" style={{ width: "80%" }}>
        <h2 className="text-3xl font-bold mb-4">{gameContext.result}</h2>
        <p className="text-lg mb-4">
          {username} vs {gameContext.opponent}
        </p>
        <button
          onClick={handleClose}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
