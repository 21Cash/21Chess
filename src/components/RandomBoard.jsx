import React, { useState, useRef, useMemo, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import moveSoundEffect from "../media/Move.mp3";
import captureSoundEffect from "../media/Capture.mp3";
import gameEndSoundEffect from "../media/GameEnd.mp3";
import drawSoundEffect from "../media/Draw.mp3";

const boardWrapper = {
  width: `80vw`,
  maxWidth: "80vh",
  margin: "3rem auto",
};

const MOVE_TIME_DELAY = 1000;

const STARTING_POSITION_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const RandomBoard = () => {
  const [game, setGame] = useState(() => new Chess());
  const chessboardRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(STARTING_POSITION_FEN);
  const [lastMoveSquares, setLastMoveSquares] = useState([]);
  const [kingInCheckSquare, setKingInCheckSquare] = useState(null);
  const [mute, setMute] = useState(true);
  const [moveSound] = useState(new Audio(moveSoundEffect));
  const [captureSound] = useState(new Audio(captureSoundEffect));
  const [gameEndSound] = useState(new Audio(gameEndSoundEffect));
  const [drawSound] = useState(new Audio(drawSoundEffect));

  useEffect(() => {
    const interval = setInterval(() => {
      makeRandomMove();
    }, MOVE_TIME_DELAY);

    return () => {
      clearInterval(interval);
    };
  }, [game]);

  const makeMove = (_moveObj) => {
    const moveObj = game.move(_moveObj);
    setCurrentPosition(game.fen());
    if (!mute) handleMoveSound(moveObj);
    updateKingInCheckSquare();
    setLastMoveSquaresTo([moveObj.from, moveObj.to]);
  };

  const makeRandomMove = () => {
    const possibleMoves = game.moves();
    // exit if the game is over
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) {
      console.log(`Game Over`);
      setTimeout(() => {
        console.log(`Starting New Game`);
        setGame(new Chess()); // Reset the game using setGame
      }, 5000);

      return;
    }

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeMove(possibleMoves[randomIndex]);
  };

  const handleMoveSound = (moveObj) => {
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
          let curSquare = String.fromCharCode(file) + rank;
          const squareDetails = game.get(curSquare);
          if (
            squareDetails &&
            squareDetails.type === "k" &&
            squareDetails.color === checkedColor
          ) {
            kingSquare = curSquare;
            break;
          }
        }
      }
      setKingInCheckSquare({
        [kingSquare]: {
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, #FF0000, #FFDAB9 100%)",
        },
      });
    } else {
      setKingInCheckSquare(null);
    }
  };

  const setLastMoveSquaresTo = (squares) => {
    const highlightSquares = Object.fromEntries(
      squares.map((item) => [item, { background: "rgba(144, 238, 144, 0.90)" }])
    );
    // update last moves State
    setLastMoveSquares(highlightSquares);
  };

  return (
    <div style={boardWrapper}>
      <Chessboard
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
        animationDuration={200}
      />
    </div>
  );
};

export default RandomBoard;
