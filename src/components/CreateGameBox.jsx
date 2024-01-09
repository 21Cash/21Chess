import React from "react";

const CreateGameBox = ({ onClickCreateGame }) => {
  return (
    <div className="bg-gray-900 px-8 rounded-lg shadow-md py-10">
      <button
        onClick={onClickCreateGame}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Create Game
      </button>
    </div>
  );
};

export default CreateGameBox;
