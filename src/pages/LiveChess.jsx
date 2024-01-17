import React, { useState } from "react";
import JoinGameBox from "../components/JoinGameBox";
import CreateGameBox from "../components/CreateGameBox";
import SpectatePlayerBox from "../components/SpectatePlayerBox";
import MainFooter from "../components/MainFooter";
import CreateGamePopup from "../components/CreateGamePopup";
import ChatBox from "../components/ChatBox";
import RandomBoard from "../components/RandomBoard";

const LiveChess = () => {
  const [createGamePopupActive, setCreateGamePopupActive] = useState(false);
  return (
    <div className="h-full pt-5">
      <div className="flex bg-gray-900 h-[90vh] py-5 px-5 justify-between">
        <div className="hidden sm:block w-3/12 bg-gray-700 mx-2 mt-5 mb-2 rounded-md my-10 p-3">
          {/* <p className="p-4"> World Chat </p> */}

          <ChatBox roomName="Global" />
        </div>
        <div className="hidden sm:flex h-9/10 flex-col justify-center w-5/12 rounded-md aspect-w-[1] mt-5">
          <div className="h-80% flex justify-center">
            <RandomBoard />
          </div>
        </div>

        <div className="w-full sm:w-3/12 bg-gray-700 mx-2 mt-5 mb-2 rounded-md">
          <div className="h-full p-6 flex flex-col justify-evenly space-y-6">
            <JoinGameBox />

            <CreateGameBox
              onClickCreateGame={() => setCreateGamePopupActive(true)}
            />
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
