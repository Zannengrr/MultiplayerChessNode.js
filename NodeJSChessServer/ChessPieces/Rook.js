"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rook = void 0;
const PieceMoveData_1 = require("../Game/PieceMoveData");
const Direction_1 = require("../Movement/Direction");
const ChessPieceData_1 = require("./ChessPieceData");
class Rook extends ChessPieceData_1.ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.hasMoved = false;
        this.allowedDirection = [new Direction_1.Direction(1, 0), new Direction_1.Direction(-1, 0), new Direction_1.Direction(0, 1), new Direction_1.Direction(0, -1)];
    }
    ValidateMove(source, target) {
        let succes = super.ValidateMove(source, target);
        if (succes) {
            this.hasMoved = true;
        }
        return succes;
    }
    HasMoved() {
        return this.hasMoved;
    }
    SetCastleCell(cell) {
        this.castleCell = cell;
    }
    CastleMove(board) {
        let sourceCell = board.GetCellDataByChessPieceId(this.ChessPieceId);
        //let rookClone: ChessPieceData = this.Copy();
        this.castleCell.ChessPiece = this;
        sourceCell.ChessPiece = null;
        let data = new PieceMoveData_1.PieceMoveData(0, 0, 0, "", "");
        data.Id = this.ChessPieceId;
        data.PlayerId = this.PlayerId;
        data.X = this.castleCell.x;
        data.Y = this.castleCell.y;
        return data;
    }
    Copy() {
        let clone = new Rook(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        clone.hasMoved = this.hasMoved;
        return clone;
    }
}
exports.Rook = Rook;
//# sourceMappingURL=Rook.js.map