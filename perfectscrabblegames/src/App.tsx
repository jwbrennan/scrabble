import { useState, useCallback, useEffect } from 'react';
import sevenletterbingos from './assets/SevenLetterBingos.txt?raw';
import eightletterbingos from './assets/EightLetterBingos.txt?raw';
import Board from './components/Board';
import OpeningBingoSelector from './components/OpeningBingoSelector';
import SubsequentBingoSelector from './components/SubsequentTurnSelector';
import ClearBoard from './components/ClearBoard';
import { BOARD_SIZE, INITIAL_TILEBAG } from './lib/setup';
import { styleWithBlanks } from './lib/styleWithBlanks';
import { updateTileBag } from './lib/api/updateTileBag';
import type { Turn } from './lib/utils';

// Formats: gcg https://www.poslfit.com/scrabble/gcg/

const SEVENS = sevenletterbingos
	.trim()
	.split('\n')
	.map((w) => w.trim().toUpperCase())
	.filter((w) => w.length === 7);

const EIGHTS = eightletterbingos
	.trim()
	.split('\n')
	.map((w) => w.trim().toUpperCase())
	.filter((w) => w.length === 8);

export default function App() {
	const [board, setBoard] = useState<string[][]>(
		Array(BOARD_SIZE)
			.fill(null)
			.map(() => Array(BOARD_SIZE).fill(''))
	);

	const [tileBag, setTileBag] =
		useState<Record<string, number>>(INITIAL_TILEBAG);

	const [isPlacingOpening, setIsPlacingOpening] = useState(false);

	const [isFirstTurnDone, setIsFirstTurnDone] = useState(false);

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

	const [turns, setTurns] = useState<Turn[]>([]);

	useEffect(() => {
		if (turns.length === 0) return;

		const last = turns[turns.length - 1];

		console.log(JSON.stringify(last, null, 2));
	}, [turns]);

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
							{isFirstTurnDone ? (
								<SubsequentBingoSelector
									eightLetterWords={EIGHTS}
								/>
							) : (
								<>
									{!isPlacingOpening ? (
										<button
											onClick={() =>
												setIsPlacingOpening(true)
											}
											className="px-20 py-8 bg-red-600 hover:bg-red-700 text-white text-4xl 
                               font-bold rounded-full shadow-2xl transform hover:scale-105 transition"
										>
											Random Opening Bingo
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
												try {
													const updateTileBagResult =
														await updateTileBag(
															word,
															tileBag
														);
													console.log(
														updateTileBagResult
													);
													const styleWithBlanksResult =
														styleWithBlanks(
															newBoard,
															word,
															row,
															col,
															direction,
															updateTileBagResult
														);
													if (
														!styleWithBlanksResult
													) {
														alert(
															'Error in blank styling!'
														);
														return;
													}
													setTileBag(
														updateTileBagResult.tileBag
													);
													setBoard(
														styleWithBlanksResult.board
													);
													setTurns((t) => [
														...t,
														{
															word,
															row,
															col,
															direction,
															score: 0,
															blanksUsed:
																styleWithBlanksResult.blanksUsed,
														},
													]);
												} catch (err) {
													console.error(err);
													alert('API Failure!');
													return;
												}
												setIsPlacingOpening(false);
												setIsFirstTurnDone(true);
											}}
											onCancel={() =>
												setIsPlacingOpening(false)
											}
											onStartSquareSelected={
												handleStartSquareSelected
											}
										/>
									)}
								</>
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
									setTurns([]);
									setTileBag(INITIAL_TILEBAG);
									setIsPlacingOpening(false);
									console.clear();
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
							Turns
						</h2>

						{turns.length === 0 && (
							<p className="text-gray-500">No Turns</p>
						)}

						<ul className="space-y-2">
							{turns.map((m, i) => (
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
