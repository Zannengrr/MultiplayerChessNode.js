"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieceMoveData = exports.Game = void 0;
const app_1 = require("./app");
const ChessBoard_1 = require("./ChessBoard");
class Game {
    constructor(gameCreator, isPublic, id) {
        this.Players = new Array();
        this.piecesId = 1;
        this.startingPieceOrder = [
            ChessBoard_1.ChessPieceType.Pawn, ChessBoard_1.ChessPieceType.Pawn, ChessBoard_1.ChessPieceType.Pawn, ChessBoard_1.ChessPieceType.Pawn, ChessBoard_1.ChessPieceType.Pawn, ChessBoard_1.ChessPieceType.Pawn, ChessBoard_1.ChessPieceType.Pawn, ChessBoard_1.ChessPieceType.Pawn,
            ChessBoard_1.ChessPieceType.Rook, ChessBoard_1.ChessPieceType.Knight, ChessBoard_1.ChessPieceType.Bishop, ChessBoard_1.ChessPieceType.King, ChessBoard_1.ChessPieceType.Queen, ChessBoard_1.ChessPieceType.Bishop, ChessBoard_1.ChessPieceType.Knight, ChessBoard_1.ChessPieceType.Rook
        ];
        this.piecesDictionary = {
            1: ChessBoard_1.Pawn,
            2: ChessBoard_1.Rook,
            3: ChessBoard_1.Knight,
            4: ChessBoard_1.Bishop,
            5: ChessBoard_1.Queen,
            6: ChessBoard_1.King,
        };
        this.Players.push(gameCreator);
        this.Started = false;
        this.PublicGame = isPublic;
        this.Id = id;
        gameCreator.GameId = this.Id;
        gameCreator.InGame = true;
        this.GameHistory = new GameHistory(this.Id);
    }
    //call when both players have joined the game
    Initialize() {
        let board = new ChessBoard_1.BoardData();
        let whitePieces = this.CreatePieces(this.Players[0], board, 1, 0, ChessBoard_1.Side.White); //Remove if not needed
        let blackPieces = this.CreatePieces(this.Players[1], board, 6, 7, ChessBoard_1.Side.Black); //Remove if not needed
        this.gameData = new GameData(this.Id, board);
        this.gameData.PickFirstPlayer(this.Players); //move this so it is done first
        //send initial game setup to clients
        for (var i = 0; i < this.Players.length; i++) {
            app_1.SendNetworkMessage("InitializeGame", this.gameData, this.Players[i].Connection);
        }
        this.GameHistory.Board = board.Copy();
        for (var i = 0; i < whitePieces.length; i++) {
            whitePieces[i].SetBoardData(this.gameData.Board);
            blackPieces[i].SetBoardData(this.gameData.Board);
        }
        console.log("Game started");
    }
    CreatePieces(user, board, pawnRowNumbeR, restPiecesRowNumber, side) {
        let pieces = [];
        //Pawn generation
        for (var i = 0; i < this.startingPieceOrder.length - 8; i++) {
            let ChessPieceData = new this.piecesDictionary[this.startingPieceOrder[i]](user.BasicUserInfo.Id, this.piecesId++, this.startingPieceOrder[i], side);
            board.AllCells[i][pawnRowNumbeR].ChessPiece = ChessPieceData;
            pieces.push(ChessPieceData);
        }
        //Rest pieces generation
        for (var i = 8; i < this.startingPieceOrder.length; i++) {
            let ChessPieceData = new this.piecesDictionary[this.startingPieceOrder[i]](user.BasicUserInfo.Id, this.piecesId++, this.startingPieceOrder[i], side);
            board.AllCells[i - 8][restPiecesRowNumber].ChessPiece = ChessPieceData;
            pieces.push(ChessPieceData);
        }
        return pieces;
    }
    ValidateMove(moveData) {
        let sourceCell = this.gameData.Board.GetCellDataByChessPieceId(moveData.Id);
        let targetCell = this.gameData.Board.GetCellDataByPosition(moveData.X, moveData.Y);
        let success = this.gameData.Board.ValidateMove(sourceCell, targetCell);
        //send failure message
        if (!success) {
            let user = this.Players.find(us => us.BasicUserInfo.Id == moveData.PlayerId);
            let message = new app_1.CallbackData(false, "Invalid move");
            app_1.SendNetworkMessage("MoveFailure", message, user.Connection);
            return;
        }
        //generate array of move data
        let moveDataArray = [];
        let killedPiece;
        //TODO refactor and move elsewhere
        if (sourceCell.ChessPiece.Type == ChessBoard_1.ChessPieceType.King && targetCell.ChessPiece.Type == ChessBoard_1.ChessPieceType.Rook) {
            sourceCell.ChessPiece.SetCastleDestinations(sourceCell, targetCell, this.gameData.Board);
            let kingMoveData = sourceCell.ChessPiece.CastleMove(this.gameData.Board);
            let rookMoveData = targetCell.ChessPiece.CastleMove(this.gameData.Board);
            kingMoveData.GameId = moveData.GameId;
            rookMoveData.GameId = moveData.GameId;
            moveDataArray.push(kingMoveData);
            moveDataArray.push(rookMoveData);
        }
        else {
            killedPiece = sourceCell.ChessPiece.MovePiece(sourceCell, targetCell);
            moveDataArray.push(moveData);
        }
        for (var i = 0; i < this.Players.length; i++) {
            app_1.SendNetworkMessage("MoveSuccess", moveDataArray, this.Players[i].Connection);
        }
        let playerWon = this.CheckWinCondition(killedPiece, this.Players);
        this.EndGameResults(playerWon);
    }
    JoinGame(user) {
        try {
            if (this.Players.length < 2) {
                user.InGame = true;
                this.Players.push(user);
                this.Initialize();
                return true;
            }
        }
        catch (e) {
            console.log(e);
            return false;
        }
        return false;
    }
    CheckWinCondition(killedPiece, players) {
        if (killedPiece != null && killedPiece.Type == ChessBoard_1.ChessPieceType.King) {
            return players.find(player => player.BasicUserInfo.Id == killedPiece.PlayerId);
        }
        return null;
    }
    SaveMovesToHistory(moveArray) {
        for (var i = 0; i < moveArray.length; i++) {
            this.GameHistory.MoveHistory.push(moveArray[i]);
        }
    }
    EndGameResults(userWon) {
        if (userWon != null) {
            for (var i = 0; i < this.Players.length; i++) {
                if (this.Players[i] == userWon) {
                    let callbackData;
                    callbackData = new app_1.CallbackData(true, "You won");
                    app_1.SendNetworkMessage("GameResult", callbackData, this.Players[i].Connection);
                }
                else {
                    let callbackData;
                    callbackData = new app_1.CallbackData(false, "You lost");
                    app_1.SendNetworkMessage("GameResult", callbackData, this.Players[i].Connection);
                }
            }
            this.GameEnd();
        }
    }
    GameEnd() {
        for (var i = 0; i < this.Players.length; i++) {
            app_1.SendNetworkMessage("GameHistory", this.GameHistory, this.Players[i].Connection);
            this.Players[i].ClearGameInfo();
        }
        this.GameFinished = true;
    }
}
exports.Game = Game;
class GameData {
    constructor(gameid, board) {
        this.Board = new ChessBoard_1.BoardData(); //Type Board
        this.GameId = gameid;
        this.Board = board;
    }
    PickFirstPlayer(players) {
        //this.StartingPlayer =  players[getRandomInt(players.length)].BasicUserInfo.Id;
        this.StartingPlayer = players[0].BasicUserInfo.Id;
    }
}
class GameHistory {
    constructor(gameid) {
        this.Board = new ChessBoard_1.BoardData();
        this.MoveHistory = [];
        this.GameId = gameid;
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
class PieceMoveData {
    constructor(x, y, id, gameid, playerid) {
        this.X = x;
        this.Y = y;
        this.Id = id;
        this.GameId = gameid;
        this.PlayerId = playerid;
    }
}
exports.PieceMoveData = PieceMoveData;
//# sourceMappingURL=Game.js.map