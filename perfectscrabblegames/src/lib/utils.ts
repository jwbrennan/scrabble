export type Placement = {
	word: string;
	row: number;
	col: number;
	direction: string;
};

export const placeWord = (
	board: string[][],
	placement: Placement
): string[][] => {
	const newBoard = board.map((row) => [...row]);
	const { word, row, col, direction } = placement;

	for (let i = 0; i < word.length; i++) {
		if (direction === 'H') {
			newBoard[row][col + i] = word[i];
		} else {
			newBoard[row + i][col] = word[i];
		}
	}
	return newBoard;
};
