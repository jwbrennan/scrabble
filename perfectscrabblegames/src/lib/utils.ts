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

import type { TileBag } from './api/updateTileBag';

/**
 * Converts TileBag to a string of tiles, e.g., 'AABB?C'
 */
export function getTilesString(tileBag: TileBag): string {
	let s = '';
	for (const [letter, count] of Object.entries(tileBag)) {
		s += letter.repeat(count);
	}
	return s;
}

/**
 * Checks if a word can be formed from the tiles string.
 * Allows for at most one letter to be provided by the board (overlap).
 */
export function canFormWord(tilesString: string, word: string): boolean {
	const tileCounts: Record<string, number> = {};
	for (const char of tilesString.toUpperCase()) {
		tileCounts[char] = (tileCounts[char] || 0) + 1;
	}
	let overlaps = 1; // Allow at most one letter to be from the board
	for (const char of word.toUpperCase()) {
		if (tileCounts[char] && tileCounts[char] > 0) {
			tileCounts[char]--;
		} else if (overlaps > 0) {
			overlaps--;
		} else {
			return false;
		}
	}
	return true;
}

/**
 * Checks if a word can be formed from the tiles string with one additional blank and one overlap tile.
 */
export function canFormWordWithBlanks(
	tilesString: string,
	word: string
): boolean {
	const tileCounts: Record<string, number> = {};
	for (const char of tilesString.toUpperCase()) {
		tileCounts[char] = (tileCounts[char] || 0) + 1;
	}
	let blanks = 1; // One additional blank
	let overlaps = 1; // Allow at most one letter to be from the board
	for (const char of word.toUpperCase()) {
		if (tileCounts[char] && tileCounts[char] > 0) {
			tileCounts[char]--;
		} else if (blanks > 0) {
			blanks--;
		} else if (overlaps > 0) {
			overlaps--;
		} else {
			return false;
		}
	}
	return true;
}
