import type { Turn, Direction } from './utils';
import type { TileBag } from './api/updateTileBag';
import { findViablePlays } from './api/findViablePlays';
import { styleWithBlanks } from './styleWithBlanks';
import { canFormWord, canFormWordWithBlanks, getTilesString } from './utils';

export interface CandidatePlay {
	id: number;
	bingo: string;
	row: number;
	col: number;
	direction: Direction;
	blanks: string[];
	overlapTile: string;
	tileBag: TileBag;
	tilesLeft: number;
	score: number;
}

/**
 * Culls the word list based on the current tile bag and number of turns.
 * @param words - The list of words to cull.
 * @param tileBag - The current tile bag.
 * @param turnsCount - The current number of turns.
 * @returns The culled list of words.
 */
export function cullWords(
	words: string[],
	tileBag: TileBag,
	turnsCount: number
): string[] {
	const tilesString = getTilesString(tileBag);
	return words.filter((word) => {
		// For turns up to and including 11, require exact tiles (no extra blank)
		if (turnsCount <= 11) {
			return canFormWord(tilesString, word);
		}
		// After turn 11 (turnsCount > 11), allow one extra blank
		return canFormWordWithBlanks(tilesString, word);
	});
}

/**
 * Finds the next viable play starting from the given word index.
 * @param words - The list of words to check.
 * @param startIndex - The index to start checking from.
 * @param turns - The current turns.
 * @returns A promise that resolves to an object with candidates and the next index, or null if none found.
 */
export async function findNextViablePlay(
	words: string[],
	startIndex: number,
	turns: Turn[]
): Promise<{ candidates: CandidatePlay[]; nextIndex: number } | null> {
	console.log(
		`Starting search with ${words.length} words, starting from index ${startIndex}`
	);
	let index = startIndex;
	while (index < words.length) {
		const word = words[index];
		console.log(`Trying word ${index}: ${word}`);
		try {
			const response = await findViablePlays(word, turns);
			console.log(`Response for ${word}:`, response);
			if (
				response.success === false &&
				response.error === 'NO-VIABLE-PLAYS'
			) {
				console.log(`No viable plays for ${word}, continuing`);
				index++;
				continue;
			}
			if (response.viablePlays && response.viablePlays.length > 0) {
				console.log(
					`Found ${response.viablePlays.length} viable plays for ${word}`
				);
				const candidates: CandidatePlay[] = response.viablePlays.map(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(p: any) => ({
						id: turns.length + 1,
						bingo: p.bingo,
						row: p.row,
						col: p.col,
						direction: p.direction,
						blanks: p.blanks || [],
						overlapTile: p.overlapTile,
						tileBag: p.tileBag,
						tilesLeft: p.tilesLeft,
						score: 0,
					})
				);
				return { candidates, nextIndex: index + 1 };
			}
			console.log(
				`No viable plays found for ${word}, but response was successful`
			);
		} catch (err) {
			console.error('Error finding viable plays for', word, ':', err);
		}
		index++;
	}
	console.log('Exhausted all words, no viable plays found');
	return null; // No viable plays found
}

/**
 * Accepts a candidate play, updates the board, turns, and culls the words.
 * @param candidate - The candidate play to accept.
 * @param board - The current board.
 * @param turns - The current turns.
 * @param words - The current words list.
 * @returns An object with updated board, turns, and words, or null if error.
 */
export function acceptCandidate(
	candidate: CandidatePlay,
	board: string[][],
	turns: Turn[],
	words: string[],
	eightLetterWords: string[]
): {
	board: string[][];
	turns: Turn[];
	words: string[];
} | null {
	try {
		const styledResult = styleWithBlanks(
			board,
			candidate.bingo,
			candidate.row,
			candidate.col,
			candidate.direction,
			candidate.blanks
		);

		if (!styledResult) {
			return null;
		}

		const newBoard = styledResult.board;
		const newTurns = [
			...turns,
			{
				id: turns.length + 1,
				bingo: candidate.bingo,
				row: candidate.row,
				col: candidate.col,
				direction: candidate.direction,
				score: 0,
				blanks: styledResult.blanks,
				tileBag: candidate.tileBag,
				tilesLeft: candidate.tilesLeft,
			},
		];

		const newTurnsCount = newTurns.length;
		let wordsToCull = words;
		if (newTurnsCount === 12 || newTurnsCount === 13) {
			wordsToCull = eightLetterWords;
		}
		let culledWords = cullWords(
			wordsToCull,
			candidate.tileBag,
			newTurnsCount
		);
		// Shuffle the culled list to randomize the order
		culledWords = [...culledWords].sort(() => Math.random() - 0.5);

		console.log('Remaining tiles:', getTilesString(candidate.tileBag));
		console.log(
			`Culled and shuffled words: ${wordsToCull.length} -> ${culledWords.length} for turn ${newTurnsCount}`
		);
		console.log(
			`Culled from ${wordsToCull === words ? 'current' : 'original'} list`
		);
		if (newTurnsCount >= 12) {
			console.log('Culled list (using blanks):', culledWords);
		}

		return {
			board: newBoard,
			turns: newTurns,
			words: culledWords,
		};
	} catch (err) {
		console.error(err);
		return null;
	}
}

/**
 * Skips the current word, resetting candidates and restoring the original board.
 * @param originalBoard - The original board state.
 * @returns An object with reset values.
 */
export function skipWord(originalBoard: string[][] | null): {
	candidates: CandidatePlay[];
	currentCandidateIndex: number;
	board: string[][] | null;
} {
	return {
		candidates: [],
		currentCandidateIndex: 0,
		board: originalBoard,
	};
}

/**
 * Goes to the previous candidate.
 * @param currentIndex - The current candidate index.
 * @param candidatesLength - The total number of candidates.
 * @returns The new index.
 */
export function goToPreviousCandidate(currentIndex: number): number {
	return Math.max(0, currentIndex - 1);
}

/**
 * Goes to the next candidate.
 * @param currentIndex - The current candidate index.
 * @param candidatesLength - The total number of candidates.
 * @returns The new index.
 */
export function goToNextCandidate(
	currentIndex: number,
	candidatesLength: number
): number {
	const next = currentIndex + 1;
	return next >= candidatesLength ? candidatesLength - 1 : next;
}
