import React, { useState, useRef, useContext, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { GameContext, SocketContext, UserContext } from "../Context";
import moveSoundEffect from "../media/Move.mp3";
import captureSoundEffect from "../media/Capture.mp3";
import gameEndSoundEffect from "../media/GameEnd.mp3";
import drawSoundEffect from "../media/Draw.mp3";

const buttonStyle = {
  cursor: "pointer",
  padding: "10px 20px",
  margin: "10px 10px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "none",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};

const inputStyle = {
  padding: "10px 20px",
  margin: "10px 0 10px 0",
  borderRadius: "6px",
  border: "none",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};

const boardWrapper = {
  width: `80vw`,
  maxWidth: "80vh",
  margin: "3rem auto",
};
const Game = () => {
  const [game, setGame] = useState(new Chess());
  const [opponentMoveInput, setOpponentMoveInput] = useState("");
  const chessboardRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const { gameContext, setGameContext } = useContext(GameContext);
  const { username } = useContext(UserContext);
  const [moveSound] = useState(new Audio(moveSoundEffect));
  const [captureSound] = useState(new Audio(captureSoundEffect));
  const [gameEndSound] = useState(new Audio(gameEndSoundEffect));
  const [drawSound] = useState(new Audio(drawSoundEffect));
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [myTime, setMyTime] = useState(0);
  const [opponentTime, setOpponentTime] = useState(0);
  const [lastMoveSquares, setLastMoveSquares] = useState([]);
  const myColor = gameContext.myColor;
  let toMakeMoveColor = myColor;
  let opponentUsername;
  let interval;

  const safeGameMutate = (modify) => {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  };

  const handleMoveSound = async (moveObj) => {
    const isCapture = moveObj.flags.includes("c");
    const isCheckmate = moveObj.san.includes("#");
    if (isCheckmate) {
      gameEndSound.play();
    } else if (isCapture) {
      captureSound.play();
    } else {
      moveSound.play();
    }
  };

  const updateTimers = (whiteTimerInMs, blackTimeInMs) => {
    if (myColor == "w") {
      setMyTime(whiteTimerInMs);
      setOpponentTime(blackTimeInMs);
    } else {
      setMyTime(blackTimeInMs);
      setOpponentTime(whiteTimerInMs);
    }
    clearInterval(interval);
    interval = setInterval(() => {
      if (myColor == toMakeMoveColor) {
        setMyTime((prevTime) => Math.max(prevTime - 1000, 0));
      } else {
        setOpponentTime((prevTime) => Math.max(prevTime - 1000, 0));
      }
    }, 1000);
  };

  useEffect(() => {
    console.log(`Use Effect Being Called`);
    // This is Hot Fix, May not work in future,
    // TODO : Send Full Game State Through Server
    setGame(new Chess());
    setGameHasStarted(false);

    socket.on("moveMessage", (data) => {
      setGameHasStarted(true);
      const {
        senderId,
        gameString,
        senderName,
        color,
        moveObj,
        blackTime,
        whiteTime,
      } = data;
      console.log(`Move received => ${moveObj.san}`);
      toMakeMoveColor = color == "w" ? "b" : "w";
      console.log(
        `${getTimeFormattedString(whiteTime)}, ${getTimeFormattedString(
          blackTime
        )}`
      );
      updateTimers(whiteTime, blackTime);
      if (senderId == socket.id) return; // Ignore self Moves

      console.log(moveObj);

      const opponentMove = moveObj;
      safeGameMutate((game) => {
        const move = game.move(opponentMove);
        if (move !== null) {
          // Handle valid move
        } else {
          console.log("Invalid move");
        }
      });

      handleMoveSound(moveObj);
      setLastMoveSquaresTo([moveObj.from, moveObj.to]);

      return () => clearInterval(interval);
    });
    socket.on("startGame", (gameData) => {
      console.log("Game Started.");
      const { whiteName, blackName } = gameData;
      let opponentName;
      if (username == whiteName) {
        opponentName = blackName;
      } else opponentName = whiteName;
      setGameContext({ ...gameContext, opponent: opponentName });
      setGameHasStarted(true);
      console.log(`Opponent : ${opponentName}`);
      opponentUsername = opponentName;
    });

    socket.on("endGame", (resultData) => {
      const { isDraw, winColor, winnerName, cause, pgn } = resultData;
      console.log(resultData);
      if (isDraw) {
        setGameContext({
          ...gameContext,
          result: "Draw",
          opponent: opponentUsername,
          pgn,
        });
        drawSound.play();
      } else {
        setGameContext({
          ...gameContext,
          result: `${winnerName} Won By ${cause}`,
          opponent: opponentUsername,
          pgn,
        });
        gameEndSound.play();
      }
      clearInterval(interval);
    });
  }, []);

  const onClickResign = () => {
    if (!gameHasStarted) return;
    socket.emit("resign");
  };

  const setLastMoveSquaresTo = (squares) => {
    const hightlightSquares = Object.fromEntries(
      squares.map((item) => [item, { background: "rgba(144, 238, 144, 0.90)" }])
    );
    // update last moves State
    setLastMoveSquares(hightlightSquares);
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    if (!gameHasStarted) return false; // if Game Hasnt begun, Dont make move
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });

    setGame(gameCopy);

    if (move === null) return false;

    //  const { gameString, moveString, color } = moveData;
    const moveData = {
      gameString: gameContext.gameString,
      color: myColor,
      moveObj: move,
    };
    setLastMoveSquaresTo([move.from, move.to]);
    socket.emit("sendMove", moveData);
    handleMoveSound(move);
    return true;
  };
  return (
    <div className="flex bg-gradient-to-r from-gray-800 via-gray-900 to-gray-900">
      {/* Left div for chatbox */}
      <div className="my-10 mx-5 flex-1 bg-gray-600 p-4">
        {/* Chatbox content goes here */}
      </div>

      {/* Middle div for chessboard */}
      <div className="flex-3 flex justify-center">
        <div className="pt-5" style={boardWrapper}>
          <Chessboard
            customSquareStyles={{
              ...lastMoveSquares,
            }}
            id="PremovesEnabled"
            arePremovesAllowed={true}
            position={game.fen()}
            isDraggablePiece={({ piece }) => piece[0] === myColor[0]}
            onPieceDrop={onDrop}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
            ref={chessboardRef}
            allowDragOutsideBoard={false}
            boardOrientation={myColor === "w" ? "white" : "black"}
            animationDuration={200}
          />
        </div>
      </div>
      <div className="h-2/3 self-center my-6 mx-4 flex-1  bg-gray-500 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
        <div className="text-lg font-semibold text-gray-700 mb-4">
          <div className="text-black text-4xl bg-gray-600 p-4 rounded-md pt-4 font-bold">
            {!gameHasStarted ? `?? : ??` : getTimeFormattedString(opponentTime)}
          </div>

          <div className="text-gray-900 text-3xl mb-2 font-thin mt-4">
            {gameContext.opponent !== "" ? gameContext.opponent : "Waiting..."}
          </div>

          <div className="text-base mb-2">vs</div>

          <div className="text-gray-900 text-3xl mb-4 font-thin">
            {username}
          </div>

          <div className="text-lg font-semibold text-gray-700 mt-auto">
            <div className="text-black text-4xl bg-gray-600 p-4 rounded-md font-bold">
              {!gameHasStarted ? "?? : ??" : getTimeFormattedString(myTime)}
            </div>
          </div>
        </div>

        <button
          onClick={onClickResign}
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
        >
          Resign
        </button>
      </div>
    </div>
  );
};

// Debuggine Purpose Code
const getTimeFormattedString = (timeInMs) => {
  const remainingTime = timeInMs;
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = ((remainingTime % 60000) / 1000).toFixed(0).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0"); // Adding leading zero if needed
  const timeString = `${formattedMinutes} : ${seconds}`;
  return timeString;
};

export default Game;
