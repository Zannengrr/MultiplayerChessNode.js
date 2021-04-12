"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bishop = void 0;
const Direction_1 = require("../Movement/Direction");
const ChessPieceData_1 = require("./ChessPieceData");
class Bishop extends ChessPieceData_1.ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.allowedDirection = [new Direction_1.Direction(1, 1), new Direction_1.Direction(-1, -1), new Direction_1.Direction(1, -1), new Direction_1.Direction(-1, 1)];
    }
    Copy() {
        let clone = new Bishop(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Bishop = Bishop;
//# sourceMappingURL=Bishop.js.map