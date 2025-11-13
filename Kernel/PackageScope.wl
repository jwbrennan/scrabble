(* 
    Declaration of symbols that need to be available in all paclet files, but are not 
    exported when the paclet is loaded.
*)

BeginPackage["Scrabbology`PackageScope`", {"Scrabbology`"}]
formatWord;
tiles;
UpdateUsedTileCount;
UpdateRemainingTileCount;
FindStartingSquares;
FindPossibleOverlapPositions;
ForbiddenSquares;
UpdateForbiddenSquares;
Battleship;
IdentifyBlanks;
FormatWordWithBlanks;
BlanksAllowed;
RunScrabblegorithm;

EndPackage[]