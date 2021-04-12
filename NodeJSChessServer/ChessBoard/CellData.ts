import { ChessPieceData } from "../ChessPieces/ChessPieceData";

export class CellData {
    public x: number;
    public y: number;
    public ChessPiece: ChessPieceData;
    constructor(posx: number, posy: number) {
        this.x = posx;
        this.y = posy;
        this.ChessPiece = null;
    }

    DoesCellHaveEnemyPiece(playerId: string): boolean {
        if (this.ChessPiece != null && this.ChessPiece.PlayerId != playerId) {
            return true;
        }

        return false;
    }

    Copy() {
        let clone: CellData = new CellData(this.x, this.y);
        clone.ChessPiece = this.ChessPiece.Copy();
        return clone;
    }
}