import { isNullOrUndefined } from "util";
import { BoardData } from "../ChessBoard/BoardData";
import { CellData } from "../ChessBoard/CellData";
import { ChessPieceType, Side } from "../Enums/Enum";
import { PieceMoveData } from "../Game/PieceMoveData";
import { Direction } from "../Movement/Direction";
import { ChessPieceData } from "./ChessPieceData";
import { Rook } from "./Rook";

export class King extends ChessPieceData {
    private hasMoved: boolean = false;
    private rook: Rook;
    private castleCell: CellData;
    constructor(playerId: string, chessPieceId: number, type: ChessPieceType, color: Side, board: BoardData) {
        super(playerId, chessPieceId, type, color, board);
    }

    ValidateMove(source: CellData, target: CellData): boolean {
        let isMoveValid: boolean = false;

        isMoveValid = this.CanCastle(target, source);

        let requestedDistance = BoardData.GetCellDistance(source, target);
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

    CanCastle(targetCell: CellData, startingCell: CellData): boolean {
        if (!this.hasMoved && targetCell.x == 7 || targetCell.x == 0) {
            let direction: Direction = new Direction(targetCell.x - startingCell.x, targetCell.y - startingCell.y);
            if (targetCell.ChessPiece != null) {
                this.rook = targetCell.ChessPiece as Rook;
            }
            if (!isNullOrUndefined(this.rook) && !this.rook.HasMoved() && this.CheckPath(direction, startingCell, 2)) {
                return true;
            }
        }
        return false;
    }

    CastleMove(board: BoardData): PieceMoveData {
        let sourceCell: CellData = board.GetCellDataByChessPieceId(this.ChessPieceId);
        this.castleCell.ChessPiece = this;
        sourceCell.ChessPiece = null;

        let data: PieceMoveData = new PieceMoveData(0, 0, 0, "", "");
        data.Id = this.ChessPieceId;
        data.PlayerId = this.PlayerId;
        data.X = this.castleCell.x;
        data.Y = this.castleCell.y;

        return data;
    }

    SetCastleDestinations(source: CellData, target: CellData, board: BoardData) {
        let direction: Direction = new Direction(target.x - source.x, target.y - source.y);
        let newKingCell: CellData = board.GetCellDataByPosition(source.x + 2 * direction.directionX, source.y);
        let newRookCell: CellData = board.GetCellDataByPosition(newKingCell.x + 1 * (-direction.directionX), newKingCell.y);

        (source.ChessPiece as King).castleCell = newKingCell;
        (target.ChessPiece as Rook).SetCastleCell(newRookCell);
    }

    CheckPath(direction: Direction, startingCell: CellData, distance: number): boolean {
        let currentPositionX: number = startingCell.x;
        let currentPositionY: number = startingCell.y;
        let Currentcell: CellData;

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
        let clone: King = new King(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        clone.hasMoved = this.hasMoved;
        clone.rook = this.rook;
        return clone;
    }
}