I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). Currently a user can select a starting square anywhere on the board and choose a direction to play it (horizontally or vertically).

I have logged in the console the data representing a 'Turn'. I am sending the 'word' and the tiles currently in the 'tilebag' to an external api, returning the new tile count. This API handles cases where 'blanks' are required, and returns a failure if the word cannot be formed, e.g. if it contains 4 Zs. I would like to replace the letter tile with a "?" tile if a blank is needed. For example, the word "CHUKKER" requires one of the Ks to be a blank.

Here is the contents of App.tsx: