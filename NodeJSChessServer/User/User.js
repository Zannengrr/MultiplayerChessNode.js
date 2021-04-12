"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfo = exports.User = void 0;
class User {
    constructor(id, username, conn) {
        this.BasicUserInfo = new UserInfo(id, username);
        this.Connection = conn;
        this.InGame = false;
        this.GameId = "";
    }
    CreateTimer(func, timeMiliseconds) {
        this.MatchmakingTimer = setInterval(() => func(this), timeMiliseconds);
        console.log("Timer started");
    }
    StopTimer() {
        clearInterval(this.MatchmakingTimer);
        console.log("Timer stopped");
    }
    ClearGameInfo() {
        this.InGame = false;
        this.GameId = "";
    }
}
exports.User = User;
class UserInfo {
    constructor(id, username) {
        this.Id = id;
        this.Username = username;
    }
}
exports.UserInfo = UserInfo;
//# sourceMappingURL=User.js.map