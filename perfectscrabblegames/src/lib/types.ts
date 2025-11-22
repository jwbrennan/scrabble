export interface Move {
	word: string;
	row: number;
	col: number;
	direction: 'H' | 'V';
	score: number;
}
