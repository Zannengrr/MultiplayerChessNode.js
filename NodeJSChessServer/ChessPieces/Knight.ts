import { BoardData } from "../ChessBoard/BoardData";
import { CellData } from "../ChessBoard/CellData";
import { ChessPieceType, Side } from "../Enums/Enum";
import { ChessPieceData } from "./ChessPieceData";

export class Knight extends ChessPieceData {
    constructor(playerId: string, chessPieceId: number, type: ChessPieceType, color: Side, board: BoardData) {
        super(playerId, chessPieceId, type, color, board);
    }

    ValidateMove(source: CellData, target: CellData): boolean {
        let distanceX: number = target.x - source.x;
        let distanceY: number = target.y - source.y;

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
        let clone: Knight = new Knight(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}