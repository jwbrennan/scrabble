I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). Currently a user can select a starting square anywhere on the board and choose a direction to play it (horizontally or vertically). I have logged in the console the data representing a 'Turn'.
```tsx
export interface Turn { bingo: string; row: number; col: number; direction: Direction; // "H" or "V" score: number; }
```
Each time a 'bingo' is played, I am sending the 'bingo' and the tiles currently in the 'tile bag' to an external api, returning the new/updated 'tile bag'. This API handles cases where 'blanks' are required, and returns a failure if the word cannot be formed, e.g. if it contains 4 Zs. I have started to include the first and second turn in the game. The first turn is a seven letter bingo and the 2nd (and all subsequent turns) is an eight letter bingo that must have exactly one overlap with the first bingo.
Right now I have an an external API to find all possible overlapping 'plays' where the 2nd (and all subsequent bingos) can go. It returns a list of viable plays in this format:
```json
[
	{
		"bingo": "WOOLSKIN",
		"row": 6,
		"col": 11,
		"direction": "V",
		"overlapTile": "O"
	},
	{
		"bingo": "WOOLSKIN",
		"row": 5,
		"col": 11,
		"direction": "V",
		"overlapTile": "O"
	},
	{
		"bingo": "WOOLSKIN",
		"row": 7,
		"col": 10,
		"direction": "V",
		"overlapTile": "W"
	}
]
```
Now, I want to show the user all of these options, and allow them to select the one they want, or skip onto the next word if they don't like any. I can imagine this looking a bit messy if they were all shown at once, so maybe the user can click through the N boards if there are N viable plays?
I have lots of code files I can show you, but I would like to get a high-level look at this first. Please do not include any code in your response.

// Formats: gcg https://www.poslfit.com/scrabble/gcg/