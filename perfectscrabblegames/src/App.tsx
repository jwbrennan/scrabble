import { useState, useCallback, useEffect } from 'react';
import sevenletterbingos from './assets/SevenLetterBingos.txt?raw';
import eightletterbingos from './assets/EightLetterBingos.txt?raw';
import Board from './components/Board';
import OpeningBingoSelector from './components/OpeningBingoSelector';
import SubsequentTurnSelector from './components/SubsequentTurnSelector';
import ResetBoard from './components/ResetBoard';
import { BOARD_SIZE, INITIAL_TILEBAG } from './lib/setup';
import { styleWithBlanks } from './lib/styleWithBlanks';
import { updateTileBag } from './lib/api/updateTileBag';
import type { Turn } from './lib/utils';

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

	const [selectedRow, setSelectedRow] = useState<number | null>(null);
	const [selectedCol, setSelectedCol] = useState<number | null>(null);

	const handleStartSquareSelected = useCallback(
		(handler: (r: number, c: number) => void): (() => void) => {
			setStartSquareHandler(() => handler);
			return () => {
				setStartSquareHandler(null);
			};
		},
		[]
	);

	const handleSquareSelected = useCallback(
		(r: number | null, c: number | null) => {
			setSelectedRow(r);
			setSelectedCol(c);
		},
		[]
	);

	const handleBoardClick = (r: number, c: number) => {
		startSquareHandler?.(r, c);
	};

	const [turns, setTurns] = useState<Turn[]>([]);

	useEffect(() => {
		if (turns.length === 0) return;
		console.log(JSON.stringify(turns, null, 2));
	}, [turns]);

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4">
			<div className="bg-white p-8 rounded-lg shadow-2xl mx-auto text-center">
				<div className="flex justify-center gap-12 items-start w-full">
					<div className="flex flex-col items-center">
						<div className="bg-green-900 p-4 rounded-lg shadow-2xl max-w-2xl">
							<Board
								board={board}
								onTileClick={handleBoardClick}
								selectedRow={selectedRow}
								selectedCol={selectedCol}
							/>
						</div>
						<div className="mt-2 flex flex-col items-center space-y-8">
							{isFirstTurnDone ? (
								<SubsequentTurnSelector
									eightLetterWords={EIGHTS}
									turns={turns}
									board={board}
									setBoard={setBoard}
									setTurns={setTurns}
								/>
							) : (
								<>
									{!isPlacingOpening ? (
										<button
											onClick={() =>
												setIsPlacingOpening(true)
											}
											className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
										>
											Random Opening Bingo
										</button>
									) : (
										<OpeningBingoSelector
											sevenLetterWords={SEVENS}
											onPlace={async (
												newBoard,
												bingo,
												row,
												col,
												direction
											) => {
												try {
													const openingBingoTileBagResult =
														await updateTileBag(
															bingo,
															tileBag
														);
													const styleWithBlanksResult =
														styleWithBlanks(
															newBoard,
															bingo,
															row,
															col,
															direction,
															openingBingoTileBagResult.blanks
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
														openingBingoTileBagResult.tileBag
													);
													setBoard(
														styleWithBlanksResult.board
													);
													setTurns((t) => [
														...t,
														{
															id: t.length + 1,
															bingo,
															row,
															col,
															direction,
															blanks: styleWithBlanksResult.blanks,
															tileBag:
																openingBingoTileBagResult.tileBag,
															tilesLeft:
																Object.values(
																	openingBingoTileBagResult.tileBag
																).reduce(
																	(a, b) =>
																		a + b,
																	0
																),
															score: 0,
														},
													]);
												} catch (err) {
													console.error(err);
													alert('API Failure!');
													return;
												}
												setIsPlacingOpening(false);
												setIsFirstTurnDone(true);
												setSelectedRow(null);
												setSelectedCol(null);
											}}
											onCancel={() => {
												setIsPlacingOpening(false);
												setSelectedRow(null);
												setSelectedCol(null);
											}}
											onSquareSelected={
												handleSquareSelected
											}
											onStartSquareSelected={
												handleStartSquareSelected
											}
										/>
									)}
								</>
							)}

							<ResetBoard
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
									setIsFirstTurnDone(false);
									setSelectedRow(null);
									setSelectedCol(null);
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
										{m.bingo}
									</div>
									<div className="text-sm text-gray-600">
										Row {m.row + 1}, Col {m.col + 1}
									</div>
									<div className="text-sm text-gray-600">
										Direction: {m.direction}
									</div>
									<div className="text-sm text-gray-600">
										Blanks: {m.blanks}
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
