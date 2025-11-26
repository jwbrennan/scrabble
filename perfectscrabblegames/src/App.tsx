import { useState, useCallback, useEffect } from 'react';
import sevenletterbingos from './assets/SevenLetterBingos.txt?raw';
import Board from './components/Board';
import OpeningBingoSelector from './components/OpeningBingoSelector';
import ClearBoard from './components/ClearBoard';
import { BOARD_SIZE, INITIAL_TILEBAG } from './lib/tiles';
import type { Move } from './lib/types';

// Formats: gcg https://www.poslfit.com/scrabble/gcg/

const SEVENS = sevenletterbingos
	.trim()
	.split('\n')
	.map((w) => w.trim().toUpperCase())
	.filter((w) => w.length === 7);

export default function App() {
	const [board, setBoard] = useState<string[][]>(
		Array(BOARD_SIZE)
			.fill(null)
			.map(() => Array(BOARD_SIZE).fill(''))
	);

	const [tileBag, setTileBag] =
		useState<Record<string, number>>(INITIAL_TILEBAG);

	const [isPlacingOpening, setIsPlacingOpening] = useState(false);

	const [startSquareHandler, setStartSquareHandler] = useState<
		((r: number, c: number) => void) | null
	>(null);

	const handleStartSquareSelected = useCallback(
		(handler: (r: number, c: number) => void): (() => void) => {
			setStartSquareHandler(() => handler);
			return () => {
				setStartSquareHandler(null);
			};
		},
		[]
	);

	const handleBoardClick = (r: number, c: number) => {
		startSquareHandler?.(r, c);
	};

	const [moves, setMoves] = useState<Move[]>([]);

	useEffect(() => {
		if (moves.length === 0) return;

		const last = moves[moves.length - 1];

		console.log(JSON.stringify(last, null, 2));
	}, [moves]);

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4">
			<div className="bg-white p-8 rounded-lg shadow-2xl mx-auto text-center">
				<div className="flex justify-center gap-12 items-start w-full">
					<div className="flex flex-col items-center">
						<div className="bg-green-900 p-8 rounded-lg shadow-2xl">
							<Board
								board={board}
								onTileClick={handleBoardClick}
							/>
						</div>
						<div className="mt-12 flex flex-col items-center space-y-8">
							{!isPlacingOpening ? (
								<button
									onClick={() => setIsPlacingOpening(true)}
									className="px-20 py-8 bg-red-600 hover:bg-red-700 text-white text-4xl 
                               font-bold rounded-full shadow-2xl transform hover:scale-105 transition"
								>
									Random Word
								</button>
							) : (
								<OpeningBingoSelector
									sevenLetterWords={SEVENS}
									onPlace={async (
										newBoard,
										word,
										row,
										col,
										direction
									) => {
										setBoard(newBoard);
										setMoves((prev) => [
											...prev,
											{
												word,
												row,
												col,
												direction,
												score: 0,
											},
										]);
										try {
											const testParams =
												new URLSearchParams({
													word: word.toUpperCase(),
												});

											const testAPIResponse = await fetch(
												`https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/TEST?${testParams}`
											);
											if (!testAPIResponse.ok)
												throw new Error(
													'API returned error'
												);
											const testResult =
												await testAPIResponse.json();
											console.log(testResult);
										} catch (err) {
											console.error('API Failure', err);
										}
										try {
											const tileBagParams =
												new URLSearchParams({
													word: word.toUpperCase(),
													tileBag:
														JSON.stringify(tileBag),
												});

											const updateTileBagResponse =
												await fetch(
													`https://www.wolframcloud.com/obj/josephb/Scrabble/APIs/UpdateTileBag?${tileBagParams}`
												);
											if (!updateTileBagResponse.ok)
												throw new Error(
													'API returned error'
												);
											const updateTileBagResult =
												await updateTileBagResponse.json();
											console.log(updateTileBagResult);
										} catch (err) {
											console.error(
												'Failed to update tilebag from API:',
												err
											);
											alert(
												'Warning: Could not update tile bag (check console)'
											);
										}
										setIsPlacingOpening(false);
									}}
									onCancel={() => setIsPlacingOpening(false)}
									onStartSquareSelected={
										handleStartSquareSelected
									}
								/>
							)}

							<ClearBoard
								onClear={() => {
									setBoard(
										Array(BOARD_SIZE)
											.fill(null)
											.map(() =>
												Array(BOARD_SIZE).fill('')
											)
									);
									setMoves([]);
									setIsPlacingOpening(false);
								}}
							/>
							<footer className="mt-20 text-gray-600 text-sm">
								Perfect Scrabble Games • Joseph Brennan 2025
							</footer>
						</div>
					</div>

					{/* SIDEBAR */}
					<div className="w-72 bg-white rounded-xl shadow-xl p-4 text-left">
						<h2 className="text-xl font-bold mb-4 text-green-900">
							Moves
						</h2>

						{moves.length === 0 && (
							<p className="text-gray-500">No moves yet</p>
						)}

						<ul className="space-y-2">
							{moves.map((m, i) => (
								<li
									key={i}
									className="p-3 border rounded-lg shadow-sm bg-gray-50"
								>
									<div className="font-bold text-lg text-red-700">
										{m.word}
									</div>
									<div className="text-sm text-gray-600">
										Row {m.row + 1}, Col {m.col + 1}
									</div>
									<div className="text-sm text-gray-600">
										Direction: {m.direction}
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
