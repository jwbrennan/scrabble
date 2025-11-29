// Calls Wolfram Cloud endpoint to validate a word and get the new tile bag.
export type TileBag = Record<string, number>;

export interface UpdateTileBagResponse {
	success: boolean;
	tileBag: TileBag;
}

export async function updateTileBag(
	word: string,
	currentTileBag: TileBag
): Promise<UpdateTileBagResponse> {
	const remainingBlanks = String(currentTileBag['?'] ?? 0);
	const params = new URLSearchParams({
		word: word.toUpperCase(),
		tileBag: JSON.stringify(currentTileBag),
		blanks: remainingBlanks,
	});

	const response = await fetch(
		`https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/UpdateTileBag?${params}`
	);

	if (!response.ok) {
		throw new Error(`Tile-bag API error ${response.status}`);
	}

	const data = (await response.json()) as UpdateTileBagResponse;

	if (!data.success) {
		throw new Error('CANNOT-FORM-WORD');
	}

	return data;
}
