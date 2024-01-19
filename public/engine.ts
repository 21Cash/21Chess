/*!
 * Stockfish.js (http://github.com/nmrugg/stockfish.js)
 * License: GPL
 */

/*
 * Description of the universal chess interface (UCI)  https://gist.github.com/aliostad/f4470274f39d29b788c1b09519e67372/
 */

const stockfish = new Worker("./stockfish.wasm.js");

type EngineMessage = {
  /** stockfish engine message in UCI format*/
  uciMessage: string;
  /** found best move for current position in format `e2e4`*/
  bestMove?: string;
  /** found best move for opponent in format `e7e5` */
  ponder?: string;
  /**  material balance's difference in centipawns(IMPORTANT! stockfish gives the cp score in terms of whose turn it is)*/
  positionEvaluation?: string;
  /** count of moves until mate */
  possibleMate?: string;
  /** the best line found */
  pv?: string;
  /** number of halfmoves the engine looks ahead */
  depth?: number;
  /** Color of the side with the forced mate ('w' for white, 'b' for black, or null if no forced mate) */
  forcedWinColor: null | "w" | "b";
};

export default class Engine {
  stockfish: Worker;
  onMessage: (callback: (messageData: EngineMessage) => void) => void;
  isReady: boolean;

  constructor() {
    this.stockfish = stockfish;
    this.isReady = false;
    this.onMessage = (callback) => {
      this.stockfish.addEventListener("message", (e) => {
        callback(this.transformSFMessageData(e));
      });
    };
    this.init();
  }

  private transformSFMessageData(e): EngineMessage {
    const uciMessage = e?.data ?? e;

    const positionEvaluation = uciMessage.match(/cp\s+(-?\d+)/)?.[1];
    const possibleMate = uciMessage.match(/mate\s+(-?\d+)/)?.[1];

    let forcedWinColor: null | "w" | "b" = null;
    if (possibleMate !== undefined) {
      if (possibleMate > 0) {
        forcedWinColor = "w"; // White is winning
      } else if (possibleMate < 0) {
        forcedWinColor = "b"; // Black is winning
      }
    }

    return {
      uciMessage,
      bestMove: uciMessage.match(/bestmove\s+(\S+)/)?.[1] ?? null,
      ponder: uciMessage.match(/ponder\s+(\S+)/)?.[1] ?? null,
      positionEvaluation: positionEvaluation ?? null,
      possibleMate: possibleMate ?? null,
      pv: uciMessage.match(/ pv\s+(.*)/)?.[1] ?? null,
      depth: Number(uciMessage.match(/ depth\s+(\S+)/)?.[1]) ?? 0,
      forcedWinColor,
    };
  }

  init() {
    this.stockfish.postMessage("uci");
    this.stockfish.postMessage("isready");
    this.onMessage(({ uciMessage }) => {
      if (uciMessage === "readyok") {
        this.isReady = true;
      }
    });
  }

  onReady(callback) {
    this.onMessage(({ uciMessage }) => {
      if (uciMessage === "readyok") {
        callback();
      }
    });
  }

  evaluatePosition(fen, depth = 12) {
    if (depth > 24) depth = 24;

    this.stockfish.postMessage(`position fen ${fen}`);
    this.stockfish.postMessage(`go depth ${depth}`);
  }

  stop() {
    this.stockfish.postMessage("stop"); // Run when searching takes too long time and stockfish will return you the bestmove of the deep it has reached
  }

  terminate() {
    this.isReady = false;
    this.stockfish.postMessage("quit"); // Run this before chessboard unmounting.
  }
}
