import { SendNetworkMessage } from '../Server'
import { BoardData } from '../ChessBoard/BoardData';
import { CellData } from '../ChessBoard/CellData';
import { Bishop } from '../ChessPieces/Bishop';
import { ChessPieceData } from '../ChessPieces/ChessPieceData';
import { King } from '../ChessPieces/King';
import { Knight } from '../ChessPieces/Knight';
import { Pawn } from '../ChessPieces/Pawn';
import { Queen } from '../ChessPieces/Queen';
import { Rook } from '../ChessPieces/Rook';
import { ChessPieceType, Side } from '../Enums/Enum';
import { User } from '../User/User'
import { GameData } from './GameData';
import { GameHistory } from './GameHistory';
import { PieceMoveData } from './PieceMoveData';
import { CallbackData } from '../Data/CallbackData';
import { isNullOrUndefined } from 'util';

export class Game {
    public Id: string;
    public Players: Array<User> = new Array<User>();
    public Started: boolean;
    public GameFinished: boolean;
    public PublicGame: boolean;

    private gameData: GameData;

    private piecesId: number = 1;

    private startingPieceOrder: ChessPieceType[] =
        [
            ChessPieceType.Pawn, ChessPieceType.Pawn, ChessPieceType.Pawn, ChessPieceType.Pawn, ChessPieceType.Pawn, ChessPieceType.Pawn, ChessPieceType.Pawn, ChessPieceType.Pawn,
            ChessPieceType.Rook, ChessPieceType.Knight, ChessPieceType.Bishop, ChessPieceType.King, ChessPieceType.Queen, ChessPieceType.Bishop, ChessPieceType.Knight, ChessPieceType.Rook
        ];

    private piecesDictionary =
        {
            1: Pawn,
            2: Rook,
            3: Knight,
            4: Bishop,
            5: Queen,
            6: King,
        }

    public GameHistory: GameHistory;

    constructor(gameCreator:User, isPublic:boolean, id:string) {
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
        let board: BoardData = new BoardData();
        let whitePieces = this.CreatePieces(this.Players[0], board, 1, 0, Side.White); //Remove if not needed
        let blackPieces = this.CreatePieces(this.Players[1], board, 6, 7, Side.Black); //Remove if not needed

        this.gameData = new GameData(this.Id, board);
        this.gameData.PickFirstPlayer(this.Players); //move this so it is done first

        //send initial game setup to clients
        for (var i = 0; i < this.Players.length; i++)
        {
            SendNetworkMessage("InitializeGame", this.gameData, this.Players[i].Connection);
        }
        this.GameHistory.Board = board.Copy();

        for (var i = 0; i < whitePieces.length; i++)
        {
            whitePieces[i].SetBoardData(this.gameData.Board);
            blackPieces[i].SetBoardData(this.gameData.Board);
        }
        console.log("Game started");
    }

    CreatePieces(user: User, board: BoardData, pawnRowNumbeR: number, restPiecesRowNumber: number, side: Side): ChessPieceData[] {
        let pieces: ChessPieceData[] = [];

        //Pawn generation
        for (var i = 0; i < this.startingPieceOrder.length - 8; i++) {
            let ChessPieceData: ChessPieceData = new this.piecesDictionary[this.startingPieceOrder[i]](user.BasicUserInfo.Id, this.piecesId++, this.startingPieceOrder[i], side);
            board.AllCells[i][pawnRowNumbeR].ChessPiece = ChessPieceData;
            pieces.push(ChessPieceData);
        }

        //Rest pieces generation
        for (var i = 8; i < this.startingPieceOrder.length; i++) {
            let ChessPieceData: ChessPieceData = new this.piecesDictionary[this.startingPieceOrder[i]](user.BasicUserInfo.Id, this.piecesId++, this.startingPieceOrder[i], side);
            board.AllCells[i - 8][restPiecesRowNumber].ChessPiece = ChessPieceData;
            pieces.push(ChessPieceData);
        }

        return pieces;
    }

