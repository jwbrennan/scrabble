I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). The first turn is a seven letter bingo and the 2nd (and all subsequent turns) is an eight letter bingo that must have exactly one overlap with another bingo.
In my file SubsequentBingoSelector.tsx, I display candidate plays found using my 'findViablePlays' API. The txt file of eight letter words is culled depending on the tiles remaining, and this list is shuffled and iterated through incrementally. I am having a problem whereby findViablePlays API calls when the no. of turns is 13, and one blank has already been used, are causing failures. It said this in the console: "Access to fetch at 'https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/FindViablePlays?bingo=MAZARINE&turns=urlEncodedTurnsArray' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.". Can you suggest reasons why? Could the parameter I am passing to the URL be too long?

// Formats: gcg https://www.poslfit.com/scrabble/gcg/


// To do: Handle opening bingos like BEZZAZZ!