import React from "react";
import RandomBoard from "../components/RandomBoard";

const ScreenSaver = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <RandomBoard />
    </div>
  );
};

export default ScreenSaver;
