import { useState, useCallback } from 'react';
import sevenletterbingos from './assets/SevenLetterBingos.txt?raw';
import eightletterbingos from './assets/EightLetterBingos.txt?raw';
import Board from './components/Board';
import OpeningBingoSelector from './components/OpeningBingoSelector';
import SubsequentTurnSelector from './components/SubsequentTurnSelector';
import ResetBoard from './components/ResetBoard';
import { BOARD_SIZE, INITIAL_TILEBAG } from './lib/gameSetup';
import { styleWithBlanks } from './lib/styleWithBlanks';
import { updateTileBag } from './lib/api/updateTileBag';
import { scoreTurn } from './lib/api/scoreTurn';
import { getTilesString } from './lib/utils';
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
			.map(() => Array(BOARD_SIZE).fill('')),
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
		[],
	);

	const handleSquareSelected = useCallback(
		(r: number | null, c: number | null) => {
			setSelectedRow(r);
			setSelectedCol(c);
		},
		[],
	);

	const handleBoardClick = (r: number, c: number) => {
		startSquareHandler?.(r, c);
	};

	const [turns, setTurns] = useState<Turn[]>([]);

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
						<div className="mt-4 text-center">
							<p className="text-xl font-semibold max-w-lg mx-auto break-words">
								Tile Bag:{' '}
								<span className="font-mono">
									{getTilesString(
										turns.length > 0 ?
											turns[turns.length - 1].tileBag
										:	tileBag,
									)}
								</span>
							</p>
						</div>
						<div className="mt-2 flex flex-col items-center space-y-8">
							{isFirstTurnDone ?
								<SubsequentTurnSelector
									eightLetterWords={EIGHTS}
									turns={turns}
									board={board}
									setBoard={setBoard}
									setTurns={setTurns}
								/>
							:	<>
									{!isPlacingOpening ?
										<button
											onClick={() =>
												setIsPlacingOpening(true)
											}
											className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
										>
											Random Opening Bingo
										</button>
									:	<OpeningBingoSelector
											sevenLetterWords={SEVENS}
											onPlace={async (
												newBoard,
												bingo,
												row,
												col,
												direction,
											) => {
												try {
													const openingBingoTileBagResult =
														await updateTileBag(
															bingo,
															tileBag,
															0, // Force blanksRemaining to 0 for opening turn
														);
													const styleWithBlanksResult =
														styleWithBlanks(
															newBoard,
															bingo,
															row,
															col,
															direction,
															openingBingoTileBagResult.blanks,
														);
													if (
														!styleWithBlanksResult
													) {
														alert(
															'Error in blank styling!',
														);
														return;
													}
													setTileBag(
														openingBingoTileBagResult.tileBag,
													);
													setBoard(
														styleWithBlanksResult.board,
													);
													const newTurn = {
														id: turns.length + 1,
														bingo,
														row,
														col,
														direction,
														blanks: styleWithBlanksResult.blanks,
														tileBag:
															openingBingoTileBagResult.tileBag,
														tilesLeft:
															Object.values(
																openingBingoTileBagResult.tileBag,
															).reduce(
																(a, b) => a + b,
																0,
															),
														score: 0,
														overlap: null,
													};
													// Score the opening turn
													try {
														const scoreResponse =
															await scoreTurn(
																JSON.stringify(
																	newTurn,
																),
															);
														if (
															scoreResponse.success &&
															scoreResponse.score !==
																undefined
														) {
															newTurn.score =
																scoreResponse.score;
														} else {
															console.error(
																'Failed to score opening turn:',
																scoreResponse.error,
															);
														}
													} catch (err) {
														console.error(
															'Error scoring opening turn:',
															err,
														);
													}
													const newTurns = [
														...turns,
														newTurn,
													];
													setTurns(newTurns);
													console.log(
														JSON.stringify(
															newTurns,
														),
													);
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
									}
								</>
							}

							<ResetBoard
								onClear={() => {
									setBoard(
										Array(BOARD_SIZE)
											.fill(null)
											.map(() =>
												Array(BOARD_SIZE).fill(''),
											),
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
								Perfect Scrabble Games • Joseph Brennan 2026
							</footer>
						</div>
					</div>

					{/* SIDEBAR */}
					<div className="w-96 bg-white rounded-xl shadow-xl p-4 text-left">
						<h2 className="text-xl font-bold mb-4 text-green-900">
							Scoreboard
						</h2>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<h3 className="text-lg font-bold mb-2 text-green-900">
									Player A
								</h3>
								{(
									turns.filter((m) => m.id % 2 === 1)
										.length === 0
								) ?
									<p className="text-gray-500">No Turns</p>
								:	<ul className="space-y-1">
										{turns
											.filter((m) => m.id % 2 === 1)
											.map((m, i) => {
												return (
													<li
														key={i}
														className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded"
													>
														<div>{m.bingo}</div>
														<div>
															Row: {m.row + 1},
															Col:{' '}
															{String.fromCharCode(
																65 + m.col,
															)}
														</div>
														<div>
															Dir: {m.direction}
														</div>
														{m.blanks && (
															<div>
																Blanks:{' '}
																{m.blanks.tile}
															</div>
														)}
														<div>
															Score: {m.score}
														</div>
													</li>
												);
											})}
									</ul>
								}
							</div>
							<div>
								<h3 className="text-lg font-bold mb-2 text-green-900">
									Player B
								</h3>
								{(
									turns.filter((m) => m.id % 2 === 0)
										.length === 0
								) ?
									<p className="text-gray-500">No Turns</p>
								:	<ul className="space-y-1">
										{turns
											.filter((m) => m.id % 2 === 0)
											.map((m, i) => {
												return (
													<li
														key={i}
														className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded"
													>
														<div>{m.bingo}</div>
														<div>
															Row: {m.row + 1},
															Col:{' '}
															{String.fromCharCode(
																65 + m.col,
															)}
														</div>
														<div>
															Dir: {m.direction}
														</div>
														{m.blanks && (
															<div>
																Blanks:{' '}
																{m.blanks.tile}
															</div>
														)}
														<div>
															Score: {m.score}
														</div>
													</li>
												);
											})}
									</ul>
								}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
