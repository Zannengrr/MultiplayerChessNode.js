"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitHandler = exports.RemoveArrayElement = exports.SendNetworkMessage = exports.RemoveUserFromServer = exports.FindUserByUsername = exports.FindUserByConnection = exports.FindGameById = exports.SearchForSuitableGame = exports.RemoveActiveGame = exports.CheckForGameMatch = exports.handleConnection = exports.ActiveGames = exports.OnlineUsers = exports.RegisteredUsers = void 0;
const util_1 = require("util");
const NetworkMessage_1 = require("./Data/NetworkMessage");
const NetworkHandle_1 = require("./Network/NetworkHandle");
var net = require('net');
const server = net.createServer();
var fs = require('fs');
exports.RegisteredUsers = new Array();
exports.OnlineUsers = new Array();
exports.ActiveGames = new Array();
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
        exports.RegisteredUsers = JSON.parse(data);
        LogRegisteredUsersToConsole();
    });
}
function LogRegisteredUsersToConsole() {
    console.log("Registered users:");
    for (var i = 0; i < exports.RegisteredUsers.length; i++) {
        console.log("User: %s, Email: %s, Password: %s ", exports.RegisteredUsers[i].Username, exports.RegisteredUsers[i].Email, exports.RegisteredUsers[i].Password);
    }
}
server.on('connection', handleConnection);
server.listen(9000, function () {
    console.log('server listening to %j', server.address());
    ImportData();
});
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
        NetworkHandle_1.HandleData(jsonString, conn);
        console.log('connection data from %s: %j', remoteAddress, d.toString());
    }
    function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
        RemoveUserFromServer(conn);
    }
}
exports.handleConnection = handleConnection;
function CheckForGameMatch(user) {
    if (exports.ActiveGames.length > 0) {
        let findGame = SearchForSuitableGame();
        if (!util_1.isNullOrUndefined(findGame)) {
            let succes = findGame.JoinGame(user);
            if (succes) {
                user.StopTimer();
                console.log(exports.ActiveGames);
            }
        }
    }
    console.log("Timer method finished");
}
exports.CheckForGameMatch = CheckForGameMatch;
function RemoveActiveGame(game) {
    console.log("Before remove %s", exports.ActiveGames.length);
    let index = exports.ActiveGames.indexOf(game, 0);
    if (index > -1) {
        exports.ActiveGames.splice(index, 1);
    }
    console.log("After remove %s", exports.ActiveGames.length);
}
exports.RemoveActiveGame = RemoveActiveGame;
//can be expanded for a more interesting matchmaking
function SearchForSuitableGame() {
    return exports.ActiveGames.find(game => game.PublicGame && !game.Started);
}
exports.SearchForSuitableGame = SearchForSuitableGame;
//add types
function FindGameById(gameId) {
    let findGame = exports.ActiveGames.find(game => game.Id == gameId);
    return findGame;
}
exports.FindGameById = FindGameById;
function FindUserByConnection(userConnection) {
    let findUser = exports.OnlineUsers.find(user => user.Connection == userConnection);
    return findUser;
}
exports.FindUserByConnection = FindUserByConnection;
function FindUserByUsername(data) {
    let findUser = exports.OnlineUsers.find(user => user.BasicUserInfo.Username == data);
    return findUser;
}
exports.FindUserByUsername = FindUserByUsername;
function RemoveUserFromServer(connection) {
    let findUser = exports.OnlineUsers.find(user => user.Connection === connection);
    if (!util_1.isNullOrUndefined(findUser)) {
        if (findUser.InGame) {
            let findGame = FindGameById(findUser.GameId);
            if (!util_1.isNullOrUndefined(findGame)) {
                findGame.GameEnd();
                RemoveArrayElement(exports.ActiveGames, 'Id', findGame.Id);
                console.log("Games left : %s", exports.ActiveGames.length);
            }
        }
        RemoveArrayElement(exports.OnlineUsers, 'BasicUserInfo', findUser.BasicUserInfo);
        console.log("Users left : %s", exports.OnlineUsers.length);
    }
}
exports.RemoveUserFromServer = RemoveUserFromServer;
function SendNetworkMessage(event, data, conn) {
    let message = new NetworkMessage_1.NetworkMessage(event, data);
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
exports.RemoveArrayElement = RemoveArrayElement;
//on server close, save registered users to list
//on server close, save all match history to list?
function exitHandler() {
    let jsonString = JSON.stringify(exports.RegisteredUsers);
    fs.writeFileSync('graph.txt', jsonString, 'utf8');
    console.log("Done saving data");
}
exports.exitHandler = exitHandler;
process.on('SIGINT', exitHandler);
//process.on('exit', exitHandler);
//process.on('SIGUSR1', exitHandler);
//process.on('SIGUSR2', exitHandler);
//process.on('SIGTERM', exitHandler);
//process.on('uncaughtException', exitHandler);
//# sourceMappingURL=Server.js.map