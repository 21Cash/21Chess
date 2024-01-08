import React, { useContext } from "react";
import { UserContext } from "../Context";

const GameRequestPopup = ({ challengerName, format, onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg" style={{ width: "80%" }}>
        <h2 className="text-3xl font-bold mb-4">Game Request</h2>
        <p className="text-lg mb-4">
          Challenger: {challengerName}
          <br />
          Format: {format}
        </p>
        <div className="flex justify-between">
          <button
            onClick={onAccept}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mr-3"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameRequestPopup;
