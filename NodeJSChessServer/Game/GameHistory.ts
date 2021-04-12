import { BoardData } from "../ChessBoard/BoardData";
import { PieceMoveData } from "./PieceMoveData";

export class GameHistory {
    public GameId: string;
    public Board: BoardData = new BoardData();
    public MoveHistory: PieceMoveData[] = [];
    constructor(gameid: string) {
        this.GameId = gameid;
    }
}