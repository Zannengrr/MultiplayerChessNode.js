import { isNullOrUndefined } from 'util';
import { NetworkMessage } from './Data/NetworkMessage';
import { RegisterData } from './Data/RegisterData';
import { Game } from './Game/Game';
import { HandleData } from './Network/NetworkHandle';
import { User } from './User/User';
var net = require('net');
const server = net.createServer();

var fs = require('fs');

export var RegisteredUsers: Array<RegisterData> = new Array<RegisterData>();
export var OnlineUsers: Array<User> = new Array<User>();
export var ActiveGames: Array<Game> = new Array<Game>();

//read from file or connect to database
function ImportData() {
    //in this method we can connect to database or read our necessery info from file
    //Currently we read registered users from file and History matches from file(maybe) and save to lists
    ReadFromFile();
};

function ReadFromFile() {
    fs.readFile('graph.txt', function (err: Error, data: string)
    {
        if (err) throw err;

        RegisteredUsers = JSON.parse(data);

        LogRegisteredUsersToConsole();
    })
}

function LogRegisteredUsersToConsole() {
    console.log("Registered users:");
    for (var i = 0; i < RegisteredUsers.length; i++) {
        console.log("User: %s, Email: %s, Password: %s ", RegisteredUsers[i].Username, RegisteredUsers[i].Email, RegisteredUsers[i].Password);
    }
}

server.on('connection', handleConnection);

server.listen(9000, function () {
    console.log('server listening to %j', server.address());
    ImportData();
});

export function handleConnection(conn) {

    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('new client connection from %s', remoteAddress);
    conn.on('data', onConnData)
    conn.once('close', onConnClose);
    conn.on('error', onConnError);

    function onConnClose()
    {
        console.log('connection from %s closed', remoteAddress);
        RemoveUserFromServer(conn);
    }

    function onConnData(d: Buffer) {
        let jsonString = d.toString();
        HandleData(jsonString, conn);
        console.log('connection data from %s: %j', remoteAddress, d.toString());
    }

    function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
        RemoveUserFromServer(conn);
    }
}

export function CheckForGameMatch(user:User) {
    if (ActiveGames.length > 0) {
        let findGame: Game = SearchForSuitableGame();
        if (!isNullOrUndefined(findGame))
        {
            let succes = findGame.JoinGame(user);
            if (succes)
            {
                user.StopTimer();
                console.log(ActiveGames);
            }
        }
    }
    console.log("Timer method finished");
}

export function RemoveActiveGame(game:Game)
{
    console.log("Before remove %s", ActiveGames.length);
    let index: number = ActiveGames.indexOf(game, 0);
    if (index > -1) {
        ActiveGames.splice(index, 1);
    }
    console.log("After remove %s", ActiveGames.length);
}

//can be expanded for a more interesting matchmaking
export function SearchForSuitableGame(): Game {
    return ActiveGames.find(game => game.PublicGame && !game.Started)
}

//add types
export function FindGameById(gameId): Game {
    let findGame = ActiveGames.find(game => game.Id == gameId);
    return findGame;
}

export function FindUserByConnection(userConnection): User {
    let findUser = OnlineUsers.find(user => user.Connection == userConnection);
    return findUser;
}

export function FindUserByUsername(data: string): User {
    let findUser = OnlineUsers.find(user => user.BasicUserInfo.Username == data);
    return findUser;
}

export function RemoveUserFromServer(connection) {
    let findUser = OnlineUsers.find(user => user.Connection === connection);
    if (!isNullOrUndefined(findUser))
    {
        if (findUser.InGame)
        {
            let findGame = FindGameById(findUser.GameId);
            if (!isNullOrUndefined(findGame))
            {
                findGame.GameEnd();
                RemoveArrayElement(ActiveGames, 'Id', findGame.Id);
                console.log("Games left : %s", ActiveGames.length);
            }
        }
        RemoveArrayElement(OnlineUsers, 'BasicUserInfo', findUser.BasicUserInfo);
        console.log("Users left : %s", OnlineUsers.length);
    }
}

export function SendNetworkMessage(event:string, data:object, conn) {
    let message: NetworkMessage = new NetworkMessage(event, data);
    let jsonString = JSON.stringify(message);
    conn.write(jsonString);
}

export function RemoveArrayElement(array, attribute, value) {
    let i = array.length;
    while (i--)
    {
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
export function exitHandler() {
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


