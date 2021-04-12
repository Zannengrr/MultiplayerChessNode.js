"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Direction = exports.Side = exports.ChessPieceType = exports.King = exports.Queen = exports.Knight = exports.Bishop = exports.Rook = exports.Pawn = exports.ChessPieceData = exports.CellData = exports.BoardData = void 0;
const util_1 = require("util");
const Game_1 = require("./Game");
class BoardData {
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
    GetCellDataByPosition(x, y) {
        return this.AllCells[x][y];
    }
    GetChessPieceById(id) {
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
    GetCellDataByChessPieceId(id) {
        for (var i = 0; i < this.AllCells.length; i++) {
            let row = this.AllCells[i];
            for (var j = 0; j < row.length; j++) {
                if (row[j].ChessPiece != null && row[j].ChessPiece.ChessPieceId === id) {
                    return row[j];
                }
            }
        }
    }
    ValidateMove(sourceCell, targetCell) {
        let chessPiece = sourceCell.ChessPiece;
        if (chessPiece == null) {
            return false;
        }
        let validMove = chessPiece.ValidateMove(sourceCell, targetCell);
        return validMove;
    }
    static GetCellDistance(source, target) {
        return Math.max(Math.abs(target.x - source.x), Math.abs(target.y - source.y));
    }
    Copy() {
        let clone = new BoardData();
        clone.AllCells = JSON.parse(JSON.stringify(this.AllCells));
        return clone;
    }
}
exports.BoardData = BoardData;
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
class ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        this.PlayerId = playerId;
        this.ChessPieceId = chessPieceId;
        this.Type = type;
        this.Color = color;
        this.boardParent = board;
    }
    SetBoardData(board) {
        this.boardParent = board;
    }
    ValidateMove(source, target) {
        let distanceX = target.x - source.x;
        let distanceY = target.y - source.y;
        let direction = new Direction(distanceX, distanceY);
        if (!Direction.IsDirectionValid(this.allowedDirection, direction)) {
            return false;
        }
        if (!this.CheckPath(direction, source, BoardData.GetCellDistance(source, target))) {
            return false;
        }
        console.log("%s class validate move", typeof (this));
        return true;
    }
    MovePiece(source, target) {
        let targetClone = null;
        if (target.ChessPiece != null && target.ChessPiece.PlayerId != this.PlayerId) {
            targetClone = target.ChessPiece.Copy();
        }
        let clone = source.ChessPiece.Copy();
        target.ChessPiece = clone;
        source.ChessPiece = null;
        return targetClone;
    }
    CheckPath(direction, startingCell, distance) {
        let currentPositionX = startingCell.x;
        let currentPositionY = startingCell.y;
        let Currentcell;
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
        let clone = new ChessPieceData(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.ChessPieceData = ChessPieceData;
class Pawn extends ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.isFirstMove = true;
        this.PawnDirection(color);
    }
    //Missing check for Passan move, expand pawn with passan bool?
    ValidateMove(source, target) {
        let isMoveValid = false;
        let distanceY = (target.y - source.y) * this.direction;
        let distanceX = (target.x - source.x);
        if (this.isFirstMove && distanceY == 2 && distanceX == 0 && this.CheckPath(new Direction(distanceX,distanceY),source,2)) 
        {
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
    PawnDirection(color) {
        if (color === Side.White) {
            this.direction = 1;
            return;
        }
        this.direction = -1;
    }
    Copy() {
        let clone = new Pawn(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Pawn = Pawn;
class Rook extends ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.hasMoved = false;
        this.allowedDirection = [new Direction(1, 0), new Direction(-1, 0), new Direction(0, 1), new Direction(0, -1)];
    }
    ValidateMove(source, target) {
        let succes = super.ValidateMove(source, target);
        if (succes) {
            this.hasMoved = true;
        }
        return succes;
    }
    HasMoved() {
        return this.hasMoved;
    }
    SetCastleCell(cell) {
        this.castleCell = cell;
    }
    CastleMove(board) {
        let sourceCell = board.GetCellDataByChessPieceId(this.ChessPieceId);
        //let rookClone: ChessPieceData = this.Copy();
        this.castleCell.ChessPiece = this;
        sourceCell.ChessPiece = null;
        let data = new Game_1.PieceMoveData(0, 0, 0, "", "");
        data.Id = this.ChessPieceId;
        data.PlayerId = this.PlayerId;
        data.X = this.castleCell.x;
        data.Y = this.castleCell.y;
        return data;
    }
    Copy() {
        let clone = new Rook(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        clone.hasMoved = this.hasMoved;
        return clone;
    }
}
exports.Rook = Rook;
class Bishop extends ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.allowedDirection = [new Direction(1, 1), new Direction(-1, -1), new Direction(1, -1), new Direction(-1, 1)];
    }
    Copy() {
        let clone = new Bishop(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Bishop = Bishop;
class Knight extends ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
    }
    ValidateMove(source, target) {
        let distanceX = target.x - source.x;
        let distanceY = target.y - source.y;
        if (!((Math.abs(distanceX) == 2 && Math.abs(distanceY) == 1) || (Math.abs(distanceX) == 1 && (Math.abs(distanceY) == 2)))) {
            return false;
        }
        if (!target.ChessPiece == null && !target.DoesCellHaveEnemyPiece(this.PlayerId)) {
            return false;
        }
        console.log("%s class validate move", typeof (this));
        return true;
    }
    Copy() {
        let clone = new Knight(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Knight = Knight;
class Queen extends ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.allowedDirection =
            [
                new Direction(1, 1), new Direction(-1, -1), new Direction(1, -1), new Direction(-1, 1),
                new Direction(1, 0), new Direction(-1, 0), new Direction(0, 1), new Direction(0, -1)
            ];
    }
    Copy() {
        let clone = new Queen(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        return clone;
    }
}
exports.Queen = Queen;
class King extends ChessPieceData {
    constructor(playerId, chessPieceId, type, color, board) {
        super(playerId, chessPieceId, type, color, board);
        this.hasMoved = false;
    }
    ValidateMove(source, target) {
        let isMoveValid = false;
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
    CanCastle(targetCell, startingCell) {
        if (!this.hasMoved && targetCell.x == 7 || targetCell.x == 0) {
            let direction = new Direction(targetCell.x - startingCell.x, targetCell.y - startingCell.y);
            if (targetCell.ChessPiece != null) {
                this.rook = targetCell.ChessPiece;
            }
            if (!util_1.isNullOrUndefined(this.rook) && !this.rook.HasMoved() && this.CheckPath(direction, startingCell, 2)) {
                return true;
            }
        }
        return false;
    }
    CastleMove(board) {
        let sourceCell = board.GetCellDataByChessPieceId(this.ChessPieceId);
        this.castleCell.ChessPiece = this;
        sourceCell.ChessPiece = null;
        let data = new Game_1.PieceMoveData(0, 0, 0, "", "");
        data.Id = this.ChessPieceId;
        data.PlayerId = this.PlayerId;
        data.X = this.castleCell.x;
        data.Y = this.castleCell.y;
        return data;
    }
    SetCastleDestinations(source, target, board) {
        let direction = new Direction(target.x - source.x, target.y - source.y);
        let newKingCell = board.GetCellDataByPosition(source.x + 2 * direction.directionX, source.y);
        let newRookCell = board.GetCellDataByPosition(newKingCell.x + 1 * (-direction.directionX), newKingCell.y);
        source.ChessPiece.castleCell = newKingCell;
        target.ChessPiece.SetCastleCell(newRookCell);
    }
    CheckPath(direction, startingCell, distance) {
        let currentPositionX = startingCell.x;
        let currentPositionY = startingCell.y;
        let Currentcell;
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
        let clone = new King(this.PlayerId, this.ChessPieceId, this.Type, this.Color, this.boardParent);
        clone.allowedDirection = this.allowedDirection;
        clone.hasMoved = this.hasMoved;
        clone.rook = this.rook;
        return clone;
    }
}
exports.King = King;
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
class Direction {
    constructor(dirx, diry) {
        this.directionX = 0;
        this.directionY = 0;
        if (dirx != 0 && diry != 0 && (Math.abs(dirx) - Math.abs(diry) > 0)) {
            this.directionX = dirx;
            this.directionY = diry;
            return;
        }
        this.directionX = this.NormalizeToDirection(dirx);
        this.directionY = this.NormalizeToDirection(diry);
    }
    static IsDirectionValid(directionArray, directionToTestAgainst) {
        for (var i = 0; i < directionArray.length; i++) {
            if (this.CompareDirections(directionArray[i], directionToTestAgainst)) {
                return true;
            }
        }
        return false;
    }
    static CompareDirections(source, target) {
        return (source.directionX == target.directionX && source.directionY == target.directionY);
    }
    NormalizeToDirection(numberToNormalize) {
        let direction = 0;
        if (numberToNormalize != 0) {
            direction = numberToNormalize / Math.abs(numberToNormalize);
        }
        return direction;
    }
}
exports.Direction = Direction;
//# sourceMappingURL=ChessBoard.js.map