export type Direction = 'H' | 'V';
export interface Turn {
	id: number;
	bingo: string;
	row: number;
	col: number;
	direction: Direction;
	score: number;
	blanksUsed: number;
	tileBag: Record<string, number>; // Current tile bag after this turn
	tilesLeft: number; // Total remaining tiles after this turn
}
export const placeWord = (board: string[][], turn: Turn): string[][] => {
	const newBoard = board.map((row) => [...row]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { bingo, row, col, direction, score } = turn;

	for (let i = 0; i < bingo.length; i++) {
		if (direction === 'H') {
			newBoard[row][col + i] = bingo[i];
		} else {
			newBoard[row + i][col] = bingo[i];
		}
	}
	return newBoard;
};

export function getPlayedTiles(turns: Turn[]): Map<string, string> {
	const played = new Map<string, string>(); // key: "r,c" → letter
	for (const turn of turns) {
		const { bingo, row, col, direction } = turn;
		for (let i = 0; i < bingo.length; i++) {
			const r = direction === 'H' ? row : row + i;
			const c = direction === 'H' ? col + i : col;
			played.set(`${r},${c}`, bingo[i]);
		}
	}
	return played;
}
