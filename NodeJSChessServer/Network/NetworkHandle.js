"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleData = exports.NetworkMessageHandles = void 0;
const nanoid_1 = require("nanoid");
const util_1 = require("util");
const Server_1 = require("../Server");
const CallbackData_1 = require("../Data/CallbackData");
const LoginCallbackk_1 = require("../Data/LoginCallbackk");
const Game_1 = require("../Game/Game");
const User_1 = require("../User/User");
exports.NetworkMessageHandles = {
    "Register": Register,
    "Login": Login,
    "CreateGame": CreateGame,
    "StartMatchmaking": MatchMaking,
    "CancelMatchmaking": CancelMatchmaking,
    "InviteUserToGame": InviteUserToGame,
    "OnInvitationCallback": OnInvitationCallback,
    "TryMove": OnTryMove,
    //"Promotion": OnPromotion,
};
function HandleData(jsonString, conn) {
    let deserializedObject = JSON.parse(jsonString);
    exports.NetworkMessageHandles[deserializedObject.messageName](deserializedObject.data, conn);
}
exports.HandleData = HandleData;
//Register validation
function Register(data, conn) {
    let dataObject = data;
    let result = new CallbackData_1.CallbackData(false, "");
    if (Server_1.RegisteredUsers.some(data => data.Email === dataObject.Email)) {
        result.Success = false;
        result.Message = "User with that email already exists.";
    }
    else if (Server_1.RegisteredUsers.some(data => data.Username === dataObject.Username)) {
        result.Success = false;
        result.Message = "User with that username already exists.";
    }
    else {
        //success
        result.Success = true;
        result.Message = "";
        Server_1.RegisteredUsers.push(dataObject);
    }
    Server_1.SendNetworkMessage("OnRegisterCallback", result, conn);
}
//Login validation
function Login(data, conn) {
    let dataObject = data;
    let result = new LoginCallbackk_1.LoginCallback(new CallbackData_1.CallbackData(false, ""), "", "");
    if (Server_1.RegisteredUsers.some(data => data.Username === dataObject.Username && data.Password === dataObject.Password)) {
        //succesful login
        result.Data.Success = true;
        result.Data.Message = "";
        //create user
        let user = new User_1.User(nanoid_1.nanoid(), dataObject.Username, conn);
        //add user to online users
        Server_1.OnlineUsers.push(user);
        result.UserInfo = user.BasicUserInfo;
    }
    else if (Server_1.RegisteredUsers.some(data => data.Username === dataObject.Username && data.Password !== dataObject.Password)) {
        result.Data.Success = false;
        result.Data.Message = "You have entered the wrong password.";
    }
    else {
        result.Data.Success = false;
        result.Data.Message = "User does not exist.";
    }
    Server_1.SendNetworkMessage("OnLoginCallback", result, conn);
}
function CreateGame(data, conn) {
    let dataObject = data;
    let gameCreator = Server_1.FindUserByUsername(dataObject.UserId);
    let GameInstance = new Game_1.Game(gameCreator, dataObject.IsPublic, nanoid_1.nanoid());
    Server_1.ActiveGames.push(GameInstance);
    let gameType = "Public";
    if (!GameInstance.PublicGame) {
        gameType = "Private";
    }
    console.log("%s game created with ID: %s", gameType, GameInstance.Id);
}
function MatchMaking(data, conn) {
    let user = Server_1.FindUserByConnection(conn);
    user.CreateTimer(() => Server_1.CheckForGameMatch(user), 5000);
    console.log("Matchmaking started");
}
function CancelMatchmaking(data, conn) {
    let findUser = Server_1.FindUserByConnection(conn);
    findUser.StopTimer();
    console.log("Matchmaking canceled");
}
function InviteUserToGame(data, conn) {
    let username = String(data);
    let invitedUser = Server_1.FindUserByUsername(username);
    if (!util_1.isNullOrUndefined(invitedUser)) {
        let messageParent = Server_1.FindUserByConnection(conn);
        let gameId = messageParent.GameId;
        Server_1.SendNetworkMessage("Invitation", Object(gameId), invitedUser.Connection);
    }
}
function OnTryMove(data, conn) {
    let dataObject = data;
    let findGame = Server_1.FindGameById(dataObject.GameId);
    if (!util_1.isNullOrUndefined(findGame)) {
        findGame.ValidateMove(dataObject);
    }
    if (findGame.GameFinished) {
        setTimeout(() => Server_1.RemoveActiveGame(findGame), 10000);
    }
}
function OnInvitationCallback(data, conn) {
    let dataObject = data;
    let game = Server_1.FindGameById(dataObject.GameId);
    if (dataObject.Data.Success && game.Players.length < 2) {
        let invitedUser = Server_1.FindUserByConnection(conn);
        game.JoinGame(invitedUser);
    }
    else //maybe dont send callback for rejected invitation
     {
        let inviteParent = game.Players[0];
        Server_1.SendNetworkMessage("InvitationRejected", dataObject.Data, inviteParent.Connection);
    }
}
//# sourceMappingURL=NetworkHandle.js.map