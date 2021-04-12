import { BoardData } from "../ChessBoard/BoardData";
import { ChessPieceType, Side } from "../Enums/Enum";
import { Direction } from "../Movement/Direction";
import { ChessPieceData } from "./ChessPieceData";

export class Queen extends ChessPieceData {
    constructor(playerId: string, chessPieceId: number, type: ChessPieceType, color: Side, board: BoardData) {
        super(playerId, chessPieceId, type, color, board);
        this.allowedDirection =
            [
                new Direction(1, 1), new Direction(-1, -1), new Direction(1, -1), new Direction(-1, 1),
                new Direction(1, 0), new Direction(-1, 0), new Direction(0, 1), new Direction(0, -1)
            ];
    }

    Copy() {
        let clone: Queen = new Queen(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}