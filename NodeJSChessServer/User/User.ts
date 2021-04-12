export class User {
    public BasicUserInfo: UserInfo
    public Connection;
    public InGame: boolean;
    public GameId: string;
    public MatchmakingTimer: NodeJS.Timeout;
    constructor(id: string, username: string, conn) {
        this.BasicUserInfo = new UserInfo(id, username)
        this.Connection = conn;
        this.InGame = false;
        this.GameId = "";
    }

    CreateTimer(func:Function, timeMiliseconds:number)
    {
        this.MatchmakingTimer = setInterval(() => func(this), timeMiliseconds);
        console.log("Timer started");
    }

    StopTimer()
    {
        clearInterval(this.MatchmakingTimer);
        console.log("Timer stopped");
    }

    ClearGameInfo() {
        this.InGame = false;
        this.GameId = "";
    }
}

export class UserInfo {
    public Id: string;
    public Username: string;

    constructor(id: string, username) {
        this.Id = id;
        this.Username = username;
    }
}