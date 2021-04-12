import { nanoid } from "nanoid";
import { isNullOrUndefined } from "util";
import { ActiveGames, CheckForGameMatch, FindGameById, FindUserByConnection, FindUserByUsername, OnlineUsers, RegisteredUsers, RemoveActiveGame, SendNetworkMessage } from "../Server";
import { CallbackData } from "../Data/CallbackData";
import { GameSessionData } from "../Data/GameSessionData";
import { InvitationCallback } from "../Data/InvitationCallback";
import { LoginCallback } from "../Data/LoginCallbackk";
import { LoginData } from "../Data/LoginData";
import { NetworkMessage } from "../Data/NetworkMessage";
import { RegisterData } from "../Data/RegisterData";
import { Game } from "../Game/Game";
import { PieceMoveData } from "../Game/PieceMoveData";
import { User } from "../User/User";

export const NetworkMessageHandles =
{
    "Register": Register,
    "Login": Login,
    "CreateGame": CreateGame,
    "StartMatchmaking": MatchMaking,
    "CancelMatchmaking": CancelMatchmaking,
    "InviteUserToGame": InviteUserToGame,
    "OnInvitationCallback": OnInvitationCallback,
    "TryMove": OnTryMove,
    //"Promotion": OnPromotion,
}

export function HandleData(jsonString: string, conn) {
    let deserializedObject: NetworkMessage = JSON.parse(jsonString);
    NetworkMessageHandles[deserializedObject.messageName](deserializedObject.data, conn);
}

//Register validation
function Register(data: object, conn) {
    let dataObject = data as RegisterData;
    let result: CallbackData = new CallbackData(false, "");

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
function Login(data: object, conn) {
    let dataObject = data as LoginData;
    let result: LoginCallback = new LoginCallback(new CallbackData(false, ""), "", "");
    if (RegisteredUsers.some(data => data.Username === dataObject.Username && data.Password === dataObject.Password)) {
        //succesful login
        result.Data.Success = true;
        result.Data.Message = "";
        //create user
        let user: User = new User(nanoid(), dataObject.Username, conn);
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

function CreateGame(data: object, conn) {
    let dataObject: GameSessionData = data as GameSessionData;
    let gameCreator: User = FindUserByUsername(dataObject.UserId);
    let GameInstance: Game = new Game(gameCreator, dataObject.IsPublic, nanoid());
    ActiveGames.push(GameInstance);

    let gameType: string = "Public";
    if (!GameInstance.PublicGame) {
        gameType = "Private";
    }
    console.log("%s game created with ID: %s", gameType, GameInstance.Id);
}

function MatchMaking(data: object, conn) {
    let user = FindUserByConnection(conn);
    user.CreateTimer(() => CheckForGameMatch(user), 5000);
    console.log("Matchmaking started");
}

function CancelMatchmaking(data: object, conn) {
    let findUser = FindUserByConnection(conn);
    findUser.StopTimer();
    console.log("Matchmaking canceled");
}

function InviteUserToGame(data: object, conn) {
    let username: string = String(data);
    let invitedUser = FindUserByUsername(username);
    if (!isNullOrUndefined(invitedUser)) {
        let messageParent = FindUserByConnection(conn);
        let gameId = messageParent.GameId;
        SendNetworkMessage("Invitation", Object(gameId), invitedUser.Connection);
    }
}

function OnTryMove(data: object, conn) {
    let dataObject: PieceMoveData = data as PieceMoveData;
    let findGame = FindGameById(dataObject.GameId);
    if (!isNullOrUndefined(findGame)) {
        findGame.ValidateMove(dataObject);
    }

    if (findGame.GameFinished) {
        setTimeout(() => RemoveActiveGame(findGame), 10000);
    }
}

function OnInvitationCallback(data: object, conn) {
    let dataObject: InvitationCallback = data as InvitationCallback;
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
