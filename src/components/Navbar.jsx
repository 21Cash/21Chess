import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../Context";

function Button({ text, bg, padding }) {
  return (
    <div>
      <button
        className={`
          ${padding || "px-6 py-2"} text-sm font-semibold uppercase 
          rounded-sm text-white transition ${bg}`}
      >
        <span>{text}</span>
      </button>
    </div>
  );
}

function Navbar() {
  const { username } = useContext(UserContext);
  return (
    <div className="fixed left-0 right-0 top-0 h-16 shadow-md border-b-2 border-gray-100 bg-gray-900">
      <nav className="flex items-center container mx-auto h-full justify-between">
        <Link to="/">
          <h1 className="font-semibold uppercase text-2xl text-gray-200">
            21Chess
          </h1>
        </Link>

        <div>
          <ul className="flex items-center space-x-10 text-sm">
            <li>
              <Link to="/" className="text-gray-400 hover:text-gray-100">
                Home
              </Link>
            </li>
            <li>
              <Link to="/Join" className="text-gray-400 hover:text-gray-100">
                Join Game
              </Link>
            </li>
            <li>
              <Link to="/docs" className="text-gray-400 hover:text-gray-100">
                Docs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          {username && (
            <Button
              text={username}
              bg="bg-gradient-to-r from-purple-500 to-blue-500"
            />
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
