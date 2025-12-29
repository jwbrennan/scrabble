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
	blanks: string[];
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
	const params = new URLSearchParams();
	params.append('bingo', bingo);
	params.append('turns', JSON.stringify(turns));

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
