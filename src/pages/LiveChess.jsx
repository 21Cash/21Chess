import React, { useState } from "react";
import JoinGameBox from "../components/JoinGameBox";
import CreateGameBox from "../components/CreateGameBox";
import SpectatePlayerBox from "../components/SpectatePlayerBox";
import MainFooter from "../components/MainFooter";
import CreateGamePopup from "../components/CreateGamePopup";

const LiveChess = () => {
  const [createGamePopupActive, setCreateGamePopupActive] = useState(false);

  return (
    <div>
      <div className="flex bg-gradient-to-l from-gray-600 to-gray-900 h-screen py-8">
        <div className="w-4/12 bg-gray-500 mx-2 mt-5 mb-2">
          <p className="p-4"> World Chat </p>
        </div>
        <div className="w-6/12 bg-gray-500 rounded-md mx-2 mt-5 mb-2">
          <p className="p-4"> Open Games</p>
        </div>

        <div className="w-4/12 bg-gray-500 mx-2 mt-5 mb-2 space-y-6 rounded-md">
          <div className="px-2 pt-4 mx-3">
            <JoinGameBox />
          </div>

          <div className="px-2 mx-3">
            <CreateGameBox
              onClickCreateGame={() => setCreateGamePopupActive(true)}
            />
          </div>
          <div className="px-2 mx-3">
            <SpectatePlayerBox />
          </div>
        </div>
      </div>
      {createGamePopupActive && (
        <CreateGamePopup onClickClose={() => setCreateGamePopupActive(false)} />
      )}

      <MainFooter />
    </div>
  );
};

export default LiveChess;
