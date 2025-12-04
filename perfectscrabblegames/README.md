I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). Currently a user can select a starting square anywhere on the board and choose a direction to play it (horizontally or vertically).
I have logged in the console the data representing a 'Turn'.
textexport interface Turn {
	word: string;
	row: number;
	col: number;
	direction: Direction;
	score: number;
}
I am sending the 'word' and the tiles currently in the 'tile bag' to an external api, returning the new 'tile bag'. This API handles cases where 'blanks' are required, and returns a failure if the word cannot be formed, e.g. if it contains 4 Zs.
I have started to include the first and second turn in the game. The first turn is a seven letter bingo and the 2nd (and all subsequent turns) is an eight letter bingo that must have exactly one overlap with the first bingo. In order to check this I need to maintain a 'continuous dataset' of played bingos.
Honestly Grok, I don't want to see any for loops or back-end logic...assume I already handle this in my API calls to the Wolfram Cloud.
Really I want to be able to see boilerplate code for how I would send off the current list of Turns, and current word via an API call.
Here is the contents of App.tsx:



// Formats: gcg https://www.poslfit.com/scrabble/gcg/