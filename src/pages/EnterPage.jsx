import React, { useState, useEffect, useContext } from "react";
import { backendUrl } from "../../Constants";
import { SocketContext } from "../Context";
import { UserContext } from "../Context";
import { useNavigate } from "react-router-dom";

const EnterPage = () => {
  const [serverStatus, setServerStatus] = useState("Checking status");
  const [playersOnline, setPlayersOnline] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [name, setName] = useState(""); // New state for the entered name
  const { socket } = useContext(SocketContext);
  const { setUsername } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendUrl}/serverInfo`);
        if (response.ok) {
          const data = await response.json();
          setServerStatus("Online");
          console.log(response.data);
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
  }, []);

  const checkServerStatus = () => {
    setLoading(true);
    setTimeout(() => {
      const isOnline = Math.random() < 0.8;
      setServerStatus(isOnline ? "Online" : "Offline");
      setPlayersOnline(isOnline ? Math.floor(Math.random() * 100) : 0);
      setLoading(false);
      setError(false);
    }, 2000);
  };

  const handleEnter = () => {
    const userData = { username: name };
    socket.emit("registerUser", userData);

    socket.on("userRegistered", (userData) => {
      console.log(`Register Success Username : ${userData.username}`);
      setUsername(userData.username);
      navigate("/Home");
    });

    socket.on("userRegisterFailed", (data) => {
      console.error("Register Failed");
      alert(data.msg);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Username submitted:", name);
    const userData = { username: name };
    socket.emit("registerUser", userData);

    socket.on("userRegistered", (userData) => {
      console.log(`Register Success Username : ${userData.username}`);
      setUsername(userData.username);
      navigate("/Home");
    });

    socket.on("userRegisterFailed", (data) => {
      console.error("Register Failed");
      alert(data.msg);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
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
          <p className="text-lg text-center mb-6">Minimalistic Online Chess</p>
          <p className="text-sm text-center mb-8">
            Free and lightweight Chess Platform
          </p>
          <form onSubmit={handleSubmit} className="flex items-center mb-8">
            {/* Integrate EnterBox logic into the username input */}
            <input
              type="text"
              placeholder="Enter your username"
              className="bg-gray-800 border border-gray-700 rounded-l px-4 py-3 outline-none focus:border-blue-500 w-64"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleEnter}
              className="bg-blue-500 text-white px-4 py-3 rounded-r hover:bg-blue-600 transition duration-300 ml-2"
            >
              Enter
            </button>
          </form>
          <div className="text-center">
            <p>Server Status: {serverStatus}</p>
            <p>{playersOnline} players Online</p>
            <button
              onClick={checkServerStatus}
              className="bg-gray-700 text-white px-3 py-2 rounded mt-4 hover:bg-gray-600 transition duration-300"
            >
              Check Status
            </button>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-center py-4">
        <p className="text-gray-400">
          &#169; {new Date().getFullYear()} 21Chess. Made with &#10084;&#65039;
          by 21Cash.{" "}
          <a
            href="https://link-to-source-code"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Source Code
          </a>
        </p>
      </footer>
    </div>
  );
};

export default EnterPage;
