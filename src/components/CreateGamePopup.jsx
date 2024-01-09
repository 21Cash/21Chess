import React from "react";
import { useNavigate } from "react-router-dom";
import CreateGame from "../components/CreateGame";

function CreateGamePopup({ onClickClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="w-1/2 relative">
        <button
          onClick={onClickClose}
          className="absolute top-0 right-0 m-3 flex items-center justify-center bg-gray-300 rounded-full w-8 h-8"
        >
          <span className="text-black ">X</span>
        </button>
        <CreateGame />
      </div>
    </div>
  );
}

export default CreateGamePopup;
