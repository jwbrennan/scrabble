// Styling a turn after tiles are played with blanks represented as "?".
export type PlaceBingoResult = {
	board: string[][];
	blanksUsed: number;
};

export function styleWithBlanks(
	board: string[][],
	bingo: string,
	row: number,
	col: number,
	direction: 'H' | 'V',
	apiResult: { success: boolean; tileBag: Record<string, number> }
): PlaceBingoResult | null {
	if (!apiResult.success) return null;

	const letters = bingo.toUpperCase().split('');
	const newBoard = board.map((r) => [...r]);

	// 1. Find how many blanks were used for each letter
	const neededBlanks: string[] = [];
	for (const [letter, count] of Object.entries(apiResult.tileBag)) {
		if (typeof count === 'number' && count < 0) {
			neededBlanks.push(...Array(-count).fill(letter));
		}
	}

	// 2. Randomly assign those blanks on the board
	const blankPositions = new Set<number>();

	for (const letter of neededBlanks) {
		const candidates: number[] = [];
		letters.forEach((l, i) => {
			if (l === letter && !blankPositions.has(i)) candidates.push(i);
		});

		if (candidates.length === 0) continue; // safety

		const chosen =
			candidates[Math.floor(Math.random() * candidates.length)];
		blankPositions.add(chosen);
	}

	// 3. Write "?" where blanks were used
	let r = row;
	let c = col;
	letters.forEach((letter, i) => {
		newBoard[r][c] = blankPositions.has(i) ? '?' : letter;
		if (direction === 'H') c++;
		else r++;
	});

	return {
		board: newBoard,
		blanksUsed: blankPositions.size,
	};
}
