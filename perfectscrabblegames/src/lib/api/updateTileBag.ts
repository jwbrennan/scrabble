// Calls Wolfram Cloud endpoint to validate a bingo and get the new tile bag.
export type TileBag = Record<string, number>;

export interface UpdateTileBagResponse {
	success: boolean;
	tileBag: TileBag;
	blanks: {
		tile: string;
		indices: number[];
	} | null;
}

export async function updateTileBag(
	bingo: string,
	currentTileBag: TileBag,
	blanksRemaining: number
): Promise<UpdateTileBagResponse> {
	const params = new URLSearchParams({
		bingo: bingo.toUpperCase(),
		tileBag: JSON.stringify(currentTileBag),
		blanksRemaining: String(blanksRemaining),
	});

	const response = await fetch(
		`https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/UpdateTileBag?${params}`
	);

	if (!response.ok) {
		throw new Error(`Tile Bag API error ${response.status}`);
	}

	const data = (await response.json()) as UpdateTileBagResponse;

	if (!data.success) {
		throw new Error('CANNOT-FORM-WORD');
	}

	return data;
}
