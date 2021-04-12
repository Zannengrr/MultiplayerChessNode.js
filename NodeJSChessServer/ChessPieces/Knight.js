"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Knight = void 0;
const ChessPieceData_1 = require("./ChessPieceData");
class Knight extends ChessPieceData_1.ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
    }
    ValidateMove(source, target) {
        let distanceX = target.x - source.x;
        let distanceY = target.y - source.y;
        if (!((Math.abs(distanceX) == 2 && Math.abs(distanceY) == 1) || (Math.abs(distanceX) == 1 && (Math.abs(distanceY) == 2)))) {
            return false;
        }
        if (target.ChessPiece != null && !target.DoesCellHaveEnemyPiece(this.PlayerId)) {
            return false;
        }
        console.log("%s class validate move", typeof (this));
        return true;
    }
    Copy() {
        let clone = new Knight(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Knight = Knight;
//# sourceMappingURL=Knight.js.map