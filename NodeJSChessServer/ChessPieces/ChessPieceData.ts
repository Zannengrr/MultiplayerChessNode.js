import { BoardData } from "../ChessBoard/BoardData";
import { CellData } from "../ChessBoard/CellData";
import { ChessPieceType, Side } from "../Enums/Enum";
import { Direction } from "../Movement/Direction";

export class ChessPieceData {
    public PlayerId: string;
    public ChessPieceId: number;
    public Type: ChessPieceType;
    public Color: Side;
    protected allowedDirection: Direction[];
    protected boardParent: BoardData;

    constructor(playerId: string, chessPieceId: number, type: ChessPieceType, color: Side, board: BoardData) {
        this.PlayerId = playerId;
        this.ChessPieceId = chessPieceId;
        this.Type = type;
        this.Color = color;
        this.boardParent = board;
    }

    SetBoardData(board: BoardData) {
        this.boardParent = board;
    }

    ValidateMove(source: CellData, target: CellData): boolean {
        let distanceX: number = target.x - source.x;
        let distanceY: number = target.y - source.y;

        let direction: Direction = new Direction(distanceX, distanceY);
        if (!Direction.IsDirectionValid(this.allowedDirection, direction)) {
            return false;
        }

        if (!this.CheckPath(direction, source, BoardData.GetCellDistance(source, target))) {
            return false;
        }

        console.log("%s class validate move", typeof (this));
        return true;
    }

    MovePiece(source: CellData, target: CellData) {
        let targetClone: ChessPieceData = null;
        if (target.ChessPiece != null && target.ChessPiece.PlayerId != this.PlayerId) {
            targetClone = target.ChessPiece.Copy();
        }

        let clone = source.ChessPiece.Copy();
        target.ChessPiece = clone;
        source.ChessPiece = null;

        return targetClone;
    }

    CheckPath(direction: Direction, startingCell: CellData, distance: number): boolean {
        let currentPositionX: number = startingCell.x;
        let currentPositionY: number = startingCell.y;
        let Currentcell: CellData;

        for (var i = 1; i <= distance; i++) {
            currentPositionX += direction.directionX;
            currentPositionY += direction.directionY;

            Currentcell = this.boardParent.AllCells[currentPositionX][currentPositionY];
            if (Currentcell.ChessPiece != null) {
                break;
            }
        }

        let distanceToCell = BoardData.GetCellDistance(startingCell, Currentcell);
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
        let clone: ChessPieceData = new ChessPieceData(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}