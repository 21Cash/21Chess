import React, { useState, useRef, useContext, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { GameContext, SocketContext, UserContext } from "../Context";
import soundEffect from "../media/Move.mp3";

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
  width: `70vw`,
  maxWidth: "70vh",
  margin: "3rem auto",
};
const Game = () => {
  const [game, setGame] = useState(new Chess());
  const [opponentMoveInput, setOpponentMoveInput] = useState("");
  const chessboardRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const { gameContext, setGameContext } = useContext(GameContext);
  const { username } = useContext(UserContext);
  const [moveSound] = useState(new Audio(soundEffect));

  const myColor = gameContext.myColor;
  let canMakeMoves = false;
  let opponentUsername;

  useEffect(() => {
    socket.on("moveMessage", (data) => {
      const { senderId, gameString, senderName, color, moveObj } = data;
      console.log("Move received.");
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
      console.log(data);
    });
    socket.on("startGame", (gameData) => {
      console.log("Game Started.");
      const { whiteName, blackName } = gameData;
      canMakeMoves = true;
      let opponentName;
      if (username == whiteName) {
        opponentName = blackName;
      } else opponentName = whiteName;
      setGameContext({ ...gameContext, opponent: opponentName });
      console.log(`Opponent : ${opponentName}`);
      opponentUsername = opponentName;
    });

    socket.on("endGame", (resultData) => {
      const { isDraw, winColor, winnerName } = resultData;

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
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLowerCase() ?? "q",
    });
    setGame(gameCopy);

    if (move === null) return false;
    console.log(move);

    //  const { gameString, moveString, color } = moveData;
    const moveData = {
      gameString: gameContext.gameString,
      color: myColor,
      moveObj: move,
    };
    socket.emit("sendMove", moveData);
    moveSound.play();
    return true;
  };

  return (
    <div style={boardWrapper}>
      <Chessboard
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
      {/* <input
        style={inputStyle}
        type="text"
        placeholder="Enter opponent's move"
        value={opponentMoveInput}
        onChange={(e) => setOpponentMoveInput(e.target.value)}
      />
      <button style={buttonStyle} onClick={handleOpponentMoveInput}>
        Submit
      </button> */}
    </div>
  );
};

export default Game;
