import React, { useState, useRef, useMemo, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { SpectateContext, SocketContext, GameContext } from "../Context";
import ChatBox from "../components/ChatBox";
import moveSoundEffect from "../media/Move.mp3";
import captureSoundEffect from "../media/Capture.mp3";
import gameEndSoundEffect from "../media/GameEnd.mp3";
import drawSoundEffect from "../media/Draw.mp3";
import AutoEvaluationBar from "../components/AutoEvaluationBar";
import {
  darkSquareStyle,
  kingCheckStyles,
  lastMoveStyles,
  lightSquareStyle,
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
  width: `85vw`,
  maxWidth: "85vh",
  margin: "3rem auto",
};

const STARTING_POSITION_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const SpectateGame = () => {
  const [curGameString, setCurGameString] = useState(useParams().gameString);
  const game = useMemo(() => new Chess(), []);
  const [opponentMoveInput, setOpponentMoveInput] = useState("");
  const chessboardRef = useRef(null);
  const { spectateContext } = useContext(SpectateContext);
  const { gameContext, setGameContext } = useContext(GameContext);
  const { socket } = useContext(SocketContext);

  const whiteName = spectateContext.whiteName;
  const blackName = spectateContext.blackName;
  const [currentPosition, setCurrentPosition] = useState(
    spectateContext && spectateContext.fen
      ? spectateContext.fen
      : STARTING_POSITION_FEN
  );

  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [myTime, setMyTime] = useState(spectateContext.whiteTime);
  const [opponentTime, setOpponentTime] = useState(spectateContext.blackTime);
  const [lastMoveSquares, setLastMoveSquares] = useState([]);
  const [kingInCheckSquare, setKingInCheckSquare] = useState(null);
  const [resultText, setResultText] = useState("");

  const myColor = "w";
  const [toMakeMoveColor, setToMakeMoveColor] = useState(myColor);
  let opponentUsername;
  let interval;

  const [moveSound] = useState(new Audio(moveSoundEffect));
  const [captureSound] = useState(new Audio(captureSoundEffect));
  const [gameEndSound] = useState(new Audio(gameEndSoundEffect));
  const [drawSound] = useState(new Audio(drawSoundEffect));

  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [bestLine, setBestline] = useState("");
  const [possibleMate, setPossibleMate] = useState("");
  const bestMove = bestLine?.split(" ")?.[0];
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

  const updateTimers = (whiteTimerInMs, blackTimeInMs, toMoveColor) => {
    if (myColor == "w") {
      setMyTime(whiteTimerInMs);
      setOpponentTime(blackTimeInMs);
    } else {
      setMyTime(blackTimeInMs);
      setOpponentTime(whiteTimerInMs);
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

  useEffect(() => {
    console.log(`Use Effect Being Called`);
    setResultText("");
    // This is Hot Fix, May not work in future,
    // TODO : Send Full Game State Through Server
    setGameHasStarted(false);

    socket.on("moveMessage", (data) => {
      setResultText("");
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
      } = data;

      console.log(`Move received => ${moveObj.san}`);
      setToMakeMoveColor(color == "w" ? "b" : "w");
      updateTimers(whiteTime, blackTime, moveObj.color == "w" ? "b" : "w");

      // Update game, so that we can know checks
      game.load(fen);
      setCurrentPosition(fen);

      handleMoveSound(moveObj);
      setLastMoveSquaresTo([moveObj.from, moveObj.to]);
      updateKingInCheckSquare();

      setPossibleMate("");
      setBestline("");

      return () => clearInterval(intervalRef.current);
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
    });
  }, []);

  const setLastMoveSquaresTo = (squares) => {
    const hightlightSquares = Object.fromEntries(
      squares.map((item) => [item, lastMoveStyles])
    );
    // update last moves State
    setLastMoveSquares(hightlightSquares);
  };
  return (
    <div className="h-auto flex flex-col sm:flex-row bg-gradient-to-r from-gray-800 via-gray-900 to-gray-900">
      <div className="h-[85vh] w-[90vw] sm:w-1/4 order-last sm:order-first mt-10 mb-14 mx-5 flex-1 bg-gray-700 p-4">
        <ChatBox roomName={curGameString} />
      </div>

      <div className="flex-3 sm:ml-8 flex justify-center">
        <div style={boardWrapper}>
          <Chessboard
            customArrows={
              bestMove && [
                [
                  bestMove.substring(0, 2),
                  bestMove.substring(2, 4),
                  "rgb(0, 128, 0)",
                ],
              ]
            }
            customDarkSquareStyle={darkSquareStyle}
            customLightSquareStyle={lightSquareStyle}
            customSquareStyles={{
              ...lastMoveSquares,
              ...kingInCheckSquare,
            }}
            position={currentPosition}
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
        <div className="my-12 mr-3 ml-8 flex-1 ">
          <AutoEvaluationBar
            fen={currentPosition}
            onBestLineFound={setBestline}
          />
        </div>
      </div>

      <div className="h-3/5 self-center my-6 mx-4 flex-1  bg-gray-500 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
        <div className="text-lg font-semibold text-gray-700 mb-4">
          <div className="text-black text-4xl bg-gray-600 p-4 rounded-md pt-4 font-bold">
            {getTimeFormattedString(opponentTime)}
          </div>

          <div className="text-gray-900 text-3xl mb-2 font-thin mt-4">
            {blackName}
          </div>

          <div className="text-base mb-2">vs</div>

          <div className="text-gray-900 text-3xl mb-4 font-thin">
            {whiteName}
          </div>

          <div className="text-lg font-semibold text-gray-700 mt-auto">
            <div className="text-black text-4xl bg-gray-600 p-4 rounded-md font-bold">
              {getTimeFormattedString(myTime)}
            </div>
            {resultText && (
              <div className="bg-gray-800 py-2 px-6 my-3 rounded-md text-white ">
                {resultText}
              </div>
            )}
          </div>
        </div>
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

export default SpectateGame;
