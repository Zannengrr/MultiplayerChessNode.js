"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHistory = void 0;
const BoardData_1 = require("../ChessBoard/BoardData");
class GameHistory {
    constructor(gameid) {
        this.Board = new BoardData_1.BoardData();
        this.MoveHistory = [];
        this.GameId = gameid;
    }
}
exports.GameHistory = GameHistory;
//# sourceMappingURL=GameHistory.js.map