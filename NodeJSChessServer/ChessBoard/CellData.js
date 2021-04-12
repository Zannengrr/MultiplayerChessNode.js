"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellData = void 0;
class CellData {
    constructor(posx, posy) {
        this.x = posx;
        this.y = posy;
        this.ChessPiece = null;
    }
    DoesCellHaveEnemyPiece(playerId) {
        if (this.ChessPiece != null && this.ChessPiece.PlayerId != playerId) {
            return true;
        }
        return false;
    }
    Copy() {
        let clone = new CellData(this.x, this.y);
        clone.ChessPiece = this.ChessPiece.Copy();
        return clone;
    }
}
exports.CellData = CellData;
//# sourceMappingURL=CellData.js.map