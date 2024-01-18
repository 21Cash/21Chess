import React, { useState, useEffect, useRef } from "react";

const EvaluationBar = ({ positionEvaluation, colorToPlay = "w" }) => {
  const evalValue = parseFloat(positionEvaluation);
  const [percentage, setPercentage] = useState(50);

  const animationRef = useRef(null);
  const targetPercentageRef = useRef(50);

  useEffect(() => {
    if (evalValue > 20) {
      targetPercentageRef.current = 100;
    } else if (evalValue < -20) {
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

  if (colorToPlay === "w" && positionEvaluation[0] === "#") {
    // Make the bar totally white with flipped gradient
    barColor = `linear-gradient(to bottom, black ${percentage}%, white ${percentage}%)`;
  } else if (colorToPlay === "b") {
    // Make the bar totally black with flipped gradient
    barColor = `linear-gradient(to bottom, white ${percentage}%, black ${percentage}%)`;
  } else {
    // Default linear gradient
    barColor = `linear-gradient(to bottom, white ${percentage}%, black ${percentage}%)`;
  }

  const lineStyle = {
    position: "absolute",
    top: `${midpointPercentage}%`,
    left: 0,
    right: 0,
    height: "2px",
    background: "red", // You can adjust the color
  };

  return (
    <div className="flex flex-col items-center relative">
      <div className="text-xs text-green-500 font-bold mr-2">
        {positionEvaluation == 100 ? "#" : positionEvaluation}
      </div>
      <div
        style={{ background: barColor }}
        className="h-[80vh] w-4 border rounded-md overflow-hidden relative"
      >
        <div style={lineStyle}></div>
      </div>
    </div>
  );
};

export default EvaluationBar;
