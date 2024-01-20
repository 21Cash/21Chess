import React, { useState, useEffect, useRef, useMemo } from "react";
import Engine from "../../public/engine";
import { Chess } from "chess.js";

const AutoEvaluationBar = ({
  fen,
  showEvaluationText = true,
  whiteAtBottom = true,
  engineDepth = 18,
  onBestLineFound,
}) => {
  const engine = useMemo(() => new Engine(), []);
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [mateText, setMateText] = useState(null);
  const evalValue = parseFloat(positionEvaluation);
  const [percentage, setPercentage] = useState(50);
  const animationRef = useRef(null);
  const targetPercentageRef = useRef(50);

  function findBestMove(fenPosition) {
    engine.stop();
    setMateText(null);
    engine.evaluatePosition(fenPosition, engineDepth);
    const chessGame = new Chess(fenPosition);
    const toMakeMoveColor = chessGame.turn();
    engine.onMessage(
      ({
        positionEvaluation,
        possibleMate,
        pv,
        depth,
        forcedMateEvaluation,
      }) => {
        if (depth < 6) return;
        positionEvaluation &&
          setPositionEvaluation(
            ((toMakeMoveColor === "w" ? 1 : -1) * Number(positionEvaluation)) /
              100
          );

        if (forcedMateEvaluation) {
          console.log(forcedMateEvaluation);
          const playerToMoveIsLosing = forcedMateEvaluation < 0;
          let winningColor = toMakeMoveColor;
          if (playerToMoveIsLosing)
            winningColor = toMakeMoveColor == "w" ? "b" : "w";
          const curEval = winningColor == "w" ? 40 : -40;
          setPositionEvaluation(curEval);
          const text = `#${Math.abs(forcedMateEvaluation)}`;
          setMateText(text);
        }

        pv && onBestLineFound && onBestLineFound(pv);
      }
    );
  }

  useEffect(() => {
    findBestMove(fen);
  }, [fen]);

  useEffect(() => {
    if (evalValue > 40) {
      targetPercentageRef.current = 100;
    } else if (evalValue < -40) {
      targetPercentageRef.current = 0;
    } else {
      targetPercentageRef.current = 50 + (evalValue / 3) * 20;
    }
  }, [evalValue]);

  useEffect(() => {
    const animationDuration = 500; // 500 milliseconds
    const framesPerSecond = 60; // Number of frames per second
    const totalFrames = framesPerSecond * (animationDuration / 1000); // Total frames for 500 milliseconds

    let frameCount = 0;

    const animateColorChange = () => {
      frameCount++;

      const progress = frameCount / totalFrames;
      const currentPercentage =
        percentage + (targetPercentageRef.current - percentage) * progress;

      setPercentage(
        evalValue === 0 ? Math.round(currentPercentage) : currentPercentage
      );

      if (
        (evalValue > 0 && percentage < targetPercentageRef.current) ||
        (evalValue < 0 && percentage > targetPercentageRef.current)
      ) {
        animationRef.current = requestAnimationFrame(animateColorChange);
      }
    };

    // Start the animation
    animationRef.current = requestAnimationFrame(animateColorChange);

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [evalValue, percentage]);

  const midpointPercentage = 50;

  let barColor;

  barColor = `linear-gradient(to bottom, white ${percentage}%, black ${percentage}%)`;

  const lineStyle = {
    position: "absolute",
    top: `${midpointPercentage}%`,
    left: 0,
    right: 0,
    height: "2px",
    background: "red",
  };

  const barRotationStyle = whiteAtBottom ? "rotate(180deg)" : "";

  return (
    <div className="flex h-full w-2 flex-col items-center relative">
      {showEvaluationText && (
        <div className="text-xs text-green-500 font-bold ">
          {mateText != null ? mateText : positionEvaluation}
        </div>
      )}
      <div
        style={{
          background: barColor,
          transform: barRotationStyle,
        }}
        className="h-full w-4 border rounded-md overflow-hidden relative"
      >
        <div style={lineStyle}></div>
      </div>
    </div>
  );
};

export default AutoEvaluationBar;
