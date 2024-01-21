// Board Colors

const lightSquareStyle = { backgroundColor: "#c8c7c8" };
const darkSquareStyle = { backgroundColor: "#71818f" };

// Board Colors ends here

// Last Move Styles
const defaultGreenStyles = {
  background: "rgba(144, 238, 144, 1)",
};

const neonGreenStyles = {
  background: "rgba(144, 238, 144, 1)",
  boxShadow: "0 0 20px 0px rgba(144, 238, 144, 1)",
};

// Neon Blue Style
const lastMoveStyles = {
  background: "rgba(0, 204, 255, 0.7)",
  boxShadow: "0 0 15px 0px rgba(0, 204, 255, 0.9)",
};

// Last Move Styles ends here

// Premove Styles

const defaultRedStyle = {
  backgroundColor: "rgb(239, 68, 68)",
};

const redGlowDarkSquare = {
  backgroundColor: "rgb(239, 68, 68)",
  boxShadow: "0 0 20px 0px rgba(255, 0, 0, 0.7)", // Darker at edges, lighter at middle
};

const redGlowLightSquare = {
  backgroundColor: "rgb(239, 68, 68)",
  boxShadow: "0 0 20px 0px rgba(255, 0, 0, 0.7)", // Darker at edges, lighter at middle
};

// Currently Used :
const customPremoveDarkSquareStyle = redGlowDarkSquare;
const customPremoveLightSquareStyle = redGlowLightSquare;

// Premove Styles ends here

// King Check Styles
const kingCheckStyles = {
  borderRadius: "50%",
  background: "radial-gradient(circle at center, #FF0000, #FFDAB9 100%)",
  boxShadow: "0 0 20px 0px rgba(255, 0, 0, 1)",
};

// King Checks Styles Ends Here

export {
  lastMoveStyles,
  customPremoveDarkSquareStyle,
  customPremoveLightSquareStyle,
  lightSquareStyle,
  darkSquareStyle,
  kingCheckStyles,
};
