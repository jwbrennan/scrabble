// src/components/OpeningBingoSelector.tsx
import { useState, useEffect } from 'react';
import { CENTER, LETTER_POINTS } from '../lib/tiles';
import { placeWord } from '../lib/utils';

interface Props {
	sevenLetterWords: string[];
	onPlace: (
		newBoard: string[][],
		word: string,
		row: number,
		col: number,
		direction: 'H' | 'V'
	) => void;

	onCancel: () => void;
	onStartSquareSelected: (
		handler: (row: number, col: number) => void
	) => (() => void) | undefined;
}

export default function OpeningBingoSelector({
	sevenLetterWords,
	onPlace,
	onCancel,
	onStartSquareSelected,
}: Props) {
	const [word, setWord] = useState<string>(() => {
		return sevenLetterWords[
			Math.floor(Math.random() * sevenLetterWords.length)
		];
	});
	const [startRow, setStartRow] = useState<number | null>(null);
	const [startCol, setStartCol] = useState<number | null>(null);

	useEffect(() => {
		if (!word) return;

		let cleanup: (() => void) | undefined;

		const handler = (row: number, col: number) => {
			setStartRow(row);
			setStartCol(col);
		};

		// Delay registration so parent cannot call synchronously
		const id = setTimeout(() => {
			cleanup = onStartSquareSelected(handler) || undefined;
		}, 0);

		return () => {
			clearTimeout(id);
			cleanup?.();
		};
	}, [onStartSquareSelected, word]);

	const tryPlace = (direction: string) => {
		if (startRow === null || startCol === null) return;

		const endRow = direction === 'H' ? startRow : startRow + 6;
		const endCol = direction === 'H' ? startCol + 6 : startCol;

		if (endRow > 14 || endCol > 14) {
			alert("Word doesn't fit — goes off the board!");
			return;
		}

		const coversCenter =
			direction === 'H'
				? startRow === CENTER &&
				  startCol <= CENTER &&
				  startCol + 6 >= CENTER
				: startCol === CENTER &&
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
			word,
			row: startRow,
			col: startCol,
			direction: direction as 'H' | 'V',
		});

		onPlace(newBoard, word, startRow, startCol, direction as 'H' | 'V');
	};
	return (
		<div className="bg-white rounded-2xl shadow-2xl p-8 mt-12 max-w-4xl mx-auto space-y-8">
			<h2 className="text-5xl font-bold text-green-900 text-center">
				Opening Bingo: <span className="text-red-600">{word}</span>
			</h2>

			<div className="flex justify-center gap-5">
				{word.split('').map((l, i) => (
					<div
						key={i}
						className="relative w-24 h-24 bg-amber-100 border-4 border-amber-600 rounded-lg shadow-xl flex items-center justify-center"
					>
						<span className="text-7xl font-bold">{l}</span>
						<span className="absolute bottom-2 right-2 text-sm font-bold text-amber-800">
							{LETTER_POINTS[l]}
						</span>
					</div>
				))}
			</div>

			<div className="text-3xl text-center">
				{startRow === null ? (
					<p>
						Click any square on the board to place the first letter
					</p>
				) : (
					<p className="text-green-600 font-bold">
						Starting square selected! Choose direction:
					</p>
				)}
			</div>

			<div className="flex justify-center gap-12 mt-4">
				<button
					onClick={() => tryPlace('H')}
					disabled={startRow === null}
					className="px-10 py-6 bg-black text-white text-4xl font-bold rounded-lg
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition hover:scale-105"
				>
					Horizontal
				</button>

				<button
					onClick={() => tryPlace('V')}
					disabled={startRow === null}
					className="px-10 py-6 bg-black text-white text-4xl font-bold rounded-lg
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition hover:scale-105"
				>
					Vertical
				</button>
			</div>

			<div className="flex justify-center gap-8">
				<button
					onClick={() =>
						// reset the selected start square when choosing a new word
						// so the UI requires the user to click again
						(() => {
							setWord(
								sevenLetterWords[
									Math.floor(
										Math.random() * sevenLetterWords.length
									)
								]
							);
							setStartRow(null);
							setStartCol(null);
						})()
					}
					className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white text-2xl rounded-full"
				>
					New Word
				</button>
				<button
					onClick={onCancel}
					className="px-10 py-4 bg-gray-600 hover:bg-gray-700 text-white text-2xl rounded-full"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
