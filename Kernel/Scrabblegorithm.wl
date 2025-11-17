BeginPackage["Scrabbology`PackageScope`", {"Scrabbology`"}]

Begin["`Scrabblegorithm`Private`"]

tiles = 
<|
	"A" -> <|"Quantity" -> 9, "Points" -> 1|>,
	"B" -> <|"Quantity" -> 2, "Points" -> 3|>,
	"C" -> <|"Quantity" -> 2, "Points" -> 3|>,
	"D" -> <|"Quantity" -> 4, "Points" -> 2|>,
	"E" -> <|"Quantity" -> 12, "Points" -> 1|>,
	"F" -> <|"Quantity" -> 2, "Points" -> 4|>,
	"G" -> <|"Quantity" -> 3, "Points" -> 2|>,
	"H" -> <|"Quantity" -> 2, "Points" -> 4|>,
	"I" -> <|"Quantity" -> 9, "Points" -> 1|>,
	"J" -> <|"Quantity" -> 1, "Points" -> 8|>,
	"K" -> <|"Quantity" -> 1, "Points" -> 5|>,
	"L" -> <|"Quantity" -> 4, "Points" -> 1|>,
	"M" -> <|"Quantity" -> 2, "Points" -> 3|>,
	"N" -> <|"Quantity" -> 6, "Points" -> 1|>,
	"O" -> <|"Quantity" -> 8, "Points" -> 1|>,
	"P" -> <|"Quantity" -> 2, "Points" -> 3|>,
	"Q" -> <|"Quantity" -> 1, "Points" -> 10|>,
	"R" -> <|"Quantity" -> 6, "Points" -> 1|>,
	"S" -> <|"Quantity" -> 4, "Points" -> 1|>,
	"T" -> <|"Quantity" -> 6, "Points" -> 1|>,
	"U" -> <|"Quantity" -> 4, "Points" -> 1|>,
	"V" -> <|"Quantity" -> 2, "Points" -> 4|>,
	"W" -> <|"Quantity" -> 2, "Points" -> 4|>,
	"X" -> <|"Quantity" -> 1, "Points" -> 8|>,
	"Y" -> <|"Quantity" -> 2, "Points" -> 4|>,
	"Z" -> <|"Quantity" -> 1, "Points" -> 10|>,
	"?" -> <|"Quantity" -> 2, "Points" -> 0|>
|>;

(* Updates association containing (Tile -> No. Used) pairs. *)
UpdateUsedTileCount[usedCounts_Association, word_String] :=
Module[
	{charCounts},
	charCounts = Counts[Characters[word]];
	Merge[{usedCounts, charCounts}, Total]
]

