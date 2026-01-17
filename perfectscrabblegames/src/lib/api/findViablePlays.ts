import type { Turn } from '../utils';

export interface ViablePlay {
	id: number;
	bingo: string;
	row: number;
	col: number;
	direction: 'H' | 'V';
	overlap: {
		tile: string;
		index: number;
	} | null;
	tileBag: Record<string, number>;
	tilesLeft: number;
	blanks: {
		tile: string;
		indices: number[];
	} | null;
}

export interface FindViablePlaysResponse {
	success?: boolean;
	error?: string;
	viablePlays?: ViablePlay[];
}

export async function findViablePlays(
	bingo: string,
	turns: Turn[]
): Promise<FindViablePlaysResponse> {
	// Strip down turns to only the fields needed by the API
	const minimalTurns = turns.map((turn) => ({
		id: turn.id,
		bingo: turn.bingo,
		row: turn.row,
		col: turn.col,
		direction: turn.direction,
		blanks: turn.blanks,
	}));

	const params = new URLSearchParams();
	params.append('bingo', bingo);
	params.append('turns', JSON.stringify(minimalTurns));
	// Send the current tile bag separately
	if (turns.length > 0) {
		params.append('currentTileBag', JSON.stringify(turns[turns.length - 1].tileBag));
	}

	const response = await fetch(
		`https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/FindViablePlays?${params.toString()}`,
		{
			method: 'GET',
		}
	);

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	const data: FindViablePlaysResponse = await response.json();
	return data;
}
