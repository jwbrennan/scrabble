import { CENTER } from './tiles';

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

export const getOpeningPlacement = (
	word: string,
	direction: string
): { row: number; col: number; direction: string } | null => {
	const len = word.length;
	if (len !== 7) return null;
	const start = CENTER - 3; // 7-letter word is always 3 left/right of centre
	if (direction === 'H') {
		return { row: CENTER, col: start, direction: 'H' };
	}
	return { row: start, col: CENTER, direction: 'V' };
};