(* Updates association containing (Tile -> No. Remaining) pairs. *)
UpdateRemainingTileCount[remainingCounts_Association, word_String, blanks_Integer] :=
Module[
	{tiles = Characters[word], charCounts, newCounts, blanksNeeded},
	charCounts = Counts[Characters[word]];
	newCounts = Merge[{remainingCounts, Map[(# -> (remainingCounts[#] - charCounts[#])) &, tiles]}, Last];
	blanksNeeded = Abs[Total[Select[Values[newCounts], # < 0 &]]];
	If[
		blanksNeeded <= blanks && Min[Values[newCounts]] >= -blanks,
		newCounts["?"] = newCounts["?"] - blanksNeeded;
		Return[newCounts],
		Return[remainingCounts]
	]
]

UpdateScrabbleBoard[word_String, pos_List, direction_String : ("Right" | "Down"), epilogState_List] :=
Module[
	{x, y, length, epilog},
	length = StringLength[word];
	x = (pos[[2]] - 1);
	y = 15 - (LetterNumber[pos[[1]]] - 1);
	If[
		direction === "Right",
		epilog = 
		Table[
			{
				{LightYellow, EdgeForm[Thin], 
				Rectangle[{x + (i - 1), y}, {x + i, y - 1}, RoundingRadius -> 0.2]},
				Text[Style[Characters[word][[i]], 16, Bold],
				{x + (i - 0.5), y - 0.5}]
			},
			{i, length}
		],
		epilog =
		Table[
			{
				{LightYellow, EdgeForm[Thin], 
				Rectangle[{x, y - (i - 1)}, {x + 1, y - i}, RoundingRadius -> 0.2]},
				Text[Style[Characters[word][[i]], 16, Bold],
				{x + 0.5, y - (i - 0.5)}]
			},
			{i, length}
		]
	];
	Join[epilogState, epilog]
]


FindStartingSquares[boardRow_, boardCol_, retrace_, toTile_, dirOfPlay_String : ("Right" | "Down")] := 
Module[
	{posList},
	If[
		dirOfPlay == "Down", 
		posList = {ToUpperCase[FromLetterNumber[boardRow - retrace]], boardCol + toTile};
		Flatten[Outer[List, posList[[1]], posList[[2]]], 1],
		posList = {ToUpperCase[FromLetterNumber[boardRow + toTile]], boardCol - retrace};
		Flatten[Outer[List, posList[[1]], posList[[2]]], 1]
	]
]

FindPossibleOverlapPositions[assoc_Association, word_String, overlapTileOptions_List] :=
Module[
	{overlapAssoc = <|"Down" -> <||>, "Right" -> <||>|>, overlapVectors, overlapSquaresAssoc},
	Map[ (* Map over overlap tiles. *)
		Function[
			{tile},
			Map[ (* Map over played bingos. *)
				Function[
					{i},
					Module[
						{
							direction, boardRow, boardCol, bingo = assoc[[i]]["Bingo"], toTile, retrace,
							avoidCols, posListDown, filterPosListDown,
							avoidRows, posListRight, filterPosListRight
						},
						direction = assoc[[i]]["Direction"]; (* Find direction of played bingo. *)
						{boardRow, boardCol} = assoc[[i]]["Position"]; (* Find position of played bingo. *)
						boardRow = LetterNumber[boardRow];
						toTile = StringPosition[assoc[[i]]["Bingo"], tile][[All, 1]] - 1; (* Find position of overlap tile within played bingo. *)    
						retrace = StringPosition[word, tile][[All, 1]] - 1; (* Find position of overlap tile within new bingo. *) 
						(* Play "Down" through this already-played word, as it is directed to the "Right". *)
						If[
							direction == "Right",
							avoidCols = Values[Select[assoc, #["Direction"] == "Down" &][[All, "Position"]]][[All, 2]]; (* Do not play "Down" through existing "Down" bingos. *)   
							posListDown = FindStartingSquares[boardRow, boardCol, retrace, toTile, "Down"];
							filterPosListDown = Select[posListDown, FreeQ[avoidCols, #[[2]]] && LetterNumber[#[[1]]] <= 8 && LetterNumber[#[[1]]] >= 1 &];
							If[
								filterPosListDown =!= {},
								If[
									! KeyExistsQ[overlapAssoc["Down"], tile], 
									overlapAssoc["Down"][tile] = <||>
								];
								If[
									! KeyExistsQ[overlapAssoc["Down"][tile], bingo],
									overlapAssoc["Down"][tile][bingo] = {}
								];
							];
							If[
								filterPosListDown =!= {} && KeyExistsQ[overlapAssoc["Down"][tile], bingo], 
								overlapAssoc["Down"][tile][bingo] = Join[overlapAssoc["Down"][tile][bingo], filterPosListDown]
							], (* Update overlapAssoc. *)
							(* Else, play "Right" through this already-played word, as it is directed "Down". *)
							avoidRows = Values[Select[assoc, #["Direction"] == "Right" &][[All, "Position"]]][[All, 1]]; (* Do not play "Right" through existing "Right" bingos. *)   
							posListRight = FindStartingSquares[boardRow, boardCol, retrace, toTile, "Right"];
							filterPosListRight = Select[posListRight, FreeQ[avoidRows, #[[1]]] && #[[2]] > 0 && #[[2]] <= 8 &];
							If[
								filterPosListRight =!= {},
								If[
									! KeyExistsQ[overlapAssoc["Right"], tile], 
									overlapAssoc["Right"][tile] = <||>
								];
								If[
									! KeyExistsQ[overlapAssoc["Right"][tile], bingo], 
									overlapAssoc["Right"][tile][bingo] = {}
								];
							];
							If[
								filterPosListRight =!= {} && KeyExistsQ[overlapAssoc["Right"][tile], bingo], 
								overlapAssoc["Right"][tile][bingo] = Join[overlapAssoc["Right"][tile][bingo], filterPosListRight]
							]
						]
					]
				],
				Range[Length[assoc]]
			]
		],
		overlapTileOptions
	];
	overlapAssoc = Select[overlapAssoc, # =!= <||> &]; (* E.g. after turn 1 there will be no "Right" overlaps. *)
	overlapVectors = 
	Flatten[
		Table[
			Map[
				{#, dir, tile, bingo} &,
				overlapAssoc[dir][tile][bingo]
			], 
			{dir, Keys[overlapAssoc]}, 
			{tile, Keys[overlapAssoc[dir]]}, 
			{bingo, Keys[overlapAssoc[dir, tile]]}
		], 
		3
	]; (* Obtain all combinations of position, direction, and tile. *)

	(* For each vector, where is it overlapping with 'forbidden' squares? *)
	overlapSquaresAssoc = 
	Map[
		# -> 
		Intersection[
			Battleship[word, #[[1]], #[[2]]], 
			UpdateForbiddenSquares[assoc, #[[4]]]
		] &, 
		overlapVectors
	];
	Keys[
		Select[
			overlapSquaresAssoc, 
			Length[Values[#]] == 1 &
		]
	] (* Select overlap vectors that overlap exactly one square. *)
]

(* Identify squares used up by a 'word' placed at 'startPos'. *)
Battleship[word_String, startPos_List, direction_String : ("Right" | "Down")] :=
Module[
	{row, col, length = StringLength[word]},
	{row, col} = startPos;
	If[
		direction === "Right",
		Table[{row, col + i}, {i, 0, length - 1}],
		Table[{ToUpperCase[FromLetterNumber[LetterNumber[row] + i]], col}, {i, 0, length - 1}]
	]
]

(* Identify squares in the 'forbidden zones' around already played words. *)
ForbiddenSquares[word_String, startPos_List, direction_String : ("Right" | "Down")] :=
 Module[
	{
		row, col, length = StringLength[word], 
		mainPositions, abovePositions, belowPositions, leftPositions, rightPositions
	},
	{row, col} = startPos;
	If[
		direction === "Right",
		mainPositions = Table[{row, col + i}, {i, -1, length}];
		abovePositions = Table[{ToUpperCase[FromLetterNumber[LetterNumber[row] - 1]], col + i}, {i, 0, length - 1} ];
		belowPositions = Table[{ToUpperCase[FromLetterNumber[LetterNumber[row] + 1]], col + i}, {i, 0, length - 1} ];
		Join[mainPositions, abovePositions, belowPositions],
		mainPositions = Table[{ToUpperCase[FromLetterNumber[LetterNumber[row] + i]], col}, {i, -1, length}];
		leftPositions = Table[{ToUpperCase[FromLetterNumber[LetterNumber[row] + i]], col - 1}, {i, 0, length - 1}];
		rightPositions = Table[{ToUpperCase[FromLetterNumber[LetterNumber[row] + i]], col + 1}, {i, 0, length - 1}];
		Join[mainPositions, leftPositions, rightPositions]
	]
]

(* Update 'forbidden squares taking into account the bingo to be overlapped. *)
UpdateForbiddenSquares[assoc_, bingo_] :=
DeleteDuplicates[
	Flatten[
		Values[
			Map[
				With[
					{word = #["Bingo"], pos = #["Position"], dir = #["Direction"]},
					If[
						word == bingo, 
						Battleship[word, pos, dir], 
						ForbiddenSquares[word, pos, dir]
					]
				] &,
				assoc
			]
		],
		1
	]
]

(* Uses 'blankAssoc' to retrieve the blank(s) required for this play. *)
IdentifyBlanks[overlapVector_List, blankAssoc_Association] := 
SelectFirst[
	blankAssoc, 
	#["Overlap"] == overlapVector[[3]] &
]["Blank"]

(* Formats word ready for it to be displayed with its blanks as "?" tiles. *)
FormatWordWithBlanks[word_String, blanks_List] := 
Module[
	{formatWord = word},
	Map[
		Module[
			{blankIndices = StringPosition[word, #][[All, 1]]},
			If[
				Length[blankIndices] > Count[blanks, #], 
				blankIndices = {RandomChoice[blankIndices]}
			];
			formatWord = 
			StringReplacePart[formatWord, ToLowerCase[#], {#, #} & /@ blankIndices]
		] &,
		blanks
	];
	Return[formatWord]
]

(* Determines the blanks allowed at this stage of the iteration. *)
BlanksAllowed[assoc_Association, usedCounts_Association] := 
Module[
	{blanksUsed = usedCounts["?"], b},
	If[
		Length[assoc] < 12, 
		b = 0, 
		If[
			Length[assoc] == 13 && blanksUsed == 0, 
			b = 2, 
			b = 1
		] 
	]; 
	Return[b]
]

RunScrabblegorithm[] :=
Module[
	{
		wordsByLength = GroupBy[RandomSample[Import["CSW21.txt", "List"]], StringLength],
		board = CreateInitialScrabbleBoard[], (* Create Graphic of Empty Scrabble Board. *)
		assoc = <||>
	},
	i = 1;
	While[
		Length[assoc] < 14,
		(* Turn 1. *)
		While[
			Length[assoc] == 0,
			remainingCounts = tiles[[All, "Quantity"]]; (* Whole tile bag remaining. *)
			usedCounts = AssociationThread[Keys[tiles], Table[0, 27]]; (* Initially zero tiles have been used. *)
			b = BlanksAllowed[assoc, usedCounts];
			Module[
				{next = False},
				pos = {"H", 2};
				word = wordsByLength[7][[i]];
				If[
					UpdateRemainingTileCount[remainingCounts, word, b] === tiles[[All, "Quantity"]], (* Starting 7-letter word must not require blanks. *)
					Print[word, ": Choose another Starter"];
					next = True
				];
				Module[
					{boardTurn1},
					boardTurn1 =
					Row[
						{
							DynamicModule[
								{currentBoard = board, localEpilogState},
								localEpilogState = UpdateScrabbleBoard[word, pos, "Right", {}];
								Column[
									{
										Show[currentBoard, ImageSize -> 300, Epilog -> localEpilogState],
										Button[
											"Select",
											AppendTo[assoc, 1 -> <|"Bingo" -> word, "Position" -> pos, "Direction" -> "Right"|>];
											remainingCounts = UpdateRemainingTileCount[remainingCounts, word, b];
											usedCounts = UpdateUsedTileCount[usedCounts, word];
											epilogState = localEpilogState;
											next = True;(* Flag is set to True when selected *)
											Print["Tiles Used: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]]];
											Print["Tiles Left: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]]];
											NotebookDelete[EvaluationCell[]];
										]
									}
								]
							],
							Button["Skip", next = True; NotebookDelete[EvaluationCell[]]]
						}
					];
					If[next == False, Print[boardTurn1]];
					WaitUntil[next === True];
					next = False;
				];
			];
			i++;
			If[i > Length[wordsByLength[7]], Abort[]];
			If[Length[assoc] == 1, i = 1]
		];

		(* Turns 2-12. *)
		While[
			1 <= Length[assoc] < 12,
			Module[
				{next = False}, (* Initialize flag. *)
				word = wordsByLength[8][[i]];
				overlapTileOptions = Intersection[Characters[word], Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]];
				If[overlapTileOptions === {}, Print[word, " Has No Overlaps!"]; next = True];
				b = BlanksAllowed[assoc, usedCounts];
				Map[ (* Check the remaining counts for each overlap option. *)
					If[
						UpdateRemainingTileCount[remainingCounts, StringJoin[DeleteElements[Characters[word], 1 -> {#}]], b] == remainingCounts,
						overlapTileOptions = DeleteCases[overlapTileOptions, #] (* Keep only options that can be formed with the available tiles. *)
					] &, 
					overlapTileOptions
				];
				If[overlapTileOptions === {}, next = True];
				overlapVectors = FindPossibleOverlapPositions[assoc, word, overlapTileOptions];
				If[overlapVectors === {}, next = True];
				possibleEpilogs = AssociationMap[UpdateScrabbleBoard[word, #[[1]], #[[2]], epilogState] &, overlapVectors];
				
				Module[
					{boardOptions},
					boardOptions =
					Row[
						Join[
							Table[
								DynamicModule[
									{currentBoard = board, localEpilogState, dIdx = idx},
									localEpilogState = possibleEpilogs[overlapVectors[[idx]]];
									Column[
										{  
											Show[currentBoard, ImageSize -> 300, Epilog -> Dynamic[localEpilogState]],
											Button[
												"Select",
												AppendTo[assoc, Length[assoc] + 1 -> <|"Bingo" -> word, "Position" -> overlapVectors[[dIdx]][[1]], "Direction" -> overlapVectors[[dIdx]][[2]], "Overlap" -> overlapVectors[[dIdx]][[3]]|>];
												remainingCounts = UpdateRemainingTileCount[remainingCounts, StringJoin[DeleteElements[Characters[word], 1 -> {overlapVectors[[dIdx]][[3]]}]], b];
												usedCounts = UpdateUsedTileCount[usedCounts, StringJoin[DeleteElements[Characters[word], 1 -> {overlapVectors[[dIdx]][[3]]}]]];
												epilogState = localEpilogState;
												next = True; (* Flag is set to True when selected *)
												Print["Tiles Used: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]]];
												Print["Tiles Left: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]]];
												Print["Bingos Checked: ", i];
												NotebookDelete[EvaluationCell[]]
											]
										}
									]
								],
							{idx, Length[overlapVectors]}
							],
							{
								If[
									overlapTileOptions =!= {}, 
									Button["Skip", next = True; NotebookDelete[EvaluationCell[]]], 
									Nothing
								]
							}
						]
					];
					If[next == False, Print[boardOptions]];
					WaitUntil[next === True];
					next = False;
				];
			];
			i++; 
			If[i == 10000, Print["25% Bingos Checked"]];
			If[i == 20000, Print["50% Bingos Checked"]];
			If[i == 30000, Print["75% Bingos Checked"]];
			If[i > Length[wordsByLength[8]], Print["Sorry! Try Again!"]; Abort[]];
			If[Length[assoc] == 12, i = 1]
		];

		(* Turns 13 and 14. *)
		Module[
			{next = False}, (* Initialize flag. *)
			word = wordsByLength[8][[i]];
			overlapTileOptions = Intersection[Characters[word], Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]]; 
			If[overlapTileOptions === {}, Print[word, " Has No Overlaps!"]; next = True];
			b = BlanksAllowed[assoc, usedCounts];
			blankAssoc = {};
			(* Identify blanks and update blankAssoc. *)
			Map[
				Module[
					{newRemainingCounts, negativeKeys},
					newRemainingCounts = UpdateRemainingTileCount[remainingCounts, StringJoin[DeleteElements[Characters[word], 1 -> {#}]], b];
					If[
						newRemainingCounts == remainingCounts,             
						overlapTileOptions = DeleteCases[overlapTileOptions, #],
						negativeKeys = Flatten[Table[#, {-newRemainingCounts[#]}] & /@ Select[Keys[newRemainingCounts], newRemainingCounts[#] < 0 &]];
						If[negativeKeys =!= {},
							AppendTo[blankAssoc, <|"Overlap" -> #, "Blank" -> negativeKeys|>],
							AppendTo[blankAssoc, <|"Overlap" -> #, "Blank" -> Null|>]
						]
					]
				] &,
				overlapTileOptions
			];
			If[overlapTileOptions === {}, next = True];
			overlapVectors = FindPossibleOverlapPositions[assoc, word, overlapTileOptions];
			If[
				overlapVectors === {}, 
				next = True,
				Echo@word;
				{overlapVectors, possibleEpilogs} =
				Module[
					{
						vectors, epilogs, blankVectors, wordOptions, blankEpilogs
					},
					vectors = Select[overlapVectors, IdentifyBlanks[#, blankAssoc] == Null &];
					epilogs = AssociationMap[UpdateScrabbleBoard[word, #[[1]], #[[2]], epilogState] &, vectors];
					blankVectors = Select[overlapVectors, IdentifyBlanks[#, blankAssoc] =!= Null &];
					blankVectors = Map[Append[#, IdentifyBlanks[#, blankAssoc]] &, blankVectors];
					wordOptions = AssociationMap[FormatWordWithBlanks[word, IdentifyBlanks[#, blankAssoc]] &, blankVectors];
					blankEpilogs = AssociationMap[UpdateScrabbleBoard[StringReplace[wordOptions[#], c_ /; LowerCaseQ[c] :> "?"], #[[1]], #[[2]], epilogState] &, blankVectors];
					{Join[vectors, blankVectors], Join[epilogs, blankEpilogs]}
				];
			];
			Module[
				{boardOptions},
				boardOptions =
				Row[
					Join[
						Table[
							DynamicModule[
								{currentBoard = board, localEpilogState, dIdx = idx},
								localEpilogState = possibleEpilogs[overlapVectors[[idx]]];
								Column[
									{ 
										Show[currentBoard, ImageSize -> 300, Epilog -> Dynamic[localEpilogState]],
										Button[
											"Select",
											i = 1;
											AppendTo[assoc, Length[assoc] + 1 -> <|"Bingo" -> word, "Position" -> overlapVectors[[dIdx]][[1]], "Direction" -> overlapVectors[[dIdx]][[2]], "Overlap" -> overlapVectors[[dIdx]][[3]]|>];
											If[
												Length[overlapVectors[[dIdx]]] == 5,
												usedCounts = UpdateUsedTileCount[usedCounts, StringJoin[DeleteElements[Characters[word], 1 -> Flatten[{overlapVectors[[dIdx]][[3]], overlapVectors[[dIdx]][[5]]}]]]];
												remainingCounts = UpdateRemainingTileCount[remainingCounts, StringJoin[DeleteElements[Characters[word], 1 -> {overlapVectors[[dIdx]][[3]]}]], Length[overlapVectors[[dIdx]][[5]]]];
												Map[remainingCounts[#]++ &, overlapVectors[[dIdx]][[5]]];
												usedCounts["?"] = usedCounts["?"] + Length[overlapVectors[[dIdx]][[5]]],
												usedCounts = UpdateUsedTileCount[usedCounts, StringJoin[DeleteElements[Characters[word], 1 -> {overlapVectors[[dIdx]][[3]]}]]];
												remainingCounts = UpdateRemainingTileCount[remainingCounts, StringJoin[DeleteElements[Characters[word], 1 -> {overlapVectors[[dIdx]][[3]]}]], 0]
											];
											epilogState = localEpilogState;
											next = True;(* Flag is set to True when selected *)
											Print["Tiles Used: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]]];
											Print["Tiles Left: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]]];
											NotebookDelete[EvaluationCell[]]
										]
									}
								]
							],	
							{idx, Length[overlapVectors]}
						],
						{
							If[
								overlapTileOptions =!= {}, 
								Button["Skip", next = True; NotebookDelete[EvaluationCell[]]], 
								Nothing
							]
						}
					]
				];
				If[next == False, Print[boardOptions]];
				WaitUntil[next === True];
				next = False;
			];
		];
		i++; 
		If[i == 10000, Print["25% Bingos Checked"]];
		If[i == 20000, Print["50% Bingos Checked"]];
		If[i == 30000, Print["75% Bingos Checked"]];
		If[i > Length[wordsByLength[8]],  Print["Sorry! Try Again!"]; Abort[]];
	]
]

GameToEpilog[game_List] := 
Fold[
	UpdateScrabbleBoard[
		game[#2, "Bingo"],
		game[#2, "Position"],
		game[#2, "Direction"],
		#1
	] &,
	{},
	Range[Length[game]]
]

PerfectScrabbleGameQ[game_List] :=
Module[
	{
		tileBag = KeyDrop[tiles[[All, "Quantity"]], "?"],
		bingoChars = Flatten[Characters /@ Values[game[[All, "Bingo"]]]],
		overlapCounts = Counts[Values[game[[All, "Overlap"]]][[2 ;;]]],
		playedTilesCounts = AssociationThread[CharacterRange["A", "Z"], ConstantArray[0, Length[CharacterRange["A", "Z"]]]],
		diff, blanks, leftovers
	},
	playedTilesCounts = KeySort[Merge[{playedTilesCounts, Counts[DeleteElements[bingoChars, Values[overlapCounts] -> Keys[overlapCounts]]]}, Total]];
	diff = tileBag - playedTilesCounts;
	blanks = Flatten[Table[#, {-diff[#]}] & /@ Keys[Select[diff, # < 0 &]]];
	leftovers = Keys[Select[diff, # > 0 &]];
	Return[
		{
			If[
				Total[diff] == 0, 
				True, 
				False
			], 
			Grid[
				{
					{"Blanks:", blanks}, 
					{" Leftovers:", leftovers}
				}
			]
		}
	]
]

End[]

EndPackage[]