import React, { useState, useEffect, useContext } from "react";
import { backendUrl } from "../../Constants";
import { SocketContext } from "../Context";
import { UserContext } from "../Context";
import { useNavigate } from "react-router-dom";
import MainFooter from "../components/MainFooter";

const EnterPage = () => {
  const [serverStatus, setServerStatus] = useState("Checking status");
  const [playersOnline, setPlayersOnline] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [name, setName] = useState(""); // New state for the entered name
  let { socket } = useContext(SocketContext);
  const { setUsername } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendUrl}/serverInfo`);
        if (response.ok) {
          const data = await response.json();
          setServerStatus("Online");
          setPlayersOnline(`${data.playersOnline} `);
          setLoading(false);
          setError(false);
          console.log("Connected To Server.");
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        setServerStatus("Offline");
        setPlayersOnline(0);
        setLoading(false);
        setError(true);
      }
    };

    fetchData();

    // Socket event listeners within useEffect
    if (socket) {
      socket.on("userRegistered", (userData) => {
        console.log(`Register Success Username : ${userData.username}`);
        setUsername(userData.username);
        navigate("/LiveChess");
      });

      socket.on("userRegisterFailed", (data) => {
        console.error("Register Failed");
        alert(data.msg);
      });
    }

    // Cleanup function to remove the listeners when unmounting
    return () => {
      if (!socket) return;
      socket.off("userRegistered");
      socket.off("userRegisterFailed");
    };
  }, [socket]);
  const handleEnter = () => {
    console.log("Submitting");
    const userData = { username: name };
    socket.emit("registerUser", userData);
    console.log(`Register Emitted`);
  };

  return (
    <div>
      <div className="bg-gray-900 to-gray-900 text-white flex items-center justify-center h-[85vh] mt-6">
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-4xl">Loading...</p>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white ml-3"></div>
          </div>
        ) : error ? (
          <div className="flex text-4xl items-center justify-center h-screen">
            <p>Couldn't connect to the server.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-16">
            <h1 className="text-6xl font-bold mb-4">21Chess</h1>
            <p className="text-lg text-center mb-6">
              Minimalistic Online Chess
            </p>
            <p className="text-sm text-center mb-8">
              Free and lightweight Chess Platform
            </p>
            <div className="flex items-end justify-end mb-8">
              <input
                type="text"
                placeholder="Enter your username"
                className="bg-gray-800 border border-gray-700 rounded-l px-4 py-3 outline-none focus:border-blue-500 w-64"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEnter();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleEnter}
                className="bg-blue-500 text-white px-4 py-3 rounded-r hover:bg-blue-600 transition duration-300 ml-2"
              >
                Enter
              </button>
            </div>
            <div className="text-center">
              <p>Server Status: {serverStatus}</p>
              <p>{playersOnline} players Online</p>
            </div>
          </div>
        )}
      </div>
      <MainFooter />
    </div>
  );
};

export default EnterPage;
