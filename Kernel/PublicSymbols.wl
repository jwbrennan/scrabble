(* Declaration of symbols that are exported when the paclet is loaded. *)

BeginPackage["Scrabbology`"]

GU`SetUsage[ScrabbleHelper,
	"Takes a 7-letter string of letters and finds 7 and 8-letter bingos using the tiles on the rack and potentially an additional blank tile."
];
GU`SetUsage[ScrabbleBingo,
	"Takes a 7-letter string that may contain blanks (?) and a dictionary list, and returns all possible 7-letter bingos that can be formed with the tiles on the rack."
];
GU`SetUsage[board,
	"Matrix of squares and their types on a standard Scrabble board."
];
GU`SetUsage[CreateInitialScrabbleBoard,
	"Create graphic of an empty Scrabble board."
];
GU`SetUsage[UpdateScrabbleBoard,
	"Create the Epilog of a 'word' played in a position 'pos' in the following 'direction'."
];
GU`SetUsage[RunVersion1Scrabblegorithm,
	"Iteratively find 14 bingos made of 98 of the 100 tiles in a standard English Scrabble game."
];
GU`SetUsage[VisualizeVersion1,
	"Visualize the bingos found from the Version 1 on an empty Scrabble board."
];
GU`SetUsage[RunVersion2Scrabblegorithm,
	"Iteratively find 14 bingos made of 98 of the 100 tiles in a standard English Scrabble game. 
	These bingos can be 8-letters due to overlaps with previous bingos."
];
GU`SetUsage[FindStartingSquares,
	" Finds list of starting positions of a new bingo."
];
GU`SetUsage[FindPossibleOverlapPositions,
	"Takes the current Master Association, the word to be played, and the possible options for the overlap tile, 
	and finds an association in the form:
	<| Down -> <| OverlapTileOption -> {pos1, pos2, ...} |>, Right -> <|...|> |>
	Then returns a list of valid 'overlap vectors' subject to board constraints."
];
GU`SetUsage[RunScrabblegorithm,
	"Algorithmically generates valid bingos and displays them on the Scrabble board to be chosen by the user."
];
GU`SetUsage[GameToEpilog,
	"Convert a completed game into an Epilog to e displayed on an empty Scrabble board."
];
GU`SetUsage[PerfectScrabbleGameQ,
	"Checks if a game fulfills the criteria of a Perfect Scrabble Game."
];

GU`SetUsage[UpdateTileBag,
	"Updates the tile bag association after playing a bingo, accounting for blanks used if necessary."
];
GU`SetUsage[BattleshipNew,
	"Identify squares used up by a 'bingo' placed at '(row, col)'."
];
GU`SetUsage[ForbiddenSquaresNew,
	"Identify squares in the 'forbidden zones' around already played words."
];
GU`SetUsage[FindBingoSpots,
	"Find spots to play the next bingo through previous horizontal/vertical turns."
];
GU`SetUsage[FindViablePlays,
	"Find all possible locations to play a bingo given a set of previous turns."
];
GU`SetUsage[CanFormWord,
	"Check if a word can be formed from the given tiles."
];
GU`SetUsage[CullBingoList,
	"Cull the list of possible bingos based on the tiles remaining."
];
GU`SetUsage[ScoreTurn,
	"Calculate the score of a given turn."
];
GU`SetUsage[ScoringBonus,
	"Apply letter and word multipliers to calculate the total score of a turn."
];

EndPackage[]