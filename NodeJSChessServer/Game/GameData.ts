import { BoardData } from "../ChessBoard/BoardData";
import { User } from "../User/User";

export class GameData {
    public GameId: string;
    public Board: BoardData = new BoardData(); //Type Board
    public StartingPlayer: string;
    constructor(gameid: string, board: BoardData) {
        this.GameId = gameid;
        this.Board = board;
    }

    PickFirstPlayer(players: User[]) {
        //this.StartingPlayer =  players[getRandomInt(players.length)].BasicUserInfo.Id;
        this.StartingPlayer = players[0].BasicUserInfo.Id;
    }
}