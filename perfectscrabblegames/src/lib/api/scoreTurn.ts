export interface ScoreTurnResponse {
	success: boolean;
	score?: number;
	error?: string;
}

export async function scoreTurn(turn: string): Promise<ScoreTurnResponse> {
	const params = new URLSearchParams();
	params.append('turn', turn);

	const response = await fetch(
		`https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/ScoreTurn?${params.toString()}`,
		{
			method: 'GET',
		},
	);

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	const data: ScoreTurnResponse = await response.json();
	return data;
}
