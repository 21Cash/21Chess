import React, { useState, useRef, useContext, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { GameContext, SocketContext, UserContext } from "../Context";
import moveSoundEffect from "../media/Move.mp3";
import captureSoundEffect from "../media/Capture.mp3";
import gameEndSoundEffect from "../media/GameEnd.mp3";

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
  const [canMakeMoves, setCanMakeMoves] = useState(false);

  const [lastMoveSquares, setLastMoveSquares] = useState([]);
  const myColor = gameContext.myColor;
  let opponentUsername;

  const handleMoveSound = async () => {
    let captureMove = false;
    if (game.history({ verbose: true }) == null) captureMove = false;
    else captureMove = game.history({ verbose: true }).splice(-1)[0]?.captured;
    if (game.game_over()) {
      gameEndSound.play();
    } else if (captureMove) {
      captureSound.play();
    } else {
      moveSound.play();
    }
  };

  useEffect(() => {
    console.log(`Use Effect Being Called`);
    // This is Hot Fix, May not work in future,
    // TODO : Send Full Game State Through Server
    setGame(new Chess());

    socket.on("moveMessage", (data) => {
      const { senderId, gameString, senderName, color, moveObj } = data;
      console.log(`Move received => ${moveObj.san}`);
      if (senderId == socket.id) return; // Ignore self Moves

      const opponentMove = moveObj;
      safeGameMutate((game) => {
        const move = game.move(opponentMove);
        if (move !== null) {
          // Handle valid move
        } else {
          console.log("Invalid move");
        }
      });

      handleMoveSound();
      setLastMoveSquaresTo([moveObj.from, moveObj.to]);
    });
    socket.on("startGame", (gameData) => {
      console.log("Game Started.");
      const { whiteName, blackName } = gameData;
      let opponentName;
      if (username == whiteName) {
        opponentName = blackName;
      } else opponentName = whiteName;
      setGameContext({ ...gameContext, opponent: opponentName });
      setCanMakeMoves(true);
      console.log(`Opponent : ${opponentName}`);
      opponentUsername = opponentName;
    });

    socket.on("endGame", (resultData) => {
      const { isDraw, winColor, winnerName } = resultData;
      console.log(resultData);
      if (isDraw) {
        setGameContext({
          ...gameContext,
          result: "Draw",
          opponent: opponentUsername,
        });
      } else {
        setGameContext({
          ...gameContext,
          result: `Checkmate, ${winnerName} Won`,
          opponent: opponentUsername,
        });
      }
    });
  }, []);

  const safeGameMutate = (modify) => {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  };

  const setLastMoveSquaresTo = (squares) => {
    const hightlightSquares = Object.fromEntries(
      squares.map((item) => [item, { background: "lightgreen" }])
    );
    // update last moves State
    setLastMoveSquares(hightlightSquares);
  };

  const handleOpponentMoveInput = () => {
    const opponentMove = opponentMoveInput.trim();

    safeGameMutate((game) => {
      const move = game.move(opponentMove);
      if (move !== null) {
        // Handle valid move
      } else {
        console.log("Invalid move");
      }
    });

    setOpponentMoveInput("");
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    if (!canMakeMoves) return false; // if Game Hasnt begun, Dont make move
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
    // moveSound.play();
    handleMoveSound();
    return true;
  };
  return (
    <div className="flex">
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

      {/* Right div for game information */}
      <div className="my-48 mx-10 flex-1 bg-gray-500 rounded-2xl p-4 flex flex-col justify-center items-center">
        <div className="text-gray-900  text-4xl font-bold mb-2">
          {/* Display opponent's name in big font */}
          {gameContext.opponent != "" ? gameContext.opponent : "Waiting..."}
        </div>
        <div className="text-sm mb-2">
          {/* Small 'vs' text */}
          vs
        </div>
        <div className="text-gray-900 text-4xl font-bold">
          {/* Display username in big font */}
          {username}
        </div>
      </div>
    </div>
  );
};

export default Game;
