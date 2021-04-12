"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Server_1 = require("../Server");
const BoardData_1 = require("../ChessBoard/BoardData");
const Bishop_1 = require("../ChessPieces/Bishop");
const King_1 = require("../ChessPieces/King");
const Knight_1 = require("../ChessPieces/Knight");
const Pawn_1 = require("../ChessPieces/Pawn");
const Queen_1 = require("../ChessPieces/Queen");
const Rook_1 = require("../ChessPieces/Rook");
const Enum_1 = require("../Enums/Enum");
const GameData_1 = require("./GameData");
const GameHistory_1 = require("./GameHistory");
const CallbackData_1 = require("../Data/CallbackData");
const util_1 = require("util");
class Game {
    constructor(gameCreator, isPublic, id) {
        this.Players = new Array();
        this.piecesId = 1;
        this.startingPieceOrder = [
            Enum_1.ChessPieceType.Pawn, Enum_1.ChessPieceType.Pawn, Enum_1.ChessPieceType.Pawn, Enum_1.ChessPieceType.Pawn, Enum_1.ChessPieceType.Pawn, Enum_1.ChessPieceType.Pawn, Enum_1.ChessPieceType.Pawn, Enum_1.ChessPieceType.Pawn,
            Enum_1.ChessPieceType.Rook, Enum_1.ChessPieceType.Knight, Enum_1.ChessPieceType.Bishop, Enum_1.ChessPieceType.King, Enum_1.ChessPieceType.Queen, Enum_1.ChessPieceType.Bishop, Enum_1.ChessPieceType.Knight, Enum_1.ChessPieceType.Rook
        ];
        this.piecesDictionary = {
            1: Pawn_1.Pawn,
            2: Rook_1.Rook,
            3: Knight_1.Knight,
            4: Bishop_1.Bishop,
            5: Queen_1.Queen,
            6: King_1.King,
        };
        this.Players.push(gameCreator);
        this.Started = false;
        this.PublicGame = isPublic;
        this.Id = id;
        gameCreator.GameId = this.Id;
        gameCreator.InGame = true;
        this.GameHistory = new GameHistory_1.GameHistory(this.Id);
    }
    //call when both players have joined the game
    Initialize() {
        let board = new BoardData_1.BoardData();
        let whitePieces = this.CreatePieces(this.Players[0], board, 1, 0, Enum_1.Side.White); //Remove if not needed
        let blackPieces = this.CreatePieces(this.Players[1], board, 6, 7, Enum_1.Side.Black); //Remove if not needed
        this.gameData = new GameData_1.GameData(this.Id, board);
        this.gameData.PickFirstPlayer(this.Players); //move this so it is done first
        //send initial game setup to clients
        for (var i = 0; i < this.Players.length; i++) {
            Server_1.SendNetworkMessage("InitializeGame", this.gameData, this.Players[i].Connection);
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
            let message = new CallbackData_1.CallbackData(false, "Invalid move");
            Server_1.SendNetworkMessage("MoveFailure", message, user.Connection);
            return;
        }
        //generate array of move data
        let moveDataArray = [];
        let killedPiece;
        //TODO refactor and move elsewhere
        if (!util_1.isNullOrUndefined(targetCell.ChessPiece) && sourceCell.ChessPiece.Type == Enum_1.ChessPieceType.King && targetCell.ChessPiece.Type == Enum_1.ChessPieceType.Rook) {
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
        this.SaveMovesToHistory(moveDataArray);
        for (var i = 0; i < this.Players.length; i++) {
            Server_1.SendNetworkMessage("MoveSuccess", moveDataArray, this.Players[i].Connection);
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
        if (killedPiece != null && killedPiece.Type == Enum_1.ChessPieceType.King) {
            return players.find(player => player.BasicUserInfo.Id != killedPiece.PlayerId);
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
                    callbackData = new CallbackData_1.CallbackData(true, "You won");
                    Server_1.SendNetworkMessage("GameResult", callbackData, this.Players[i].Connection);
                }
                else {
                    let callbackData;
                    callbackData = new CallbackData_1.CallbackData(false, "You lost");
                    Server_1.SendNetworkMessage("GameResult", callbackData, this.Players[i].Connection);
                }
            }
            this.GameEnd();
        }
    }
    GameEnd() {
        for (var i = 0; i < this.Players.length; i++) {
            Server_1.SendNetworkMessage("GameHistory", this.GameHistory, this.Players[i].Connection);
            this.Players[i].ClearGameInfo();
        }
        this.GameFinished = true;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map