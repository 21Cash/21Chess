import React from "react";
import { useNavigate } from "react-router-dom";
import CreateGame from "../components/CreateGame";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex justify-center items-center bg-gray-900">
      <div className="bg-gray-800 p-4 w-1/2">
        <CreateGame />
      </div>
    </div>
  );
}

export default Home;
