// Calls Wolfram Cloud endpoint to check if a bingo overlaps with previous turns.

import type { Turn } from '../utils';

interface OverlapsQResponse {
	success: boolean;
}

export async function overlapsQ(
	bingo: string,
	turns: Turn[]
): Promise<OverlapsQResponse> {
	const params = new URLSearchParams();
	params.append('bingo', bingo);
	params.append('turns', JSON.stringify(turns));

	try {
		const response = await fetch(
			`https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/OverlapsQ?${params.toString()}`,
			{
				method: 'GET',
			}
		);

		if (!response.ok) {
			throw new Error(
				`API request failed with status ${response.status}`
			);
		}

		const data: OverlapsQResponse = await response.json();
		return data;
	} catch (error) {
		console.error('Error calling OverlapsQ API:', error);
		throw error; // Rethrow to allow caller to handle (e.g., show alert)
	}
}
