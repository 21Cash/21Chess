import { createContext } from "react";

export const SocketContext = createContext(null);
export const UserContext = createContext(null);
export const GameContext = createContext(null);
export const SpectateContext = createContext(null); // {whiteName, blackName, gameString, fen, whiteTime, blackTime}
