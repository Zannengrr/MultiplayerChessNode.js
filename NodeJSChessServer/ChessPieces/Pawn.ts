import { BoardData } from "../ChessBoard/BoardData";
import { CellData } from "../ChessBoard/CellData";
import { ChessPieceType, Side } from "../Enums/Enum";
import { ChessPieceData } from "./ChessPieceData";

export class Pawn extends ChessPieceData {
    private isFirstMove: boolean = true;
    private direction: number;

    constructor(playerId: string, chessPieceId: number, type: ChessPieceType, color: Side, board: BoardData) {
        super(playerId, chessPieceId, type, color, board);
        this.PawnDirection(color);
    }

    //Missing check for Passan move, expand pawn with passan bool?
    ValidateMove(source: CellData, target: CellData): boolean {
        let isMoveValid: boolean = false;
        let distanceY = (target.y - source.y) * this.direction;
        let distanceX = (target.x - source.x);

        if (this.isFirstMove && distanceY == 2 && distanceX == 0) {
            isMoveValid = true;
        }

        if (!isMoveValid && distanceY == 1) {
            if (distanceX == 0 && target.ChessPiece == null) {
                isMoveValid = true;
            }

            if (!isMoveValid && Math.abs(distanceX) == 1 && target.DoesCellHaveEnemyPiece(this.PlayerId)) {
                isMoveValid = true;
            }
        }

        console.log("%s class validate move", typeof (this));
        if (isMoveValid) {
            this.isFirstMove = false;
        }
        return isMoveValid;
    }

    PawnDirection(color: Side) {
        if (color === Side.White) {
            this.direction = 1;
            return;
        }

        this.direction = -1;
    }

    Copy() {
        let clone: Pawn = new Pawn(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}