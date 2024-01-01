import React, { useState, useEffect, useContext } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Game from "./pages/Game";
import { io } from "socket.io-client";
import { SocketContext, UserContext, GameContext } from "./Context";
import { backendUrl } from "../Constants";
import EnterPage from "./pages/EnterPage";
import JoinGame from "./components/JoinGame";

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [gameContext, setGameContext] = useState({
    myColor: "w",
    gameString: "",
  });

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
    <UserContext.Provider value={{ username, setUsername }}>
      <SocketContext.Provider value={{ socket, setSocket }}>
        <GameContext.Provider value={{ gameContext, setGameContext }}>
          <Router>
            <div className="pt-10">
              <Navbar />
              <Routes>
                <Route path="/" element={<EnterPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Game" element={<Game />} />
                <Route path="/Join" element={<JoinGame />} />
                <Route path="/Game/:gameString" element={<Game />} />
              </Routes>
            </div>
          </Router>
        </GameContext.Provider>
      </SocketContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
