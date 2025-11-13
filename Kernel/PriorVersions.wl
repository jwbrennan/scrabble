BeginPackage["Scrabbology`PriorVersions`", {"Scrabblegorithm`", "ScrabbleBoard`"}]
RunVersion1Scrabblegorithm;
VisualizeVersion1;
RunVersion2Scrabblegorithm;
Begin["`Private`"]

RunVersion1Scrabblegorithm[iterations_Integer] := 
Module[
	{
		j = 1, dict, wordsByLength, remainingCounts, bingos, blanks,
		b, word, newRemainingCounts, negativeKeys, i
	},
	Do[
		Print[StringJoin["Attempt ", ToString[j]]];
		j++;
		(* Initialize variables. *)
		dict = RandomSample[Import["CSW21.txt", "List"]];
		wordsByLength = GroupBy[dict, StringLength];
		remainingCounts = tiles[[All, "Quantity"]];
		bingos = {};
		blanks = {};
		i = 1;
		(* Main loop. *)
		While[
			i <= Length[wordsByLength[7]], 
			word = wordsByLength[7][[i]];
			If[Length[bingos] < 12, b = 0, b = 1];
			newRemainingCounts = UpdateRemainingTileCount[remainingCounts, word, b];
			If[
				newRemainingCounts === remainingCounts, 
				If[
					i == Length[wordsByLength[7]], 
					Print["No Valid Words"]
				]; 
				i++, 
				negativeKeys = Select[Keys[newRemainingCounts], newRemainingCounts[#] < 0 &];
				If[
					negativeKeys =!= {}, 
					AppendTo[blanks, negativeKeys[[1]]]; 
					newRemainingCounts[negativeKeys[[1]]] = 0;
				];
				AppendTo[bingos, word];
				remainingCounts = newRemainingCounts;
				Print["Bingos Found: ", bingos];
				Print["Tiles Left: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]]];
				If[
					Length[bingos] == 14, 
					Print["Success!"];
					CloudPut[
						Append[CloudGet["V.1-WordMaster"], 
						<|
							"Bingos" -> bingos, 
							"Blanks" -> blanks, 
							"Tiles Remaining" -> Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]
						|>
						], 
						"V.1-WordMaster"
					]
				];
				If[
					Length[bingos] == 12, 
					i = 1, 
					i++
				]
			];
		], 
		{iterations}
	]
];

VisualizeVersion1[game_Association] :=
Module[
	{epilog, board = CreateInitialScrabbleBoard[], bingos = game["Bingos"], blanks = game["Blanks"], leftover = game["Tiles Remaining"]},
	(* Place Bingos on board. *)
	epilog = 
	Fold[
		Module[
			{col, row},
			row = If[#2 <= 7, ToUpperCase[FromLetterNumber[2 #2 - 1]], ToUpperCase[FromLetterNumber[2 (#2 - 7)]]];
			col = If[#2 <= 7, 1, 9];
			UpdateScrabbleBoard[bingos[[#2]], {row, col}, "Right", #]
		] &, 
		{},
		Range[Length[bingos]]
	];
	(* Replace letters with blanks. *)
	epilog = 
	Module[
		{rEpilog = Partition[epilog, 7], finalTurns},
		finalTurns = {rEpilog[[-2]][[All, 2]][[All, 1]], rEpilog[[-1]][[All, 2]][[All, 1]]};
		rEpilog[[-2, All, 2, 1]] = ReplacePart[finalTurns[[1]], RandomChoice[Position[finalTurns[[1]], blanks[[1]]]] -> "?"];
		rEpilog[[-1, All, 2, 1]] = ReplacePart[finalTurns[[2]], RandomChoice[Position[finalTurns[[2]], blanks[[2]]]] -> "?"];
		rEpilog
	];
	(* Place leftover tiles in corner. *)
	epilog = 
	Fold[
		UpdateScrabbleBoard[leftover[[#2]], {"O", #2}, "Right", #] &, epilog, Range[2]
	];
	Show[board, ImageSize -> 400, Epilog -> epilog]
]

RunVersion2Scrabblegorithm[iterations_Integer] :=
Module[
	{
		j, dict, wordsByLength, remainingCounts, usedCounts, bingos, blanks, overlaps, blankTileList, usedWords, i, 
		word, b, overlapOptions, overlapTile, newRemainingCounts, charsToDelete
	},
	Do[
		j++;
		(* Initialize Variables. *)
		dict = RandomSample[Import["CSW21.txt", "List"]];
		wordsByLength = GroupBy[dict, StringLength];
		remainingCounts = tiles[[All, "Quantity"]];
		usedCounts = AssociationThread[Keys[tiles], Table[0, 27]];
		bingos = {};
		blanks = {};
		overlaps = {};
		blankTileList = {};
		usedWords = <||>;(* Track used words *)
		i = 1;
		(* Select Starting Word. *)
		word = RandomChoice[wordsByLength[7]];
		remainingCounts = UpdateRemainingTileCount[remainingCounts, word, 0]
		(* If Starting Word requires blanks, skip to next iteration. *);
		If[
			remainingCounts === tiles[[All, "Quantity"]],
			Print[word];
			Print["Choose another Starter"];
			Continue[];
		];
		usedCounts = UpdateUsedTileCount[usedCounts, word];
		AppendTo[bingos, word];
		Print["Bingos: ", bingos];
		Print["Tiles Left: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]]];
		Print["Tiles Used: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]]];
		(* Main loop *)
		While[
			i <= Length[wordsByLength[8]],
			word = wordsByLength[8][[i]];
			If[KeyExistsQ[usedWords, word], i++; Continue[]];
			If[Length[bingos] < 12,	b = 0, b = 1];
			overlapOptions = Intersection[Characters[word], Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]];
			If[
				overlapOptions === {},
				Print[word, " Has No Overlaps!"];
				i++;
				Continue[];
			];
			overlapTile = RandomChoice[overlapOptions];
			newRemainingCounts = UpdateRemainingTileCount[remainingCounts, StringJoin[DeleteElements[Characters[word], 1 -> {overlapTile}]], b];
			If[
				newRemainingCounts === remainingCounts,  
				If[
					i == Length[wordsByLength[8]], 
					Print["No Valid Words"]
				];
				i++,
				blankTileList = Select[Keys[newRemainingCounts], newRemainingCounts[#] < 0 &];
				If[
					blankTileList =!= {},
					AppendTo[blanks, blankTileList[[1]]];
					newRemainingCounts[blankTileList[[1]]] = 0;
					usedCounts["?"]++;
					Print[word, " played through: ", overlapTile, " with a blank ", blankTileList[[1]]];,
					Print[word, " played through: ", overlapTile]
				];
				AppendTo[bingos, word];
				AppendTo[overlaps, overlapTile];
				charsToDelete = Join[{overlapTile}, blankTileList];
				usedCounts = UpdateUsedTileCount[usedCounts, StringJoin[DeleteElements[Characters[word], 1 -> charsToDelete]]];
				remainingCounts = newRemainingCounts;
				Print["Bingos: ",bingos];
				Print["Tiles Left: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]]];
				Print["Tiles Used: ", Length[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]], " ", StringJoin[Flatten[KeyValueMap[Table[#1, #2] &, usedCounts]]]];
				usedWords[word] = True;(* Mark the word as used *)
				If[
					Length[bingos] == 14,
					Print["Success!"];
					CloudPut[
						Append[
							CloudGet["V.2-WordMaster"],
							<|
								"Bingos" -> bingos, "Overlaps" -> overlaps, "Blanks" -> blanks,
								"Tiles Remaining" -> Flatten[KeyValueMap[Table[#1, #2] &, remainingCounts]]
							|>
						],
						"V.2-WordMaster"
					];
					Break[];
				];
				If[
					Length[bingos] == Or[12, 13],
					i = 1,
					i++
				];
			];
		],
		{j, 1, iterations}
	]
]

End[]

EndPackage[]