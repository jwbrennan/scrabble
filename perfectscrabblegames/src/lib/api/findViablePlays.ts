import type { Turn } from '../utils';

export interface ViablePlay {
	id: number;
	bingo: string;
	row: number;
	col: number;
	direction: 'H' | 'V';
	overlapTile: string;
	tileBag: Record<string, number>;
	tilesLeft: number;
}

export interface FindViablePlaysResponse {
	viablePlays: ViablePlay[];
}

export async function findViablePlays(
	bingo: string,
	turns: Turn[],
	blanksRemaining: number
): Promise<FindViablePlaysResponse> {
	const params = new URLSearchParams();
	params.append('bingo', bingo);
	params.append('turns', JSON.stringify(turns));
	params.append('blanks', String(blanksRemaining));

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
