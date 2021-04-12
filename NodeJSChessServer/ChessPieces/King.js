"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.King = void 0;
const util_1 = require("util");
const BoardData_1 = require("../ChessBoard/BoardData");
const PieceMoveData_1 = require("../Game/PieceMoveData");
const Direction_1 = require("../Movement/Direction");
const ChessPieceData_1 = require("./ChessPieceData");
class King extends ChessPieceData_1.ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.hasMoved = false;
    }
    ValidateMove(source, target) {
        let isMoveValid = false;
        isMoveValid = this.CanCastle(target, source);
        let requestedDistance = BoardData_1.BoardData.GetCellDistance(source, target);
        if (!isMoveValid && requestedDistance == 1) {
            isMoveValid = true;
        }
        if (!isMoveValid && target.ChessPiece != null && target.DoesCellHaveEnemyPiece(this.PlayerId)) {
            isMoveValid = true;
        }
        console.log("%s class validate move", typeof (this));
        this.hasMoved = true;
        return isMoveValid;
    }
    CanCastle(targetCell, startingCell) {
        if (!this.hasMoved && targetCell.x == 7 || targetCell.x == 0) {
            let direction = new Direction_1.Direction(targetCell.x - startingCell.x, targetCell.y - startingCell.y);
            if (targetCell.ChessPiece != null) {
                this.rook = targetCell.ChessPiece;
            }
            if (!util_1.isNullOrUndefined(this.rook) && !this.rook.HasMoved() && this.CheckPath(direction, startingCell, 2)) {
                return true;
            }
        }
        return false;
    }
    CastleMove(board) {
        let sourceCell = board.GetCellDataByChessPieceId(this.ChessPieceId);
        this.castleCell.ChessPiece = this;
        sourceCell.ChessPiece = null;
        let data = new PieceMoveData_1.PieceMoveData(0, 0, 0, "", "");
        data.Id = this.ChessPieceId;
        data.PlayerId = this.PlayerId;
        data.X = this.castleCell.x;
        data.Y = this.castleCell.y;
        return data;
    }
    SetCastleDestinations(source, target, board) {
        let direction = new Direction_1.Direction(target.x - source.x, target.y - source.y);
        let newKingCell = board.GetCellDataByPosition(source.x + 2 * direction.directionX, source.y);
        let newRookCell = board.GetCellDataByPosition(newKingCell.x + 1 * (-direction.directionX), newKingCell.y);
        source.ChessPiece.castleCell = newKingCell;
        target.ChessPiece.SetCastleCell(newRookCell);
    }
    CheckPath(direction, startingCell, distance) {
        let currentPositionX = startingCell.x;
        let currentPositionY = startingCell.y;
        let Currentcell;
        for (var i = 1; i <= distance; i++) {
            currentPositionX += direction.directionX;
            currentPositionY += direction.directionY;
            Currentcell = this.boardParent.AllCells[currentPositionX][currentPositionY];
            if (distance != i && Currentcell.ChessPiece != null) {
                return false;
            }
        }
        return true;
    }
    Copy() {
        let clone = new King(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        clone.hasMoved = this.hasMoved;
        clone.rook = this.rook;
        return clone;
    }
}
exports.King = King;
//# sourceMappingURL=King.js.map