    ValidateMove(moveData: PieceMoveData) {

        let sourceCell: CellData = this.gameData.Board.GetCellDataByChessPieceId(moveData.Id);
        let targetCell: CellData = this.gameData.Board.GetCellDataByPosition(moveData.X, moveData.Y);

        let success: boolean = this.gameData.Board.ValidateMove(sourceCell, targetCell);

        //send failure message
        if (!success) {
            let user: User = this.Players.find(us => us.BasicUserInfo.Id == moveData.PlayerId);
            let message: CallbackData = new CallbackData(false, "Invalid move");
            SendNetworkMessage("MoveFailure", message, user.Connection);
            return;
        }

        //generate array of move data
        let moveDataArray: PieceMoveData[] = [];
        let killedPiece: ChessPieceData;
        //TODO refactor and move elsewhere
        if (!isNullOrUndefined(targetCell.ChessPiece) && sourceCell.ChessPiece.Type == ChessPieceType.King && targetCell.ChessPiece.Type == ChessPieceType.Rook)
        {
            (sourceCell.ChessPiece as King).SetCastleDestinations(sourceCell, targetCell, this.gameData.Board);
            let kingMoveData: PieceMoveData = (sourceCell.ChessPiece as King).CastleMove(this.gameData.Board);
            let rookMoveData: PieceMoveData = (targetCell.ChessPiece as Rook).CastleMove(this.gameData.Board);
            kingMoveData.GameId = moveData.GameId;
            rookMoveData.GameId = moveData.GameId;
            moveDataArray.push(kingMoveData);
            moveDataArray.push(rookMoveData);
        }
        else
        {
            killedPiece = sourceCell.ChessPiece.MovePiece(sourceCell, targetCell);
            moveDataArray.push(moveData);
        }

        this.SaveMovesToHistory(moveDataArray);

        for (var i = 0; i < this.Players.length; i++)
        {
            SendNetworkMessage("MoveSuccess", moveDataArray, this.Players[i].Connection);
        }

        let playerWon: User = this.CheckWinCondition(killedPiece, this.Players);
        this.EndGameResults(playerWon);
    }

    JoinGame(user: User) {
        try
        {
            if (this.Players.length < 2) {
                user.InGame = true;
                this.Players.push(user);
                this.Initialize();
                return true;
            }
        }
        catch (e)
        {
            console.log(e);
            return false;
        }
        return false;
    }

    CheckWinCondition(killedPiece: ChessPieceData, players: User[]): User
    {
        if (killedPiece != null && killedPiece.Type == ChessPieceType.King) {
            return players.find(player => player.BasicUserInfo.Id != killedPiece.PlayerId)
        }

        return null;
    }

    SaveMovesToHistory(moveArray: PieceMoveData[])
    {
        for (var i = 0; i < moveArray.length; i++)
        {
            this.GameHistory.MoveHistory.push(moveArray[i]);
        }
    }

    EndGameResults(userWon:User)
    {
        if (userWon != null) {
            for (var i = 0; i < this.Players.length; i++) {
                if (this.Players[i] == userWon) {
                    let callbackData: CallbackData;
                    callbackData = new CallbackData(true, "You won");
                    SendNetworkMessage("GameResult", callbackData, this.Players[i].Connection);
                }
                else {
                    let callbackData: CallbackData;
                    callbackData = new CallbackData(false, "You lost");
                    SendNetworkMessage("GameResult", callbackData, this.Players[i].Connection);
                }
            }

            this.GameEnd();
        }
    }

    GameEnd()
    {
        for (var i = 0; i < this.Players.length; i++)
        {
            SendNetworkMessage("GameHistory", this.GameHistory, this.Players[i].Connection);
            this.Players[i].ClearGameInfo();
        }
        this.GameFinished = true;
    }
}