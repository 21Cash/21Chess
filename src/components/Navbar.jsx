import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { SocketContext, UserContext } from "../Context";
import { useNavigate } from "react-router-dom";

function Button({ text, bg, padding }) {
  return (
    <div>
      <button
        className={`
          ${padding || "px-6 py-2"} text-sm font-semibold  
          rounded-sm text-white transition ${bg}`}
      >
        <span>{text}</span>
      </button>
    </div>
  );
}

function Navbar() {
  const { username, setUsername } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const navigate = useNavigate();

  const goEnterPage = () => {
    socket.disconnect();
    setUsername("");
    navigate("/");
    window.location.reload();
  };
  return (
    <div className="flex justify-center z-10 fixed left-0 right-0 top-0 h-16 shadow-md border-b-2 border-gray-100 bg-gradient-to-r from-gray-900 to-gray-600">
      <nav className="flex items-center justify-between w-full px-5">
        {" "}
        {/* Added "justify-between" here */}
        <div className="flex items-center">
          {/* Left side elements */}
          <Link to="/" onClick={goEnterPage} className="flex items-center">
            <h1 className="font-semibold uppercase text-2xl hover:text-blue-500 transition duration-300 ease-in-out text-gray-200">
              21Chess
            </h1>
          </Link>
          <ul className="flex items-center space-x-10 text-sm ml-8">
            {/* Nav links */}
            {username && (
              <>
                <li>
                  <Link
                    to="/LiveChess"
                    className="text-gray-400 transition duration-300 ease-in-out hover:text-gray-100"
                  >
                    LiveChess
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Join"
                    className="text-gray-400 transition duration-300 ease-in-out hover:text-gray-100"
                  >
                    Join Game
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="/spectatePage"
                className="text-gray-400 transition duration-300 ease-in-out hover:text-gray-100"
              >
                Spectate
              </Link>
            </li>
            <li>
              <Link
                to="/ScreenSaver"
                className="text-gray-400 transition duration-300 ease-in-out hover:text-gray-100"
              >
                Screen Saver
              </Link>
            </li>
            <li>
              <Link
                to="/About"
                className="text-gray-400 transition duration-300 ease-in-out hover:text-gray-100"
              >
                About
              </Link>
            </li>
          </ul>
        </div>
        <div className="ml-auto">
          {username && (
            <Button
              text={username}
              bg="bg-gradient-to-r from-purple-500 to-blue-500"
              padding="px-4 py-2" // Adjust padding if needed
            />
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
