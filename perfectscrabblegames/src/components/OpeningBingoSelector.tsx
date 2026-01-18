// Prompts user to click a starting square and select direction for opening bingo
import { useState, useEffect } from 'react';
import { CENTER, LETTER_POINTS } from '../lib/gameSetup';
import { placeWord } from '../lib/utils';

interface Props {
	sevenLetterWords: string[];
	onPlace: (
		newBoard: string[][],
		bingo: string,
		row: number,
		col: number,
		direction: 'H' | 'V',
	) => void;

	onStartSquareSelected: (
		handler: (row: number, col: number) => void,
	) => (() => void) | undefined;
	onSquareSelected: (row: number | null, col: number | null) => void;
}
export default function OpeningBingoSelector({
	sevenLetterWords,
	onPlace,
	onStartSquareSelected,
	onSquareSelected,
}: Props) {
	const [openingBingo, setOpeningBingo] = useState<string>(() => {
		return sevenLetterWords[
			Math.floor(Math.random() * sevenLetterWords.length)
		];
	});
	const [startRow, setStartRow] = useState<number | null>(null);
	const [startCol, setStartCol] = useState<number | null>(null);

	useEffect(() => {
		if (!openingBingo) return;

		const handler = (row: number, col: number) => {
			setStartRow(row);
			setStartCol(col);
			onSquareSelected(row, col);
		};
		const cleanup = onStartSquareSelected(handler);

		return () => {
			cleanup?.();
		};
	}, [openingBingo, onStartSquareSelected, onSquareSelected]);

	const tryPlace = (direction: string) => {
		if (startRow === null || startCol === null) return;

		const endRow = direction === 'H' ? startRow : startRow + 6;
		const endCol = direction === 'H' ? startCol + 6 : startCol;

		if (endRow > 14 || endCol > 14) {
			alert("Word doesn't fit — goes off the board!");
			return;
		}

		const coversCenter =
			direction === 'H' ?
				startRow === CENTER &&
				startCol <= CENTER &&
				startCol + 6 >= CENTER
			:	startCol === CENTER &&
				startRow <= CENTER &&
				startRow + 6 >= CENTER;

		if (!coversCenter) {
			alert('First move must cover the centre star!');
			return;
		}

		const emptyBoard = Array(15)
			.fill(null)
			.map(() => Array(15).fill(''));
		const newBoard = placeWord(emptyBoard, {
			id: 0,
			bingo: openingBingo,
			row: startRow,
			col: startCol,
			direction: direction as 'H' | 'V',
			blanks: null,
			score: 0,
			tileBag: {},
			tilesLeft: 0,
			overlap: null,
		});

		onPlace(
			newBoard,
			openingBingo,
			startRow,
			startCol,
			direction as 'H' | 'V',
		);
	};
	return (
		<div className="bg-white rounded-2xl shadow-2xl p-6 mt-4 w-[32rem] mx-auto space-y-4">
			<div className="flex justify-center gap-3">
				{openingBingo.split('').map((l, i) => (
					<div
						key={i}
						className="relative w-12 h-12 bg-amber-100 border-2 border-amber-600 rounded-lg shadow-xl flex items-center justify-center"
					>
						<span className="text-xl font-bold">{l}</span>
						<span className="absolute bottom-1 right-1 text-xs font-bold">
							{LETTER_POINTS[l]}
						</span>
					</div>
				))}
			</div>

			<div className="text-lg text-center">
				{startRow === null ?
					<p>
						Click any square on the board to place the first letter
					</p>
				:	<p className="text-green-600 font-bold">
						Starting square selected! Choose direction:
					</p>
				}
			</div>

			<div className="flex justify-center gap-4">
				<button
					onClick={() => tryPlace('H')}
					disabled={startRow === null}
					className="px-3 py-3 bg-black text-white text-lg font-bold rounded-lg
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition hover:scale-105"
				>
					Horizontal
				</button>

				<button
					onClick={() => tryPlace('V')}
					disabled={startRow === null}
					className="px-3 py-3 bg-black text-white text-lg font-bold rounded-lg
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition hover:scale-105"
				>
					Vertical
				</button>

				<button
					onClick={() =>
						// reset the selected start square when choosing a new word
						// so the UI requires the user to click again
						(() => {
							setOpeningBingo(
								sevenLetterWords[
									Math.floor(
										Math.random() * sevenLetterWords.length,
									)
								],
							);
							setStartRow(null);
							setStartCol(null);
							onSquareSelected(null, null);
						})()
					}
					className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-lg rounded-full"
				>
					New Bingo
				</button>
			</div>
		</div>
	);
}
