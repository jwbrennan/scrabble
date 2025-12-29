export type Direction = 'H' | 'V';
export interface Turn {
	id: number;
	bingo: string;
	row: number;
	col: number;
	direction: Direction;
	blanks: string[];
	tileBag: Record<string, number>;
	tilesLeft: number;
	score: number;
}
export const placeWord = (board: string[][], turn: Turn): string[][] => {
	const newBoard = board.map((row) => [...row]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { bingo, row, col, direction } = turn;

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
