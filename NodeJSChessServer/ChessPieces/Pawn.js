"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pawn = void 0;
const Enum_1 = require("../Enums/Enum");
const ChessPieceData_1 = require("./ChessPieceData");
class Pawn extends ChessPieceData_1.ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.isFirstMove = true;
        this.PawnDirection(color);
    }
    //Missing check for Passan move, expand pawn with passan bool?
    ValidateMove(source, target) {
        let isMoveValid = false;
        let distanceY = (target.y - source.y) * this.direction;
        let distanceX = (target.x - source.x);
        if (this.isFirstMove && distanceY == 2 && distanceX == 0) {
            isMoveValid = true;
        }
        if (!isMoveValid && distanceY == 1) {
            if (distanceX == 0 && target.ChessPiece == null) {
                isMoveValid = true;
            }
            if (!isMoveValid && Math.abs(distanceX) == 1 && target.DoesCellHaveEnemyPiece(this.PlayerId)) {
                isMoveValid = true;
            }
        }
        console.log("%s class validate move", typeof (this));
        if (isMoveValid) {
            this.isFirstMove = false;
        }
        return isMoveValid;
    }
    PawnDirection(color) {
        if (color === Enum_1.Side.White) {
            this.direction = 1;
            return;
        }
        this.direction = -1;
    }
    Copy() {
        let clone = new Pawn(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Pawn = Pawn;
//# sourceMappingURL=Pawn.js.map