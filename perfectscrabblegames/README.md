I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). Currently a user can select a starting square anywhere on the board and choose a direction to play it (horizontally or vertically). I have logged in the console the data representing a 'Turn'.
```tsx
export interface Turn { bingo: string; row: number; col: number; direction: Direction; // "H" or "V" score: number; }
```
Each time a 'bingo' is played, I am sending the 'bingo' and the tiles currently in the 'tile bag' to an external api, returning the new/updated 'tile bag'. This API handles cases where 'blanks' are required, and returns a failure if the word cannot be formed, e.g. if it contains 4 Zs. The first turn is a seven letter bingo and the 2nd (and all subsequent turns) is an eight letter bingo that must have exactly one overlap with the first bingo.

I am storing all 'Turns' in the following way:

[
	{
		"id":1,
		"bingo":"OREGANO",
		"row":7,
		"col":7,
		"direction":"H",
		"score":0,
		"blanksUsed":0,
		"tileBag":{"A":8,"B":2,"C":2,"D":4,"E":11,"F":2,"G":2,"H":2,"I":9,"J":1,"K":1,"L":4,"M":2,"N":5,"O":6,"P":2,"Q":1,"R":5,"S":4,"T":6,"U":4,"V":2,"W":2,"X":1,"Y":2,"Z":1,"?":2},
		"tilesLeft":93
	},
		{
			"id":2,
			"bingo":"KVETCHES",
			"row":5,
			"col":9,
			"direction":"V",
			"score":0,
			"blanksUsed":0,
			"tileBag":{"A":8,"B":2,"C":1,"D":4,"E":10,"F":2,"G":2,"H":1,"I":9,"J":1,"K":0,"L":4,"M":2,"N":5,"O":6,"P":2,"Q":1,"R":5,"S":3,"T":5,"U":4,"V":1,"W":2,"X":1,"Y":2,"Z":1,"?":2},
			"tilesLeft":86
		},
	{
		"id":3,
		"bingo":"APRICOTS",
		"row":12,
		"col":2,
		"direction":"H",
		"score":0,
		"blanksUsed":0,
		"tileBag":{"A":7,"B":2,"C":0,"D":4,"E":10,"F":2,"G":2,"H":1,"I":8,"J":1,"K":0,"L":4,"M":2,"N":5,"O":5,"P":1,"Q":1,"R":4,"S":3,"T":4,"U":4,"V":1,"W":2,"X":1,"Y":2,"Z":1,"?":2},
		"tilesLeft":79
	},
	{
		"id":4,
		"bingo":"JETPORTS",
		"row":7,
		"col":4,
		"direction":"V",
		"score":0,
		"blanksUsed":0,
		"tileBag":{"A":7,"B":2,"C":0,"D":4,"E":9,"F":2,"G":2,"H":1,"I":8,"J":0,"K":0,"L":4,"M":2,"N":5,"O":4,"P":0,"Q":1,"R":4,"S":2,"T":2,"U":4,"V":1,"W":2,"X":1,"Y":2,"Z":1,"?":2},
		"tilesLeft":72
	}
]

 Right now I have an an external API to find all possible overlapping 'plays' where the 2nd (and all subsequent bingos) can go. It returns a list of viable plays in this format: 

