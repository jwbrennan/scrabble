export type Direction = 'H' | 'V';

export interface Placement {
	bingo: string;
	row: number;
	col: number;
	direction: Direction;
	blanks: {
		tile: string;
		indices: number[];
	} | null;
}

export interface Turn {
	id: number;
	bingo: string;
	row: number;
	col: number;
	direction: Direction;
	blanks: {
		tile: string;
		indices: number[];
	} | null;
	tileBag: Record<string, number>;
	tilesLeft: number;
	score: number;
	overlap: {
		tile: string;
		index: number;
	} | null;
}

export interface FirestoreTurn {
	id: number;
	bingo: string;
	row: number;
	col: number;
	direction: Direction;
	blanks: {
		tile: string;
		indices: number[];
	} | null;
	score: number;
	overlap: {
		tile: string;
		index: number;
	} | null;
}

export interface ScrabbleGameData {
	gameId?: string; // Firestore will generate this if using addDoc, or you can provide with setDoc
	turns: FirestoreTurn[];
	timestamp: Date;
}

export const placeWord = (board: string[][], placement: Placement): string[][] => {
	const newBoard = board.map((row) => [...row]);
	const { bingo, row, col, direction, blanks } = placement;

	// Determine which index to style as blank
	let blankIndex: number | null = null;
	if (blanks && blanks.indices.length > 0) {
		blankIndex = blanks.indices[Math.floor(Math.random() * blanks.indices.length)];
	}

	let r = row;
	let c = col;
	for (let i = 0; i < bingo.length; i++) {
		const letter = bingo[i];
		const isBlank = blankIndex === i + 1;
		newBoard[r][c] = isBlank ? '?' : letter;
		if (direction === 'H') c++;
		else r++;
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
	word: string,
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
