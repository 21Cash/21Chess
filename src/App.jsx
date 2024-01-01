import React, { useState, useEffect, useContext } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Game from "./pages/Game";
import { io } from "socket.io-client";
import { SocketContext, UserContext } from "./Context";
import { backendUrl } from "../Constants";
import EnterPage from "./pages/EnterPage";

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");

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
        <Router>
          <div className="pt-10">
            <Navbar />
            <Routes>
              <Route path="/" element={<EnterPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/Home" element={<Home />} />
              <Route path="/Game" element={<Game />} />
            </Routes>
          </div>
        </Router>
      </SocketContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