{{"bingo" -> "CEPHALIN", "row" -> 3, "col" -> 11, "direction" -> "V", 
  "playThroughTurn" -> 1, "overlapTile" -> "A", 
  "tileBag" -> {"A" -> 7, "B" -> 2, "C" -> 0, "D" -> 4, "E" -> 8, 
    "F" -> 2, "G" -> 2, "H" -> 0, "I" -> 7, "J" -> 0, "K" -> 0, 
    "L" -> 3, "M" -> 2, "N" -> 4, "O" -> 4, "P" -> 0, "Q" -> 1, 
    "R" -> 4, "S" -> 2, "T" -> 2, "U" -> 4, "V" -> 1, "W" -> 2, 
    "X" -> 1, "Y" -> 2, "Z" -> 1, "?" -> 0}, "tilesLeft" -> 65, 
  "blanks" -> {"C", "P"}, 
  "forbiddenSquares" -> {{7, 7}, {7, 8}, {7, 9}, {7, 10}, {7, 11}, {7,
      12}, {7, 13}, {4, 9}, {5, 9}, {6, 9}, {7, 9}, {8, 9}, {9, 
     9}, {10, 9}, {11, 9}, {12, 9}, {13, 9}, {5, 8}, {6, 8}, {7, 
     8}, {8, 8}, {9, 8}, {10, 8}, {11, 8}, {12, 8}, {5, 10}, {6, 
     10}, {7, 10}, {8, 10}, {9, 10}, {10, 10}, {11, 10}, {12, 
     10}, {12, 1}, {12, 2}, {12, 3}, {12, 4}, {12, 5}, {12, 6}, {12, 
     7}, {12, 8}, {12, 9}, {12, 10}, {11, 2}, {11, 3}, {11, 4}, {11, 
     5}, {11, 6}, {11, 7}, {11, 8}, {11, 9}, {13, 2}, {13, 3}, {13, 
     4}, {13, 5}, {13, 6}, {13, 7}, {13, 8}, {13, 9}, {6, 4}, {7, 
     4}, {8, 4}, {9, 4}, {10, 4}, {11, 4}, {12, 4}, {13, 4}, {14, 
     4}, {15, 4}, {7, 3}, {8, 3}, {9, 3}, {10, 3}, {11, 3}, {12, 
     3}, {13, 3}, {14, 3}, {7, 5}, {8, 5}, {9, 5}, {10, 5}, {11, 
     5}, {12, 5}, {13, 5}, {14, 5}}}, {"bingo" -> "CEPHALIN", 
  "row" -> 0, "col" -> 12, "direction" -> "V", "playThroughTurn" -> 1,
   "overlapTile" -> "N", 
  "tileBag" -> {"A" -> 6, "B" -> 2, "C" -> 0, "D" -> 4, "E" -> 8, 
    "F" -> 2, "G" -> 2, "H" -> 0, "I" -> 7, "J" -> 0, "K" -> 0, 
    "L" -> 3, "M" -> 2, "N" -> 5, "O" -> 4, "P" -> 0, "Q" -> 1, 
    "R" -> 4, "S" -> 2, "T" -> 2, "U" -> 4, "V" -> 1, "W" -> 2, 
    "X" -> 1, "Y" -> 2, "Z" -> 1, "?" -> 0}, "tilesLeft" -> 65, 
  "blanks" -> {"C", "P"}, 
  "forbiddenSquares" -> {{7, 7}, {7, 8}, {7, 9}, {7, 10}, {7, 11}, {7,
      12}, {7, 13}, {4, 9}, {5, 9}, {6, 9}, {7, 9}, {8, 9}, {9, 
     9}, {10, 9}, {11, 9}, {12, 9}, {13, 9}, {5, 8}, {6, 8}, {7, 
     8}, {8, 8}, {9, 8}, {10, 8}, {11, 8}, {12, 8}, {5, 10}, {6, 
     10}, {7, 10}, {8, 10}, {9, 10}, {10, 10}, {11, 10}, {12, 
     10}, {12, 1}, {12, 2}, {12, 3}, {12, 4}, {12, 5}, {12, 6}, {12, 
     7}, {12, 8}, {12, 9}, {12, 10}, {11, 2}, {11, 3}, {11, 4}, {11, 
     5}, {11, 6}, {11, 7}, {11, 8}, {11, 9}, {13, 2}, {13, 3}, {13, 
     4}, {13, 5}, {13, 6}, {13, 7}, {13, 8}, {13, 9}, {6, 4}, {7, 
     4}, {8, 4}, {9, 4}, {10, 4}, {11, 4}, {12, 4}, {13, 4}, {14, 
     4}, {15, 4}, {7, 3}, {8, 3}, {9, 3}, {10, 3}, {11, 3}, {12, 
     3}, {13, 3}, {14, 3}, {7, 5}, {8, 5}, {9, 5}, {10, 5}, {11, 
     5}, {12, 5}, {13, 5}, {14, 5}}}, {"bingo" -> "CEPHALIN", 
  "row" -> 10, "col" -> 6, "direction" -> "H", "playThroughTurn" -> 2,
   "overlapTile" -> "H", 
  "tileBag" -> {"A" -> 6, "B" -> 2, "C" -> 0, "D" -> 4, "E" -> 8, 
    "F" -> 2, "G" -> 2, "H" -> 1, "I" -> 7, "J" -> 0, "K" -> 0, 
    "L" -> 3, "M" -> 2, "N" -> 4, "O" -> 4, "P" -> 0, "Q" -> 1, 
    "R" -> 4, "S" -> 2, "T" -> 2, "U" -> 4, "V" -> 1, "W" -> 2, 
    "X" -> 1, "Y" -> 2, "Z" -> 1, "?" -> 0}, "tilesLeft" -> 65, 
  "blanks" -> {"C", "P"}, 
  "forbiddenSquares" -> {{7, 6}, {7, 7}, {7, 8}, {7, 9}, {7, 10}, {7, 
     11}, {7, 12}, {7, 13}, {7, 14}, {6, 7}, {6, 8}, {6, 9}, {6, 
     10}, {6, 11}, {6, 12}, {6, 13}, {8, 7}, {8, 8}, {8, 9}, {8, 
     10}, {8, 11}, {8, 12}, {8, 13}, {5, 9}, {6, 9}, {7, 9}, {8, 
     9}, {9, 9}, {10, 9}, {11, 9}, {12, 9}, {12, 1}, {12, 2}, {12, 
     3}, {12, 4}, {12, 5}, {12, 6}, {12, 7}, {12, 8}, {12, 9}, {12, 
     10}, {11, 2}, {11, 3}, {11, 4}, {11, 5}, {11, 6}, {11, 7}, {11, 
     8}, {11, 9}, {13, 2}, {13, 3}, {13, 4}, {13, 5}, {13, 6}, {13, 
     7}, {13, 8}, {13, 9}, {6, 4}, {7, 4}, {8, 4}, {9, 4}, {10, 
     4}, {11, 4}, {12, 4}, {13, 4}, {14, 4}, {15, 4}, {7, 3}, {8, 
     3}, {9, 3}, {10, 3}, {11, 3}, {12, 3}, {13, 3}, {14, 3}, {7, 
     5}, {8, 5}, {9, 5}, {10, 5}, {11, 5}, {12, 5}, {13, 5}, {14, 5}}}}


In my file SubsequentBingoSelector.tsx, I display these candidate plays on the board and allow the user to choose from them. I am trying to automatically call my 'findViablePlays' API on each new eight-letter bingo and only display the candidates when there actually are candidates. This means the txt file of eight letter words must be shuffled and iterated through incrementally. Here is SubsequentBingoSelector.tsx:

// Formats: gcg https://www.poslfit.com/scrabble/gcg/