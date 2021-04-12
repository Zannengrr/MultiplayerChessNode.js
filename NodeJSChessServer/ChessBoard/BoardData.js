"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardData = void 0;
const CellData_1 = require("./CellData");
class BoardData {
    constructor() {
        this.CreateBoard();
    }
    CreateBoard() {
        this.AllCells = [];
        for (var y = 0; y < 8; y++) {
            this.AllCells[y] = [];
            for (var x = 0; x < 8; x++) {
                this.AllCells[y][x] = new CellData_1.CellData(y, x);
            }
        }
    }
    GetCellDataByPosition(x, y) {
        return this.AllCells[x][y];
    }
    GetChessPieceById(id) {
        for (var i = 0; i < this.AllCells.length; i++) {
            let row = this.AllCells[i];
            for (var j = 0; j < row.length; j++) {
                if (row[j].ChessPiece != null && row[j].ChessPiece.ChessPieceId === id) {
                    return row[j].ChessPiece;
                }
            }
        }
        return null;
    }
    GetCellDataByChessPieceId(id) {
        for (var i = 0; i < this.AllCells.length; i++) {
            let row = this.AllCells[i];
            for (var j = 0; j < row.length; j++) {
                if (row[j].ChessPiece != null && row[j].ChessPiece.ChessPieceId === id) {
                    return row[j];
                }
            }
        }
    }
    ValidateMove(sourceCell, targetCell) {
        let chessPiece = sourceCell.ChessPiece;
        if (chessPiece == null) {
            return false;
        }
        let validMove = chessPiece.ValidateMove(sourceCell, targetCell);
        return validMove;
    }
    static GetCellDistance(source, target) {
        return Math.max(Math.abs(target.x - source.x), Math.abs(target.y - source.y));
    }
    Copy() {
        let clone = new BoardData();
        clone.AllCells = JSON.parse(JSON.stringify(this.AllCells));
        return clone;
    }
}
exports.BoardData = BoardData;
//# sourceMappingURL=BoardData.js.map