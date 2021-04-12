import { ChessPieceData } from "../ChessPieces/ChessPieceData";
import { CellData } from "./CellData";

export class BoardData {
    public AllCells: CellData[][];
    constructor() {
        this.CreateBoard();
    }

    CreateBoard() {
        this.AllCells = [];
        for (var y = 0; y < 8; y++) {
            this.AllCells[y] = [];
            for (var x = 0; x < 8; x++) {
                this.AllCells[y][x] = new CellData(y, x);
            }
        }
    }

    GetCellDataByPosition(x: number, y: number): CellData {
        return this.AllCells[x][y];
    }

    GetChessPieceById(id: number): ChessPieceData {
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

    GetCellDataByChessPieceId(id: number): CellData {
        for (var i = 0; i < this.AllCells.length; i++) {
            let row = this.AllCells[i];
            for (var j = 0; j < row.length; j++) {
                if (row[j].ChessPiece != null && row[j].ChessPiece.ChessPieceId === id) {
                    return row[j];
                }
            }
        }
    }

    ValidateMove(sourceCell: CellData, targetCell: CellData): boolean {
        let chessPiece: ChessPieceData = sourceCell.ChessPiece;
        if (chessPiece == null) {
            return false;
        }

        let validMove: boolean = chessPiece.ValidateMove(sourceCell, targetCell);

        return validMove;
    }

    static GetCellDistance(source: CellData, target: CellData): number {
        return Math.max(Math.abs(target.x - source.x), Math.abs(target.y - source.y));
    }

    Copy() {
        let clone: BoardData = new BoardData();
        clone.AllCells = JSON.parse(JSON.stringify(this.AllCells));
        return clone;
    }
}