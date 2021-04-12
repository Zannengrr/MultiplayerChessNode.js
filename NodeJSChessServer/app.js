"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendNetworkMessage = exports.CallbackData = void 0;
const nanoid_1 = require("nanoid");
const util_1 = require("util");
const Game_1 = require("./Game");
const User_1 = require("./User");
var net = require('net');
const server = net.createServer();
var fs = require('fs');
var RegisteredUsers = new Array();
var OnlineUsers = new Array();
var ActiveGames = new Array();
class NetworkMessage {
    constructor(messageName, data) {
        this.messageName = messageName;
        this.data = data;
    }
}
class TestData {
    constructor(message) {
        this.message = message;
    }
}
class RegisterData {
    constructor(email, username, password) {
        this.Email = email;
        this.Username = username;
        this.Password = password; //password should be crypted and decrypted
    }
}
class LoginData {
    constructor(username, password) {
        this.Username = username;
        this.Password = password; //password should be crypted and decrypted
    }
}
class CallbackData {
    constructor(success, message) {
        this.Success = success;
        this.Message = message;
    }
}
exports.CallbackData = CallbackData;
class LoginCallback {
    constructor(data, username, id) {
        this.Data = new CallbackData(false, "");
        this.Data = data;
        this.UserInfo = new User_1.UserInfo(id, username);
    }
}
class InvitationCallback {
    constructor(data, gameId) {
        this.Data = new CallbackData(false, "");
        this.Data = data;
        this.GameId = gameId;
    }
}
class GameSessionData {
    constructor(userId, isPublic) {
        this.UserId = userId;
        this.IsPublic = isPublic;
    }
}
//read from file or connect to database
function ImportData() {
    //in this method we can connect to database or read our necessery info from file
    //Currently we read registered users from file and History matches from file(maybe) and save to lists
    ReadFromFile();
}
;
function ReadFromFile() {
    fs.readFile('graph.txt', function (err, data) {
        if (err)
            throw err;
        RegisteredUsers = JSON.parse(data);
        LogRegisteredUsersToConsole();
    });
}
function LogRegisteredUsersToConsole() {
    console.log("Registered users:");
    for (var i = 0; i < RegisteredUsers.length; i++) {
        console.log("User: %s, Email: %s, Password: %s ", RegisteredUsers[i].Username, RegisteredUsers[i].Email, RegisteredUsers[i].Password);
    }
}
var testMessage = new TestData("Heelp me god");
var testNetworkMessage = new NetworkMessage("test", testMessage);
server.on('connection', handleConnection);
server.listen(9000, function () {
    console.log('server listening to %j', server.address());
    ImportData();
});
const NetworkMessageHandles = {
    "test": testAction,
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
function handleConnection(conn) {
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('new client connection from %s', remoteAddress);
    conn.on('data', onConnData);
    conn.once('close', onConnClose);
    conn.on('error', onConnError);
    function onConnClose() {
        console.log('connection from %s closed', remoteAddress);
        RemoveUserFromServer(conn);
    }
    function onConnData(d) {
        let jsonString = d.toString();
        HandleData(jsonString, conn);
        console.log('connection data from %s: %j', remoteAddress, d.toString());
    }
    function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
        RemoveUserFromServer(conn);
    }
}
function HandleData(jsonString, conn) {
    let deserializedObject = JSON.parse(jsonString);
    NetworkMessageHandles[deserializedObject.messageName](deserializedObject.data, conn);
}
function testAction(data, conn) {
    let clientData = data;
    console.log('Test action string is %j', clientData.message);
    let jsonString = JSON.stringify(testNetworkMessage);
    conn.write(jsonString);
}
//Register validation
function Register(data, conn) {
    let dataObject = data;
    let result = new CallbackData(false, "");
    if (RegisteredUsers.some(data => data.Email === dataObject.Email)) {
        result.Success = false;
        result.Message = "User with that email already exists.";
    }
    else if (RegisteredUsers.some(data => data.Username === dataObject.Username)) {
        result.Success = false;
        result.Message = "User with that username already exists.";
    }
    else {
        //success
        result.Success = true;
        result.Message = "";
        RegisteredUsers.push(dataObject);
    }
    SendNetworkMessage("OnRegisterCallback", result, conn);
}
//Login validation
function Login(data, conn) {
    let dataObject = data;
    let result = new LoginCallback(new CallbackData(false, ""), "", "");
    if (RegisteredUsers.some(data => data.Username === dataObject.Username && data.Password === dataObject.Password)) {
        //succesful login
        result.Data.Success = true;
        result.Data.Message = "";
        //create user
        let user = new User_1.User(nanoid_1.nanoid(), dataObject.Username, conn);
        //add user to online users
        OnlineUsers.push(user);
        result.UserInfo = user.BasicUserInfo;
    }
    else if (RegisteredUsers.some(data => data.Username === dataObject.Username && data.Password !== dataObject.Password)) {
        result.Data.Success = false;
        result.Data.Message = "You have entered the wrong password.";
    }
    else {
        result.Data.Success = false;
        result.Data.Message = "User does not exist.";
    }
    SendNetworkMessage("OnLoginCallback", result, conn);
}
function CreateGame(data, conn) {
    let dataObject = data;
    let gameCreator = FindUserByUsername(dataObject.UserId);
    let GameInstance = new Game_1.Game(gameCreator, dataObject.IsPublic, nanoid_1.nanoid());
    ActiveGames.push(GameInstance);
    let gameType = "Public";
    if (!GameInstance.PublicGame) {
        gameType = "Private";
    }
    console.log("%s game created with ID: %s", gameType, GameInstance.Id);
}
function MatchMaking(data, conn) {
    let user = FindUserByConnection(conn);
    user.CreateTimer(() => CheckForGameMatch(user), 5000);
    console.log("Matchmaking started");
}
function CheckForGameMatch(user) {
    if (ActiveGames.length > 0) {
        let findGame = SearchForSuitableGame();
        if (!util_1.isNullOrUndefined(findGame)) {
            let succes = findGame.JoinGame(user);
            if (succes) {
                user.StopTimer();
                console.log(ActiveGames);
            }
        }
    }
    console.log("Timer method finished");
}
function CancelMatchmaking(data, conn) {
    let findUser = FindUserByConnection(conn);
    findUser.StopTimer();
    console.log("Matchmaking canceled");
}
function InviteUserToGame(data, conn) {
    let username = String(data);
    let invitedUser = FindUserByUsername(username);
    if (!util_1.isNullOrUndefined(invitedUser)) {
        let messageParent = FindUserByConnection(conn);
        let gameId = messageParent.GameId;
        SendNetworkMessage("Invitation", Object(gameId), invitedUser.Connection);
    }
}
function OnTryMove(data, conn) {
    let dataObject = data;
    let findGame = FindGameById(dataObject.GameId);
    if (!util_1.isNullOrUndefined(findGame)) {
        findGame.ValidateMove(dataObject);
    }
    if (findGame.GameFinished) {
        setTimeout(() => RemoveActiveGame(findGame), 10000);
    }
}
function RemoveActiveGame(game) {
    console.log("Before remove %s", ActiveGames.length);
    let index = ActiveGames.indexOf(game, 0);
    if (index > -1) {
        ActiveGames.splice(index, 1);
    }
    console.log("After remove %s", ActiveGames.length);
}
function OnInvitationCallback(data, conn) {
    let dataObject = data;
    let game = FindGameById(dataObject.GameId);
    if (dataObject.Data.Success && game.Players.length < 2) {
        let invitedUser = FindUserByConnection(conn);
        game.JoinGame(invitedUser);
    }
    else //maybe dont send callback for rejected invitation
     {
        let inviteParent = game.Players[0];
        SendNetworkMessage("InvitationRejected", dataObject.Data, inviteParent.Connection);
    }
}
//can be expanded for a more interesting matchmaking
function SearchForSuitableGame() {
    return ActiveGames.find(game => game.PublicGame && !game.Started);
}
//add types
function FindGameById(gameId) {
    let findGame = ActiveGames.find(game => game.Id == gameId);
    return findGame;
}
function FindUserByConnection(userConnection) {
    let findUser = OnlineUsers.find(user => user.Connection == userConnection);
    return findUser;
}
function FindUserByUsername(data) {
    let findUser = OnlineUsers.find(user => user.BasicUserInfo.Username == data);
    return findUser;
}
function RemoveUserFromServer(connection) {
    let findUser = OnlineUsers.find(user => user.Connection === connection);
    if (!util_1.isNullOrUndefined(findUser)) {
        if (findUser.InGame) {
            let findGame = FindGameById(findUser.GameId);
            if (!util_1.isNullOrUndefined(findGame)) {
                findGame.GameEnd();
                RemoveArrayElement(ActiveGames, 'Id', findGame.Id);
                console.log("Games left : %s", ActiveGames.length);
            }
        }
        RemoveArrayElement(OnlineUsers, 'BasicUserInfo', findUser.BasicUserInfo);
        console.log("Users left : %s", OnlineUsers.length);
    }
}
function SendNetworkMessage(event, data, conn) {
    let message = new NetworkMessage(event, data);
    let jsonString = JSON.stringify(message);
    conn.write(jsonString);
}
exports.SendNetworkMessage = SendNetworkMessage;
function RemoveArrayElement(array, attribute, value) {
    let i = array.length;
    while (i--) {
        if (array[i]
            && array[i].hasOwnProperty(attribute)
            && (arguments.length > 2 && array[i][attribute] === value)) {
            array.splice(i, 1);
        }
    }
    return array;
}
//on server close, save registered users to list
//on server close, save all match history to list?
function exitHandler() {
    let jsonString = JSON.stringify(RegisteredUsers);
    fs.writeFileSync('graph.txt', jsonString, 'utf8');
    console.log("Done saving data");
}
process.on('SIGINT', exitHandler);
//process.on('exit', exitHandler);
//process.on('SIGUSR1', exitHandler);
//process.on('SIGUSR2', exitHandler);
//process.on('SIGTERM', exitHandler);
//process.on('uncaughtException', exitHandler);
//# sourceMappingURL=app.js.map