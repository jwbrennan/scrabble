BeginPackage["Scrabbology`PackageScope`", {"Scrabbology`"}]

Begin["`APIFunctions`Private`"]

UpdateTileBag[tileBag_Association, bingo_String, blanksRemaining_Integer]:=
Module[
	{
		tilesInBingo = Characters[bingo], charCounts, newTileBag, blanksNeeded
	},
	charCounts=Counts[tilesInBingo];
	newTileBag=
	Merge[
		{
			tileBag,
			AssociationMap[(tileBag[#] - charCounts[#]) &, tilesInBingo ]
		},
		Last
	];
	blanksNeeded=
	Abs[
		Total[
			Select[
				Values[newTileBag],
				# < 0 &
			]
		]
	];
	If[
		blanksNeeded <= blanksRemaining && Min[Values[newTileBag]] >= -blanksRemaining,
		newTileBag["?"] = newTileBag["?"] - blanksNeeded;
		Return[
			{
				"success" -> True,
				"tileBag" -> Normal[newTileBag] /. x_Integer /; x < 0 :> 0,
				"blanks" -> Flatten[KeyValueMap[Table[#1, -#2] &, Select[newTileBag, # < 0 &]]]
			}
		],
		Return[
			{
				"success" -> False,
				"error" -> "CANNOT-FORM-WORD"
			}
		]
	]
];

BattleshipNew[spot_ /; spot["direction"] == "H"] :=
Module[
	{row, col, length = StringLength[spot["bingo"]]},
	{row, col} = {spot["row"], spot["col"]};
	Table[
		{row, col + i},
		{i, 0, length - 1}
	]
];
BattleshipNew[spot_ /; spot["direction"] == "V"] :=
Module[
	{row, col, length = StringLength[spot["bingo"]]},
	{row, col} = {spot["row"], spot["col"]};
	Table[
	{row + i, col},
	{i, 0, length - 1}
	]
];

ForbiddenSquaresNew[turn_Association /; turn["direction"] == "H"] :=
Module[
	{row, col, length = StringLength[turn["bingo"]]},
	{row, col} = {turn["row"], turn["col"]};
	Join[
		Table[{row, col + i}, {i, -1, length}],
		Table[{row - 1, col + i}, {i, 0, length - 1}],
		Table[{row + 1, col + i}, {i, 0, length - 1}]
	]
];
ForbiddenSquaresNew[turn_Association /; turn["direction"] == "V"] :=
Module[
	{row, col, length = StringLength[turn["bingo"]]},
	{row, col} = {turn["row"], turn["col"]};
	Join[
		Table[{row + i, col}, {i, -1, length}],
		Table[{row + i, col - 1}, {i, 0, length - 1}],
		Table[{row + i, col + 1}, {i, 0, length - 1}]
	]
];

FindBingoSpots[bingo_String, turn_Association /; turn["direction"] == "H"] :=
Module[
	{
	word = turn["bingo"], row = turn["row"], col = turn["col"], 
	id = turn["id"], overlaps, startingPosList
	},
	overlaps = Intersection[Characters[word], Characters[bingo]];
	Flatten[
		Map[
			With[
				{
					toTile = StringPosition[word, #][[All, 1]] - 1,
					retrace = StringPosition[bingo, #][[All, 1]] - 1
				},
				startingPosList =
				Flatten[
					Outer[List, (row - retrace), (col + toTile)],
					1
				];
				Table[
					<|
						"bingo" -> bingo, "row" -> pos[[1]], "col" -> pos[[2]], "direction" -> "V", "playThroughTurn" -> id, "overlapTile" -> #
					|>,
					{pos, startingPosList}
				]
			] &,
			overlaps
		],
		1
	]
];
FindBingoSpots[bingo_String, turn_Association /; turn["direction"] == "V"] :=
Module[
	{
		word = turn["bingo"], row = turn["row"], col = turn["col"], 
		id = turn["id"], overlaps, startingPosList
	},
	overlaps = Intersection[Characters[word], Characters[bingo]];
	Flatten[
		Map[
			With[
				{
					toTile = StringPosition[word, #][[All, 1]] - 1,
					retrace = StringPosition[bingo, #][[All, 1]] - 1
				},
				startingPosList =
				Flatten[
					Outer[List, (row + toTile), (col - retrace)],
					1
				];
				Table[
					<|
						"bingo" -> bingo, "row" -> pos[[1]], "col" -> pos[[2]], "direction" -> "H", "playThroughTurn" -> id, "overlapTile" -> #
					|>,
					{pos, startingPosList}
				]
			] &,
			overlaps
		],
		1
	]
];

FindViablePlays[bingo_String, turns_List] :=
Module[
	{
		plays = {}, spots, avoidCols, playDown, avoidRows, playAcross, playsWithTileBag, playsWithForbiddenSquares, validPlays
	},
	plays =
	Flatten[
		Map[
			If[
				#["direction"] === "H",
				spots = FindBingoSpots[bingo, #];
				avoidCols = Select[turns, #["direction"] == "V" &][[All, "col"]];
				playDown =
				Select[
					spots,
					! MemberQ[avoidCols, #["col"]] && #["row"] <= 7 && #["row"] >= 0 &
				];
				Join[plays, playDown],
				spots = FindBingoSpots[bingo, #];
				avoidRows = Select[turns, #["direction"] == "H" &][[All, "row"]];
				playAcross =
				Select[
					spots,
					! MemberQ[avoidRows, #["row"]] && #["col"] <= 7 && #["col"] >=	0 &
				];
				Join[plays, playAcross]
			] &,
			turns
		],
		1
	];
	playsWithTileBag =
	Map[
		Join[
			#,
			With[
				{possibleBingo = #["bingo"], overlapTile = #["overlapTile"]},
				{
					response =
					Enclose[
						ConfirmMatch[
							With[
								{
									blanksIntervene = If[Length[turns] < 12, 0, Min[Last[turns]["tileBag"]["?"], 1]]
								},
								UpdateTileBag[
									Last[turns]["tileBag"], 
									StringJoin[DeleteElements[Characters[possibleBingo], 1 -> {overlapTile}]], 
									blanksIntervene
								]
							],
							{"success" -> True, "tileBag" -> _List, "blanks" -> _List}
						]
					]
				},
				<|
					"tileBag" -> 
					If[
						FailureQ[response], 
						$Failed, 
						Association[response]["tileBag"]
					],
					"tilesLeft" -> 
					If[
						FailureQ[response], 
						$Failed, 
						Total[Values[Association[response]["tileBag"]]]
					],
					"blanks" -> 
					If[
						FailureQ[response], 
						$Failed, 
						Association[response]["blanks"]
					]
				|>
			]
		] &,
	plays
	];
	playsWithForbiddenSquares =
	Map[
		With[
			{play = #, playThroughTurn = #["playThroughTurn"]},
			Append[
				play,
				"forbiddenSquares" ->
				Flatten[
					Map[
						With[
							{turn = #},
							If[
								turn["id"] == playThroughTurn,
								BattleshipNew[turn],
								ForbiddenSquaresNew[turn]
							]
						] &,
					turns
					],
				1
				]
			]
		] &,
		playsWithTileBag
	];
	validPlays =
	Select[
		playsWithForbiddenSquares,
		ListQ[#["tileBag"]] && Length[Intersection[BattleshipNew[#], #["forbiddenSquares"]]] == 1 &
	];
	If[
		Length[validPlays] > 0,
		Return[
			{
				"success" -> True,
				"viablePlays" -> Normal[KeyDrop[validPlays, {"forbiddenSquares", "playThroughTurn"}]]
			}
		],
		Return[
			{
				"success" -> False,
				"error" -> "NO-VIABLE-PLAYS"
			}
		]
	]
];

CanFormWord[tiles_String, word_String] := AllTrue[Tally[Characters[word]], (Count[Characters[tiles], #[[1]]] >= #[[2]]) &];

CullBingoList[bingoList_List, tiles_String, blanks_Integer /; blanks < 2] :=
If[
	blanks == 0,
	Flatten[
		Table[
			Select[
				bingoList,
				CanFormWord[StringJoin[tiles, overlapTile], #] &
			],
			{overlapTile, ToUpperCase[Alphabet[]]}
		]
	],
	Flatten[
		Table[
			Select[
				bingoList,
				CanFormWord[StringJoin[tiles, overlapTilePlusBlank], #] &
			],
			{overlapTilePlusBlank, StringJoin @@@ Subsets[ToUpperCase[Alphabet[]], {2}]}
		]
	]
];
End[]

EndPackage[]