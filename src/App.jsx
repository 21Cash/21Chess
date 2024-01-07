import React, { useState, useEffect, useContext } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Game from "./pages/Game";
import SpectateGame from "./pages/SpectateGame";
import { io } from "socket.io-client";
import {
  SocketContext,
  UserContext,
  GameContext,
  SpectateContext,
} from "./Context";
import { backendUrl } from "../Constants";
import EnterPage from "./pages/EnterPage";
import JoinGame from "./components/JoinGame";
import Popup from "./components/Popup";
import SpectateBox from "./pages/SpecateBox";

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [gameContext, setGameContext] = useState({
    myColor: "w",
    gameString: "",
    result: "",
    opponent: "",
  });
  const [spectateContext, setSpectateContext] = useState({
    whiteName: null,
    blackName: null,
    gameString: null,
    fen: null,
    whiteTime: null,
    blackTime: null,
  });

  const handleClosePopup = () => {
    setGameContext({
      ...gameContext,
      result: "", // Reset the result when closing the popup
    });
  };

  useEffect(() => {
    console.log(`Trying To Connect To Server : ${backendUrl}`);
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket Connected.");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SpectateContext.Provider value={{ spectateContext, setSpectateContext }}>
      <UserContext.Provider value={{ username, setUsername }}>
        <SocketContext.Provider value={{ socket, setSocket }}>
          <GameContext.Provider value={{ gameContext, setGameContext }}>
            <Router>
              <div className="pt-10 bg-gray-700 h-screen">
                <Navbar />
                <Routes>
                  <Route path="/" element={<EnterPage />} />
                  <Route path="/spectatePage" element={<SpectateBox />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/Home" element={<Home />} />
                  <Route path="/Game" element={<Game />} />
                  <Route path="/Join" element={<JoinGame />} />
                  <Route path="/Game/:gameString" element={<Game />} />
                  <Route
                    path="/Spectate/:gameString"
                    element={<SpectateGame />}
                  />
                </Routes>
              </div>
            </Router>
            {gameContext.result !== "" && (
              <Popup handleClose={handleClosePopup} />
            )}
          </GameContext.Provider>
        </SocketContext.Provider>
      </UserContext.Provider>
    </SpectateContext.Provider>
  );
}

export default App;
