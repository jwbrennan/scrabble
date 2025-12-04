export type Direction = 'H' | 'V';
export interface Turn {
	word: string;
	row: number;
	col: number;
	direction: Direction;
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

export function getPlayedTiles(turns: Turn[]): Map<string, string> {
	const played = new Map<string, string>(); // key: "r,c" → letter
	for (const turn of turns) {
		const { word, row, col, direction } = turn;
		for (let i = 0; i < word.length; i++) {
			const r = direction === 'H' ? row : row + i;
			const c = direction === 'H' ? col + i : col;
			played.set(`${r},${c}`, word[i]);
		}
	}
	return played;
}
