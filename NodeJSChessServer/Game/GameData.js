"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameData = void 0;
const BoardData_1 = require("../ChessBoard/BoardData");
class GameData {
    constructor(gameid, board) {
        this.Board = new BoardData_1.BoardData(); //Type Board
        this.GameId = gameid;
        this.Board = board;
    }
    PickFirstPlayer(players) {
        //this.StartingPlayer =  players[getRandomInt(players.length)].BasicUserInfo.Id;
        this.StartingPlayer = players[0].BasicUserInfo.Id;
    }
}
exports.GameData = GameData;
//# sourceMappingURL=GameData.js.map