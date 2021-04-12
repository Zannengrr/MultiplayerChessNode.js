# NodeJSChessServer
Open project in Visual studio, or open project in VisualStudioCode by opening the root folder;
Set Node.js as the running environment.
Start/StartDebugging in VisualStudio/VisualStudioCode respectively

Project consists of folders named with clarification in mind.

Server.ts is the first script to run.
It opens a tcp connection and listens to port 9000; Also has Arrays of Online users, Registered users and Active games;

//--------NOTE---------
(After a few registrations upon ending the server with a CTRL+C, the registered users are saved into a file and loaded on next server start, this can be used to test login)
//--------ENDNOTE---------

NetworkHandles folder
Has class that holds a Dictonary of event names and methods to run accordingly.

Game folder
Has a class Game that is created when a user starts a game session.
The game does not start until another User has joined to that game.
Noteworthy classes that the game has are the GameData and GameHistory.
GameData holds information about the board and GameHistory is used to save moves for replay.

ChessBoard folder
Has classes that are used to create the ChessBoard and some functions that are done on the board like Validation

ChessPieces folder
Consists of a base class ChessPieceData and all the concrete classes created and used in the game.
Classes override some methods and have their own for specific purposes regarding game rules and/or movement.

Data folder
Consists of classes that are used throughout the server for wrapping data, and sending data over network.

Enums folder
Has all enums that are used on the server.

Movement folder
Has a Direction class that is used for checking vector movement of a Piece.

Utilities folder
Created as a place where some functions can be migrated there if they should be used globaly.


//--------NOTE---------
Castling move is not finished completely (it needs a check if the king that should be moved pass through a check, is in check or will be in check after the move)
En passant move has not been tested for (due to lack of time)
Pawn promotion has not been implemented yet (due to lack of time)
There is currently no QuitGame message that can distrupt the game and end it prematurely
There is currently no Saving of Replays on the server or client in a file (in order to watch some you would need to play a game and then after watch it on the client)
//--------ENDNOTE---------

For testing purposes there are alredy 2 users created and stored in a local text file. When the server is loaded they are displayed in the console.