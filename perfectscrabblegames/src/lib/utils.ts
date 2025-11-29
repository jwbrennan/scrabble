export interface Turn {
	word: string;
	row: number;
	col: number;
	direction: 'H' | 'V';
	score: number;
}

export const placeWord = (board: string[][], turn: Turn): string[][] => {
	const newBoard = board.map((row) => [...row]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { word, row, col, direction, score } = turn;

	for (let i = 0; i < word.length; i++) {
		if (direction === 'H') {
			newBoard[row][col + i] = word[i];
		} else {
			newBoard[row + i][col] = word[i];
		}
	}
	return newBoard;
};
