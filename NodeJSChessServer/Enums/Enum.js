"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Side = exports.ChessPieceType = void 0;
var ChessPieceType;
(function (ChessPieceType) {
    ChessPieceType[ChessPieceType["None"] = 0] = "None";
    ChessPieceType[ChessPieceType["Pawn"] = 1] = "Pawn";
    ChessPieceType[ChessPieceType["Rook"] = 2] = "Rook";
    ChessPieceType[ChessPieceType["Knight"] = 3] = "Knight";
    ChessPieceType[ChessPieceType["Bishop"] = 4] = "Bishop";
    ChessPieceType[ChessPieceType["Queen"] = 5] = "Queen";
    ChessPieceType[ChessPieceType["King"] = 6] = "King";
})(ChessPieceType = exports.ChessPieceType || (exports.ChessPieceType = {}));
var Side;
(function (Side) {
    Side[Side["White"] = 1] = "White";
    Side[Side["Black"] = 2] = "Black";
})(Side = exports.Side || (exports.Side = {}));
//# sourceMappingURL=Enum.js.map