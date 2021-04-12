"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queen = void 0;
const Direction_1 = require("../Movement/Direction");
const ChessPieceData_1 = require("./ChessPieceData");
class Queen extends ChessPieceData_1.ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.allowedDirection =
            [
                new Direction_1.Direction(1, 1), new Direction_1.Direction(-1, -1), new Direction_1.Direction(1, -1), new Direction_1.Direction(-1, 1),
                new Direction_1.Direction(1, 0), new Direction_1.Direction(-1, 0), new Direction_1.Direction(0, 1), new Direction_1.Direction(0, -1)
            ];
    }
    Copy() {
        let clone = new Queen(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Queen = Queen;
//# sourceMappingURL=Queen.js.map