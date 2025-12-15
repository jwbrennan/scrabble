I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). Currently a user can select a starting square anywhere on the board and choose a direction to play it (horizontally or vertically). I have logged in the console the data representing a 'Turn'. 

```

export interface Turn { 	

bingo: string; 	

row: number; 	

col: number; 

direction: Direction; 	// "H" or "V"

score: number; 

} 

``` 

Each time a 'bingo' is played, I am sending the 'bingo' and the tiles currently in the 'tile bag' to an external api, returning the new/updated 'tile bag'. This API handles cases where 'blanks' are required, and returns a failure if the word cannot be formed, e.g. if it contains 4 Zs. I have started to include the first and second turn in the game. The first turn is a seven letter bingo and the 2nd (and all subsequent turns) is an eight letter bingo that must have exactly one overlap with the first bingo. Right now I simply call an external API to 'check' if the next bingo overlaps at least once with the previous bingos, but I have the means of extending this to actually find all viable overlap positions. You should assume I handle any back-end logic in my API calls to the Wolfram Cloud.

Here is the content of App.tsx:  


// Formats: gcg https://www.poslfit.com/scrabble/gcg/