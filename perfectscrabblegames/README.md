I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). Currently a user can select a starting square anywhere on the board and choose a direction to play it (horizontally or vertically).

I have logged in the console the data representing a 'Move'. I want to send the 'word' and the tiles currently in the 'tilebag' to an external api and return the new tile count.

Here is the contents of App.tsx: