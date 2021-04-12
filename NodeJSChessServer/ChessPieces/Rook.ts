import { BoardData } from "../ChessBoard/BoardData";
import { CellData } from "../ChessBoard/CellData";
import { ChessPieceType, Side } from "../Enums/Enum";
import { PieceMoveData } from "../Game/PieceMoveData";
import { Direction } from "../Movement/Direction";
import { ChessPieceData } from "./ChessPieceData";

export class Rook extends ChessPieceData {
    private hasMoved: boolean = false;
    private castleCell: CellData;
    constructor(playerId: string, chessPieceId: number, type: ChessPieceType, color: Side, board: BoardData) {
        super(playerId, chessPieceId, type, color, board);
        this.allowedDirection = [new Direction(1, 0), new Direction(-1, 0), new Direction(0, 1), new Direction(0, -1)];
    }

    ValidateMove(source: CellData, target: CellData): boolean {
        let succes: boolean = super.ValidateMove(source, target);

        if (succes) {
            this.hasMoved = true;
        }
        return succes;
    }

    HasMoved(): boolean {
        return this.hasMoved;
    }

    SetCastleCell(cell: CellData) {
        this.castleCell = cell;
    }

    CastleMove(board: BoardData): PieceMoveData {
        let sourceCell: CellData = board.GetCellDataByChessPieceId(this.ChessPieceId);
        //let rookClone: ChessPieceData = this.Copy();
        this.castleCell.ChessPiece = this;
        sourceCell.ChessPiece = null;

        let data: PieceMoveData = new PieceMoveData(0, 0, 0, "", "");
        data.Id = this.ChessPieceId;
        data.PlayerId = this.PlayerId;
        data.X = this.castleCell.x;
        data.Y = this.castleCell.y;

        return data;
    }

    Copy() {
        let clone: Rook = new Rook(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        clone.hasMoved = this.hasMoved;
        return clone;
    }
}