import type { Turn } from '../utils';

export interface ViablePlay {
	bingo: string;
	row: number;
	col: number;
	direction: 'H' | 'V';
	overlapTile: string;
	tileBag: Record<string, number>;
}

export interface FindViablePlaysResponse {
	viablePlays: ViablePlay[];
}

export async function findViablePlays(
	bingo: string,
	turns: Turn[],
	tileBag: Record<string, number>,
	blanksRemaining: number
): Promise<FindViablePlaysResponse> {
	const params = new URLSearchParams();
	params.append('bingo', bingo);
	params.append('turns', JSON.stringify(turns));
	params.append('tileBag', JSON.stringify(tileBag));
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
