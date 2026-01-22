// Styling a turn after tiles are played with blanks represented as "?".
export type PlaceBingoResult = {
	board: string[][];
	blanks: {
		tile: string;
		indices: number[];
	} | null;
};

export function styleWithBlanks(
	board: string[][],
	bingo: string,
	row: number,
	col: number,
	direction: 'H' | 'V',
	blanks: {
		tile: string;
		indices: number[];
	} | null,
): PlaceBingoResult | null {
	const letters = bingo.toUpperCase().split('');
	const newBoard = board.map((r) => [...r]);

	// Determine which index to style as blank
	let blankIndex: number | null = null;
	if (blanks) {
		if (blanks.indices.length === 1) {
			blankIndex = blanks.indices[0];
		} else {
			// Randomly choose one index to style as blank
			blankIndex =
				blanks.indices[
					Math.floor(Math.random() * blanks.indices.length)
				];
		}
	}

	// Place "?" at the chosen index (1-based)
	let r = row;
	let c = col;
	letters.forEach((letter, i) => {
		const isBlank = blankIndex === i + 1;
		newBoard[r][c] = isBlank ? '?' : letter;
		if (direction === 'H') c++;
		else r++;
	});

	return {
		board: newBoard,
		blanks: blanks,
	};
}
