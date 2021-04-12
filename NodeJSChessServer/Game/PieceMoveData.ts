export class PieceMoveData {
    public X: number;
    public Y: number;
    public Id: number;
    public GameId: string;
    public PlayerId: string;
    constructor(x: number, y: number, id: number, gameid: string, playerid: string) {
        this.X = x;
        this.Y = y;
        this.Id = id;
        this.GameId = gameid;
        this.PlayerId = playerid;
    }
}