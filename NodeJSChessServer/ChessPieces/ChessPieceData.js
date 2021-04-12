"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessPieceData = void 0;
const BoardData_1 = require("../ChessBoard/BoardData");
const Direction_1 = require("../Movement/Direction");
class ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        this.PlayerId = playerId;
        this.ChessPieceId = chessPieceId;
        this.Type = type;
        this.Color = color;
        this.boardParent = board;
    }
    SetBoardData(board) {
        this.boardParent = board;
    }
    ValidateMove(source, target) {
        let distanceX = target.x - source.x;
        let distanceY = target.y - source.y;
        let direction = new Direction_1.Direction(distanceX, distanceY);
        if (!Direction_1.Direction.IsDirectionValid(this.allowedDirection, direction)) {
            return false;
        }
        if (!this.CheckPath(direction, source, BoardData_1.BoardData.GetCellDistance(source, target))) {
            return false;
        }
        console.log("%s class validate move", typeof (this));
        return true;
    }
    MovePiece(source, target) {
        let targetClone = null;
        if (target.ChessPiece != null && target.ChessPiece.PlayerId != this.PlayerId) {
            targetClone = target.ChessPiece.Copy();
        }
        let clone = source.ChessPiece.Copy();
        target.ChessPiece = clone;
        source.ChessPiece = null;
        return targetClone;
    }
    CheckPath(direction, startingCell, distance) {
        let currentPositionX = startingCell.x;
        let currentPositionY = startingCell.y;
        let Currentcell;
        for (var i = 1; i <= distance; i++) {
            currentPositionX += direction.directionX;
            currentPositionY += direction.directionY;
            Currentcell = this.boardParent.AllCells[currentPositionX][currentPositionY];
            if (Currentcell.ChessPiece != null) {
                break;
            }
        }
        let distanceToCell = BoardData_1.BoardData.GetCellDistance(startingCell, Currentcell);
        if (distanceToCell < distance) {
            return false;
        }
        if (distanceToCell == distance) {
            if (Currentcell.ChessPiece != null && Currentcell.ChessPiece.PlayerId == startingCell.ChessPiece.PlayerId) {
                return false;
            }
        }
        return true;
    }
    Copy() {
        let clone = new ChessPieceData(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.ChessPieceData = ChessPieceData;
//# sourceMappingURL=ChessPieceData.js.map