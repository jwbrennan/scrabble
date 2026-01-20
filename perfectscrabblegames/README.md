I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). The first turn is a seven letter bingo and the 2nd (and all subsequent turns) is an eight letter bingo that must have exactly one overlap with another bingo. The txt file of eight letter words is culled depending on the tiles remaining, and this list is shuffled and iterated through incrementally. On turns 13 and 14 I allow the use of 1 blank. This project is getting close to completion! However, I want the entire 'perfect game' to be logged in some database upon a user getting to that stage. I have started to set up Firebase to handle the back-end database. I have a schema.gql file with the following contents:

```gql
# Scrabble Perfect Game Schema

# Represents a complete perfect game (14 bingo turns)
type Game @table {
	id: UUID! @default(expr: "uuidV4()")
	createdAt: Timestamp! @default(expr: "request.time")
	totalScore: Int!
}

# Represents a single turn in a game
type Turn @table {
	id: UUID! @default(expr: "uuidV4()")
	gameId: UUID! 
	game: Game! @ref(fields: "gameId") 
	turnNumber: Int!  
	bingo: String!  
	row: Int! 
	col: Int!  
	direction: String!
	score: Int!
	blanks: String
	overlap: String
}
```

And a mutations.gql file with the following contents:

```gql
# Create a new game
mutation CreateGame($totalScore: Int!) @auth(level: PUBLIC) {
  game_insert(data: {
    totalScore: $totalScore
  })
}
```

And finally, a queries.gql file:

```gql
# Get all games
query ListGames($limit: Int = 50, $offset: Int = 0) @auth(level: PUBLIC) {
  games(limit: $limit, offset: $offset, orderBy: {createdAt: DESC}) {
    id
    createdAt
    totalScore
  }
}

# Get a specific game with all its turns
query GetGameDetails {
  game(id: "some-game-id") {
    id
    createdAt
    totalScore
    turns_on_game { # TRY THIS INSTEAD
      id
      turnNumber
      bingo
      # ... other turn fields
    }
  }
}
```

These are in a 'dataconnect' folder in my project.
Describe what I need to do to:

1. Automatically update the database with a new perfect game.

2. Manually populate the database with perfect games I have already found.

// Formats: gcg https://www.poslfit.com/scrabble/gcg/


// To do: Handle opening bingos like BEZZAZZ!

Turns 1-12: Culling is cumulative (from the current narrowed list), as before.
Turn 13 (after accepting turn 12, newTurnsCount = 13): Culls from the full original eightLetterWords list, allowing blanks and potentially reintroducing words that were culled out earlier.
Turn 14 (after accepting turn 13, newTurnsCount = 14): Same as above, culls from the original list.