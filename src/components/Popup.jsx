import React, { useContext, useEffect, useRef, useState } from "react";
import { GameContext, UserContext } from "../Context";

const Popup = ({ handleClose }) => {
  const { gameContext } = useContext(GameContext);
  const { username } = useContext(UserContext);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg" style={{ width: "80%" }}>
        <h2 className="text-3xl font-bold mb-4">{gameContext.result}</h2>
        <p className="text-lg mb-4">
          {username} vs {gameContext.opponent}
        </p>
        <button
          onClick={handleClose}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-3"
        >
          Close
        </button>

        <DownloadButton
          pgnString={gameContext.pgn}
          fileName={`${username}vs${gameContext.opponent}.pgn`}
        />

        <CopyPGNButton pgn={gameContext.pgn} />
      </div>
    </div>
  );
};

const DownloadButton = ({ pgnString, fileName }) => {
  const downloadFile = () => {
    console.log(`PGN : ${pgnString}`);
    const blob = new Blob([pgnString], { type: "text/plain" });
    const fileURL = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName;

    link.click();

    URL.revokeObjectURL(fileURL);
  };

  return (
    <button
      onClick={downloadFile}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3"
    >
      Download PGN
    </button>
  );
};

const CopyPGNButton = ({ pgn }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pgn);
    setCopied(true);
  };

  useEffect(() => {
    let timer;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      onClick={copyToClipboard}
      className={`bg-blue-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded ${
        copied ? "bg-green-500" : ""
      }`}
    >
      {copied ? "Copied!" : "Copy PGN"}
    </button>
  );
};

export default Popup;
