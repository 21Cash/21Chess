import React, { useState, useRef, useMemo, useContext, useEffect } from "react";
import { Chess } from "chess.js";
import { useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { GameContext, SocketContext, UserContext } from "../Context";
import moveSoundEffect from "../media/Move.mp3";
import captureSoundEffect from "../media/Capture.mp3";
import gameEndSoundEffect from "../media/GameEnd.mp3";
import drawSoundEffect from "../media/Draw.mp3";
import ChatBox from "../components/ChatBox";
import AutoEvaluationBar from "../components/AutoEvaluationBar";
import {
  lastMoveStyles,
  customPremoveDarkSquareStyle,
  customPremoveLightSquareStyle,
  darkSquareStyle,
  lightSquareStyle,
  kingCheckStyles,
} from "../constants";
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

const STARTING_POSITION_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const Game = () => {
  const game = useMemo(() => new Chess(), []);
  const [currentPosition, setCurrentPosition] = useState(STARTING_POSITION_FEN);
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
  const [kingInCheckSquare, setKingInCheckSquare] = useState(null);
  const [possibleMovesSquares, setPossibleMoveSquares] = useState(null);
  const [showRematch, setShowRematch] = useState(false);
  const [myColor, setMyColor] = useState("w");
  const [toMakeMoveColor, setToMakeMoveColor] = useState("w");
  const [moveFromSquare, setMoveFromSquare] = useState("");
  const [resultText, setResultText] = useState("");
  const [evalGame, setEvalGame] = useState(false);
  let opponentUsername;

  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (myColor === toMakeMoveColor) {
        setMyTime((prevTime) => Math.max(prevTime - 1000, 0));
      } else {
        setOpponentTime((prevTime) => Math.max(prevTime - 1000, 0));
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [toMakeMoveColor]);
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

  const updateKingInCheckSquare = () => {
    const checkedColor = game.turn();
    if (game.in_check()) {
      let kingSquare = null;
      for (let file = "a".charCodeAt(0); file <= "h".charCodeAt(0); file++) {
        for (let rank = 1; rank <= 8; rank++) {
          let curSqaure = String.fromCharCode(file) + rank;
          const squareDetails = game.get(curSqaure);
          if (
            squareDetails &&
            squareDetails.type == "k" &&
            squareDetails.color == checkedColor
          ) {
            kingSquare = curSqaure;
            break;
          }
        }
      }
      setKingInCheckSquare({
        [kingSquare]: kingCheckStyles,
      });
    } else {
      setKingInCheckSquare(null);
    }
  };

  const makeMove = (fromSquare, toSquare) => {
    const moveObj = { from: fromSquare, to: toSquare };
    const res = game.move(moveObj);
    if (!res) return;

    // Emit
    const moveData = {
      gameString: gameContext.gameString,
      color: myColor,
      moveObj: res,
    };

    socket.emit("sendMove", moveData);

    setCurrentPosition(game.fen());
    handleMoveSound(res);
    setLastMoveSquaresTo([res.from, res.to]);
    setPossibleMoveSquares([]);
    setMoveFromSquare(null);
    updateKingInCheckSquare();
  };

  useEffect(() => {
    console.log(`Use Effect Being Called`);
    // This is Hot Fix, May not work in future,
    // TODO : Send Full Game State Through Server
    setGameHasStarted(false);
    game.load(STARTING_POSITION_FEN);
    setShowRematch(false);
    setResultText("");
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
        fen,
        whiteName,
        blackName,
      } = data;

      setToMakeMoveColor(moveObj.color == "w" ? "b" : "w");

      // TODO : Fix the Timer BUG
      const localColor = username == whiteName ? "w" : "b"; // Its myColor basically, this is a bug hot fix ,

      // Updating Timers
      if (localColor == "w") {
        setMyTime(whiteTime);
        setOpponentTime(blackTime);
      } else {
        setMyTime(blackTime);
        setOpponentTime(whiteTime);
      }

      setMyColor(localColor);

      if (senderId == socket.id) return; // Ignore self Moves

      game.move(moveObj);
      setCurrentPosition(game.fen());

      handleMoveSound(moveObj);
      setLastMoveSquaresTo([moveObj.from, moveObj.to]);
      updateKingInCheckSquare();
      return () => clearInterval(intervalRef.current);
    });
    socket.on("startGame", (gameData) => {
      console.log("Start Game From Server.");
      const {
        whiteName,
        blackName,
        totalTimeInSecs,
        incrementTimeInSecs,
        gameString,
        evalGame,
      } = gameData;

      console.log(gameData);
      setResultText("");
      setEvalGame(evalGame);
      let opponentName;
      if (username == whiteName) {
        opponentName = blackName;
      } else opponentName = whiteName;
      console.log(`USERNAME : ${username}`);
      const newColor = username == whiteName ? "w" : "b";
      setMyColor(newColor);
      setGameContext({
        ...gameContext,
        opponent: opponentName,
        totalTimeInSecs,
        incrementTimeInSecs,
        gameString,
        myColor: newColor,
      });
      setGameHasStarted(true);
      console.log(`Opponent : ${opponentName}`);
      opponentUsername = opponentName;
      game.load(STARTING_POSITION_FEN);
      setCurrentPosition(STARTING_POSITION_FEN);
      setShowRematch(false);
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

      if (isDraw) {
        setResultText("Draw • 1/2 - 1/2");
      } else if (winColor == "w") {
        setResultText("White is Victorious • 1-0");
      } else {
        setResultText("Black is Victorious • 0-1");
      }
      clearInterval(intervalRef.current);
      setShowRematch(true);
    });

    return () => {
      socket.off("moveMessage");
      socket.off("startGame");
      socket.off("endGame");
    };
  }, []);

  const onClickResign = () => {
    if (!gameHasStarted) return;
    socket.emit("resign");
  };

  const onClickRematch = () => {
    const reqData = {
      targetName: gameContext.opponent,
      totalTimeInSecs: gameContext.totalTimeInSecs || 3,
      incrementTimeInSecs: gameContext.incrementTimeInSecs || 0,
    };
    socket.emit("gameRequest", reqData);
  };

  const setLastMoveSquaresTo = (squares) => {
    const hightlightSquares = Object.fromEntries(
      squares.map((item) => [item, lastMoveStyles])
    );
    // update last moves State
    setLastMoveSquares(hightlightSquares);
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    if (!gameHasStarted) return false; // if Game Hasnt begun, Dont make move
    setPossibleMoveSquares(null);
    const moveObject = {
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    };
    const move = game.move(moveObject);

    setCurrentPosition(game.fen());

    if (move === null) return false;

    //  const { gameString, moveString, color } = moveData;
    const moveData = {
      gameString: gameContext.gameString,
      color: myColor,
      moveObj: moveObject,
    };
    setLastMoveSquaresTo([move.from, move.to]);
    updateKingInCheckSquare();
    socket.emit("sendMove", moveData);
    handleMoveSound(move);
    return true;
  };

  const getMoveOptions = (square) => {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      // setOptionSquares({});
      return false;
    }

    const newSquares = {};

    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });

    newSquares[square] = {
      background: "rgba(167, 243, 208, 0.6)",
    };
    setPossibleMoveSquares(newSquares);

    // Set Start Square
    setMoveFromSquare(square);
    return true;
  };

  const onPieceDragBegin = (piece, sourceSquare) => {
    getMoveOptions(sourceSquare);
  };

  const onSquareClick = (square) => {
    if (moveFromSquare && moveFromSquare == square) {
      setMoveFromSquare(null);
      setPossibleMoveSquares([]);
      return;
    }

    if (game.get(square) != null && game.get(square).color == myColor) {
      getMoveOptions(square);
      return;
    }

    if (possibleMovesSquares && possibleMovesSquares.hasOwnProperty(square)) {
      makeMove(moveFromSquare, square);
    }
  };

  const onSquareRightClick = (square) => {
    setPossibleMoveSquares([]);
    setMoveFromSquare(null);
  };

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-r from-gray-800 via-gray-900 to-gray-900">
      <div className="h-[85vh] w-[90vw] sm:w-1/4 order-last  sm:order-first mt-10 mb-14 mx-5 flex-1 bg-gray-700 p-4">
        {/*Chat Room */}
        <ChatBox roomName={gameContext.gameString} />
      </div>

      {/* Middle div for chessboard */}
      <div className="flex-3 h-full flex justify-center my-auto mx-10">
        <div style={boardWrapper}>
          <Chessboard
            customDarkSquareStyle={darkSquareStyle}
            customLightSquareStyle={lightSquareStyle}
            customPremoveDarkSquareStyle={customPremoveDarkSquareStyle}
            customPremoveLightSquareStyle={customPremoveLightSquareStyle}
            customSquareStyles={{
              ...lastMoveSquares,
              ...kingInCheckSquare,
              ...possibleMovesSquares,
            }}
            id="PremovesEnabled"
            onPieceDragBegin={onPieceDragBegin}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            arePremovesAllowed={true}
            position={currentPosition}
            isDraggablePiece={({ piece }) => piece[0] === myColor[0]}
            onPieceDrop={onDrop}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
            ref={chessboardRef}
            boardOrientation={myColor == "w" ? "white" : "black"}
            animationDuration={200}
          />
        </div>
        {evalGame && (
          <div className="h-[35vh] md:h-[80vh] my-auto ml-4 md:ml-8">
            <AutoEvaluationBar
              fen={currentPosition}
              showEvaluationText={false}
              whiteAtBottom={myColor == "w"}
            />
          </div>
        )}
      </div>
      <div className="h-3/5 self-center my-6 mx-4 flex-1  bg-gray-500 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
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
        {resultText && (
          <div className="bg-gray-800 py-2 px-6 my-3 rounded-md text-white ">
            {resultText}
          </div>
        )}
        <div className="flex gap-2">
          {!showRematch && (
            <button
              onClick={onClickResign}
              className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
            >
              Resign
            </button>
          )}
          {showRematch && (
            <button
              onClick={onClickRematch}
              className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
            >
              Rematch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Debuggine Purpose Code
const getTimeFormattedString = (timeInMs) => {
  if (!timeInMs) return "00 : 00";
  const remainingTime = timeInMs;
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = ((remainingTime % 60000) / 1000).toFixed(0).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0"); // Adding leading zero if needed
  const timeString = `${formattedMinutes} : ${seconds}`;
  return timeString;
};

export default Game;
