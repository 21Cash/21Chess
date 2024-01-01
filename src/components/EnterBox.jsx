import React, { useContext, useState } from "react";
import { SocketContext } from "../Context";
import { UserContext } from "../Context";
import { useNavigate } from "react-router-dom";

const EnterBox = () => {
  const [name, setName] = useState("");
  const { socket } = useContext(SocketContext);
  const { username, setUsername } = useContext(UserContext);
  const navigate = useNavigate();
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

  return (
    <div className="bg-gray-900 text-white p-10 m-1 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">Enter</h1>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-1">
          Name:
        </label>
        <input
          type="text"
          id="name"
          className="w-full bg-gray-800 text-white rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:border-blue-300"
        onClick={handleEnter}
      >
        Enter
      </button>
    </div>
  );
};

export default EnterBox;
